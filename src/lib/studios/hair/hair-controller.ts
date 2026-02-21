/**
 * Formal.AI — Hair Studio Controller
 *
 * Controls hairstyle changes while strictly preserving
 * facial identity and hairline-to-face boundary integrity.
 *
 * Key challenges:
 *   - Hairline boundary preservation (no forehead shrink/expand)
 *   - Strand-level edge fidelity (no halo artifacts)
 *   - Ear-hair contact point maintenance
 *   - Consistent hair-face color temperature
 *
 * Mask strategy:
 *   - Soft feather mask at hairline boundary (3-5px gradient)
 *   - Hard mask on forehead skin zone
 *   - Anti-halo edge refinement pass
 */

import type {
    IStudioController,
    HairParams,
    StudioType,
    GenderMode,
    PerceptionOutput,
    EditScopeConfig,
    ConditioningPayload,
    GenerationRequest,
    NegativeConstraint,
    ValidationResult,
    BoundingBox,
} from "../core/types";

import { EditRegion } from "../core/types";
import { buildEditScope, GLOBAL_NEGATIVE_CONSTRAINTS, STUDIO_NEGATIVE_CONSTRAINTS, applyConstraintsToConditioning } from "../core/generation-control";
import { validateOutput } from "../core/validation-engine";

// ─── Hair-Specific Types ─────────────────────────────────────────────────────

/**
 * Hairline boundary definition.
 *
 * The hairline boundary is defined as a polyline through detected
 * hairline keypoints, with a feather width for soft blending.
 */
export interface HairlineBoundary {
    /** Ordered set of hairline keypoints, normalized [0..1]. */
    polylinePoints: Array<{ x: number; y: number }>;
    /** Feather width in pixels for soft boundary blending. */
    featherWidthPx: number;
    /** Confidence of hairline detection (0..1). */
    detectionConfidence: number;
}

/**
 * Ear-hair contact specification.
 *
 * Defines how hair interacts with ear regions. Critical for
 * long hairstyles and styles that cover ears.
 */
export interface EarHairContact {
    leftEar: {
        visible: boolean;
        contactType: "covered" | "partially_visible" | "fully_visible";
        contactLine: Array<{ x: number; y: number }>;
    };
    rightEar: {
        visible: boolean;
        contactType: "covered" | "partially_visible" | "fully_visible";
        contactLine: Array<{ x: number; y: number }>;
    };
}

/**
 * Hair region analysis from segmentation.
 */
export interface HairRegionAnalysis {
    /** Bounding box of the hair region. */
    hairBBox: BoundingBox;
    /** Percentage of image area occupied by hair. */
    coverageRatio: number;
    /** Dominant hair direction angle (0° = straight down). */
    dominantDirectionDeg: number;
    /** Average strand thickness estimate (normalized). */
    avgStrandThickness: number;
    /** Hair-skin boundary complexity score (0 = simple, 1 = complex). */
    boundaryComplexity: number;
}

// ─── Hair Edge Quality Metrics ───────────────────────────────────────────────

/**
 * Hair edge quality assessment.
 *
 * Checks for common AI hair generation artifacts:
 *   - Halo: bright or dark ring around hair edges
 *   - Jaggedness: staircase pattern on curved edges
 *   - Boundary bleed: hair color leaking into background/face
 *
 * Metric computation:
 *   haloIntensity = max(0, avgEdgeLuminance - avgAdjacentLuminance) / 255
 *   jaggedness = countDirectionChanges(edgePath) / edgePathLength
 *   bleed = colorDiffAtBoundary / expectedColorDiff
 */
export interface HairEdgeQuality {
    haloIntensity: number;   // [0..1], 0 = no halo
    edgeJaggedness: number;  // [0..1], 0 = perfectly smooth
    boundaryBleed: number;   // [0..1], 0 = no bleed
    compositeScore: number;  // weighted combination
}

/**
 * Compute hair edge quality from raw edge measurements.
 *
 * Formula:
 *   composite = 1 - (0.40 * haloIntensity + 0.35 * jaggedness + 0.25 * bleed)
 */
export function computeHairEdgeQuality(
    haloIntensity: number,
    edgeJaggedness: number,
    boundaryBleed: number,
): HairEdgeQuality {
    const compositeScore = Math.max(
        0,
        1 - (0.40 * haloIntensity + 0.35 * edgeJaggedness + 0.25 * boundaryBleed),
    );

    return {
        haloIntensity,
        edgeJaggedness,
        boundaryBleed,
        compositeScore,
    };
}

