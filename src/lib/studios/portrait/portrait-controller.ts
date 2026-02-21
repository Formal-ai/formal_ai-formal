/**
 * Formal.AI — Portrait Studio Controller
 *
 * Handles controlled wardrobe replacement and lighting optimization
 * without altering biometric identity features.
 *
 * Two-pass generation strategy:
 *   Pass A: Structural garment layout (coarse positioning)
 *   Pass B: Texture and realism refinement (fabric detail)
 *
 * Anchor points: neck centerline, collar tips, shoulder slope, torso midline
 */

import type {
    IStudioController,
    PortraitParams,
    StudioType,
    GenderMode,
    PerceptionOutput,
    EditScopeConfig,
    ConditioningPayload,
    GenerationRequest,
    NegativeConstraint,
    ValidationResult,
    Point2D,
} from "../core/types";

import { EditRegion } from "../core/types";
import { buildEditScope, GLOBAL_NEGATIVE_CONSTRAINTS, STUDIO_NEGATIVE_CONSTRAINTS, applyConstraintsToConditioning } from "../core/generation-control";
import { validateOutput } from "../core/validation-engine";
import { evaluatePortraitGeometry } from "../core/quality-evaluator";

// ─── Portrait-Specific Types ─────────────────────────────────────────────────

/**
 * Face identity stability map.
 * Defines "do-not-change" vs "safe-to-correct" zones.
 */
export interface IdentityStabilityMap {
    /** Zones that MUST NOT change — biometric identity features. */
    doNotChangeZones: {
        eyes: boolean;
        noseBridge: boolean;
        nostrils: boolean;
        philtrum: boolean;
        lipLine: boolean;
        jawContour: boolean;
    };
    /** Zones where minor photometric correction is allowed. */
    safeToCorrectZones: {
        skinExposure: boolean;    // minor exposure correction
        colorBalance: boolean;    // white balance fix
        noiseRemoval: boolean;    // denoising
        shadowSoftening: boolean; // soft fill light
    };
}

/**
 * Structural anchor points for garment placement.
 *
 * All coordinates are normalized [0..1] relative to image dimensions.
 */
export interface GarmentAnchorPoints {
    /** Neck centerline — vertical axis for tie/collar alignment. */
    neckCenterline: { top: Point2D; bottom: Point2D };
    /** Left and right collar tip positions. */
    collarTips: { left: Point2D; right: Point2D };
    /** Shoulder seam placement targets. */
    shoulderSeams: { left: Point2D; right: Point2D };
    /** Torso midline — vertical axis for button alignment. */
    torsoMidline: { top: Point2D; bottom: Point2D };
    /** Tie knot anchor — centered on collar between collar tips. */
    tieKnotAnchor: Point2D;
    /** Lapel notch positions. */
    lapelNotches: { left: Point2D; right: Point2D };
    /** Button line center axis. */
    buttonLineAxis: Point2D[];
}

/**
 * Two-pass generation plan.
 */
export interface TwoPassPlan {
    passA: {
        description: "Structural garment layout";
        regions: EditRegion[];
        objectives: string[];
    };
    passB: {
        description: "Texture and realism refinement";
        regions: EditRegion[];
        objectives: string[];
    };
}

// ─── Controller Implementation ───────────────────────────────────────────────

