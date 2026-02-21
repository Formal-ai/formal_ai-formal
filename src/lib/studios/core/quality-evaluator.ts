/**
 * Formal.AI — Quality Evaluation Engine
 *
 * Computes a composite quality score for each studio output.
 * Every metric is defined mathematically with thresholds and weights.
 *
 * FinalScore =
 *   w1·IdentityStability + w2·PoseStability + w3·GeometryAlignment
 * + w4·EdgeFidelity       + w5·LightingCoherence + w6·ArtifactPenalty
 *
 * Default weights: w1=0.30, w2=0.15, w3=0.15, w4=0.15, w5=0.10, w6=0.15
 * Composite threshold: 0.87
 */

import type {
    QualityMetric,
    QualityEvaluation,
    PerceptionOutput,
    FaceLandmarks2D,
    AngleTriple,
    Vector3,
    Point2D,
    BoundingBox,
} from "./types";

import {
    QUALITY_THRESHOLDS,
    QUALITY_WEIGHTS,
} from "./types";

import {
    computeLandmarkDrift,
    computePoseDelta,
} from "./perception";

// ─── Individual Metric Computations ──────────────────────────────────────────

/**
 * 1. Identity Stability Score
 *
 * Measures how well the face identity is preserved.
 *
 * IdentityStability = 1 − clamp(LandmarkDrift / DRIFT_THRESHOLD, 0, 1)
 *
 * where LandmarkDrift = (1/N) Σ ||L_i_new − L_i_old|| / diag(faceBBox)
 *
 * Threshold: 0.92
 * A score of 1.0 means zero landmark movement.
 * A score below threshold indicates unacceptable face drift.
 */
export function computeIdentityStability(
    originalLandmarks: FaceLandmarks2D,
    outputLandmarks: FaceLandmarks2D,
    faceBBox: BoundingBox,
): QualityMetric {
    const drift = computeLandmarkDrift(originalLandmarks, outputLandmarks, faceBBox);
    const normalizedDrift = drift / 0.015; // normalize to threshold
    const score = clamp01(1 - normalizedDrift);

    return {
        name: "identity_stability",
        score,
        threshold: QUALITY_THRESHOLDS.IDENTITY_STABILITY,
        passed: score >= QUALITY_THRESHOLDS.IDENTITY_STABILITY,
        detail: `Landmark drift: ${(drift * 1000).toFixed(2)}‰ | Score: ${score.toFixed(3)}`,
    };
}

/**
 * 2. Pose Stability Score
 *
 * Measures head pose preservation.
 *
 * PoseStability = 1 − clamp(PoseDelta / POSE_THRESHOLD, 0, 1)
 *
 * where PoseDelta = max(|Δyaw|, |Δpitch|, |Δroll|) in degrees
 *
 * Threshold: 0.90
 */
export function computePoseStability(
    originalPose: AngleTriple,
    outputPose: AngleTriple,
): QualityMetric {
    const delta = computePoseDelta(originalPose, outputPose);
    const normalizedDelta = delta / 3.0; // normalize to 3° threshold
    const score = clamp01(1 - normalizedDelta);

    return {
        name: "pose_stability",
        score,
        threshold: QUALITY_THRESHOLDS.POSE_STABILITY,
        passed: score >= QUALITY_THRESHOLDS.POSE_STABILITY,
        detail: `Pose delta: ${delta.toFixed(2)}° | Score: ${score.toFixed(3)}`,
    };
}

