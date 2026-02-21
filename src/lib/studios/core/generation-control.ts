/**
 * Formal.AI — Shared Generation Control Module
 *
 * Defines the constraint engine that governs what regions can be edited,
 * what must be preserved, and how negative constraints modify generation
 * parameters.  This is the shared "contract enforcement" layer used by
 * every studio controller.
 */

import {
    EditRegion,
    IDENTITY_LOCKED_REGIONS,
    StudioType,
    EditScopeConfig,
    NegativeConstraint,
    ConditioningPayload,
    PerceptionOutput,
    PERCEPTION_TOLERANCES,
} from "./types";

// ─── PreserveMap ─────────────────────────────────────────────────────────────

/**
 * Regions that CANNOT change, regardless of studio.
 * The PreserveMap is the union of identity-locked regions plus any
 * studio-specific preservations.
 *
 * Identity-locked (global):
 *   Eyes, Eyebrows, Nose, Lips, Jaw, FaceSkin
 *
 * Studio-specific additions:
 *   - Hair Studio: FaceSkin, Clothing, Background
 *   - Portrait Studio: Hair, Eyes, FaceSkin
 *   - Accessories Studio: Hair, FaceSkin, Background
 *   - Background Studio: FaceSkin, Hair, Clothing
 *   - Magic Prompt: determined by parsed instruction
 */
export function buildPreserveMap(
    studioType: StudioType,
    additionalPreserve: EditRegion[] = [],
): EditRegion[] {
    const base = [...IDENTITY_LOCKED_REGIONS];

    const studioPreserve: Record<StudioType, EditRegion[]> = {
        [StudioType.Portrait]: [EditRegion.Hair, EditRegion.Background],
        [StudioType.Hair]: [EditRegion.Clothing, EditRegion.Background],
        [StudioType.Accessories]: [EditRegion.Hair, EditRegion.Background],
        [StudioType.Background]: [EditRegion.Hair, EditRegion.Clothing],
        [StudioType.MagicPrompt]: [], // determined at runtime
        [StudioType.Designer]: [EditRegion.Hair, EditRegion.Background],
    };

    const combined = new Set([
        ...base,
        ...(studioPreserve[studioType] || []),
        ...additionalPreserve,
    ]);

    return Array.from(combined);
}

// ─── EditScope ───────────────────────────────────────────────────────────────

/**
 * Regions allowed to change per studio.
 * This is a WHITELIST — anything not listed is locked.
 */
const STUDIO_EDIT_SCOPES: Record<StudioType, EditRegion[]> = {
    [StudioType.Portrait]: [
        EditRegion.Clothing,
        EditRegion.CollarArea,
        EditRegion.LapelArea,
        EditRegion.TieArea,
        EditRegion.Shoulders,
        EditRegion.Torso,
        EditRegion.Neck, // collar contact zone only
    ],
    [StudioType.Hair]: [
        EditRegion.Hair,
        EditRegion.Hairline,
    ],
    [StudioType.Accessories]: [
        EditRegion.AccessoryZone,
        EditRegion.TieArea,
        EditRegion.CollarArea,
    ],
    [StudioType.Background]: [
        EditRegion.Background,
    ],
    [StudioType.MagicPrompt]: [
        // Dynamic — determined by parsed instruction
        EditRegion.Hair,
        EditRegion.Clothing,
        EditRegion.AccessoryZone,
        EditRegion.Background,
        EditRegion.TieArea,
        EditRegion.CollarArea,
    ],
    [StudioType.Designer]: [
        EditRegion.Clothing,
        EditRegion.CollarArea,
        EditRegion.LapelArea,
        EditRegion.TieArea,
        EditRegion.Shoulders,
        EditRegion.Torso,
    ],
};

export function buildEditScope(
    studioType: StudioType,
    additionalAllowed: EditRegion[] = [],
    additionalPreserved: EditRegion[] = [],
): EditScopeConfig {
    const allowed = new Set([
        ...(STUDIO_EDIT_SCOPES[studioType] || []),
        ...additionalAllowed,
    ]);

    const preserved = buildPreserveMap(studioType, additionalPreserved);

    // Remove any preserved regions from allowed (preserve always wins)
    for (const region of preserved) {
        allowed.delete(region);
    }

    return {
        allowedRegions: Array.from(allowed),
        preserveRegions: preserved,
    };
}

// ─── Negative Constraints ────────────────────────────────────────────────────

/**
 * Global negative constraints applied to EVERY studio generation.
 * Additional studio-specific negatives are appended by each controller.
 */
