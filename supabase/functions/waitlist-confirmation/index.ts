import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// C4 FIX: Restrict CORS to actual domain
const ALLOWED_ORIGINS = [
    'https://formal.ai',
    'https://www.formal.ai',
    'http://localhost:5173',
    'http://localhost:8080',
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

// C5 FIX: HTML entity escaping to prevent XSS in emails
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        const { record } = await req.json();
        const { full_name, email } = record;

        if (!email) {
            throw new Error('Email is required');
        }

        // C5 FIX: Sanitize full_name before embedding in HTML
        const safeName = escapeHtml(full_name || 'there');

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Formal.AI <hello@formalai.studio>',
                to: [email],
                subject: 'Welcome to Formal.AI - You\'re on the List!',
                html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #ffffff;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0;">Formal.AI</h1>
                        </div>
                        <h2 style="font-size: 22px; color: #333;">Welcome, ${safeName}!</h2>
                        <p style="font-size: 16px; color: #555; line-height: 1.6;">
                            Thank you for joining the Formal.AI waitlist. We're building the future of AI-powered professional styling, and you're now part of the journey.
                        </p>
                        <p style="font-size: 16px; color: #555; line-height: 1.6;">
                            We'll notify you as soon as access becomes available. In the meantime, stay tuned for updates.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://formal.ai" style="display: inline-block; padding: 14px 32px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 14px;">
                                Visit Formal.AI
                            </a>
                        </div>
                        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">
                            &copy; 2026 Formal.AI. All rights reserved.
                        </p>
                    </div>
                `,
            }),
        });

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            status: res.ok ? 200 : 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Waitlist confirmation error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );
    }
});