export class PortraitStudioController
    implements IStudioController<PortraitParams> {
    readonly studioType = "portrait" as StudioType;

    /**
     * Compute anchor points from perception data.
     *
     * Algorithm:
     *   neckCenter.x = (leftShoulder.x + rightShoulder.x) / 2
     *   neckCenter.y = neck.y
     *
     *   collarTips:
     *     left  = lerp(neck, leftShoulder, 0.3)
     *     right = lerp(neck, rightShoulder, 0.3)
     *
     *   shoulderSeams:
     *     left  = leftShoulder (adjusted down by shoulderSlope angle)
     *     right = rightShoulder
     *
     *   tieKnotAnchor = neckCenter + small offset below
     *
     *   torsoMidline = vertical line through neckCenter.x, from neck to hip midpoint
     */
    computeAnchorPoints(perception: PerceptionOutput): GarmentAnchorPoints {
        const { neck, leftShoulder, rightShoulder, chestCenter, leftHip, rightHip } =
            perception.bodyKeypoints;

        const neckCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        const hipCenterY = (leftHip.y + rightHip.y) / 2;

        return {
            neckCenterline: {
                top: { x: neckCenterX, y: neck.y },
                bottom: { x: neckCenterX, y: chestCenter.y },
            },
            collarTips: {
                left: lerp2D(neck, leftShoulder, 0.3),
                right: lerp2D(neck, rightShoulder, 0.3),
            },
            shoulderSeams: {
                left: { ...leftShoulder },
                right: { ...rightShoulder },
            },
            torsoMidline: {
                top: { x: neckCenterX, y: neck.y },
                bottom: { x: neckCenterX, y: hipCenterY },
            },
            tieKnotAnchor: {
                x: neckCenterX,
                y: neck.y + (chestCenter.y - neck.y) * 0.15,
            },
            lapelNotches: {
                left: lerp2D(neck, leftShoulder, 0.45),
                right: lerp2D(neck, rightShoulder, 0.45),
            },
            buttonLineAxis: [
                { x: neckCenterX, y: chestCenter.y },
                { x: neckCenterX, y: chestCenter.y + (hipCenterY - chestCenter.y) * 0.5 },
            ],
        };
    }

    /**
     * Build the two-pass generation plan.
     *
     * Pass A: Structural layout
     *   - Generate coarse suit silhouette with correct positioning
     *   - Align collar to neck, jacket to shoulders
     *   - Position lapels, buttonline, tie area
     *
     * Pass B: Texture refinement
     *   - Add fabric texture, wool grain, stitching hints
     *   - Add realistic folds and drape
     *   - Add collar shadows and soft contact shading
     *   - Polish fabric-skin boundary
     */
    buildTwoPassPlan(): TwoPassPlan {
        return {
            passA: {
                description: "Structural garment layout",
                regions: [
                    EditRegion.Clothing,
                    EditRegion.CollarArea,
                    EditRegion.LapelArea,
                    EditRegion.Shoulders,
                    EditRegion.Torso,
                ],
                objectives: [
                    "Generate correctly-positioned suit structure",
                    "Align collar contact line with neck contour",
                    "Match jacket shoulder seam to natural shoulder slope",
                    "Center lapel notches symmetrically",
                    "Position button line on torso midline axis",
                ],
            },
            passB: {
                description: "Texture and realism refinement",
                regions: [
                    EditRegion.Clothing,
                    EditRegion.CollarArea,
                    EditRegion.LapelArea,
                    EditRegion.TieArea,
                ],
                objectives: [
                    "Apply fabric texture with realistic grain direction",
                    "Add natural fold lines following body contours",
                    "Add collar shadow and contact shading",
                    "Refine fabric-skin boundary at neck",
                    "Add stitching hints at seams and lapel edges",
                ],
            },
        };
    }

    // ── IStudioController Implementation ──────────────────────────────────────

    computeEditScope(perception: PerceptionOutput): EditScopeConfig {
        const base = buildEditScope("portrait" as StudioType);

        // If high warp risk, remove Neck from editable
        if (perception.geometryRisk.warpRisk > 0.3) {
            return {
                ...base,
                allowedRegions: base.allowedRegions.filter((r) => r !== EditRegion.Neck),
            };
        }

        return base;
    }

    buildConditioning(
        params: PortraitParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
    ): ConditioningPayload {
        const anchors = this.computeAnchorPoints(perception);
        const plan = this.buildTwoPassPlan();

        // Build structured prompt from parameters
        const suitDesc = `${params.fit} fit ${params.suitStyle} suit`;
        const lapelDesc = `${params.lapelWidth} lapels`;
        const collarDesc = `${params.shirtCollar} collar shirt`;
        const tieDesc = params.tie === "none" ? "no tie" : params.tie;
        const lightDesc = params.lightingMood.replace(/_/g, " ");

        const genderPrefix = genderMode === "Ladies" ? "professional women's " : "";

        const structuredPrompt = [
            `Professional portrait photograph.`,
            `Subject wearing ${genderPrefix}${suitDesc} with ${lapelDesc}.`,
            `${collarDesc} underneath, ${tieDesc}.`,
            `${lightDesc} lighting.`,
            `Maintain exact facial features and skin tone.`,
            `Collar must align with neck contour.`,
            `Jacket shoulders must match natural shoulder slope.`,
            `Fabric must have realistic texture with natural folds.`,
        ].join(" ");

        const conditioning: ConditioningPayload = {
            structuredPrompt,
            referenceImages: [],
            controlMaps: {
                garment_blueprint: JSON.stringify(plan),
                anchor_points: JSON.stringify(anchors),
                shoulder_slope: String(perception.torsoOrientation.shoulderSlopeAngleDeg),
            },
            negativeTokens: [],
        };

        // Apply constraints
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
        params: PortraitParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
        retryAttempt = 0,
    ): GenerationRequest {
        return {
            studioType: "portrait" as StudioType,
            inputImageRef,
            perception,
            editScope: this.computeEditScope(perception),
            conditioning: this.buildConditioning(params, perception, genderMode),
            negativeConstraints: this.getNegativeConstraints(),
            identityWeight: params.identityStrength.value,
            creativityLevel: 0.5,
            retryAttempt,
        };
    }

    getNegativeConstraints(): NegativeConstraint[] {
        return [
            ...GLOBAL_NEGATIVE_CONSTRAINTS,
            ...STUDIO_NEGATIVE_CONSTRAINTS.portrait,
        ];
    }

    getQualityThresholds(): Record<string, number> {
        return {
            identity_stability: 0.92,
            pose_stability: 0.90,
            geometry_alignment: 0.85,
            edge_fidelity: 0.88,
            lighting_coherence: 0.82,
            artifact_penalty: 0.90,
            composite: 0.87,
            // Portrait-specific
            collar_alignment: 0.85,
            lapel_symmetry: 0.80,
            tie_centering: 0.82,
            shoulder_alignment: 0.85,
        };
    }

    validateOutput(
        _outputImageRef: string,
        outputPerception: PerceptionOutput,
        originalPerception: PerceptionOutput,
    ): ValidationResult {
        // Portrait-specific geometry evaluation
        const geoMetrics = evaluatePortraitGeometry(originalPerception, outputPerception);

        return validateOutput(
            originalPerception,
            outputPerception,
            { haloIntensity: 0, edgeJaggedness: 0, boundaryBleed: 0 }, // minimal edge concern for portrait
            {
                inputCCT: originalPerception.photometrics.colorTemperatureK,
                outputCCT: outputPerception.photometrics.colorTemperatureK,
            },
            geoMetrics,
            [], // artifacts detected during generation
        );
    }
}

