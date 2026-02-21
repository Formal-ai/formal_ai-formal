/**
 * Formal.AI — Core Type System
 *
 * All shared TypeScript types, enums, and interfaces for the studio
 * transformation pipeline.  Every module downstream imports from here.
 *
 * Design principles:
 *   - Typed bounded enums and ranges for every user-controllable parameter
 *   - Strict separation of identity-locked vs. editable regions
 *   - Mathematical metric types for quality scoring
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

/** The seven-layer transformation hierarchy (immutable ordering). */
export enum TransformationLayer {
    Identity = 0,
    Grooming = 1,
    GarmentStructure = 2,
    Accessories = 3,
    Environment = 4,
    LightingHarmony = 5,
    CompositePolish = 6,
}

/** Studio identifiers. */
export enum StudioType {
    Portrait = "portrait",
    Hair = "hair",
    Accessories = "accessories",
    Background = "background",
    MagicPrompt = "magic_prompt",
    Designer = "designer",
}

/** Gender mode — mirrors the existing studioOptions.ts convention. */
export type GenderMode = "Gentlemen" | "Ladies";

/** Discrete fit options. */
export type FitType = "slim" | "tailored" | "relaxed";

/** Suit construction styles. */
export type SuitStyle =
    | "single-breasted"
    | "double-breasted"
    | "tuxedo";

/** Lapel width control. */
export type LapelWidth = "narrow" | "standard" | "wide";

/** Shirt collar variants. */
export type ShirtCollarType =
    | "classic"
    | "spread"
    | "cutaway"
    | "button-down"
    | "mandarin"
    | "wing";

/** Tie mode. */
export type TieMode = "none" | "tie" | "bowtie";

/** Lighting mood presets. */
export type LightingMood =
    | "neutral_studio"
    | "soft_window"
    | "corporate_office"
    | "warm_editorial"
    | "cool_editorial";

/** Hair texture classification. */
export type HairTexture = "straight" | "wavy" | "curly" | "coily";

/** Edge fidelity level. */
export type EdgeFidelity = "high" | "medium" | "low";

/** Accessory material class. */
export type AccessoryMaterial = "matte" | "silk" | "metal" | "leather" | "velvet";

/** Accessory formality. */
export type FormalityLevel = "subtle" | "moderate" | "bold";

/** Background archetype. */
export type BackgroundType =
    | "corporate_office"
    | "studio_gradient"
    | "luxury_interior"
    | "neutral_professional"
    | "blurred_architectural";

/** Depth-of-field intensity. */
export type DepthOfFieldLevel = "low" | "medium" | "high";

/** Color mood. */
export type ColorMood = "neutral" | "warm" | "cool";

/** Magic Prompt output style. */
export type OutputStyle = "corporate" | "luxury" | "editorial" | "minimal_studio";

/** Fabric type for the designer engine. */
export type FabricType = "wool" | "velvet" | "silk" | "cotton" | "linen" | "cashmere";

/** Fit simulation variant (designer studio). */
export type DesignerFitType =
    | "slim"
    | "tailored"
    | "relaxed"
    | "double-breasted"
    | "structured_shoulder"
    | "wide_lapel";

// ─── Edit Regions ─────────────────────────────────────────────────────────────

/** Labelled semantic regions on the image. */
export enum EditRegion {
    FaceSkin = "face_skin",
    Eyes = "eyes",
    Eyebrows = "eyebrows",
    Nose = "nose",
    Lips = "lips",
    Ears = "ears",
    Jaw = "jaw",
    Hairline = "hairline",
    Hair = "hair",
    Neck = "neck",
    Shoulders = "shoulders",
    Torso = "torso",
    Arms = "arms",
    Hands = "hands",
    Clothing = "clothing",
    TieArea = "tie_area",
    LapelArea = "lapel_area",
    CollarArea = "collar_area",
    AccessoryZone = "accessory_zone",
    Accessories = "accessories",
    Glasses = "glasses",
    Earrings = "earrings",
    Necklace = "necklace",
    Background = "background",
}

/** Regions that must NEVER be modified — identity lock layer. */
export const IDENTITY_LOCKED_REGIONS: readonly EditRegion[] = [
    EditRegion.Eyes,
    EditRegion.Eyebrows,
    EditRegion.Nose,
    EditRegion.Lips,
    EditRegion.Jaw,
    EditRegion.FaceSkin,
] as const;