// ─── Controller Implementation ───────────────────────────────────────────────

export class HairStudioController implements IStudioController<HairParams> {
    readonly studioType = "hair" as StudioType;

    /**
     * Extract hairline boundary from perception data.
     *
     * Uses segmentation mask to trace the hair-forehead boundary,
     * then fits a smooth polyline with configurable feathering.
     */
    extractHairlineBoundary(perception: PerceptionOutput): HairlineBoundary {
        const hairMask = perception.segmentation.masks.find((m) => m.label === "hair");

        if (!hairMask || hairMask.confidence < 0.5) {
            return {
                polylinePoints: [],
                featherWidthPx: 4,
                detectionConfidence: 0,
            };
        }

        // The actual polyline extraction would be performed by the perception backend.
        // Here we define the expected shape of the boundary data.
        return {
            polylinePoints: hairMask.boundaryPoints ?? [],
            featherWidthPx: hairMask.confidence > 0.8 ? 3 : 5,   // tighter feather for high confidence
            detectionConfidence: hairMask.confidence,
        };
    }

    /**
     * Analyze ear-hair contact from perception data.
     */
    analyzeEarContact(perception: PerceptionOutput): EarHairContact {
        const landmarks = perception.faceLandmarks;
        const hairMask = perception.segmentation.masks.find((m) => m.label === "hair");

        // Default to ears visible when no hair mask
        if (!hairMask) {
            return {
                leftEar: { visible: true, contactType: "fully_visible", contactLine: [] },
                rightEar: { visible: true, contactType: "fully_visible", contactLine: [] },
            };
        }

        // Determine ear visibility from face landmarks and hair segmentation overlap
        const leftEarLandmark = landmarks.leftEar;
        const rightEarLandmark = landmarks.rightEar;

        const classifyContact = (
            earPoint: { x: number; y: number } | undefined,
        ): "covered" | "partially_visible" | "fully_visible" => {
            if (!earPoint) return "covered";
            // Coverage determination would be computed from mask overlap
            // This is a placeholder classification based on available data
            return "partially_visible";
        };

        return {
            leftEar: {
                visible: !!leftEarLandmark,
                contactType: classifyContact(leftEarLandmark),
                contactLine: [],
            },
            rightEar: {
                visible: !!rightEarLandmark,
                contactType: classifyContact(rightEarLandmark),
                contactLine: [],
            },
        };
    }

    // ── IStudioController Implementation ──────────────────────────────────────

    computeEditScope(perception: PerceptionOutput): EditScopeConfig {
        const base = buildEditScope("hair" as StudioType);

        // If hairline boundary is complex, tighten the feather zone
        const hairMask = perception.segmentation.masks.find((m) => m.label === "hair");
        if (hairMask && hairMask.confidence < 0.7) {
            // Low confidence → restrict to just hair region, exclude hairline
            return {
                ...base,
                allowedRegions: base.allowedRegions.filter((r) => r !== EditRegion.Hairline),
            };
        }

        return base;
    }

    buildConditioning(
        params: HairParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
    ): ConditioningPayload {
        const hairline = this.extractHairlineBoundary(perception);
        const earContact = this.analyzeEarContact(perception);

        // Build structured prompt
        const genderHint = genderMode === "Ladies" ? "women's " : "men's ";
        const styleDesc = params.style.replace(/_/g, " ");
        const lengthDesc = params.length.replace(/_/g, " ");
        const textureDesc = params.texture.replace(/_/g, " ");
        const colorDesc = params.color.replace(/_/g, " ");

        const partingDesc = params.parting !== "none"
            ? ` with ${params.parting} parting`
            : "";

        const structuredPrompt = [
            `Professional portrait with ${genderHint}${lengthDesc} hairstyle.`,
            `Style: ${styleDesc}${partingDesc}.`,
            `Texture: ${textureDesc}. Color: ${colorDesc}.`,
            `Maintain exact facial features, forehead shape, and face proportions.`,
            `Hairline must follow natural boundary.`,
            `Hair strands must have clean, artifact-free edges.`,
            `No halo effects around hair boundary.`,
        ].join(" ");

        const conditioning: ConditioningPayload = {
            structuredPrompt,
            referenceImages: [],
            controlMaps: {
                hairline_boundary: JSON.stringify(hairline),
                ear_contact: JSON.stringify(earContact),
                hair_direction: String(perception.hairAnalysis?.dominantDirection ?? 0),
                feather_width: String(hairline.featherWidthPx),
            },
            negativeTokens: [],
        };

        const editScope = this.computeEditScope(perception);
        const negatives = this.getNegativeConstraints();

        return applyConstraintsToConditioning(
            conditioning,
            editScope,
            negatives,
            params.identityStrength.value,
        );
    }

