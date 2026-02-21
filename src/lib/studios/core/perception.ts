/**
 * Formal.AI — Perception Layer Specification
 *
 * Defines the five core perception sub-modules and the composite
 * perception pipeline.  Each module has strict input/output contracts,
 * internal logic descriptions, confidence scoring, and tolerance metrics.
 *
 * This module does NOT perform inference — it defines the interfaces and
 * orchestration logic.  Actual model calls are delegated to a backend
 * inference service.
 */

import type {
    FaceLandmarks2D,
    HeadPoseEstimate,
    BodyKeypoints,
    TorsoOrientation,
    SegmentationMasks,
    PhotometricEstimate,
    GeometryRiskScores,
    PerceptionOutput,
    Point2D,
    Vector3,
    BoundingBox,
    AngleTriple,
} from "./types";

// ─── 1.1 Face Landmark & Pose Module ─────────────────────────────────────────

/**
 * Input:  RGB image (as a reference/URL/buffer)
 * Output: 2D landmarks, 3D head pose, face bounding box, identity region mask
 *
 * Mathematical tolerance metrics:
 *   LandmarkDrift = (1/N) Σ ||L_i_output − L_i_input|| / diag(faceBBox)
 *     Must satisfy: LandmarkDrift < 0.015  (normalized)
 *
 *   PoseDelta = max(|Δyaw|, |Δpitch|, |Δroll|)
 *     Must satisfy: PoseDelta < 3.0°
 */
export interface FaceLandmarkPoseModule {
    /**
     * Extract facial landmarks and head pose from an input image.
     *
     * Internal logic:
     *   1. Detect face bounding box using a face detector (e.g., MTCNN / RetinaFace)
     *   2. Run 68-point landmark regression within the bounding box
     *   3. Solve PnP (Perspective-n-Point) using 2D landmarks + canonical 3D model
     *      to estimate yaw, pitch, roll and approximate focal length
     *   4. Compute identity region mask = convex hull of landmark subset
     *      (eyes, nose ridge, lips, jawline)
     *
     * Failure conditions:
     *   - No face detected → abort pipeline, return "no_face" error
     *   - Multiple faces → select largest bounding box, warn user
     *   - Confidence < 0.7 → flag "low_confidence_landmarks"
     *   - Extreme pose (|yaw| > 60° or |pitch| > 45°) → warn "extreme_pose"
     */
    estimate(imageRef: string): Promise<FaceLandmarkPoseResult>;
}

export interface FaceLandmarkPoseResult {
    landmarks: FaceLandmarks2D;
    headPose: HeadPoseEstimate;
    faceBoundingBox: BoundingBox;
    identityMaskRef: string;
    confidence: number;
    warnings: string[];
}

/**
 * Compute landmark drift between two landmark sets.
 *
 * LandmarkDrift = (1/N) Σ ||L_i_new − L_i_old|| / diag(faceBBox)
 *
 * where diag(faceBBox) = √(w² + h²) of the face bounding box.
 */
export function computeLandmarkDrift(
    original: FaceLandmarks2D,
    output: FaceLandmarks2D,
    faceBBox: BoundingBox,
): number {
    const diag = Math.sqrt(
        Math.pow(faceBBox.bottomRight.x - faceBBox.topLeft.x, 2) +
        Math.pow(faceBBox.bottomRight.y - faceBBox.topLeft.y, 2),
    );
    if (diag === 0) return 1;

    const allOriginal = flattenLandmarks(original);
    const allOutput = flattenLandmarks(output);

    const n = Math.min(allOriginal.length, allOutput.length);
    if (n === 0) return 1;

    let totalDist = 0;
    for (let i = 0; i < n; i++) {
        totalDist += euclidean2D(allOriginal[i], allOutput[i]);
    }

    return totalDist / (n * diag);
}

/**
 * Compute head pose delta between original and output.
 *
 * PoseDelta = max(|Δyaw|, |Δpitch|, |Δroll|)
 */