export const GLOBAL_NEGATIVE_CONSTRAINTS: NegativeConstraint[] = [
    {
        id: "no_face_reshape",
        description: "Do not alter facial bone structure, jaw width, or facial proportions",
        weight: 1.0,
    },
    {
        id: "no_skin_over_smoothing",
        description: "Do not over-smooth skin texture; preserve pores, texture, and natural appearance",
        weight: 0.95,
    },
    {
        id: "no_age_shift",
        description: "Do not make the subject appear older or younger",
        weight: 1.0,
    },
    {
        id: "no_ethnicity_shift",
        description: "Do not alter skin tone, ethnicity cues, or racial features",
        weight: 1.0,
    },
    {
        id: "no_halo_artifacts",
        description: "No bright or dark halos around hair edges, ears, or accessory boundaries",
        weight: 0.90,
    },
    {
        id: "no_unrealistic_geometry",
        description: "No impossible geometry: floating objects, warped perspectives, impossible shadows",
        weight: 0.90,
    },
    {
        id: "no_eye_reshaping",
        description: "Do not enlarge, reshape, or change eye color/shape",
        weight: 1.0,
    },
    {
        id: "no_beauty_filter",
        description: "Do not apply beauty filters, skin whitening, or complexion alteration",
        weight: 1.0,
    },
];

/**
 * Studio-specific negative constraints.
 */
export const STUDIO_NEGATIVE_CONSTRAINTS: Record<StudioType, NegativeConstraint[]> = {
    [StudioType.Portrait]: [
        {
            id: "no_collar_float",
            description: "Collar must make contact with neck; no floating or clipping",
            weight: 0.95,
        },
        {
            id: "no_asymmetric_lapels",
            description: "Suit lapels must be symmetrical in width and angle",
            weight: 0.90,
        },
        {
            id: "no_off_center_tie",
            description: "Tie knot must be centered on collar line and vertical axis",
            weight: 0.85,
        },
        {
            id: "no_shoulder_warp",
            description: "Shoulder seam must follow natural shoulder slope",
            weight: 0.90,
        },
    ],
    [StudioType.Hair]: [
        {
            id: "no_helmet_hair",
            description: "Hair must not appear as a solid, uniform mass (helmet effect)",
            weight: 0.90,
        },
        {
            id: "no_floating_hair",
            description: "Hair strands must connect to scalp; no detached blobs",
            weight: 0.90,
        },
        {
            id: "no_forehead_bleeding",
            description: "Hair must not bleed onto forehead or overlap face unnatural",
            weight: 0.85,
        },
        {
            id: "no_ear_distortion",
            description: "Ears must not be warped, moved, or partially erased",
            weight: 0.90,
        },
        {
            id: "no_scalp_distortion",
            description: "Scalp shape and hairline must remain anatomically consistent",
            weight: 0.85,
        },
    ],
    [StudioType.Accessories]: [
        {
            id: "no_floating_accessories",
            description: "Accessories must have contact points with the body; not float in air",
            weight: 0.95,
        },
        {
            id: "no_wrong_scale",
            description: "Accessory size must be proportional to body feature it attaches to",
            weight: 0.90,
        },
        {
            id: "no_missing_shadow",
            description: "Accessories must cast appropriate contact shadows",
            weight: 0.80,
        },
        {
            id: "no_glasses_eye_warp",
            description: "Glasses must not distort or resize the eyes beneath them",
            weight: 0.95,
        },
    ],
    [StudioType.Background]: [
        {
            id: "no_hair_halo",
            description: "Hair edges must blend cleanly with new background; no bright/dark rim",
            weight: 0.95,
        },
        {
            id: "no_light_direction_mismatch",
            description: "Background lighting must match subject lighting direction",
            weight: 0.90,
        },
        {
            id: "no_skin_color_cast",
            description: "Background replacement must not introduce color cast on skin",
            weight: 0.90,
        },
        {
            id: "no_depth_inconsistency",
            description: "Background blur must be consistent with subject distance",
            weight: 0.85,
        },
    ],
    [StudioType.MagicPrompt]: [
        {
            id: "no_over_editing",
            description: "Do not modify more regions than the instruction requires",
            weight: 0.85,
        },
        {
            id: "no_conflicting_simultaneous_changes",
            description: "Do not apply conflicting changes to the same region simultaneously",
            weight: 0.90,
        },
    ],
    [StudioType.Designer]: [
        {
            id: "no_body_distortion",
            description: "Garment application must not distort the subject's body proportions",
            weight: 0.95,
        },
        {
            id: "no_unrealistic_fabric",
            description: "Fabric must follow physics: drape, fold, and light interaction must be realistic",
            weight: 0.90,
        },
    ],
};

