import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
    // User requested "flash 1.5 API"
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

    const body = await req.json();
    const contents = body.contents;

    if (!contents) {
      return new Response(JSON.stringify({ error: "No contents provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              property_type: { type: "STRING" },
              trade_type: { type: "STRING" },
              deposit: { type: "NUMBER" },
              monthly_rent: { type: "NUMBER" },
              maintenance_fee: { type: "NUMBER" },
              room_count: { type: "STRING" },
              bathroom_count: { type: "STRING" },
              current_floor: { type: "NUMBER" },
              total_floor: { type: "NUMBER" },
              supply_m2: { type: "NUMBER" },
              dedicated_m2: { type: "NUMBER" },
              parking_count: { type: "STRING" },
              move_in_type: { type: "STRING" },
              address: { type: "STRING" },
              description: { type: "STRING" },
            }
          }
        }
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini API Error: ${geminiRes.status} ${errorText}` }), {
        status: 200, // Client side error handling
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    
    // Attempt to extract JSON from response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
        const textResponse = data.candidates[0].content.parts[0].text;
        try {
            const parsed = JSON.parse(textResponse);
            return new Response(JSON.stringify(parsed), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: "Failed to parse JSON string: " + textResponse }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }
    }

    return new Response(JSON.stringify({ error: "No valid candidates returned" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
