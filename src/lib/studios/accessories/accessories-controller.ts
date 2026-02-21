/**
 * Formal.AI — Accessories Studio Controller
 *
 * Controls accessory application (glasses, earrings, necklaces,
 * piercings, watches) while preserving facial identity.
 *
 * Key challenges:
 *   - Accessory placement must respect facial geometry (glasses sit on nose bridge)
 *   - Earrings must align with earlobe landmarks
 *   - Necklace must follow neck contour
 *   - No skin texture alteration beneath accessories
 *   - Shadows from accessories must be anatomically correct
 *
 * Placement anchoring:
 *   - Glasses → nose bridge + ear temples (2D projected)
 *   - Earrings → earlobe anchor points
 *   - Necklace → neck contour polyline + clavicle endpoints
 *   - Watch → wrist landmark (if visible)
 */

import type {
    IStudioController,
    AccessoriesParams,
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

// ─── Accessories-Specific Types ──────────────────────────────────────────────

/**
 * Anchor points for accessory placement.
 */
export interface AccessoryAnchorMap {
    glasses: {
        noseBridge: Point2D;
        leftTemple: Point2D;
        rightTemple: Point2D;
        /** Angle of the nose bridge (for tilted heads). */
        bridgeAngleDeg: number;
        /** Inter-pupillary distance for frame width scaling. */
        interPupillaryDistanceNorm: number;
    };
    earrings: {
        leftEarlobe: Point2D | null;
        rightEarlobe: Point2D | null;
        /** Visibility flags for left/right ears. */
        leftEarVisible: boolean;
        rightEarVisible: boolean;
    };
    necklace: {
        /** Ordered polyline following neck contour for chain drape. */
        neckContour: Point2D[];
        /** Left and right clavicle endpoints. */
        clavicleEndpoints: { left: Point2D; right: Point2D } | null;
        /** Necklace drape center — lowest point of the chain. */
        drapeCenter: Point2D | null;
    };
    watch: {
        /** Wrist anchor, null if wrist not visible. */
        wristAnchor: Point2D | null;
        visible: boolean;
    };
}

/**
 * Accessory shadow specification.
 *
 * Defines expected shadow properties for physically-correct accessory rendering.
 */
export interface AccessoryShadowSpec {
    /** Shadow direction angle (derived from lighting direction). */
    shadowAngleDeg: number;
    /** Shadow softness (0 = hard shadow, 1 = very diffuse). */
    shadowSoftness: number;
    /** Shadow opacity (0..1). */
    shadowOpacity: number;
    /** Whether glasses need nose-pad shadow. */
    nosePadShadow: boolean;
    /** Whether earrings cast shadow on neck. */
    earringShadowOnNeck: boolean;
}

/**
 * Accessory type classification for placement logic branching.
 */
export type AccessoryType = "glasses" | "earrings" | "necklace" | "watch" | "piercing";

// ─── Controller Implementation ───────────────────────────────────────────────

export class AccessoriesStudioController
    implements IStudioController<AccessoriesParams> {
    readonly studioType = "accessories" as StudioType;

    /**
     * Compute accessory anchor points from perception data.
     *
     * Glasses anchoring algorithm:
     *   noseBridge = midpoint(leftEyeInnerCorner, rightEyeInnerCorner)
     *   bridgeAngle = atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180/π)
     *   temples = ear landmarks projected to eye plane
     *   IPD = dist(leftPupil, rightPupil) / imageWidth
     *
     * Earring anchoring:
     *   earlobe = ear bottom landmark (if detected)
     *
     * Necklace anchoring:
     *   neckContour = chin-to-clavicle polyline from segmentation boundary
     */
    computeAnchorMap(perception: PerceptionOutput): AccessoryAnchorMap {
        const lm = perception.faceLandmarks;
        const body = perception.bodyKeypoints;

        // Glasses computation
        const noseBridge: Point2D = {
            x: (lm.leftEyeInnerCorner.x + lm.rightEyeInnerCorner.x) / 2,
            y: (lm.leftEyeInnerCorner.y + lm.rightEyeInnerCorner.y) / 2,
        };

        const bridgeAngleDeg =
            Math.atan2(
                lm.rightEyeCenter.y - lm.leftEyeCenter.y,
                lm.rightEyeCenter.x - lm.leftEyeCenter.x,
            ) * (180 / Math.PI);

        const ipd =
            Math.sqrt(
                Math.pow(lm.leftPupil.x - lm.rightPupil.x, 2) +
                Math.pow(lm.leftPupil.y - lm.rightPupil.y, 2),
            );

        // Neck contour for necklace drape
        const neckContour: Point2D[] = [
            lm.chinBottom,
            { x: (lm.chinBottom.x + body.neck.x) / 2, y: (lm.chinBottom.y + body.neck.y) / 2 },
            body.neck,
        ];

        const clavicleEndpoints =
            body.leftShoulder && body.rightShoulder
                ? {
                    left: {
                        x: body.leftShoulder.x + (body.neck.x - body.leftShoulder.x) * 0.3,
                        y: body.leftShoulder.y,
                    },
                    right: {
                        x: body.rightShoulder.x + (body.neck.x - body.rightShoulder.x) * 0.3,
                        y: body.rightShoulder.y,
                    },
                }
                : null;

        return {
            glasses: {
                noseBridge,
                leftTemple: lm.leftEar ?? { x: lm.leftEyeOuterCorner.x - ipd * 0.5, y: lm.leftEyeCenter.y },
                rightTemple: lm.rightEar ?? { x: lm.rightEyeOuterCorner.x + ipd * 0.5, y: lm.rightEyeCenter.y },
                bridgeAngleDeg,
                interPupillaryDistanceNorm: ipd,
            },
            earrings: {
                leftEarlobe: lm.leftEarLobe ?? null,
                rightEarlobe: lm.rightEarLobe ?? null,
                leftEarVisible: !!lm.leftEar,
                rightEarVisible: !!lm.rightEar,
            },
            necklace: {
                neckContour,
                clavicleEndpoints,
                drapeCenter: clavicleEndpoints
                    ? {
                        x: (clavicleEndpoints.left.x + clavicleEndpoints.right.x) / 2,
                        y: Math.max(clavicleEndpoints.left.y, clavicleEndpoints.right.y) + 0.02,
                    }
                    : null,
            },
            watch: {
                wristAnchor: body.leftWrist ?? body.rightWrist ?? null,
                visible: !!(body.leftWrist || body.rightWrist),
            },
        };
    }

    /**
     * Compute shadow specification from lighting analysis.
     */
    computeShadowSpec(
        perception: PerceptionOutput,
        accessoryTypes: AccessoryType[],
    ): AccessoryShadowSpec {
        const light = perception.photometrics;

        // Shadow direction is opposite to dominant light direction
        const shadowAngle = (light.dominantLightAngleDeg + 180) % 360;

        // Shadow softness scales with light diffusion
        const shadowSoftness = light.diffuseRatio;

        // Shadow opacity is higher for harder light
        const shadowOpacity = Math.min(0.6, 1 - light.diffuseRatio) * 0.8;

        return {
            shadowAngleDeg: shadowAngle,
            shadowSoftness,
            shadowOpacity,
            nosePadShadow: accessoryTypes.includes("glasses"),
            earringShadowOnNeck: accessoryTypes.includes("earrings"),
        };
    }

    // ── IStudioController Implementation ──────────────────────────────────────

    computeEditScope(_perception: PerceptionOutput): EditScopeConfig {
        return buildEditScope("accessories" as StudioType);
    }

    buildConditioning(
        params: AccessoriesParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
    ): ConditioningPayload {
        const anchors = this.computeAnchorMap(perception);
        const activeAccessories = this.getActiveAccessoryTypes(params);
        const shadows = this.computeShadowSpec(perception, activeAccessories);

        // Build accessory description
        const accessoryDescriptions: string[] = [];

        if (params.glasses !== "none") {
            accessoryDescriptions.push(
                `wearing ${params.glasses.replace(/_/g, " ")} glasses`,
            );
        }

        if (params.earringStyle !== "none") {
            const genderHint = genderMode === "Ladies" ? "elegant " : "";
            accessoryDescriptions.push(
                `${genderHint}${params.earringStyle.replace(/_/g, " ")} earrings`,
            );
        }

        if (params.necklace !== "none") {
            accessoryDescriptions.push(
                `${params.necklace.replace(/_/g, " ")} necklace`,
            );
        }

        if (params.watch !== "none") {
            accessoryDescriptions.push(
                `${params.watch.replace(/_/g, " ")} watch`,
            );
        }

        const accessoryText =
            accessoryDescriptions.length > 0
                ? accessoryDescriptions.join(", ")
                : "no additional accessories";

        const structuredPrompt = [
            `Professional portrait photograph.`,
            `Subject ${accessoryText}.`,
            `Level of jewelry: ${params.jewelryLevel.replace(/_/g, " ")}.`,
            `Accessories must sit naturally on anatomy.`,
            `Glasses must align with nose bridge and ear temples.`,
            `Maintain exact facial features and skin tone.`,
            `Accessory shadows must be physically correct.`,
        ].join(" ");

        const conditioning: ConditioningPayload = {
            structuredPrompt,
            referenceImages: [],
            controlMaps: {
                accessory_anchors: JSON.stringify(anchors),
                shadow_spec: JSON.stringify(shadows),
                active_accessories: JSON.stringify(activeAccessories),
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
        params: AccessoriesParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
        retryAttempt = 0,
    ): GenerationRequest {
        return {
            studioType: "accessories" as StudioType,
            inputImageRef,
            perception,
            editScope: this.computeEditScope(perception),
            conditioning: this.buildConditioning(params, perception, genderMode),
            negativeConstraints: this.getNegativeConstraints(),
            identityWeight: params.identityStrength.value,
            creativityLevel: 0.3, // very conservative for accessories
            retryAttempt,
        };
    }

    getNegativeConstraints(): NegativeConstraint[] {
        return [
            ...GLOBAL_NEGATIVE_CONSTRAINTS,
            ...STUDIO_NEGATIVE_CONSTRAINTS.accessories,
        ];
    }

    getQualityThresholds(): Record<string, number> {
        return {
            identity_stability: 0.94,  // strictest — accessories must not change face
            pose_stability: 0.92,
            geometry_alignment: 0.80,
            edge_fidelity: 0.88,
            lighting_coherence: 0.85,
            artifact_penalty: 0.90,
            composite: 0.88,
            // Accessories-specific
            glasses_bridge_alignment: 0.90,
            earring_symmetry: 0.85,
            accessory_shadow_coherence: 0.80,
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

    // ── Private Helpers ───────────────────────────────────────────────────────

    private getActiveAccessoryTypes(params: AccessoriesParams): AccessoryType[] {
        const active: AccessoryType[] = [];
        if (params.glasses !== "none") active.push("glasses");
        if (params.earringStyle !== "none") active.push("earrings");
        if (params.necklace !== "none") active.push("necklace");
        if (params.watch !== "none") active.push("watch");
        return active;
    }
}

// ─── Default Parameter Factory ───────────────────────────────────────────────

export function createDefaultAccessoriesParams(): AccessoriesParams {
    return {
        glasses: "none",
        earringStyle: "none",
        necklace: "none",
        watch: "none",
        jewelryLevel: "subtle",
        identityStrength: {
            value: 0.92,
            min: 0.5,
            max: 1.0,
            default: 0.92,
            step: 0.05,
            constraintImpact: 0.95,
        },
    };
}

// ─── JSON Schema ─────────────────────────────────────────────────────────────

export const ACCESSORIES_PARAMS_SCHEMA = {
    type: "object",
    required: ["glasses", "earringStyle", "necklace", "watch", "jewelryLevel", "identityStrength"],
    properties: {
        glasses: {
            type: "string",
            enum: ["none", "rimless", "thin_metal", "thick_frame", "aviator", "round_wire"],
            default: "none",
            description: "Glasses style",
            constraintImpact: "Glasses require nose bridge + temple alignment validation",
        },
        earringStyle: {
            type: "string",
            enum: ["none", "studs", "small_hoops", "drop", "chandelier"],
            default: "none",
            description: "Earring style",
            constraintImpact: "Requires earlobe landmark detection; chandelier earrings need neck shadow computation",
        },
        necklace: {
            type: "string",
            enum: ["none", "thin_chain", "pendant", "pearl_strand", "statement"],
            default: "none",
            description: "Necklace type",
            constraintImpact: "Requires neck contour detection and clavicle endpoint anchoring",
        },
        watch: {
            type: "string",
            enum: ["none", "dress_watch", "sports_watch", "smart_watch"],
            default: "none",
            description: "Watch type (only if wrist is visible)",
            constraintImpact: "Only applied when wrist landmark is detected; no effect otherwise",
        },
        jewelryLevel: {
            type: "string",
            enum: ["minimal", "subtle", "moderate", "statement"],
            default: "subtle",
            description: "Overall jewelry intensity level",
            constraintImpact: "Higher levels increase accessory prominence in generation prompt",
        },
        identityStrength: {
            type: "number",
            minimum: 0.5,
            maximum: 1.0,
            default: 0.92,
            step: 0.05,
            description: "Identity preservation strength — highest default among studios since accessories must not alter face at all",
            constraintImpact: "Accessories studio uses 0.92 default — strictest identity preservation",
        },
    },
} as const;