/**
 * 3. Geometry Alignment Score
 *
 * Composite of collar, lapel, tie, and shoulder alignment metrics.
 *
 * GeometryAlignment = 0.30·CollarAlignment + 0.25·LapelSymmetry
 *                   + 0.20·TieCentering + 0.25·ShoulderAlignment
 *
 * Sub-metrics:
 *
 * CollarAlignment:
 *   collarError = |leftCollarTip.y − rightCollarTip.y| / faceBBoxHeight
 *   CollarAlignment = 1 − clamp(collarError / 0.05, 0, 1)
 *
 * LapelSymmetry (SymmetryScore):
 *   leftLapelAngle = atan2(lapelBottom.y − lapelTop.y, lapelBottom.x − lapelTop.x)
 *   asymmetry = |leftAngle − mirror(rightAngle)|
 *   LapelSymmetry = 1 − clamp(asymmetry / 0.15, 0, 1)
 *
 * TieCentering:
 *   tieOffset = |tieKnot.x − neckCenter.x| / faceBBoxWidth
 *   TieCentering = 1 − clamp(tieOffset / 0.04, 0, 1)
 *
 * ShoulderAlignment:
 *   slopeDelta = |outputShoulderSlope − originalShoulderSlope|
 *   ShoulderAlignment = 1 − clamp(slopeDelta / 5.0, 0, 1)
 *
 * Threshold: 0.85
 */
export function computeGeometryAlignment(
    collarError: number,
    lapelAsymmetry: number,
    tieOffset: number,
    shoulderSlopeDelta: number,
): QualityMetric {
    const collarScore = clamp01(1 - collarError / 0.05);
    const lapelScore = clamp01(1 - lapelAsymmetry / 0.15);
    const tieScore = clamp01(1 - tieOffset / 0.04);
    const shoulderScore = clamp01(1 - shoulderSlopeDelta / 5.0);

    const score =
        0.30 * collarScore +
        0.25 * lapelScore +
        0.20 * tieScore +
        0.25 * shoulderScore;

    return {
        name: "geometry_alignment",
        score,
        threshold: QUALITY_THRESHOLDS.GEOMETRY_ALIGNMENT,
        passed: score >= QUALITY_THRESHOLDS.GEOMETRY_ALIGNMENT,
        detail: `Collar: ${collarScore.toFixed(2)} | Lapel: ${lapelScore.toFixed(2)} | Tie: ${tieScore.toFixed(2)} | Shoulder: ${shoulderScore.toFixed(2)}`,
    };
}

/**
 * 4. Edge Fidelity Score
 *
 * Measures hair edge, ear boundary, and accessory boundary integrity.
 *
 * EdgeFidelity = 1 − (haloIntensity + edgeJaggedness + boundaryBleed) / 3
 *
 * haloIntensity:
 *   Compute luminance gradient at hair-background boundary.
 *   haloIntensity = max(|Δlum|_boundary) / 255
 *   Normalized to [0, 1] where 0 = no halo, 1 = severe halo.
 *
 * edgeJaggedness:
 *   Compute alpha matte second derivative at boundary.
 *   jaggedness = mean(|∂²α/∂x²| + |∂²α/∂y²|) at boundary pixels
 *   Normalized to [0, 1].
 *
 * boundaryBleed:
 *   Fraction of foreground pixels leaking into background alpha zone.
 *   bleed = count(α > 0.5 ∧ isBackground) / totalBoundaryPixels
 *
 * Threshold: 0.88
 */
export function computeEdgeFidelity(
    haloIntensity: number,
    edgeJaggedness: number,
    boundaryBleed: number,
): QualityMetric {
    const score = clamp01(1 - (haloIntensity + edgeJaggedness + boundaryBleed) / 3);

    return {
        name: "edge_fidelity",
        score,
        threshold: QUALITY_THRESHOLDS.EDGE_FIDELITY,
        passed: score >= QUALITY_THRESHOLDS.EDGE_FIDELITY,
        detail: `Halo: ${haloIntensity.toFixed(3)} | Jagged: ${edgeJaggedness.toFixed(3)} | Bleed: ${boundaryBleed.toFixed(3)}`,
    };
}