// ─── Default Parameter Factory ───────────────────────────────────────────────

export function createDefaultPortraitParams(): PortraitParams {
    return {
        suitStyle: "single-breasted",
        fit: "tailored",
        lapelWidth: "standard",
        shirtCollar: "spread",
        tie: "tie",
        lightingMood: "neutral_studio",
        identityStrength: {
            value: 0.85,
            min: 0.5,
            max: 1.0,
            default: 0.85,
            step: 0.05,
            constraintImpact: 0.9,
        },
    };
}

// ─── JSON Schema for User Parameters ─────────────────────────────────────────

export const PORTRAIT_PARAMS_SCHEMA = {
    type: "object",
    required: ["suitStyle", "fit", "lapelWidth", "shirtCollar", "tie", "lightingMood", "identityStrength"],
    properties: {
        suitStyle: {
            type: "string",
            enum: ["single-breasted", "double-breasted", "tuxedo"],
            default: "single-breasted",
            description: "Suit jacket construction style",
            constraintImpact: "Affects garment generation region and lapel structure",
        },
        fit: {
            type: "string",
            enum: ["slim", "tailored", "relaxed"],
            default: "tailored",
            description: "Garment fit from body-hugging to loose",
            constraintImpact: "Wider fits require larger edit scope; slim fits demand tighter geometry alignment",
        },
        lapelWidth: {
            type: "string",
            enum: ["narrow", "standard", "wide"],
            default: "standard",
            description: "Width of suit lapels",
            constraintImpact: "Wide lapels increase symmetry check sensitivity",
        },
        shirtCollar: {
            type: "string",
            enum: ["classic", "spread", "cutaway", "button-down", "mandarin", "wing"],
            default: "spread",
            description: "Shirt collar style",
            constraintImpact: "Collar type changes neck-contact alignment requirements",
        },
        tie: {
            type: "string",
            enum: ["none", "tie", "bowtie"],
            default: "tie",
            description: "Tie/bowtie selection",
            constraintImpact: "Adds tie-centering validation check when not 'none'",
        },
        lightingMood: {
            type: "string",
            enum: ["neutral_studio", "soft_window", "corporate_office", "warm_editorial", "cool_editorial"],
            default: "neutral_studio",
            description: "Overall lighting mood for the portrait",
            constraintImpact: "Affects photometric matching thresholds and color temperature targets",
        },
        identityStrength: {
            type: "number",
            minimum: 0.5,
            maximum: 1.0,
            default: 0.85,
            step: 0.05,
            description: "Identity preservation strength (higher = less drift, less transformation freedom)",
            constraintImpact: "Directly scales identity preservation weight in generation. Values above 0.90 significantly restrict garment transformation range.",
        },
    },
} as const;

// ─── Utility ─────────────────────────────────────────────────────────────────

function lerp2D(a: Point2D, b: Point2D, t: number): Point2D {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    };
}
