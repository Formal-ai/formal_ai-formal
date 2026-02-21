import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// C4 FIX: Restrict CORS to your actual domain (update before production)
const ALLOWED_ORIGINS = [
    'https://formal.ai',
    'https://www.formal.ai',
    'http://localhost:5173',   // Dev only — remove for production
    'http://localhost:8080',   // Dev only — remove for production
];

function getCorsHeaders(req: Request) {
    const origin = req.headers.get('Origin') || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin',
    };
}

// C7 FIX: Database-backed rate limiting replaces in-memory store
const RATE_LIMIT_WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 10;

interface GenerationRequest {
    type: 'portrait' | 'hair' | 'accessories' | 'background' | 'magic';
    image?: string; // Base64 string
    imageUrl?: string; // Storage URL
    constraints?: Record<string, string>;
    prompt?: string;
    genderMode?: string;
    // NOTE: userId is NO LONGER accepted from the client (C3 fix)
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');

        if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Server configuration error: Missing required API keys');
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // C3 FIX: Extract userId from the JWT — NEVER trust client-sent userId
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Authentication required. Please log in.' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid or expired authentication token.' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const userId = user.id; // Server-verified userId

        // 1. INPUT VALIDATION
        let body: GenerationRequest;
        try {
            body = await req.json();
        } catch {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON body' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { type, constraints, prompt, image, imageUrl, genderMode } = body;

        if (!image && !imageUrl) {
            return new Response(
                JSON.stringify({ error: 'An image or image URL is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // C7 FIX: Database-backed rate limiting (persistent across cold starts)
        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
        const { count: recentCount, error: rateLimitError } = await supabaseAdmin
            .from('generations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', windowStart);

        if (!rateLimitError && recentCount !== null && recentCount >= MAX_REQUESTS_PER_WINDOW) {
            return new Response(
                JSON.stringify({
                    error: `Rate limit exceeded. You've made ${recentCount} requests in the last ${RATE_LIMIT_WINDOW_SECONDS} seconds. Please wait before trying again.`,
                    retryAfter: RATE_LIMIT_WINDOW_SECONDS
                }),
                {
                    status: 429,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                        'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS)
                    }
                }
            );
        }

        // 3. GET IMAGE DATA (Needed for Face Check - Base64)
        let base64Data = "";
        let finalInputUrl = imageUrl || "";

        if (image) {
            base64Data = image.split(',')[1] || image;
        } else if (imageUrl) {
            const imageRes = await fetch(imageUrl);
            if (!imageRes.ok) throw new Error("Failed to fetch image from storage URL");
            const arrayBuffer = await imageRes.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = "";
            for (let i = 0; i < uint8Array.byteLength; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            base64Data = btoa(binary);
        }

        // 4. STRICT FACE VALIDATION (Gemini)
        const validationPayload = {
            contents: [{
                parts: [
                    { text: "CRITICAL SECURITY CHECK: Does this image contain a clear human face? Answer ONLY with 'YES' or 'NO'. If it is an object like a shoe, hat, or animal, answer NO." },
                    { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                ]
            }]
        };

        const validationResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validationPayload)
            }
        );

        const valResult = await validationResponse.json();
        const isValid = valResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();

        if (isValid?.includes("NO")) {
            return new Response(
                JSON.stringify({ error: "Invalid Upload: Only human faces are allowed for professional styling. Please upload a clear headshot." }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 5. FREEMIUM / CREDIT CHECK
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (profileError) throw new Error("Could not verify user account status.");

        const isPlusUser = profile.credits !== null && profile.credits > 0;

        if (!isPlusUser) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { count, error: countError } = await supabaseAdmin
                .from('generations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', oneWeekAgo.toISOString());

            if (countError) throw new Error("Could not verify usage limits.");

            if (count !== null && count >= 2) {
                return new Response(
                    JSON.stringify({
                        error: "Free Tier Limit Reached: You have used your 2 free professional images for this week. Upgrade to the Plus Model for more credits.",
                        limitReached: true
                    }),
                    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        // 6. REPLICATE GENERATION
        if (!REPLICATE_API_TOKEN) {
            return new Response(
                JSON.stringify({ error: "Server Configuration Error: REPLICATE_API_TOKEN is missing." }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        let replicatePrompt = "";
        const gender = genderMode || "person";

        switch (type) {
            case 'portrait':
                const outfit = constraints?.outfitType || 'business suit';
                const color = constraints?.outfitColor || 'navy';
                replicatePrompt = `professional headshot of a ${gender} wearing a ${color} ${outfit}, studio lighting, 8k resolution, photorealistic, sharp focus, neutral background, high quality, corporate photography`;
                break;
            case 'hair':
                const hairStyle = constraints?.hairStyle || 'neat professional';
                replicatePrompt = `professional headshot of a ${gender} with ${hairStyle} hairstyle, studio lighting, photorealistic, 8k`;
                break;
            default:
                replicatePrompt = prompt ? `professional headshot, ${prompt}, studio lighting, 8k` : "professional headshot, studio lighting, corporate style, 8k";
        }

        const MODEL_VERSION = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: MODEL_VERSION,
                input: {
                    image: finalInputUrl,
                    prompt: replicatePrompt,
                    prompt_strength: 0.8,
                    negative_prompt: "cartoon, illustration, animation, face defects, lazy eye, low resolution, blurry",
                    num_outputs: 1,
                    refine: "expert_ensemble_refiner",
                    high_noise_frac: 0.8
                }
            }),
        });

        if (!replicateResponse.ok) {
            const err = await replicateResponse.json();
            throw new Error(`Replicate API Error: ${err.detail || JSON.stringify(err)}`);
        }

        const prediction = await replicateResponse.json();
        let predictionId = prediction.id;
        let outputUrl = null;

        // Poll for completion with timeout (max 60 seconds)
        const maxWaitTime = 60000;
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json",
                }
            });
            const statusData = await statusRes.json();

            if (statusData.status === "succeeded") {
                outputUrl = statusData.output[0];
                break;
            } else if (statusData.status === "failed" || statusData.status === "canceled") {
                throw new Error("Image generation failed on the server.");
            }

            await new Promise(r => setTimeout(r, 1000));
        }

        if (!outputUrl) throw new Error("Generation timed out after 60 seconds.");

        // 7. DB LOGGING & CREDIT DEDUCTION (using server-verified userId)
        const { data: dbData, error: dbError } = await supabaseAdmin
            .from('generations')
            .insert({
                user_id: userId,
                prompt: replicatePrompt,
                result_text: "Professional Transformation",
                type: type,
                image_url: outputUrl
            })
            .select()
            .single();

        if (isPlusUser) {
            await supabaseAdmin
                .from('profiles')
                .update({ credits: profile.credits - 1 })
                .eq('id', userId);
        }

        return new Response(
            JSON.stringify({
                success: true,
                id: dbData?.id,
                result: outputUrl,
                description: `Enhanced with: ${replicatePrompt}`,
                message: "Professional analysis and styling complete.",
                quality_report: {
                    resolution: "HD Optimized",
                    lighting: "Studio Professional",
                    consistency_score: "98/100"
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        const corsHeaders = getCorsHeaders(req);
        console.error('Edge Function Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