// ─── 2D / 3D Geometry Primitives ──────────────────────────────────────────────

export interface Point2D {
    x: number;
    y: number;
}

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface BoundingBox {
    topLeft: Point2D;
    bottomRight: Point2D;
}

export interface AngleTriple {
    /** Degrees, [-90, 90] */
    yaw: number;
    /** Degrees, [-90, 90] */
    pitch: number;
    /** Degrees, [-180, 180] */
    roll: number;
}

// ─── Perception Module Types ──────────────────────────────────────────────────

/** 2D facial landmarks — 68-point model. */
export interface FaceLandmarks2D {
    leftEye: Point2D[];
    rightEye: Point2D[];
    leftBrow: Point2D[];
    rightBrow: Point2D[];
    noseRidge: Point2D[];
    nostrils: Point2D[];
    lipsOuter: Point2D[];
    lipsInner: Point2D[];
    jawline: Point2D[];
    leftEar: Point2D;
    rightEar: Point2D;
}

export interface HeadPoseEstimate {
    angles: AngleTriple;
    focalLengthProxy: number;
    faceToDistanceProxy: number;
}

export interface BodyKeypoints {
    neck: Point2D;
    leftShoulder: Point2D;
    rightShoulder: Point2D;
    leftElbow: Point2D;
    rightElbow: Point2D;
    leftWrist: Point2D;
    rightWrist: Point2D;
    chestCenter: Point2D;
    leftHip: Point2D;
    rightHip: Point2D;
}

export interface TorsoOrientation {
    angles: AngleTriple;
    shoulderSlopeAngleDeg: number;
    shoulderSymmetryScore: number; // 0..1
}

/** Segmentation masks — each is a binary/alpha mask reference. */
export interface SegmentationMasks {
    hair: string;
    faceSkin: string;
    eyebrows: string;
    eyes: string;
    lips: string;
    ears: string;
    neck: string;
    torso: string;
    hands: string;
    clothing: string;
    tieArea: string;
    lapelArea: string;
    collarArea: string;
    accessoryZones: string;
    background: string;
    /** High-fidelity alpha matte for hair boundary. */
    hairAlphaMatte: string;
}

export interface PhotometricEstimate {
    /** Dominant key-light direction in world space. */
    dominantLightDirection: Vector3;
    /** Correlated color temperature in Kelvin. */
    colorTemperatureK: number;
    /** Per-pixel relative exposure map reference. */
    exposureMapRef: string;
    /** Shadow density map reference (0 = no shadow, 1 = full shadow). */
    shadowMapRef: string;
    /** Shadow hardness: 0 = perfectly soft, 1 = perfectly hard. */
    shadowHardness: number;
    /** Skin tone reference sample region. */
    skinToneSampleRegion: BoundingBox;
}

export interface GeometryRiskScores {
    /** Probability of face shape drift (0..1). */
    warpRisk: number;
    /** Hairline and ear boundary integrity risk (0..1). */
    edgeRisk: number;
}

/** Complete perception output aggregated from all sub-modules. */
export interface PerceptionOutput {
    landmarks: FaceLandmarks2D;
    headPose: HeadPoseEstimate;
    bodyKeypoints: BodyKeypoints;
    torsoOrientation: TorsoOrientation;
    segmentation: SegmentationMasks;
    photometrics: PhotometricEstimate;
    geometryRisk: GeometryRiskScores;
    faceBoundingBox: BoundingBox;
    /** Identity region mask — union of all locked regions. */
    identityMaskRef: string;
    /** Hair-specific analysis (optional). */
    hairAnalysis?: {
        hairBBox: BoundingBox;
        coverageRatio: number;
        dominantDirection: number;
        avgStrandThickness: number;
        boundaryComplexity: number;
    };
}

// ─── Generation Control Types ─────────────────────────────────────────────────

export interface EditScopeConfig {
    /** Regions that MAY be edited by this studio invocation. */
    allowedRegions: EditRegion[];
    /** Regions that must remain pixel-stable. */
    preserveRegions: EditRegion[];
    /** Softness of the transitions between edit and preserve regions (px). */
    boundaryFeatherPx?: number;
}

export interface NegativeConstraint {
    id: string;
    description: string;
    /** Weight: 0 = disabled, 1 = maximum enforcement. */
    weight: number;
}

