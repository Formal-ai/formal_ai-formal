/**
 * Formal.AI — Validation & Auto-Retry Engine
 *
 * Performs post-generation validation checks and implements the
 * auto-retry/recovery logic.  If output quality is below threshold,
 * the engine computes adjustments and requests regeneration.
 *
 * Retry Policy:
 *   MAX_RETRIES = 3
 *   Per retry: increase preserve weight +0.10, decrease creativity -0.15
 *   At retry 2: switch to inpainting-only mode
 *   After all retries exhausted: return best result + user guidance
 */

import type {
    ValidationResult,
    RetryAdjustment,
    QualityEvaluation,
    QualityMetric,
    PerceptionOutput,
    GenerationRequest,
    StudioType,
} from "./types";

import {
    QUALITY_THRESHOLDS,
    RETRY_POLICY,
    PERCEPTION_TOLERANCES,
} from "./types";

import {
    computeIdentityStability,
    computePoseStability,
    computeGeometryAlignment,
    computeEdgeFidelity,
    computeLightingCoherence,
    computeArtifactPenalty,
    evaluateQuality,
    type ArtifactDetection,
} from "./quality-evaluator";

// ─── Validation Checks ──────────────────────────────────────────────────────

/**
 * Face-Landmark Delta Check
 *
 * Compares original and output landmarks.
 * Threshold: average normalized displacement < 0.015
 *
 * If failed:
 *   - Increase PreserveMap weight by 0.10
 *   - Add "no face distortion" to negative constraints
 *   - Reduce edit scope (remove Neck if present)
 */
function checkLandmarkDelta(
    original: PerceptionOutput,
    output: PerceptionOutput,
): { passed: boolean; metric: QualityMetric; adjustments: RetryAdjustment[] } {
    const metric = computeIdentityStability(
        original.landmarks,
        output.landmarks,
        original.faceBoundingBox,
    );

    const adjustments: RetryAdjustment[] = [];
    if (!metric.passed) {
        adjustments.push(
            {
                action: "increase_preserve_weight",
                target: "identity_regions",
                suggestedValue: 0.10,
            },
            {
                action: "tighten_negative_constraints",
                target: "no_face_reshape",
                suggestedValue: 1.0,
            },
        );
    }

    return { passed: metric.passed, metric, adjustments };
}

/**
 * Pose Drift Check
 *
 * Compares original and output head pose.
 * Threshold: max angular delta < 3.0°
 *
 * If failed:
 *   - Increase pose preservation weight
 *   - Reduce creativity parameter
 */
function checkPoseDrift(
    original: PerceptionOutput,
    output: PerceptionOutput,
): { passed: boolean; metric: QualityMetric; adjustments: RetryAdjustment[] } {
    const metric = computePoseStability(
        original.headPose.angles,
        output.headPose.angles,
    );

    const adjustments: RetryAdjustment[] = [];
    if (!metric.passed) {
        adjustments.push(
            {
                action: "increase_preserve_weight",
                target: "head_pose",
                suggestedValue: 0.10,
            },
            {
                action: "lower_creativity",
                target: "global",
                suggestedValue: RETRY_POLICY.CREATIVITY_DECREMENT,
            },
        );
    }

    return { passed: metric.passed, metric, adjustments };
}

/**
 * Hair/Edge Integrity Check
 *
 * Validates hair edge quality, halo presence, and boundary integrity.
 *
 * If failed:
 *   - Add stronger edge preservation constraints
 *   - Switch to inpainting-only mode for hair boundary region
 */
function checkHairEdgeIntegrity(
    haloIntensity: number,
    edgeJaggedness: number,
    boundaryBleed: number,
): { passed: boolean; metric: QualityMetric; adjustments: RetryAdjustment[] } {
    const metric = computeEdgeFidelity(haloIntensity, edgeJaggedness, boundaryBleed);

    const adjustments: RetryAdjustment[] = [];
    if (!metric.passed) {
        adjustments.push(
            {
                action: "tighten_negative_constraints",
                target: "no_hair_halo",
                suggestedValue: 1.0,
            },
            {
                action: "switch_inpainting_only",
                target: "hair_boundary",
                suggestedValue: 1.0,
            },
        );
    }

    return { passed: metric.passed, metric, adjustments };
}

/**
 * Fabric Realism Heuristics
 *
 * Checks for fabric artifacts: discontinuity, impossible creases, etc.
 *
 * TextureContinuity = 1 − mean(|∇Texture|_cross_seam) / max_gradient
 *
 * If failed:
 *   - Lower creativity to preserve texture consistency
 *   - Increase fabric-specific negative constraints
 */
function checkFabricRealism(
    artifacts: ArtifactDetection[],
): { passed: boolean; metric: QualityMetric; adjustments: RetryAdjustment[] } {
    const fabricArtifacts = artifacts.filter(
        (a) =>
            a.type === "fabric_discontinuity" ||
            a.type === "collar_break" ||
            a.type === "texture_repetition",
    );

    const metric = computeArtifactPenalty(
        fabricArtifacts.length > 0 ? fabricArtifacts : [{ type: "fabric_discontinuity", severity: 0, region: "clothing" }],
    );

    const adjustments: RetryAdjustment[] = [];
    if (!metric.passed) {
        adjustments.push(
            {
                action: "lower_creativity",
                target: "fabric_generation",
                suggestedValue: 0.20,
            },
            {
                action: "tighten_negative_constraints",
                target: "no_unrealistic_fabric",
                suggestedValue: 0.95,
            },
        );
    }

    return { passed: metric.passed, metric, adjustments };
}

