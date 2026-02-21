/**
 * Formal.AI — Pipeline Orchestrator
 *
 * Sequences the full generation pipeline from input image to validated output.
 *
 * Pipeline flow:
 *   ┌─────────────┐
 *   │ Input Image  │
 *   └──────┬───────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Perception Run  │  ← Face landmarks, body pose, segmentation, photometrics
 *   └──────┬──────────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Risk Analysis   │  ← Geometry risk, edge risk assessment
 *   └──────┬──────────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Constraint Eng  │  ← PreserveMap, EditScope, Negatives, auto-tighten
 *   └──────┬──────────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Studio Control  │  ← Build conditioning payload per studio
 *   └──────┬──────────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Generation      │  ← Send to inference backend
 *   └──────┬──────────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Output Percept  │  ← Re-run perception on generated image
 *   └──────┬──────────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Quality Eval    │  ← Score identity, pose, edge, lighting, artifacts
 *   └──────┬──────────┘
 *          ▼
 *   ┌─────────────────┐
 *   │  Validation      │  ← Pass/fail + auto-retry decision
 *   └──────┬──────────┘
 *          ▼
 *   ┌───────┬─────────┐
 *   │  PASS │  RETRY  │  ← If retry: adjust constraints, loop back to Generation
 *   └───────┴─────────┘
 */

import type {
    StudioType,
    GenderMode,
    PerceptionOutput,
    GenerationRequest,
    ValidationResult,
    IStudioController,
} from "../core/types";

import { autoTightenConstraints } from "../core/generation-control";
import { PortraitStudioController } from "../portrait/portrait-controller";
import { HairStudioController } from "../hair/hair-controller";
import { AccessoriesStudioController } from "../accessories/accessories-controller";
import { BackgroundStudioController } from "../background/background-controller";
import { MagicPromptStudioController } from "../magic-prompt/magic-prompt-controller";
import { DesignerStudioController } from "../designer/designer-controller";

// ─── Pipeline Types ──────────────────────────────────────────────────────────

/** Pipeline execution status. */
export type PipelineStatus =
    | "idle"
    | "perceiving"
    | "constraining"
    | "generating"
    | "evaluating"
    | "validating"
    | "retrying"
    | "complete"
    | "failed"
    | "blocked"; // prompt safety blocked (Magic Prompt)

/** Single pipeline run result. */
export interface PipelineResult {
    status: PipelineStatus;
    /** The final (or best) output image reference. */
    outputImageRef: string | null;
    /** Validation result of the final output. */
    validation: ValidationResult | null;
    /** Number of retry attempts consumed. */
    retryAttempts: number;
    /** Maximum retries allowed. */
    maxRetries: number;
    /** Total pipeline execution time (ms). */
    executionTimeMs: number;
    /** Per-step timing breakdown. */
    stepTimings: Record<string, number>;
    /** Error message if failed. */
    error: string | null;
}

/** Pipeline configuration. */
export interface PipelineConfig {
    /** Maximum retry attempts before giving up. */
    maxRetries: number;
    /** Timeout per step (ms). */
    stepTimeoutMs: number;
    /** Overall pipeline timeout (ms). */
    totalTimeoutMs: number;
    /** Whether to auto-tighten constraints on retry. */
    autoTightenOnRetry: boolean;
    /** Whether to run output perception (adds latency but enables validation). */
    enableOutputPerception: boolean;
    /** Minimum composite quality score to accept. */
    minCompositeScore: number;
}

/** Default pipeline configuration. */
export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
    maxRetries: 3,
    stepTimeoutMs: 30_000,
    totalTimeoutMs: 120_000,
    autoTightenOnRetry: true,
    enableOutputPerception: true,
    minCompositeScore: 0.85,
};

// ─── Controller Registry ────────────────────────────────────────────────────

type AnyParams = Record<string, unknown>;

const CONTROLLER_REGISTRY: Record<string, IStudioController<AnyParams>> = {
    portrait: new PortraitStudioController() as unknown as IStudioController<AnyParams>,
    hair: new HairStudioController() as unknown as IStudioController<AnyParams>,
    accessories: new AccessoriesStudioController() as unknown as IStudioController<AnyParams>,
    background: new BackgroundStudioController() as unknown as IStudioController<AnyParams>,
    magic_prompt: new MagicPromptStudioController() as unknown as IStudioController<AnyParams>,
    designer: new DesignerStudioController() as unknown as IStudioController<AnyParams>,
};

/** Get the controller for a given studio type. */
export function getController(studioType: StudioType): IStudioController<AnyParams> {
    const controller = CONTROLLER_REGISTRY[studioType];
    if (!controller) {
        throw new Error(`No controller registered for studio type: ${studioType}`);
    }
    return controller;
}

// ─── Pipeline Orchestrator ───────────────────────────────────────────────────