export function computePoseDelta(
    original: AngleTriple,
    output: AngleTriple,
): number {
    return Math.max(
        Math.abs(output.yaw - original.yaw),
        Math.abs(output.pitch - original.pitch),
        Math.abs(output.roll - original.roll),
    );
}

// ─── 1.2 Full-Body Pose Module ───────────────────────────────────────────────

/**
 * Input:  RGB image
 * Output: Body keypoints, torso orientation, shoulder metrics
 *
 * Confidence score logic:
 *   KeypointConfidence = average confidence of all detected keypoints
 *   Reject if KeypointConfidence < 0.6
 *   Warn if any single keypoint confidence < 0.5
 */
export interface FullBodyPoseModule {
    /**
     * Extract body keypoints and torso orientation.
     *
     * Internal logic:
     *   1. Run pose estimation model (e.g., OpenPose / MediaPipe Pose)
     *   2. Extract neck, shoulders, elbows, wrists, chest, hips
     *   3. Compute torso orientation from shoulder/hip vectors:
     *        torsoYaw = atan2(rightShoulder.x - leftShoulder.x,
     *                         rightShoulder.y - leftShoulder.y)
     *   4. Compute shoulder slope:
     *        slopeAngle = atan2(rightShoulder.y - leftShoulder.y,
     *                           rightShoulder.x - leftShoulder.x) * (180/π)
     *   5. Compute shoulder symmetry:
     *        symmetry = 1 - |leftShoulderDist - rightShoulderDist| / max(...)
     *
     * Failure conditions:
     *   - Subject not visible from waist up → abort with "insufficient_body"
     *   - Shoulder keypoints missing → fallback to face-only processing
     */
    estimate(imageRef: string): Promise<FullBodyPoseResult>;
}

export interface FullBodyPoseResult {
    keypoints: BodyKeypoints;
    torsoOrientation: TorsoOrientation;
    keypointConfidence: number;
    warnings: string[];
}

// ─── 1.3 Semantic Segmentation & Matting Module ──────────────────────────────

/**
 * Input:  RGB image
 * Output: Per-region masks, alpha mattes with hair-strand detail
 *
 * Edge smoothing constraints:
 *   - Hair matte boundary must use guided filter or KNN matting
 *   - Alpha gradient at hair boundary: max 8px transition width
 *   - No binary cutoffs at hair-background boundary
 *
 * Hair-strand preservation logic:
 *   - Trimap generation: definite FG, definite BG, unknown band (12-20px)
 *   - Alpha refinement in unknown band using local color statistics
 *   - Preserve strands where alpha > 0.05 and strand width ≥ 1px
 */
export interface SemanticSegmentationModule {
    /**
     * Generate segmentation masks and refined alpha mattes.
     *
     * Internal logic:
     *   1. Run semantic segmentation (e.g., DeepLabV3+ / SegFormer)
     *      to produce coarse per-class masks
     *   2. Refine hair mask with alpha matting:
     *      a. Generate trimap from coarse mask (erode/dilate)
     *      b. Run alpha matting model in unknown region
     *      c. Apply guided filter for edge coherence
     *   3. Refine clothing sub-regions:
     *      a. Detect collar, lapel, tie sub-zones within clothing mask
     *      b. Output as separate masks for studio use
     *   4. Validate mask coverage: ensure face + hair + background ≥ 95% of image
     *
     * Failure conditions:
     *   - Face mask area < 3% of image → "face_too_small"
     *   - Hair mask discontinuous (multiple disjoint regions > 3) → warn "fragmented_hair"
     *   - Background mask < 5% → warn "tight_framing"
     */
    segment(imageRef: string): Promise<SegmentationResult>;
}

export interface SegmentationResult {
    masks: SegmentationMasks;
    /** Fraction of image covered by each region. */
    regionCoverage: Record<string, number>;
    /** Overall segmentation confidence. */
    confidence: number;
    warnings: string[];
}