/**
 * 5. Lighting Coherence Score
 *
 * Measures whether output lighting matches input lighting.
 *
 * LightDirectionMismatch = angle(subjectLightDir, backgroundLightDir)
 *   = acos(dot(L_subject, L_bg) / (|L_subject| · |L_bg|))  [in degrees]
 *
 * ColorTempDelta = |CCT_output − CCT_input| / CCT_input
 *
 * LightingCoherence = 1 − 0.6·clamp(angleMismatch / 30, 0, 1)
 *                       − 0.4·clamp(colorTempDelta / 0.2, 0, 1)
 *
 * Threshold: 0.82
 * Acceptable light direction mismatch: < 30°
 * Acceptable color temperature delta: < 20%
 */
export function computeLightingCoherence(
    subjectLightDir: Vector3,
    outputLightDir: Vector3,
    inputCCT: number,
    outputCCT: number,
): QualityMetric {
    const angleMismatch = angleBetweenVectors(subjectLightDir, outputLightDir);
    const colorTempDelta = inputCCT > 0 ? Math.abs(outputCCT - inputCCT) / inputCCT : 0;

    const angleComponent = clamp01(angleMismatch / 30);
    const colorComponent = clamp01(colorTempDelta / 0.2);
    const score = clamp01(1 - 0.6 * angleComponent - 0.4 * colorComponent);

    return {
        name: "lighting_coherence",
        score,
        threshold: QUALITY_THRESHOLDS.LIGHTING_COHERENCE,
        passed: score >= QUALITY_THRESHOLDS.LIGHTING_COHERENCE,
        detail: `Light angle Δ: ${angleMismatch.toFixed(1)}° | CCT Δ: ${(colorTempDelta * 100).toFixed(1)}%`,
    };
}

/**
 * 6. Artifact Penalty Score
 *
 * Detects common AI generation artifacts.
 *
 * ArtifactPenalty = 1 − Σ(detected_artifact_severity_i) / N_checks
 *
 * Checked artifacts:
 *   - Hand distortion (extra/missing fingers if hands visible)
 *   - Hair texture banding (unnatural stripe patterns)
 *   - Collar stitching breaks
 *   - Fabric texture discontinuity
 *   - Unrealistic specular highlights
 *   - Skin plastic appearance
 *
 * Each artifact severity ∈ [0, 1] where 0 = not detected, 1 = severe.
 *
 * Threshold: 0.90
 */
export function computeArtifactPenalty(
    artifactSeverities: ArtifactDetection[],
): QualityMetric {
    const n = artifactSeverities.length || 1;
    const totalSeverity = artifactSeverities.reduce((sum, a) => sum + a.severity, 0);
    const score = clamp01(1 - totalSeverity / n);

    const worstArtifacts = artifactSeverities
        .filter((a) => a.severity > 0.1)
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 3)
        .map((a) => `${a.type}: ${a.severity.toFixed(2)}`)
        .join(", ");

    return {
        name: "artifact_penalty",
        score,
        threshold: QUALITY_THRESHOLDS.ARTIFACT_PENALTY,
        passed: score >= QUALITY_THRESHOLDS.ARTIFACT_PENALTY,
        detail: worstArtifacts || "No significant artifacts detected",
    };
}

export interface ArtifactDetection {
    type:
    | "hand_distortion"
    | "hair_banding"
    | "collar_break"
    | "fabric_discontinuity"
    | "unrealistic_specular"
    | "plastic_skin"
    | "texture_repetition"
    | "edge_artifact";
    severity: number; // 0..1
    region: string;
}

// ─── Composite Quality Evaluation ────────────────────────────────────────────

/**
 * Computes the final composite quality score from all individual metrics.
 *
 * FinalScore =
 *   w1·IdentityStability + w2·PoseStability + w3·GeometryAlignment
 * + w4·EdgeFidelity       + w5·LightingCoherence + w6·ArtifactPenalty
 *
 * w1=0.30, w2=0.15, w3=0.15, w4=0.15, w5=0.10, w6=0.15
 * Sum = 1.00
 *
 * Composite pass threshold: 0.87
 *
 * To pass:
 *   1. CompositeScore ≥ 0.87   AND
 *   2. IdentityStability individually ≥ 0.92   AND
 *   3. No single metric below 0.70 (catastrophic failure guard)
 */