/** Structured conditioning for the generation backend. */
export interface ConditioningPayload {
    /** Structured text prompt (not raw user text). */
    structuredPrompt: string;
    /** Reference image(s) for style/texture. */
    referenceImages: string[];
    /** Control maps (depth, edge, pose, etc.). */
    controlMaps: Record<string, string>;
    /** Negative prompt tokens. */
    negativeTokens: string[];
}

export interface GenerationRequest {
    studioType: StudioType;
    inputImageRef: string;
    perception: PerceptionOutput;
    editScope: EditScopeConfig;
    conditioning: ConditioningPayload;
    negativeConstraints: NegativeConstraint[];
    /** Identity preservation strength: 0..1 (default 0.85). */
    identityWeight: number;
    /** Creativity freedom: 0..1 (default 0.5). */
    creativityLevel: number;
    /** Current retry attempt (0-indexed). */
    retryAttempt: number;
}

// ─── Quality / Validation Types ───────────────────────────────────────────────

/** Individual quality metric with raw score and pass/fail. */
export interface QualityMetric {
    name: string;
    /** Raw score: 0..1 where 1 = perfect. */
    score: number;
    /** Threshold below which this metric fails. */
    threshold: number;
    /** Whether the metric passed its threshold. */
    passed: boolean;
    /** Human-readable detail. */
    detail: string;
}

/**
 * Composite quality evaluation output.
 *
 * FinalScore =
 *   w1·IdentityStability + w2·PoseStability + w3·GeometryAlignment
 * + w4·EdgeFidelity      + w5·LightingCoherence + w6·ArtifactPenalty
 */
export interface QualityEvaluation {
    identityStability: QualityMetric;
    poseStability: QualityMetric;
    geometryAlignment: QualityMetric;
    edgeFidelity: QualityMetric;
    lightingCoherence: QualityMetric;
    artifactPenalty: QualityMetric;
    /** Weighted composite: 0..1. */
    compositeScore: number;
    /** Whether composite passes the global threshold. */
    passed: boolean;
    /** Per-metric breakdown. */
    allMetrics: QualityMetric[];
}

export interface ValidationResult {
    quality: QualityEvaluation;
    /** Specific failure reasons, if any. */
    failures: string[];
    /** Recommended retry strategy adjustments. */
    retryAdjustments: RetryAdjustment[];
}

export interface RetryAdjustment {
    action:
    | "increase_preserve_weight"
    | "reduce_edit_scope"
    | "lower_creativity"
    | "switch_inpainting_only"
    | "tighten_negative_constraints";
    /** Region or parameter to adjust. */
    target: string;
    /** Suggested new value. */
    suggestedValue: number;
}

// ─── Studio Result Types ──────────────────────────────────────────────────────

export interface StudioResult {
    studioType: StudioType;
    /** Output image reference. */
    outputImageRef: string;
    /** Quality evaluation for this output. */
    quality: QualityEvaluation;
    /** Number of retry attempts used. */
    retriesUsed: number;
    /** Whether the output passed all validation. */
    accepted: boolean;
    /** Processing time in milliseconds. */
    processingTimeMs: number;
    /** If not accepted, the reason(s). */
    rejectionReasons: string[];
}

export interface PipelineResult {
    /** Final composite output image reference. */
    finalImageRef: string;
    /** Per-studio results in execution order. */
    studioResults: StudioResult[];
    /** Overall pipeline quality. */
    overallQuality: QualityEvaluation;
    /** Total wall-clock time in milliseconds. */
    totalTimeMs: number;
    /** Whether the pipeline produced an accepted output. */
    accepted: boolean;
}

// ─── User Parameter Schemas ───────────────────────────────────────────────────

/**
 * Bounded numeric parameter.
 * Enforced at runtime: min ≤ value ≤ max.
 */
export interface BoundedParam<T = number> {
    value: T;
    min: T;
    max: T;
    default: T;
    step?: T;
    /** Impact on constraint weight (0 = none, 1 = maximum). */
    constraintImpact: number;
}

/** Portrait Studio user-controllable parameters. */
export interface PortraitParams {
    suitStyle: SuitStyle;
    fit: FitType;
    lapelWidth: LapelWidth;
    shirtCollar: ShirtCollarType;
    tie: TieMode;
    lightingMood: LightingMood;
    /** 0..1 — higher = less identity drift, less transformation strength. */
    identityStrength: BoundedParam;
}