// ─── Composite Validation ────────────────────────────────────────────────────

/**
 * Run all validation checks and produce a ValidationResult.
 *
 * This is the main entry point called by the pipeline after each generation.
 */
export function validateOutput(
    original: PerceptionOutput,
    output: PerceptionOutput,
    edgeMetrics: { haloIntensity: number; edgeJaggedness: number; boundaryBleed: number },
    lightingMetrics: { inputCCT: number; outputCCT: number },
    geometryMetrics: {
        collarError: number;
        lapelAsymmetry: number;
        tieOffset: number;
        shoulderSlopeDelta: number;
    },
    artifacts: ArtifactDetection[],
): ValidationResult {
    // Run individual checks
    const landmarkCheck = checkLandmarkDelta(original, output);
    const poseCheck = checkPoseDrift(original, output);
    const edgeCheck = checkHairEdgeIntegrity(
        edgeMetrics.haloIntensity,
        edgeMetrics.edgeJaggedness,
        edgeMetrics.boundaryBleed,
    );
    const fabricCheck = checkFabricRealism(artifacts);

    // Compute remaining metrics
    const geometryMetric = computeGeometryAlignment(
        geometryMetrics.collarError,
        geometryMetrics.lapelAsymmetry,
        geometryMetrics.tieOffset,
        geometryMetrics.shoulderSlopeDelta,
    );

    const lightingMetric = computeLightingCoherence(
        original.photometrics.dominantLightDirection,
        output.photometrics.dominantLightDirection,
        lightingMetrics.inputCCT,
        lightingMetrics.outputCCT,
    );

    const allArtifactMetric = computeArtifactPenalty(artifacts);

    // Compose final quality evaluation
    const quality = evaluateQuality(
        landmarkCheck.metric,
        poseCheck.metric,
        geometryMetric,
        edgeCheck.metric,
        lightingMetric,
        allArtifactMetric,
    );

    // Collect failures and adjustments
    const failures: string[] = [];
    const retryAdjustments: RetryAdjustment[] = [];

    const checks = [landmarkCheck, poseCheck, edgeCheck, fabricCheck];
    for (const check of checks) {
        if (!check.passed) {
            failures.push(`${check.metric.name}: ${check.metric.detail}`);
            retryAdjustments.push(...check.adjustments);
        }
    }

    if (!geometryMetric.passed) {
        failures.push(`geometry_alignment: ${geometryMetric.detail}`);
    }
    if (!lightingMetric.passed) {
        failures.push(`lighting_coherence: ${lightingMetric.detail}`);
    }
    if (!allArtifactMetric.passed) {
        failures.push(`artifact_penalty: ${allArtifactMetric.detail}`);
    }

    return { quality, failures, retryAdjustments };
}

// ─── Auto-Retry Policy Engine ────────────────────────────────────────────────

/**
 * Retry decision state machine.
 *
 * Logic per retry attempt:
 *
 *   Attempt 0 (first try): standard generation
 *   Attempt 1: increase preserve weight +0.10, reduce creativity -0.15
 *   Attempt 2: switch to inpainting-only mode, further reduce creativity -0.15
 *   Attempt 3 (max): maximum constraints, narrowest edit scope
 *
 * After all retries exhausted:
 *   Return the best result (highest composite score across attempts)
 *   Flag "needs clearer photo" guidance for the user
 */
export interface RetryContext {
    /** Current attempt number (0-indexed). */
    attempt: number;
    /** Quality evaluations from all previous attempts. */
    previousEvaluations: QualityEvaluation[];
    /** Best composite score seen so far. */
    bestScore: number;
    /** Image ref of the best output so far. */
    bestOutputRef: string;
    /** Accumulated retry adjustments. */
    accumulatedAdjustments: RetryAdjustment[];
}

/**
 * Determine whether to retry and compute adjustment parameters.
 *
 * Returns:
 *   shouldRetry: boolean
 *   adjustments: parameter changes to apply
 *   userGuidance: string | null (non-null if all retries exhausted)
 */
export function computeRetryDecision(
    validationResult: ValidationResult,
    context: RetryContext,
): RetryDecision {
    // Exit conditions
    if (validationResult.quality.passed) {
        return {
            shouldRetry: false,
            adjustments: [],
            userGuidance: null,
            useBestPrevious: false,
        };
    }

    if (context.attempt >= RETRY_POLICY.MAX_RETRIES) {
        // All retries exhausted
        const shouldUsePrevious =
            context.bestScore > validationResult.quality.compositeScore;

        return {
            shouldRetry: false,
            adjustments: [],
            userGuidance: generateUserGuidance(validationResult, context),
            useBestPrevious: shouldUsePrevious,
        };
    }

    // Compute adjustments based on what failed
    const adjustments = computeRetryAdjustments(
        validationResult,
        context.attempt,
    );

    return {
        shouldRetry: true,
        adjustments,
        userGuidance: null,
        useBestPrevious: false,
    };
}

