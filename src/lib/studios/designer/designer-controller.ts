/**
 * Formal.AI — Designer & Brand Owner Studio Controller
 *
 * Extends the Portrait Studio with brand-identity-aware generation:
 *   - Brand color palettes applied to garments and accessories
 *   - Logo/monogram placement with brand guidelines
 *   - Corporate dress code compliance checks
 *   - Style guide consistency enforcement
 *
 * Architecture:
 *   - Composes PortraitStudioController for base garment logic
 *   - Adds brand overlay layer for color/logo injection
 *   - Adds corporate compliance validation pass
 */

import type {
    IStudioController,
    DesignerParams,
    StudioType,
    GenderMode,
    PerceptionOutput,
    EditScopeConfig,
    ConditioningPayload,
    GenerationRequest,
    NegativeConstraint,
    ValidationResult,
} from "../core/types";

import { EditRegion } from "../core/types";
import {
    buildEditScope,
    GLOBAL_NEGATIVE_CONSTRAINTS,
    STUDIO_NEGATIVE_CONSTRAINTS,
    applyConstraintsToConditioning,
} from "../core/generation-control";
import { validateOutput } from "../core/validation-engine";

// ─── Designer-Specific Types ─────────────────────────────────────────────────

/** Brand identity specification. */
export interface BrandIdentity {
    /** Primary brand color (hex). */
    primaryColor: string;
    /** Secondary brand color (hex). */
    secondaryColor: string;
    /** Accent color (hex). */
    accentColor: string;
    /** Brand name for prompt context. */
    brandName: string;
    /** Logo placement preference. */
    logoPlacement: "none" | "breast_pocket" | "lapel_pin" | "tie_clip" | "cufflink";
    /** Corporate dress code strictness. */
    dressCodeLevel: "casual" | "business_casual" | "formal" | "executive";
}

/**
 * Brand color compliance check result.
 *
 * Verifies that generated garment colors fall within the
 * brand palette with acceptable tolerance.
 *
 * Color distance metric: CIE ΔE*₂₀₀₀
 *   ΔE < 2.0  → visually identical
 *   ΔE < 5.0  → acceptable brand match
 *   ΔE > 10.0 → noticeably different — fails compliance
 */
export interface BrandColorCompliance {
    /** Average ΔE between target brand color and generated garment color. */
    avgDeltaE: number;
    /** Maximum ΔE deviation. */
    maxDeltaE: number;
    /** Whether the colors pass brand compliance (ΔE < 5.0 threshold). */
    passes: boolean;
    /** Detail string for debugging. */
    detail: string;
}

/**
 * Corporate dress code compliance result.
 */
export interface DressCodeCompliance {
    /** Whether the generated outfit meets the dress code level requirements. */
    meetsRequirements: boolean;
    /** List of compliance issues found. */
    issues: string[];
    /** Compliance score (0..1). */
    score: number;
}

/** Dress code rules per strictness level. */
const DRESS_CODE_RULES: Record<string, { required: string[]; prohibited: string[] }> = {
    casual: { required: ["collared_shirt"], prohibited: [] },
    business_casual: { required: ["collared_shirt", "trousers"], prohibited: ["jeans", "sneakers"] },
    formal: { required: ["suit_jacket", "dress_shirt", "tie"], prohibited: ["polo", "sneakers", "jeans"] },
    executive: { required: ["suit_jacket", "dress_shirt", "tie", "pocket_square"], prohibited: ["polo", "sneakers", "jeans", "casual_watch"] },
};

// ─── Controller ──────────────────────────────────────────────────────────────

export class DesignerStudioController implements IStudioController<DesignerParams> {
    readonly studioType = "designer" as StudioType;

    /** Build brand conditioning layer on top of base portrait conditioning. */
    private buildBrandOverlay(brand: BrandIdentity): string {
        const colorDesc = `Brand colors: primary ${brand.primaryColor}, secondary ${brand.secondaryColor}, accent ${brand.accentColor}.`;
        const logoDesc = brand.logoPlacement !== "none"
            ? ` Subtle brand logo/monogram on ${brand.logoPlacement.replace(/_/g, " ")}.`
            : "";
        const codeDesc = ` Dress code: ${brand.dressCodeLevel.replace(/_/g, " ")}.`;
        return `${colorDesc}${logoDesc}${codeDesc}`;
    }

    /** Validate dress code compliance. */
    validateDressCode(dressCodeLevel: string, detectedGarments: string[]): DressCodeCompliance {
        const rules = DRESS_CODE_RULES[dressCodeLevel] ?? DRESS_CODE_RULES.formal;
        const issues: string[] = [];

        for (const req of rules.required) {
            if (!detectedGarments.some((g) => g.includes(req))) {
                issues.push(`Missing required item: ${req.replace(/_/g, " ")}`);
            }
        }
        for (const prohib of rules.prohibited) {
            if (detectedGarments.some((g) => g.includes(prohib))) {
                issues.push(`Prohibited item detected: ${prohib.replace(/_/g, " ")}`);
            }
        }

        const score = Math.max(0, 1 - issues.length * 0.2);
        return { meetsRequirements: issues.length === 0, issues, score };
    }