export function evaluateQuality(
    identityStability: QualityMetric,
    poseStability: QualityMetric,
    geometryAlignment: QualityMetric,
    edgeFidelity: QualityMetric,
    lightingCoherence: QualityMetric,
    artifactPenalty: QualityMetric,
): QualityEvaluation {
    const allMetrics = [
        identityStability,
        poseStability,
        geometryAlignment,
        edgeFidelity,
        lightingCoherence,
        artifactPenalty,
    ];

    const compositeScore =
        QUALITY_WEIGHTS.w1_identity * identityStability.score +
        QUALITY_WEIGHTS.w2_pose * poseStability.score +
        QUALITY_WEIGHTS.w3_geometry * geometryAlignment.score +
        QUALITY_WEIGHTS.w4_edge * edgeFidelity.score +
        QUALITY_WEIGHTS.w5_lighting * lightingCoherence.score +
        QUALITY_WEIGHTS.w6_artifact * artifactPenalty.score;

    // Catastrophic failure guard: any metric below 0.70 is an auto-fail
    const catastrophicFailure = allMetrics.some((m) => m.score < 0.70);

    // Identity must pass its own threshold independently
    const identityPassed = identityStability.passed;

    const passed =
        compositeScore >= QUALITY_THRESHOLDS.COMPOSITE_PASS &&
        identityPassed &&
        !catastrophicFailure;

    return {
        identityStability,
        poseStability,
        geometryAlignment,
        edgeFidelity,
        lightingCoherence,
        artifactPenalty,
        compositeScore,
        passed,
        allMetrics,
    };
}

// ─── Studio-Specific Quality Evaluators ──────────────────────────────────────

/**
 * Portrait-specific geometry metrics.
 *
 * Computes collar alignment, lapel symmetry, tie centering,
 * and shoulder alignment from perception and keypoint data.
 */
export function evaluatePortraitGeometry(
    original: PerceptionOutput,
    output: PerceptionOutput,
): {
    collarError: number;
    lapelAsymmetry: number;
    tieOffset: number;
    shoulderSlopeDelta: number;
} {
    // Collar alignment: vertical difference between collar tips
    // Proxy using neck-to-shoulder midpoints
    const origNeck = original.bodyKeypoints.neck;
    const outNeck = output.bodyKeypoints.neck;

    const origLeftShoulder = original.bodyKeypoints.leftShoulder;
    const origRightShoulder = original.bodyKeypoints.rightShoulder;
    const outLeftShoulder = output.bodyKeypoints.leftShoulder;
    const outRightShoulder = output.bodyKeypoints.rightShoulder;

    // Collar error: normalized vertical asymmetry at collar tips
    const bboxHeight =
        original.faceBoundingBox.bottomRight.y - original.faceBoundingBox.topLeft.y;
    const collarError = bboxHeight > 0
        ? Math.abs(
            (outLeftShoulder.y - outNeck.y) - (outRightShoulder.y - outNeck.y),
        ) / bboxHeight
        : 0;

    // Lapel asymmetry: difference between left and right shoulder-to-torso angles
    const origLeftAngle = Math.atan2(
        origLeftShoulder.y - origNeck.y,
        origLeftShoulder.x - origNeck.x,
    );
    const origRightAngle = Math.atan2(
        origRightShoulder.y - origNeck.y,
        origRightShoulder.x - origNeck.x,
    );
    const outLeftAngle = Math.atan2(
        outLeftShoulder.y - outNeck.y,
        outLeftShoulder.x - outNeck.x,
    );
    const outRightAngle = Math.atan2(
        outRightShoulder.y - outNeck.y,
        outRightShoulder.x - outNeck.x,
    );

    const lapelAsymmetry = Math.abs(
        Math.abs(outLeftAngle) - Math.abs(outRightAngle),
    );

    // Tie centering: horizontal offset from neck centerline
    const neckCenterX = outNeck.x;
    const bboxWidth =
        original.faceBoundingBox.bottomRight.x - original.faceBoundingBox.topLeft.x;
    const tieCenterX = (outLeftShoulder.x + outRightShoulder.x) / 2;
    const tieOffset = bboxWidth > 0
        ? Math.abs(tieCenterX - neckCenterX) / bboxWidth
        : 0;

    // Shoulder slope delta
    const origSlope = original.torsoOrientation.shoulderSlopeAngleDeg;
    const outSlope = output.torsoOrientation.shoulderSlopeAngleDeg;
    const shoulderSlopeDelta = Math.abs(outSlope - origSlope);

    return { collarError, lapelAsymmetry, tieOffset, shoulderSlopeDelta };
}