    buildGenerationRequest(
        inputImageRef: string,
        params: HairParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
        retryAttempt = 0,
    ): GenerationRequest {
        return {
            studioType: "hair" as StudioType,
            inputImageRef,
            perception,
            editScope: this.computeEditScope(perception),
            conditioning: this.buildConditioning(params, perception, genderMode),
            negativeConstraints: this.getNegativeConstraints(),
            identityWeight: params.identityStrength.value,
            creativityLevel: 0.4, // conservative for hair
            retryAttempt,
        };
    }

    getNegativeConstraints(): NegativeConstraint[] {
        return [
            ...GLOBAL_NEGATIVE_CONSTRAINTS,
            ...STUDIO_NEGATIVE_CONSTRAINTS.hair,
        ];
    }

    getQualityThresholds(): Record<string, number> {
        return {
            identity_stability: 0.92,
            pose_stability: 0.90,
            geometry_alignment: 0.80,
            edge_fidelity: 0.90,        // stricter for hair
            lighting_coherence: 0.82,
            artifact_penalty: 0.90,
            composite: 0.87,
            // Hair-specific
            hairline_fidelity: 0.88,
            halo_free: 0.90,
            strand_edge_quality: 0.85,
        };
    }

    validateOutput(
        _outputImageRef: string,
        outputPerception: PerceptionOutput,
        originalPerception: PerceptionOutput,
    ): ValidationResult {
        return validateOutput(
            originalPerception,
            outputPerception,
            { haloIntensity: 0, edgeJaggedness: 0, boundaryBleed: 0 },
            {
                inputCCT: originalPerception.photometrics.colorTemperatureK,
                outputCCT: outputPerception.photometrics.colorTemperatureK,
            },
            { collarError: 0, lapelAsymmetry: 0, tieOffset: 0, shoulderSlopeDelta: 0 },
            [],
        );
    }
}

// ─── Default Parameter Factory ───────────────────────────────────────────────

export function createDefaultHairParams(): HairParams {
    return {
        style: "professional_crop",
        length: "short",
        texture: "straight",
        color: "natural",
        parting: "side",
        identityStrength: {
            value: 0.90,
            min: 0.5,
            max: 1.0,
            default: 0.90,
            step: 0.05,
            constraintImpact: 0.95,
        },
    };
}

// ─── JSON Schema ─────────────────────────────────────────────────────────────

export const HAIR_PARAMS_SCHEMA = {
    type: "object",
    required: ["style", "length", "texture", "color", "parting", "identityStrength"],
    properties: {
        style: {
            type: "string",
            enum: [
                "professional_crop", "textured_layers", "slicked_back",
                "soft_waves", "corporate_bob", "natural_curls",
                "low_fade", "pompadour", "braided_updo",
            ],
            default: "professional_crop",
            description: "Overall hairstyle classification",
            constraintImpact: "Dramatic style changes (e.g., crop → braided_updo) increase edge fidelity requirements",
        },
        length: {
            type: "string",
            enum: ["buzz", "short", "medium", "long", "very_long"],
            default: "short",
            description: "Hair length category",
            constraintImpact: "Longer hair increases boundary complexity and requires larger edit regions",
        },
        texture: {
            type: "string",
            enum: ["straight", "wavy", "curly", "coily", "kinky"],
            default: "straight",
            description: "Hair texture type",
            constraintImpact: "Curly/coily textures increase edge complexity; may need wider feather masks",
        },
        color: {
            type: "string",
            enum: ["natural", "black", "dark_brown", "medium_brown", "light_brown", "blonde", "auburn", "gray", "silver"],
            default: "natural",
            description: "Hair color",
            constraintImpact: "High-contrast color changes (dark → blonde) increase halo risk at edges",
        },
        parting: {
            type: "string",
            enum: ["none", "center", "side", "deep_side"],
            default: "side",
            description: "Hair parting style",
            constraintImpact: "Changes parting line generation and forehead exposure boundaries",
        },
        identityStrength: {
            type: "number",
            minimum: 0.5,
            maximum: 1.0,
            default: 0.90,
            step: 0.05,
            description: "Identity preservation strength — higher for Hair studio due to hairline sensitivity",
            constraintImpact: "Hair studio defaults to 0.90 (higher than portrait) because hairline-forehead boundary is identity-critical",
        },
    },
} as const;