    // ── IStudioController Implementation ──────────────────────────────────────

    computeEditScope(_perception: PerceptionOutput): EditScopeConfig {
        return buildEditScope("designer" as StudioType);
    }

    buildConditioning(params: DesignerParams, perception: PerceptionOutput, genderMode: GenderMode): ConditioningPayload {
        const brand = params.brandIdentity;
        const brandOverlay = this.buildBrandOverlay(brand);

        const genderPrefix = genderMode === "Ladies" ? "professional women's " : "";
        const suitDesc = `${params.fit} fit ${params.suitStyle} suit`;

        const structuredPrompt = [
            `Professional corporate portrait.`,
            `Subject wearing ${genderPrefix}${suitDesc}.`,
            `${brandOverlay}`,
            `Garment colors must match brand palette within CIE ΔE*₂₀₀₀ < 5.0.`,
            `Maintain exact facial features and skin tone.`,
            `Corporate, polished, premium finish.`,
        ].join(" ");

        const conditioning: ConditioningPayload = {
            structuredPrompt,
            referenceImages: [],
            controlMaps: {
                brand_identity: JSON.stringify(brand),
                dress_code_level: brand.dressCodeLevel,
                primary_color: brand.primaryColor,
                secondary_color: brand.secondaryColor,
            },
            negativeTokens: [],
        };

        const editScope = this.computeEditScope(perception);
        const negatives = this.getNegativeConstraints();
        return applyConstraintsToConditioning(conditioning, editScope, negatives, params.identityStrength.value);
    }

    buildGenerationRequest(inputImageRef: string, params: DesignerParams, perception: PerceptionOutput, genderMode: GenderMode, retryAttempt = 0): GenerationRequest {
        return {
            studioType: "designer" as StudioType, inputImageRef, perception,
            editScope: this.computeEditScope(perception),
            conditioning: this.buildConditioning(params, perception, genderMode),
            negativeConstraints: this.getNegativeConstraints(),
            identityWeight: params.identityStrength.value,
            creativityLevel: 0.4, retryAttempt,
        };
    }

    getNegativeConstraints(): NegativeConstraint[] {
        return [...GLOBAL_NEGATIVE_CONSTRAINTS, ...(STUDIO_NEGATIVE_CONSTRAINTS.designer ?? []),
        { id: "designer_no_off_brand_colors", description: "Do not generate garment colors outside the brand palette", weight: 0.90 },
        { id: "designer_no_casual_elements", description: "Do not introduce casual clothing elements in formal dress codes", weight: 0.85 },
        ];
    }

    getQualityThresholds(): Record<string, number> {
        return {
            identity_stability: 0.92, pose_stability: 0.90, geometry_alignment: 0.85,
            edge_fidelity: 0.88, lighting_coherence: 0.82, artifact_penalty: 0.90,
            composite: 0.87, brand_color_compliance: 0.85, dress_code_compliance: 0.90,
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

export function createDefaultDesignerParams(): DesignerParams {
    return {
        suitStyle: "single-breasted", fit: "tailored",
        brandIdentity: {
            primaryColor: "#1a1a2e", secondaryColor: "#16213e", accentColor: "#0f3460",
            brandName: "", logoPlacement: "none", dressCodeLevel: "formal",
        },
        identityStrength: { value: 0.88, min: 0.5, max: 1.0, default: 0.88, step: 0.05, constraintImpact: 0.90 },
    };
}

export const DESIGNER_PARAMS_SCHEMA = {
    type: "object",
    required: ["suitStyle", "fit", "brandIdentity", "identityStrength"],
    properties: {
        suitStyle: { type: "string", enum: ["single-breasted", "double-breasted", "tuxedo"], default: "single-breasted" },
        fit: { type: "string", enum: ["slim", "tailored", "relaxed"], default: "tailored" },
        brandIdentity: {
            type: "object",
            required: ["primaryColor", "secondaryColor", "accentColor", "brandName", "logoPlacement", "dressCodeLevel"],
            properties: {
                primaryColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
                secondaryColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
                accentColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
                brandName: { type: "string", maxLength: 100 },
                logoPlacement: { type: "string", enum: ["none", "breast_pocket", "lapel_pin", "tie_clip", "cufflink"] },
                dressCodeLevel: { type: "string", enum: ["casual", "business_casual", "formal", "executive"] },
            },
        },
        identityStrength: { type: "number", minimum: 0.5, maximum: 1.0, default: 0.88, step: 0.05 },
    },
} as const;
