/**
 * Formal.AI — Background Studio Controller
 *
 * Controls background replacement with depth-aware compositing,
 * consistent lighting, and edge-refined subject extraction.
 *
 * Compositing pipeline:
 *   1. Extract subject alpha matte (trimap-based refinement)
 *   2. Remove color spill from original background
 *   3. Generate/place new background with matched depth-of-field
 *   4. Apply edge refinement at subject-background boundary
 *   5. Match lighting between subject and background
 *   6. Add ground shadow / ambient occlusion
 */

import type {
    IStudioController,
    BackgroundParams,
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

// ─── Background-Specific Types ───────────────────────────────────────────────

/** Subject matte quality assessment. */
export interface MatteQuality {
    alphaPrecision: number;
    hairStrandPreservation: number;
    edgeSmoothness: number;
    residualHalo: number;
    colorSpill: number;
    compositeScore: number;
}

/**
 * Compute matte quality score.
 *
 * composite = 0.25*alpha + 0.25*hair + 0.20*edge + 0.15*(1-halo) + 0.15*(1-spill)
 */
export function computeMatteQuality(
    alphaPrecision: number,
    hairStrandPreservation: number,
    edgeSmoothness: number,
    residualHalo: number,
    colorSpill: number,
): MatteQuality {
    const compositeScore = Math.max(0, Math.min(1,
        0.25 * alphaPrecision +
        0.25 * hairStrandPreservation +
        0.20 * edgeSmoothness +
        0.15 * (1 - residualHalo) +
        0.15 * (1 - colorSpill),
    ));
    return { alphaPrecision, hairStrandPreservation, edgeSmoothness, residualHalo, colorSpill, compositeScore };
}

/** Depth-of-field spec for background rendering. */
export interface DepthOfFieldSpec {
    subjectDistanceNorm: number;
    backgroundBlurRadiusPx: number;
    bokehShape: "circular" | "hexagonal" | "swirl";
    matchOriginalDOF: boolean;
}

/** Lighting match spec for background–subject coherence. */
export interface LightingMatchSpec {
    targetColorTempK: number;
    lightDirectionDeg: number;
    ambientFillRatio: number;
    groundShadowOpacity: number;
    groundShadowBlurPx: number;
}

// ─── Controller ──────────────────────────────────────────────────────────────

export class BackgroundStudioController
    implements IStudioController<BackgroundParams> {
    readonly studioType = "background" as StudioType;

    /** Estimate DOF from face bounding-box area ratio. */
    estimateDepthOfField(perception: PerceptionOutput): DepthOfFieldSpec {
        const bb = perception.faceBoundingBox;
        const area = (bb.bottomRight.x - bb.topLeft.x) * (bb.bottomRight.y - bb.topLeft.y);
        return {
            subjectDistanceNorm: Math.max(0.2, 1 - area * 2),
            backgroundBlurRadiusPx: Math.round(area * 30 + 3),
            bokehShape: "circular",
            matchOriginalDOF: true,
        };
    }

    /** Derive lighting match from subject photometrics. */
    computeLightingMatch(perception: PerceptionOutput): LightingMatchSpec {
        const p = perception.photometrics;
        return {
            targetColorTempK: p.colorTemperatureK,
            lightDirectionDeg: p.dominantLightAngleDeg,
            ambientFillRatio: p.diffuseRatio,
            groundShadowOpacity: Math.min(0.5, 1 - p.diffuseRatio),
            groundShadowBlurPx: Math.round(p.diffuseRatio * 20 + 5),
        };
    }

    computeEditScope(_perception: PerceptionOutput): EditScopeConfig {
        return buildEditScope("background" as StudioType);
    }

    buildConditioning(
        params: BackgroundParams,
        perception: PerceptionOutput,
        _genderMode: GenderMode,
    ): ConditioningPayload {
        const dof = this.estimateDepthOfField(perception);
        const lm = this.computeLightingMatch(perception);
        const bgStyle = params.style.replace(/_/g, " ");
        const bgColor = params.dominantColor !== "auto" ? ` in ${params.dominantColor.replace(/_/g, " ")} tones` : "";
        const blurDesc = params.blurIntensity === "sharp" ? "crisp" : params.blurIntensity === "soft" ? "softly blurred" : "strong bokeh";

        const structuredPrompt = [
            `Professional portrait with ${bgStyle} background${bgColor}.`,
            `Background: ${blurDesc}. Lighting: ${lm.targetColorTempK}K, direction ${lm.lightDirectionDeg}°.`,
            `Preserve hair strand detail. No halo artifacts. Natural ground shadow.`,
            `Maintain exact facial features and body position.`,
        ].join(" ");

        const conditioning: ConditioningPayload = {
            structuredPrompt,
            referenceImages: [],
            controlMaps: {
                depth_of_field: JSON.stringify(dof),
                lighting_match: JSON.stringify(lm),
                background_environment: params.style,
                blur_intensity: params.blurIntensity,
            },
            negativeTokens: [],
        };
        return applyConstraintsToConditioning(conditioning, this.computeEditScope(perception), this.getNegativeConstraints(), params.identityStrength.value);
    }

    buildGenerationRequest(inputImageRef: string, params: BackgroundParams, perception: PerceptionOutput, genderMode: GenderMode, retryAttempt = 0): GenerationRequest {
        return {
            studioType: "background" as StudioType, inputImageRef, perception,
            editScope: this.computeEditScope(perception),
            conditioning: this.buildConditioning(params, perception, genderMode),
            negativeConstraints: this.getNegativeConstraints(),
            identityWeight: params.identityStrength.value,
            creativityLevel: 0.6, retryAttempt,
        };
    }

    getNegativeConstraints(): NegativeConstraint[] {
        return [...GLOBAL_NEGATIVE_CONSTRAINTS, ...STUDIO_NEGATIVE_CONSTRAINTS.background];
    }

    getQualityThresholds(): Record<string, number> {
        return {
            identity_stability: 0.94, pose_stability: 0.92, geometry_alignment: 0.80,
            edge_fidelity: 0.90, lighting_coherence: 0.85, artifact_penalty: 0.88,
            composite: 0.87, matte_quality: 0.88, color_spill_free: 0.85,
            depth_consistency: 0.82, shadow_grounding: 0.80,
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

export function createDefaultBackgroundParams(): BackgroundParams {
    return {
        style: "studio_gradient", dominantColor: "auto", blurIntensity: "soft",
        environmentLighting: "match_subject",
        identityStrength: { value: 0.90, min: 0.5, max: 1.0, default: 0.90, step: 0.05, constraintImpact: 0.90 },
    };
}

export const BACKGROUND_PARAMS_SCHEMA = {
    type: "object",
    required: ["style", "dominantColor", "blurIntensity", "environmentLighting", "identityStrength"],
    properties: {
        style: { type: "string", enum: ["studio_gradient", "solid_color", "office_interior", "outdoor_urban", "outdoor_nature", "abstract_texture", "corporate_lobby", "library", "window_light"], default: "studio_gradient" },
        dominantColor: { type: "string", enum: ["auto", "neutral_gray", "warm_beige", "cool_blue", "dark_charcoal", "white", "navy"], default: "auto" },
        blurIntensity: { type: "string", enum: ["sharp", "soft", "strong_bokeh"], default: "soft" },
        environmentLighting: { type: "string", enum: ["match_subject", "studio", "natural_window", "overcast", "golden_hour"], default: "match_subject" },
        identityStrength: { type: "number", minimum: 0.5, maximum: 1.0, default: 0.90, step: 0.05 },
    },
} as const;
