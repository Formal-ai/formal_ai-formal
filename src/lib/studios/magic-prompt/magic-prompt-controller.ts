/**
 * Formal.AI — Magic Prompt Studio Controller
 *
 * Accepts freeform natural-language prompts and dynamically
 * determines which regions to edit (multi-scope).
 *
 * Key differences from other studios:
 *   - Edit scope is inferred from prompt semantics, not hardcoded
 *   - Conflict detection between prompt intent and identity preservation
 *   - Higher creativity freedom but tighter identity guardrails
 *   - Automatic negative constraint injection from prompt analysis
 *
 * Safety pipeline:
 *   1. Parse prompt → extract intent tokens
 *   2. Classify intent vs prohibited actions
 *   3. Map intent to editable regions
 *   4. Generate negative constraints for uneditable regions
 *   5. Apply identity-aware conditioning
 */

import type {
    IStudioController,
    MagicPromptParams,
    StudioType,
    GenderMode,
    PerceptionOutput,
    EditScopeConfig,
    ConditioningPayload,
    GenerationRequest,
    NegativeConstraint,
    ValidationResult,
} from "../core/types";

import { EditRegion, IDENTITY_LOCKED_REGIONS } from "../core/types";
import {
    GLOBAL_NEGATIVE_CONSTRAINTS,
    applyConstraintsToConditioning,
} from "../core/generation-control";
import { validateOutput } from "../core/validation-engine";

// ─── Magic Prompt Types ──────────────────────────────────────────────────────

/** Intent categories that can be detected from freeform text. */
export type PromptIntentCategory =
    | "clothing_change"
    | "hair_change"
    | "background_change"
    | "accessory_add"
    | "accessory_remove"
    | "lighting_change"
    | "style_transfer"
    | "pose_adjust"
    | "composite" // multiple intents
    | "unknown";

/** Prohibited intent flags — these must be blocked. */
export type ProhibitedIntent =
    | "face_reshape"
    | "ethnicity_change"
    | "age_change"
    | "body_reshape"
    | "skin_color_change"
    | "biometric_alter";

/** Result of prompt analysis. */
export interface PromptAnalysis {
    rawPrompt: string;
    detectedIntents: PromptIntentCategory[];
    /** Editable regions inferred from the prompt. */
    inferredEditRegions: EditRegion[];
    /** Regions that must be preserved (complement of edit regions + identity). */
    inferredPreserveRegions: EditRegion[];
    /** Any prohibited intents detected → will block generation. */
    prohibitedIntents: ProhibitedIntent[];
    /** Confidence in the intent classification (0..1). */
    classificationConfidence: number;
    /** Whether the prompt is safe to execute. */
    isSafe: boolean;
    /** Human-readable rejection reason if not safe. */
    rejectionReason: string | null;
    /** Additional negative constraints extracted from prompt context. */
    additionalNegatives: NegativeConstraint[];
}

/**
 * Keyword-to-region mapping for basic intent classification.
 *
 * In production this would use an LLM classifier; here we define
 * the structured mapping for the pipeline spec.
 */
const INTENT_REGION_MAP: Record<PromptIntentCategory, EditRegion[]> = {
    clothing_change: [EditRegion.Clothing, EditRegion.CollarArea, EditRegion.LapelArea, EditRegion.TieArea, EditRegion.Shoulders, EditRegion.Torso],
    hair_change: [EditRegion.Hair, EditRegion.Hairline],
    background_change: [EditRegion.Background],
    accessory_add: [EditRegion.Accessories, EditRegion.Glasses, EditRegion.Earrings, EditRegion.Necklace],
    accessory_remove: [EditRegion.Accessories, EditRegion.Glasses, EditRegion.Earrings, EditRegion.Necklace],
    lighting_change: [], // lighting affects the whole image photometrically
    style_transfer: [EditRegion.Clothing, EditRegion.Hair, EditRegion.Background],
    pose_adjust: [], // blocked by default
    composite: [], // determined by sub-intents
    unknown: [],
};

/** Keywords that map to prohibited intents. */
const PROHIBITED_KEYWORDS: Array<{ pattern: RegExp; intent: ProhibitedIntent }> = [
    { pattern: /\b(reshape|change|alter)\s+(face|facial|jaw|chin|nose|cheek)/i, intent: "face_reshape" },
    { pattern: /\b(change|alter|modify)\s+(ethnicity|race|racial)/i, intent: "ethnicity_change" },
    { pattern: /\b(make|look)\s+(younger|older|aged?)/i, intent: "age_change" },
    { pattern: /\b(slim|thin|fat|muscular|reshape)\s+(body|figure|torso)/i, intent: "body_reshape" },
    { pattern: /\b(lighten|darken|change)\s+(skin|complexion|skin\s*tone)/i, intent: "skin_color_change" },
    { pattern: /\b(fingerprint|iris|retina|biometric)/i, intent: "biometric_alter" },
];