/**
 * Execute the full generation pipeline.
 *
 * This is the main entry point for running a studio transformation.
 * It sequences all steps and handles retries.
 *
 * Pseudo-code:
 * ```
 * function executePipeline(input, studioType, params, gender, config):
 *   perception = runPerception(input)
 *   controller = getController(studioType)
 *
 *   for attempt in 0..config.maxRetries:
 *     request = controller.buildGenerationRequest(input, params, perception, gender, attempt)
 *
 *     if config.autoTightenOnRetry && attempt > 0:
 *       request = applyRetryTightening(request, perception, attempt)
 *
 *     output = callInferenceBackend(request)
 *     outputPerception = runPerception(output)
 *     validation = controller.validateOutput(output, outputPerception, perception)
 *
 *     if validation.passed:
 *       return { status: "complete", output, validation }
 *
 *   return { status: "failed", bestOutput, bestValidation }
 * ```
 */
export async function executePipeline(
    inputImageRef: string,
    studioType: StudioType,
    params: AnyParams,
    genderMode: GenderMode,
    config: PipelineConfig = DEFAULT_PIPELINE_CONFIG,
): Promise<PipelineResult> {
    const startTime = Date.now();
    const stepTimings: Record<string, number> = {};

    try {
        // Step 1: Run perception on input image
        const perceptionStart = Date.now();
        const perception = await runPerception(inputImageRef);
        stepTimings.perception = Date.now() - perceptionStart;

        // Step 2: Get studio controller
        const controller = getController(studioType);

        // Step 3: Retry loop
        let bestResult: PipelineResult | null = null;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            // Check total timeout
            if (Date.now() - startTime > config.totalTimeoutMs) {
                return buildResult("failed", bestResult, attempt, config.maxRetries, startTime, stepTimings, "Pipeline timed out");
            }

            // Build generation request
            const constraintStart = Date.now();
            let request = controller.buildGenerationRequest(
                inputImageRef, params, perception, genderMode, attempt,
            );

            // Auto-tighten on retry
            if (config.autoTightenOnRetry && attempt > 0) {
                request = applyRetryTightening(request, perception, attempt);
            }
            stepTimings[`constraint_${attempt}`] = Date.now() - constraintStart;

            // Send to inference backend
            const genStart = Date.now();
            const outputImageRef = await callInferenceBackend(request);
            stepTimings[`generation_${attempt}`] = Date.now() - genStart;

            // Run output perception
            if (config.enableOutputPerception) {
                const outPerceptionStart = Date.now();
                const outputPerception = await runPerception(outputImageRef);
                stepTimings[`output_perception_${attempt}`] = Date.now() - outPerceptionStart;

                // Validate
                const valStart = Date.now();
                const validation = controller.validateOutput(outputImageRef, outputPerception, perception);
                stepTimings[`validation_${attempt}`] = Date.now() - valStart;

                if (validation.quality.passed) {
                    return buildResult("complete", { outputImageRef, validation }, attempt, config.maxRetries, startTime, stepTimings, null);
                }

                bestResult = { outputImageRef, validation } as unknown as PipelineResult;
            } else {
                // No validation — accept first output
                return buildResult("complete", { outputImageRef, validation: null }, attempt, config.maxRetries, startTime, stepTimings, null);
            }
        }

        return buildResult("failed", bestResult, config.maxRetries, config.maxRetries, startTime, stepTimings, "Max retries exceeded");
    } catch (error) {
        return buildResult("failed", null, 0, config.maxRetries, startTime, stepTimings, String(error));
    }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function buildResult(
    status: PipelineStatus,
    data: { outputImageRef?: string; validation?: ValidationResult | null } | PipelineResult | null,
    retryAttempts: number,
    maxRetries: number,
    startTime: number,
    stepTimings: Record<string, number>,
    error: string | null,
): PipelineResult {
    return {
        status,
        outputImageRef: (data as any)?.outputImageRef ?? null,
        validation: (data as any)?.validation ?? null,
        retryAttempts,
        maxRetries,
        executionTimeMs: Date.now() - startTime,
        stepTimings,
        error,
    };
}

function applyRetryTightening(
    request: GenerationRequest,
    perception: PerceptionOutput,
    attempt: number,
): GenerationRequest {
    const tightenFactor = 0.05 * attempt; // progressive tightening
    const result = autoTightenConstraints(
        request.editScope,
        request.negativeConstraints,
        perception.geometryRisk,
        request.identityWeight + tightenFactor,
    );

    return {
        ...request,
        editScope: result.editScope,
        negativeConstraints: result.negatives,
        identityWeight: result.identityWeight,
    };
}

/**
 * Stub: Run perception on an image.
 *
 * In production, this calls the perception backend (face landmarks,
 * body pose, segmentation, photometrics, geometry consistency).
 */
async function runPerception(_imageRef: string): Promise<PerceptionOutput> {
    // This would call the actual perception pipeline
    throw new Error("runPerception: Not implemented — connect to perception backend");
}

/**
 * Stub: Call the inference backend for image generation.
 *
 * In production, this sends the GenerationRequest to the diffusion
 * model inference endpoint and returns the output image reference.
 */
async function callInferenceBackend(_request: GenerationRequest): Promise<string> {
    // This would call the actual inference backend
    throw new Error("callInferenceBackend: Not implemented — connect to inference endpoint");
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
    DEFAULT_PIPELINE_CONFIG as PIPELINE_DEFAULTS,
};