export interface RetryDecision {
    shouldRetry: boolean;
    adjustments: RetryAdjustment[];
    userGuidance: string | null;
    useBestPrevious: boolean;
}

/**
 * Compute specific parameter adjustments for the next retry attempt.
 */
export function computeRetryAdjustments(
    validation: ValidationResult,
    attempt: number,
): RetryAdjustment[] {
    const adjustments: RetryAdjustment[] = [
        ...validation.retryAdjustments,
    ];

    // Progressive tightening
    const preserveIncrement = RETRY_POLICY.PRESERVE_WEIGHT_INCREMENT * (attempt + 1);
    const creativityDecrement = RETRY_POLICY.CREATIVITY_DECREMENT * (attempt + 1);

    adjustments.push({
        action: "increase_preserve_weight",
        target: "global",
        suggestedValue: Math.min(0.30, preserveIncrement),
    });

    adjustments.push({
        action: "lower_creativity",
        target: "global",
        suggestedValue: Math.min(0.45, creativityDecrement),
    });

    // At attempt 2+, switch to inpainting-only for failed regions
    if (attempt >= RETRY_POLICY.INPAINTING_FALLBACK_RETRY) {
        const failedRegions = validation.failures
            .map((f) => f.split(":")[0].trim())
            .filter(Boolean);

        for (const region of failedRegions) {
            adjustments.push({
                action: "switch_inpainting_only",
                target: region,
                suggestedValue: 1.0,
            });
        }
    }

    // If identity specifically failed, aggressively lock down
    if (!validation.quality.identityStability.passed) {
        adjustments.push({
            action: "reduce_edit_scope",
            target: "remove_neck_region",
            suggestedValue: 1.0,
        });
    }

    return deduplicateAdjustments(adjustments);
}

/**
 * Apply retry adjustments to a generation request to produce the
 * modified request for the next attempt.
 */
export function applyRetryAdjustments(
    request: GenerationRequest,
    adjustments: RetryAdjustment[],
    newAttempt: number,
): GenerationRequest {
    let identityWeight = request.identityWeight;
    let creativityLevel = request.creativityLevel;
    const allowedRegions = [...request.editScope.allowedRegions];
    const preserveRegions = [...request.editScope.preserveRegions];

    for (const adj of adjustments) {
        switch (adj.action) {
            case "increase_preserve_weight":
                identityWeight = Math.min(1.0, identityWeight + adj.suggestedValue);
                break;
            case "lower_creativity":
                creativityLevel = Math.max(0.05, creativityLevel - adj.suggestedValue);
                break;
            case "reduce_edit_scope": {
                const idx = allowedRegions.indexOf(adj.target as any);
                if (idx >= 0) allowedRegions.splice(idx, 1);
                break;
            }
            case "switch_inpainting_only":
                // Mark in conditioning that inpainting-only mode is active
                break;
            case "tighten_negative_constraints":
                // Already applied via conditioning
                break;
        }
    }

    return {
        ...request,
        identityWeight,
        creativityLevel,
        editScope: { allowedRegions, preserveRegions },
        retryAttempt: newAttempt,
    };
}

// ─── User Guidance Generation ────────────────────────────────────────────────

/**
 * Generate user-facing guidance when all retries are exhausted.
 */
export function generateUserGuidance(
    validation: ValidationResult,
    context: RetryContext,
): string {
    const reasons: string[] = [];

    if (!validation.quality.identityStability.passed) {
        reasons.push(
            "The face in the output differed too much from the original. " +
            "Try uploading a clearer, front-facing photo with good lighting.",
        );
    }

    if (!validation.quality.edgeFidelity.passed) {
        reasons.push(
            "Hair edges were difficult to process cleanly. " +
            "A photo with a simpler background or well-defined hairline works better.",
        );
    }

    if (!validation.quality.lightingCoherence.passed) {
        reasons.push(
            "The lighting in the photo made it hard to match with the chosen style. " +
            "Try a photo with more even, front-facing lighting.",
        );
    }

    if (!validation.quality.geometryAlignment.passed) {
        reasons.push(
            "Garment alignment was difficult due to the pose. " +
            "A straight-on or slight three-quarter pose works best.",
        );
    }

    if (reasons.length === 0) {
        reasons.push(
            "The AI was unable to achieve the desired quality level. " +
            "Please try a different photo or simpler style options.",
        );
    }

    return `We couldn't achieve the quality standard after ${context.attempt + 1} attempts. ` +
        reasons.join(" ");
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function deduplicateAdjustments(
    adjustments: RetryAdjustment[],
): RetryAdjustment[] {
    const seen = new Map<string, RetryAdjustment>();
    for (const adj of adjustments) {
        const key = `${adj.action}::${adj.target}`;
        const existing = seen.get(key);
        if (!existing || adj.suggestedValue > existing.suggestedValue) {
            seen.set(key, adj);
        }
    }
    return Array.from(seen.values());
}
