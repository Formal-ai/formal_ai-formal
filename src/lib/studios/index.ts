/**
 * Formal.AI — Studio Engine Barrel Exports
 *
 * Single import point for the entire studio algorithm architecture.
 *
 * Usage:
 *   import { executePipeline, PortraitStudioController, EditRegion } from "@/lib/studios";
 */

// ─── Core Types & Constants ──────────────────────────────────────────────────
export {
    // Enums
    StudioType,
    EditRegion,
    type GenderMode,
    // Core interfaces
    type Point2D,
    type BoundingBox,
    type AngleTriple,
    type FaceLandmarks2D,
    type PerceptionOutput,
    type EditScopeConfig,
    type ConditioningPayload,
    type GenerationRequest,
    type NegativeConstraint,
    type ValidationResult,
    type QualityMetric,
    type BoundedParam as IdentityStrengthParam,
    // Studio parameter types
    type PortraitParams,
    type HairParams,
    type AccessoriesParams,
    type BackgroundParams,
    type MagicPromptParams,
    type DesignerParams,
    // Controller interface
    type IStudioController,
    // Constants
    IDENTITY_LOCKED_REGIONS,
    QUALITY_THRESHOLDS,
    PERCEPTION_TOLERANCES,
    RETRY_POLICY,
} from "./core/types";

// ─── Core Modules ────────────────────────────────────────────────────────────
export {
    // Perception
    computeLandmarkDrift,
    computePoseDelta,
    DefaultPerceptionPipeline as PerceptionPipeline,
} from "./core/perception";

export {
    // Generation Control
    buildPreserveMap,
    buildEditScope,
    applyConstraintsToConditioning,
    autoTightenConstraints,
    GLOBAL_NEGATIVE_CONSTRAINTS,
    STUDIO_NEGATIVE_CONSTRAINTS,
} from "./core/generation-control";

export {
    // Quality Evaluator
    computeIdentityStability,
    computePoseStability,
    computeGeometryAlignment,
    computeEdgeFidelity,
    computeLightingCoherence,
    computeArtifactPenalty,
    evaluateQuality as computeCompositeQuality,
    evaluatePortraitGeometry,
} from "./core/quality-evaluator";

export {
    // Validation Engine
    validateOutput,
    computeRetryAdjustments,
    generateUserGuidance,
    type RetryDecision,
    type RetryContext,
} from "./core/validation-engine";

// ─── Studio Controllers ──────────────────────────────────────────────────────
export { PortraitStudioController, createDefaultPortraitParams, PORTRAIT_PARAMS_SCHEMA } from "./portrait/portrait-controller";
export { HairStudioController, createDefaultHairParams, HAIR_PARAMS_SCHEMA } from "./hair/hair-controller";
export { AccessoriesStudioController, createDefaultAccessoriesParams, ACCESSORIES_PARAMS_SCHEMA } from "./accessories/accessories-controller";
export { BackgroundStudioController, createDefaultBackgroundParams, BACKGROUND_PARAMS_SCHEMA } from "./background/background-controller";
export { MagicPromptStudioController, createDefaultMagicPromptParams, MAGIC_PROMPT_PARAMS_SCHEMA, analyzePrompt } from "./magic-prompt/magic-prompt-controller";
export { DesignerStudioController, createDefaultDesignerParams, DESIGNER_PARAMS_SCHEMA } from "./designer/designer-controller";

// ─── Pipeline ────────────────────────────────────────────────────────────────
export {
    executePipeline,
    getController,
    DEFAULT_PIPELINE_CONFIG,
    type PipelineResult,
    type PipelineConfig,
    type PipelineStatus,
} from "./pipeline/pipeline-orchestrator";