// ─── Prompt Analyzer ─────────────────────────────────────────────────────────

/**
 * Analyze a freeform prompt to extract intents and map to regions.
 *
 * This is a rule-based classifier. In production, this would be
 * augmented by an LLM-based semantic classifier with higher accuracy.
 */
export function analyzePrompt(rawPrompt: string): PromptAnalysis {
    const lowerPrompt = rawPrompt.toLowerCase();
    const detectedIntents: PromptIntentCategory[] = [];
    const prohibitedIntents: ProhibitedIntent[] = [];

    // Check for prohibited intents first
    for (const { pattern, intent } of PROHIBITED_KEYWORDS) {
        if (pattern.test(rawPrompt)) {
            prohibitedIntents.push(intent);
        }
    }

    // Detect valid intents via keyword matching
    if (/\b(suit|shirt|dress|blazer|jacket|clothing|outfit|wear|tuxedo|collar|tie|bowtie)\b/i.test(lowerPrompt)) {
        detectedIntents.push("clothing_change");
    }
    if (/\b(hair|hairstyle|haircut|curly|straight|wavy|bald|ponytail|braid|bob)\b/i.test(lowerPrompt)) {
        detectedIntents.push("hair_change");
    }
    if (/\b(background|backdrop|scene|setting|studio|outdoor|office|nature)\b/i.test(lowerPrompt)) {
        detectedIntents.push("background_change");
    }
    if (/\b(glasses|earring|necklace|watch|jewelry|accessory|accessories|piercing)\b/i.test(lowerPrompt)) {
        detectedIntents.push(lowerPrompt.includes("remove") ? "accessory_remove" : "accessory_add");
    }
    if (/\b(lighting|light|bright|dim|warm|cool|shadow|dramatic)\b/i.test(lowerPrompt)) {
        detectedIntents.push("lighting_change");
    }

    if (detectedIntents.length === 0 && prohibitedIntents.length === 0) {
        detectedIntents.push("unknown");
    } else if (detectedIntents.length > 1) {
        detectedIntents.push("composite");
    }

    // Map intents to regions
    const editRegionSet = new Set<EditRegion>();
    for (const intent of detectedIntents) {
        for (const region of INTENT_REGION_MAP[intent] ?? []) {
            editRegionSet.add(region);
        }
    }
    const inferredEditRegions = Array.from(editRegionSet);

    // Preserve regions = all identity regions + everything NOT in edit scope
    const allRegions = Object.values(EditRegion);
    const preserveSet = new Set<EditRegion>([...IDENTITY_LOCKED_REGIONS]);
    for (const r of allRegions) {
        if (!editRegionSet.has(r)) preserveSet.add(r);
    }
    const inferredPreserveRegions = Array.from(preserveSet);

    // Safety check
    const isSafe = prohibitedIntents.length === 0;
    const rejectionReason = isSafe
        ? null
        : `Prompt contains prohibited intent(s): ${prohibitedIntents.join(", ")}. These modifications violate identity preservation rules.`;

    // Additional negatives from detected intents
    const additionalNegatives: NegativeConstraint[] = [];
    if (detectedIntents.includes("hair_change")) {
        additionalNegatives.push({ id: "magic_preserve_hairline", description: "Preserve natural hairline boundary and forehead shape", weight: 0.9 });
    }
    if (detectedIntents.includes("clothing_change")) {
        additionalNegatives.push({ id: "magic_preserve_body_proportions", description: "Do not alter body proportions or posture", weight: 0.95 });
    }

    return {
        rawPrompt,
        detectedIntents,
        inferredEditRegions,
        inferredPreserveRegions,
        prohibitedIntents,
        classificationConfidence: isSafe ? 0.75 : 0.95,
        isSafe,
        rejectionReason,
        additionalNegatives,
    };
}

// ─── Controller ──────────────────────────────────────────────────────────────

export class MagicPromptStudioController implements IStudioController<MagicPromptParams> {
    readonly studioType = "magic_prompt" as StudioType;