/**
 * Hair-specific edge integrity metric.
 *
 * HairIntegrityScore = 1 − 0.40·boundaryRoughness − 0.30·haloStrength − 0.30·edgeBleed
 *
 * boundaryRoughness: high-frequency energy at hair-background boundary
 *   = mean(|∇α| at boundary) / max_gradient
 *
 * haloStrength: brightness anomaly at hair edge
 *   = mean(|I_boundary − I_bg_avg|) / 255
 *
 * edgeBleed: fraction of hair alpha leaking into unexpected region
 *   = count(hair_alpha > 0.3 ∧ outside_expected_region) / boundary_pixels
 */
export function computeHairIntegrityScore(
    boundaryRoughness: number,
    haloStrength: number,
    edgeBleed: number,
): number {
    return clamp01(
        1 - 0.40 * boundaryRoughness - 0.30 * haloStrength - 0.30 * edgeBleed,
    );
}

/**
 * Accessory-specific realism score.
 *
 * AccessoryRealismScore =
 *   0.25·scaleAccuracy + 0.25·perspectiveMatch +
 *   0.25·occlusionCorrectness + 0.25·shadowConsistency
 *
 * scaleAccuracy:
 *   ratio = measuredAccessorySize / expectedAccessorySize
 *   scaleAccuracy = 1 − |ratio − 1|  (penalize over or under scale)
 *
 * perspectiveMatch:
 *   angleDelta = |accessoryPlane − faceProjectionPlane|
 *   perspectiveMatch = 1 − clamp(angleDelta / 15°, 0, 1)
 *
 * occlusionCorrectness:
 *   1.0 if all occlusion relationships are correct
 *   0.0 if accessory incorrectly overlaps preserved regions
 *
 * shadowConsistency:
 *   shadowAngleDelta = |accessoryShadowDir − dominantLightDir|
 *   shadowConsistency = 1 − clamp(shadowAngleDelta / 20°, 0, 1)
 */
export function computeAccessoryRealismScore(
    scaleRatio: number,
    perspectiveAngleDelta: number,
    occlusionCorrect: boolean,
    shadowAngleDelta: number,
): number {
    const scaleAccuracy = clamp01(1 - Math.abs(scaleRatio - 1));
    const perspectiveMatch = clamp01(1 - perspectiveAngleDelta / 15);
    const occlusionScore = occlusionCorrect ? 1.0 : 0.0;
    const shadowConsistency = clamp01(1 - shadowAngleDelta / 20);

    return (
        0.25 * scaleAccuracy +
        0.25 * perspectiveMatch +
        0.25 * occlusionScore +
        0.25 * shadowConsistency
    );
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function angleBetweenVectors(a: Vector3, b: Vector3): number {
    const magA = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    const magB = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
    if (magA === 0 || magB === 0) return 90;

    const dot = a.x * b.x + a.y * b.y + a.z * b.z;
    const cosAngle = Math.max(-1, Math.min(1, dot / (magA * magB)));
    return Math.acos(cosAngle) * (180 / Math.PI);
}
