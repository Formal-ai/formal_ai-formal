import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error?.message || `API request failed with status ${response.status}`;
        
        // Don't retry on client errors (4xx) except rate limits (429)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(errorMessage);
        }
        
        // For 5xx or 429, retry with exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          lastError = new Error(errorMessage);
          continue;
        }
        
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      // If it's a network error and we have retries left, try again
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Network error on attempt ${attempt + 1}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }
  
  throw lastError || new Error("Failed after maximum retries");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageText, audioTranscript } = await req.json();
    const inputText = messageText || audioTranscript;

    // Input validation
    if (!inputText) {
      return new Response(
        JSON.stringify({ error: 'No input text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Length validation (max 5000 characters)
    if (inputText.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Input text too long. Maximum 5000 characters allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for suspicious patterns that could indicate prompt injection
    const suspiciousPatterns = [
      /ignore\s+(previous|all|above)\s+instructions?/i,
      /system\s+prompt/i,
      /you\s+are\s+now/i,
      /disregard\s+(previous|all)\s+instructions?/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(inputText)) {
        console.warn('Suspicious input detected:', inputText.substring(0, 100));
        return new Response(
          JSON.stringify({ error: 'Invalid input detected. Please provide valid contact information.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are a CRM assistant. Extract the following information from the text and respond ONLY with valid JSON in this exact format:
{
  "name": "contact name",
  "company": "company name",
  "summary": "brief summary of the interaction",
  "nextAction": "what needs to be done next",
  "dueDate": "when it should be done",
  "sentiment": "positive, neutral, or negative",
  "suggestedReply": "a short suggested reply",
  "relationshipScore": "score from 0-100"
}

Text to analyze:
${inputText}`;

    console.log('Calling Gemini API...');
    
    const result = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    console.log('Gemini API response received');

    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Generated text:', generatedText);

    // Try to parse JSON from the response
    let analysisResults;
    try {
      // Remove markdown code blocks if present
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResults = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON, using text extraction fallback');
      // Fallback to text extraction
      const extractField = (text: string, fieldName: string): string => {
        const regex = new RegExp(`${fieldName}[:\\s]+([^\\n]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      analysisResults = {
        name: extractField(generatedText, 'name') || 'Unknown Contact',
        company: extractField(generatedText, 'company') || 'Unknown Company',
        summary: extractField(generatedText, 'summary') || generatedText,
        nextAction: extractField(generatedText, 'next action') || 'Follow up',
        dueDate: extractField(generatedText, 'due date') || 'TBD',
        sentiment: extractField(generatedText, 'sentiment') || 'neutral',
        suggestedReply: extractField(generatedText, 'suggested reply') || '',
        relationshipScore: extractField(generatedText, 'relationship score') || '70'
      };
    }

    return new Response(
      JSON.stringify(analysisResults),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-contact function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