    computeEditScope(perception: PerceptionOutput, params?: MagicPromptParams): EditScopeConfig {
        const analysis = params ? analyzePrompt(params.prompt) : { inferredEditRegions: [], inferredPreserveRegions: [...IDENTITY_LOCKED_REGIONS] };
        return {
            allowedRegions: analysis.inferredEditRegions,
            preserveRegions: analysis.inferredPreserveRegions,
            boundaryFeatherPx: 4,
        };
    }

    buildConditioning(params: MagicPromptParams, perception: PerceptionOutput, _genderMode: GenderMode): ConditioningPayload {
        const analysis = analyzePrompt(params.prompt);
        if (!analysis.isSafe) {
            return {
                structuredPrompt: `BLOCKED: ${analysis.rejectionReason}`,
                referenceImages: [],
                controlMaps: { blocked: "true", reason: analysis.rejectionReason ?? "" },
                negativeTokens: [],
            };
        }

        const structuredPrompt = [
            `${params.prompt}.`,
            `Maintain exact facial features and skin tone.`,
            `Only modify: ${analysis.inferredEditRegions.join(", ") || "minimal changes"}.`,
            `Preserve exactly: ${analysis.inferredPreserveRegions.join(", ")}.`,
        ].join(" ");

        const conditioning: ConditioningPayload = {
            structuredPrompt,
            referenceImages: [],
            controlMaps: {
                prompt_analysis: JSON.stringify(analysis),
                detected_intents: JSON.stringify(analysis.detectedIntents),
                creativity_level: String(params.creativityLevel),
            },
            negativeTokens: [],
        };

        const negatives = [...this.getNegativeConstraints(), ...analysis.additionalNegatives];
        const editScope = this.computeEditScope(perception, params);
        return applyConstraintsToConditioning(conditioning, editScope, negatives, params.identityStrength.value);
    }

    buildGenerationRequest(inputImageRef: string, params: MagicPromptParams, perception: PerceptionOutput, genderMode: GenderMode, retryAttempt = 0): GenerationRequest {
        return {
            studioType: "magic_prompt" as StudioType, inputImageRef, perception,
            editScope: this.computeEditScope(perception, params),
            conditioning: this.buildConditioning(params, perception, genderMode),
            negativeConstraints: this.getNegativeConstraints(),
            identityWeight: params.identityStrength.value,
            creativityLevel: params.creativityLevel, retryAttempt,
        };
    }

    getNegativeConstraints(): NegativeConstraint[] {
        return [...GLOBAL_NEGATIVE_CONSTRAINTS,
        { id: "magic_no_unintended_edits", description: "Do not modify any region outside the inferred edit scope", weight: 0.95 },
        { id: "magic_no_style_bleed", description: "Do not let style changes bleed into facial features", weight: 0.90 },
        ];
    }

    getQualityThresholds(): Record<string, number> {
        return {
            identity_stability: 0.92, pose_stability: 0.90, edge_fidelity: 0.85,
            lighting_coherence: 0.80, artifact_penalty: 0.88, composite: 0.85,
            prompt_adherence: 0.75, scope_containment: 0.90,
        };
    }

    validateOutput(_outputImageRef: string, outputPerception: PerceptionOutput, originalPerception: PerceptionOutput): ValidationResult {
        return validateOutput(originalPerception, outputPerception,
            { haloIntensity: 0, edgeJaggedness: 0, boundaryBleed: 0 },
            { inputCCT: originalPerception.photometrics.colorTemperatureK, outputCCT: outputPerception.photometrics.colorTemperatureK },
            { collarError: 0, lapelAsymmetry: 0, tieOffset: 0, shoulderSlopeDelta: 0 }, []);
    }
}

// ─── Defaults & Schema ───────────────────────────────────────────────────────

export function createDefaultMagicPromptParams(): MagicPromptParams {
    return {
        prompt: "",
        creativityLevel: 0.6,
        identityStrength: { value: 0.88, min: 0.5, max: 1.0, default: 0.88, step: 0.05, constraintImpact: 0.90 },
    };
}

export const MAGIC_PROMPT_PARAMS_SCHEMA = {
    type: "object",
    required: ["prompt", "creativityLevel", "identityStrength"],
    properties: {
        prompt: { type: "string", minLength: 3, maxLength: 500, description: "Freeform natural language edit instruction" },
        creativityLevel: { type: "number", minimum: 0.1, maximum: 0.9, default: 0.6, step: 0.1, description: "How much creative freedom the model has" },
        identityStrength: { type: "number", minimum: 0.5, maximum: 1.0, default: 0.88, step: 0.05, description: "Identity preservation weight" },
    },
} as const;