// ─── 1.4 Photometric Estimation Module ───────────────────────────────────────

/**
 * Input:  RGB image + face mask + body mask
 * Output: Light direction, color temperature, exposure map, shadow map
 *
 * Computation methods:
 *   - Light direction: estimated from face shading using spherical harmonics
 *     decomposition or normal-map regression.
 *       lightDir = argmax_d ∫ I(p)·N(p)·δ(d) dp  over face region
 *
 *   - Color temperature: computed from white-balance estimation on skin region
 *       CCT = McCamy's formula on (x, y) chromaticity of skin sample
 *
 *   - Exposure map: log-luminance relative to skin reference region
 *       exposure(p) = log2(lum(p)) - log2(lum_skin_ref)
 *
 *   - Shadow density: thresholded luminance on face region
 *       shadow(p) = clamp(1 - lum(p)/lum_median, 0, 1)
 *
 * Normalization:
 *   - lightDir normalized to unit vector
 *   - colorTemperatureK clamped [2500, 10000]
 *   - exposure values normalized to [-3, +3] EV
 *   - shadow values in [0, 1]
 */
export interface PhotometricEstimationModule {
    /**
     * Estimate lighting conditions from the input image.
     *
     * Failure conditions:
     *   - Completely flat lighting (variance < threshold) → flag "flat_lighting"
     *   - Extreme backlight (face median lum < 0.15) → flag "backlit_subject"
     *   - Mixed lighting (CCT variance across face > 800K) → flag "mixed_lighting"
     */
    estimate(
        imageRef: string,
        faceMaskRef: string,
        bodyMaskRef: string,
    ): Promise<PhotometricResult>;
}

export interface PhotometricResult {
    photometrics: PhotometricEstimate;
    confidence: number;
    warnings: string[];
}

// ─── 1.5 Geometry Consistency Model ──────────────────────────────────────────

/**
 * Computes risk scores for geometric artifacts.
 *
 * WarpRisk = f(pose_extremity, landmark_confidence, face_size)
 *   - Higher for extreme poses, low confidence, small faces
 *   - warpRisk = α·(1 - landmarkConf) + β·poseExtremity + γ·(1 - faceAreaRatio)
 *   - α=0.4, β=0.35, γ=0.25
 *
 * EdgeRisk = g(hair_complexity, ear_occlusion, background_contrast)
 *   - Higher for complex hairstyles, partially occluded ears, low BG contrast
 *   - edgeRisk = δ·hairComplexity + ε·earOcclusionScore + ζ·(1 - bgContrast)
 *   - δ=0.45, ε=0.30, ζ=0.25
 */
export interface GeometryConsistencyModule {
    computeRisk(
        landmarks: FaceLandmarks2D,
        headPose: HeadPoseEstimate,
        faceBBox: BoundingBox,
        hairMaskRef: string,
        landmarkConfidence: number,
        imageWidth: number,
        imageHeight: number,
    ): Promise<GeometryRiskScores>;
}

export function computeWarpRisk(
    landmarkConfidence: number,
    poseExtremity: number,
    faceAreaRatio: number,
): number {
    const alpha = 0.4;
    const beta = 0.35;
    const gamma = 0.25;
    return clamp01(
        alpha * (1 - landmarkConfidence) +
        beta * poseExtremity +
        gamma * (1 - faceAreaRatio),
    );
}

export function computeEdgeRisk(
    hairComplexity: number,
    earOcclusionScore: number,
    bgContrast: number,
): number {
    const delta = 0.45;
    const epsilon = 0.30;
    const zeta = 0.25;
    return clamp01(
        delta * hairComplexity +
        epsilon * earOcclusionScore +
        zeta * (1 - bgContrast),
    );
}

// ─── Composite Perception Pipeline ───────────────────────────────────────────

