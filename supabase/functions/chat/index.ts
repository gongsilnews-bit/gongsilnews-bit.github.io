import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + GEMINI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

    // ==========================================
    // RAG (Retrieval-Augmented Generation) 로직
    // ==========================================
    let ragContext = "";

    try {
      // 요청을 받았을 때 환경변수를 불러오고 Supabase 클라이언트 생성
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. "매물" 관련 질문인지 확인 후 최신 매물 3개 조회
        if (/(매물|공실|전세|월세|매매|방|아파트|오피스텔|상가|원룸|투룸)/.test(userQuery)) {
          const { data: props, error } = await supabase
            .from('properties')
            .select('property_type, trade_type, deposit, monthly_rent, sido, sigungu, dong, description')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(3);

          if (!error && props && props.length > 0) {
            ragContext += "\n\n[추가 검색 데이터: 실시간 최신 매물 정보]\n";
            props.forEach((p, idx) => {
              const desc = p.description ? p.description.substring(0, 40).replace(/\n/g, ' ') : '';
              ragContext += `${idx+1}. [${p.trade_type}] ${p.sigungu} ${p.dong} ${p.property_type} (보증금 ${p.deposit} / 월세 ${p.monthly_rent}) - ${desc}...\n`;
            });
          }
        }

        // 2. "뉴스" 관련 질문인지 확인 후 최신 뉴스 3개 조회
        if (/(뉴스|기사|칼럼|소식)/.test(userQuery)) {
          const { data: news, error } = await supabase
            .from('articles')
            .select('title, section1, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(3);

          if (!error && news && news.length > 0) {
            ragContext += "\n\n[추가 검색 데이터: 실시간 최신 뉴스 기사]\n";
            news.forEach((n, idx) => {
              const date = new Date(n.created_at).toLocaleDateString('ko-KR');
              ragContext += `${idx+1}. [${n.section1 || '뉴스'}] ${n.title} (${date})\n`;
            });
          }
        }

        // 조회된 RAG 데이터가 있다면 시스템 프롬프트의 가장 끝에 덧붙입니다.
        if (ragContext && contents.length > 0 && contents[0].parts.length > 0) {
          if (typeof contents[0].parts[0].text === 'string') {
            contents[0].parts[0].text += ragContext;
          }
        }
      }
    } catch (ragError: any) {
      console.error("RAG logic failed, skipping RAG:", ragError.message);
      // RAG가 실패해도 전체 챗봇이 멈추지 않고, 그냥 기본 응답으로 넘어가도록 계속 진행
    }
    // ==========================================
    const contents = body.contents;
    const userQuery = body.userQuery || ""; // Frontend에서 보낸 원본 질문

    if (!contents) {
      return new Response(JSON.stringify({ error: "No contents provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==========================================
    // RAG (Retrieval-Augmented Generation) 로직
    // ==========================================
    let ragContext = "";

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      throw new Error(`Gemini API Error: ${geminiRes.status} ${errorText}`);
    }

    const data = await geminiRes.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