// ─── Constraint Weight Application ──────────────────────────────────────────

/**
 * Applies constraint weights to a conditioning payload.
 *
 * Pseudo-code logic:
 *   for each constraint in activeConstraints:
 *     if constraint.weight > 0:
 *       append constraint.description to negativeTokens
 *       scale emphasis by constraint.weight:
 *         token = "((" + description + ":" + weight + "))"
 *
 * For preserve regions:
 *   Append identity-preservation prompt tokens
 *   Increase IP-adapter / reference fidelity weight
 *
 * For edit scope:
 *   Construct inpainting mask from allowed regions
 *   Everything outside allowed regions gets mask = 0 (no edit)
 */
export function applyConstraintsToConditioning(
    conditioning: ConditioningPayload,
    editScope: EditScopeConfig,
    negatives: NegativeConstraint[],
    identityWeight: number,
): ConditioningPayload {
    const negativeTokens = [...conditioning.negativeTokens];

    // Apply negative constraints as weighted negative prompt tokens
    for (const constraint of negatives) {
        if (constraint.weight > 0) {
            const emphasis = constraint.weight >= 0.9 ? 1.5 : constraint.weight >= 0.7 ? 1.2 : 1.0;
            negativeTokens.push(`(${constraint.description}:${emphasis.toFixed(1)})`);
        }
    }

    // Add identity preservation tokens
    if (identityWeight > 0.7) {
        negativeTokens.push(
            `(change face shape:${(identityWeight * 1.5).toFixed(1)})`,
            `(alter facial features:${(identityWeight * 1.5).toFixed(1)})`,
            `(modify eye shape:${(identityWeight * 1.5).toFixed(1)})`,
            `(change skin color:${(identityWeight * 1.3).toFixed(1)})`,
        );
    }

    // Build structured prompt with scope awareness
    const scopePrefix = editScope.allowedRegions.length > 0
        ? `Only modify: ${editScope.allowedRegions.join(", ")}. `
        : "";

    const preservePrefix = editScope.preserveRegions.length > 0
        ? `Preserve exactly: ${editScope.preserveRegions.join(", ")}. `
        : "";

    return {
        ...conditioning,
        structuredPrompt: `${scopePrefix}${preservePrefix}${conditioning.structuredPrompt}`,
        negativeTokens,
    };
}

// ─── Geometry-Aware Constraint Checks ────────────────────────────────────────

/**
 * Check if perception data suggests high warp risk and auto-tighten constraints.
 *
 * Logic:
 *   if warpRisk > WARP_RISK_THRESHOLD:
 *     increase identityWeight by 0.1
 *     reduce allowed edit scope (remove Neck from Portrait, etc.)
 *   if edgeRisk > EDGE_RISK_THRESHOLD:
 *     increase edge-related negative constraint weights by 0.1
 *     add explicit "preserve hair edges" token
 */
export function autoTightenConstraints(
    editScope: EditScopeConfig,
    negatives: NegativeConstraint[],
    geometryRisk: { warpRisk: number; edgeRisk: number },
    currentIdentityWeight: number,
): {
    editScope: EditScopeConfig;
    negatives: NegativeConstraint[];
    identityWeight: number;
} {
    let identityWeight = currentIdentityWeight;
    let adjustedScope = { ...editScope };
    const adjustedNegatives = negatives.map((n) => ({ ...n }));

    // High warp risk → tighten identity preservation
    if (geometryRisk.warpRisk > PERCEPTION_TOLERANCES.WARP_RISK_THRESHOLD) {
        identityWeight = Math.min(1.0, identityWeight + 0.10);

        // Remove Neck from editable regions (most fragile zone)
        adjustedScope = {
            ...adjustedScope,
            allowedRegions: adjustedScope.allowedRegions.filter(
                (r) => r !== EditRegion.Neck,
            ),
        };
    }

    // High edge risk → strengthen edge constraints
    if (geometryRisk.edgeRisk > PERCEPTION_TOLERANCES.EDGE_RISK_THRESHOLD) {
        for (const neg of adjustedNegatives) {
            if (
                neg.id.includes("halo") ||
                neg.id.includes("hair") ||
                neg.id.includes("edge") ||
                neg.id.includes("ear")
            ) {
                neg.weight = Math.min(1.0, neg.weight + 0.10);
            }
        }

        adjustedNegatives.push({
            id: "auto_preserve_hair_edges",
            description: "Strictly preserve hair strand edges and boundary integrity",
            weight: 0.95,
        });
    }

    return {
        editScope: adjustedScope,
        negatives: adjustedNegatives,
        identityWeight,
    };
}