/** Hair Studio parameters. */
export interface HairParams {
    style: string;
    length: string;
    texture: string;
    color: string;
    parting: string;
    identityStrength: BoundedParam;
}

/** Accessories Studio user-controllable parameters. */
export interface AccessoriesParams {
    accessoryType: string;
    material: AccessoryMaterial;
    color: string;
    formalityLevel: FormalityLevel;
}

/** Background Studio user-controllable parameters. */
export interface BackgroundParams {
    backgroundType: BackgroundType;
    depthOfField: DepthOfFieldLevel;
    colorMood: ColorMood;
    edgeStrictness: EdgeFidelity;
}

/** Magic Prompt Studio user-controllable parameters. */
export interface MagicPromptParams {
    /** Free-text instruction from the user. */
    prompt: string;
    /** 0..1 — how far from the original the system is allowed to go. */
    creativityLevel: number;
    /** Identity preservation weight. */
    identityStrength: BoundedParam;
}

/** Designer & Brand Owner Studio parameters. */
export interface DesignerParams {
    /** Reference garment image(s). */
    garmentRefs: string[];
    /** Fabric textures. */
    fabricTextures: string[];
    fitType: DesignerFitType;
    fabricType: FabricType;
    /** Brand preset identifier (if saved). */
    brandPresetId?: string;
}

// ─── Studio Controller Interface ──────────────────────────────────────────────

/**
 * Every studio controller must implement this interface.
 * This is the contract between the pipeline orchestrator and individual studios.
 */
export interface IStudioController<TParams> {
    readonly studioType: StudioType;

    /** Compute the edit scope for this studio given perception data. */
    computeEditScope(perception: PerceptionOutput): EditScopeConfig;

    /** Build the conditioning payload from user parameters + perception. */
    buildConditioning(
        params: TParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
    ): ConditioningPayload;

    /** Assemble the full generation request. */
    buildGenerationRequest(
        inputImageRef: string,
        params: TParams,
        perception: PerceptionOutput,
        genderMode: GenderMode,
        retryAttempt?: number,
    ): GenerationRequest;

    /** Return studio-specific negative constraints. */
    getNegativeConstraints(): NegativeConstraint[];

    /** Return studio-specific quality metric thresholds. */
    getQualityThresholds(): Record<string, number>;

    /** Validate an output against studio-specific rules. */
    validateOutput(
        outputImageRef: string,
        perception: PerceptionOutput,
        originalPerception: PerceptionOutput,
    ): ValidationResult;
}

// ─── Configuration Constants ──────────────────────────────────────────────────

/** Global quality thresholds. */
export const QUALITY_THRESHOLDS = {
    IDENTITY_STABILITY: 0.92,
    POSE_STABILITY: 0.90,
    GEOMETRY_ALIGNMENT: 0.85,
    EDGE_FIDELITY: 0.88,
    LIGHTING_COHERENCE: 0.82,
    ARTIFACT_PENALTY: 0.90,
    COMPOSITE_PASS: 0.87,
} as const;

/** Quality score weights — must sum to 1.0. */
export const QUALITY_WEIGHTS = {
    w1_identity: 0.30,
    w2_pose: 0.15,
    w3_geometry: 0.15,
    w4_edge: 0.15,
    w5_lighting: 0.10,
    w6_artifact: 0.15,
} as const;

/** Retry policy constants. */
export const RETRY_POLICY = {
    MAX_RETRIES: 3,
    PRESERVE_WEIGHT_INCREMENT: 0.10,
    CREATIVITY_DECREMENT: 0.15,
    INPAINTING_FALLBACK_RETRY: 2,
} as const;

/** Perception tolerance constants. */
export const PERCEPTION_TOLERANCES = {
    /** Max average landmark displacement in normalized coords (0..1). */
    LANDMARK_DRIFT_THRESHOLD: 0.015,
    /** Max head pose delta in degrees. */
    POSE_DELTA_THRESHOLD_DEG: 3.0,
    /** Shoulder slope delta in degrees. */
    SHOULDER_SLOPE_DELTA_DEG: 5.0,
    /** Warp risk probability threshold — above triggers preservation mode. */
    WARP_RISK_THRESHOLD: 0.3,
    /** Edge risk probability threshold. */
    EDGE_RISK_THRESHOLD: 0.25,
} as const;