/**
 * Runs all perception modules in the optimal order and produces
 * the unified PerceptionOutput.
 *
 * Execution order:
 *   1. Face Landmark & Pose  (depends on: raw image)
 *   2. Full-Body Pose        (depends on: raw image)
 *   3. Semantic Segmentation (depends on: raw image, face bbox)
 *   4. Photometric Estimation(depends on: raw image, face mask, body mask)
 *   5. Geometry Risk          (depends on: landmarks, pose, hair mask)
 *
 * Steps 1 & 2 can run in parallel.
 * Steps 3 depends on step 1 (face bbox for segmentation guidance).
 * Step 4 depends on step 3 (masks).
 * Step 5 depends on steps 1, 3.
 */
export interface PerceptionPipeline {
    /**
     * Run the full perception stack on an input image.
     *
     * @throws PerceptionError if critical modules fail (no face, etc.)
     */
    run(imageRef: string): Promise<PerceptionOutput>;
}

export class PerceptionError extends Error {
    constructor(
        message: string,
        public readonly module: string,
        public readonly code: string,
        public readonly warnings: string[],
    ) {
        super(message);
        this.name = "PerceptionError";
    }
}

/**
 * Default implementation of the perception pipeline.
 * Coordinates all five sub-modules.
 */
export class DefaultPerceptionPipeline implements PerceptionPipeline {
    constructor(
        private faceLandmarkPose: FaceLandmarkPoseModule,
        private fullBodyPose: FullBodyPoseModule,
        private segmentation: SemanticSegmentationModule,
        private photometrics: PhotometricEstimationModule,
        private geometryConsistency: GeometryConsistencyModule,
    ) { }

    async run(imageRef: string): Promise<PerceptionOutput> {
        // Phase 1: Face + Body in parallel
        const [faceResult, bodyResult] = await Promise.all([
            this.faceLandmarkPose.estimate(imageRef),
            this.fullBodyPose.estimate(imageRef),
        ]);

        // Validate critical results
        if (faceResult.confidence < 0.7) {
            throw new PerceptionError(
                "Face landmark confidence too low for reliable transformation",
                "face_landmark_pose",
                "low_confidence",
                faceResult.warnings,
            );
        }

        // Phase 2: Segmentation (needs face bbox)
        const segResult = await this.segmentation.segment(imageRef);

        // Phase 3: Photometrics (needs masks)
        const photoResult = await this.photometrics.estimate(
            imageRef,
            segResult.masks.faceSkin,
            segResult.masks.torso,
        );

        // Phase 4: Geometry risk assessment
        const imageWidth =
            faceResult.faceBoundingBox.bottomRight.x; // proxy
        const imageHeight =
            faceResult.faceBoundingBox.bottomRight.y; // proxy

        const geometryRisk = await this.geometryConsistency.computeRisk(
            faceResult.landmarks,
            faceResult.headPose,
            faceResult.faceBoundingBox,
            segResult.masks.hair,
            faceResult.confidence,
            imageWidth,
            imageHeight,
        );

        return {
            landmarks: faceResult.landmarks,
            headPose: faceResult.headPose,
            bodyKeypoints: bodyResult.keypoints,
            torsoOrientation: bodyResult.torsoOrientation,
            segmentation: segResult.masks,
            photometrics: photoResult.photometrics,
            geometryRisk,
            faceBoundingBox: faceResult.faceBoundingBox,
            identityMaskRef: faceResult.identityMaskRef,
        };
    }
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function euclidean2D(a: Point2D, b: Point2D): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function flattenLandmarks(landmarks: FaceLandmarks2D): Point2D[] {
    return [
        ...landmarks.leftEye,
        ...landmarks.rightEye,
        ...landmarks.leftBrow,
        ...landmarks.rightBrow,
        ...landmarks.noseRidge,
        ...landmarks.nostrils,
        ...landmarks.lipsOuter,
        ...landmarks.lipsInner,
        ...landmarks.jawline,
        landmarks.leftEar,
        landmarks.rightEar,
    ];
}
