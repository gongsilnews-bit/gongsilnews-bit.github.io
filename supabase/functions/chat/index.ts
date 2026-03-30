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
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + GEMINI_API_KEY;

    const body = await req.json();
    const contents = body.contents;
    const userQuery = body.userQuery || "";

    if (!contents) {
      return new Response(JSON.stringify({ error: "No contents provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==========================================
    // RAG (REST API) 로직
    // ==========================================
    let ragContext = "";

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      
      if (supabaseUrl && supabaseKey) {
        const restUrl = `${supabaseUrl}/rest/v1`;
        const sbHeaders = {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        };

        // 1. "매물" 관련 질문
        if (/(매물|공실|전세|월세|매매|방|아파트|오피스텔|상가|원룸|투룸)/.test(userQuery)) {
          const fetchUrl = `${restUrl}/properties?select=property_type,trade_type,deposit,monthly_rent,sido,sigungu,dong,description&status=eq.active&order=created_at.desc&limit=3`;
          const res = await fetch(fetchUrl, { headers: sbHeaders });
          if (res.ok) {
            const props = await res.json();
            if (props && props.length > 0) {
              ragContext += "\n\n[추가 검색 데이터: 실시간 최신 매물 정보]\n";
              props.forEach((p: any, idx: number) => {
                const desc = p.description ? p.description.substring(0, 40).replace(/\n/g, ' ') : '';
                ragContext += `${idx+1}. [${p.trade_type}] ${p.sigungu} ${p.dong} ${p.property_type} (보증금 ${p.deposit} / 월세 ${p.monthly_rent}) - ${desc}...\n`;
              });
            }
          }
        }

        // 2. "뉴스" 관련 질문
        if (/(뉴스|기사|칼럼|소식)/.test(userQuery)) {
          const fetchUrl = `${restUrl}/articles?select=title,section1,created_at&status=eq.published&order=created_at.desc&limit=3`;
          const res = await fetch(fetchUrl, { headers: sbHeaders });
          if (res.ok) {
            const news = await res.json();
            if (news && news.length > 0) {
              ragContext += "\n\n[추가 검색 데이터: 실시간 최신 뉴스 기사]\n";
              news.forEach((n: any, idx: number) => {
                const date = new Date(n.created_at).toLocaleDateString('ko-KR');
                ragContext += `${idx+1}. [${n.section1 || '뉴스'}] ${n.title} (${date})\n`;
              });
            }
          }
        }

        if (ragContext && contents.length > 0 && contents[0].parts.length > 0) {
          if (typeof contents[0].parts[0].text === 'string') {
            contents[0].parts[0].text += ragContext;
          }
        }
      }
    } catch (ragError: any) {
      console.error("RAG fetch failed:", ragError.message);
    }
    // ==========================================

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini API Error: ${geminiRes.status} ${errorText}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();

    return new Response(JSON.stringify(data), {
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
