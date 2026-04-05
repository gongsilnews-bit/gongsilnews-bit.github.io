import os
import re

app_dir = "c:/Users/user/Desktop/test/gongsil-next/src/app"
comp_dir = "c:/Users/user/Desktop/test/gongsil-next/src/components"

# 1. KakaoMap.js 컴포넌트 만들기 (클라이언트 컴포넌트)
kakaomap_js = """'use client';
import { useEffect, useRef } from 'react';

export default function KakaoMap({ properties }) {
    const mapRef = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=435d3602201a49ea712e5f5a36fe6efc&libraries=clusterer,services&autoload=false";
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                if (!mapRef.current) return;
                
                const container = mapRef.current;
                const options = {
                    center: new window.kakao.maps.LatLng(37.498095, 127.027610), // 강남역 기본
                    level: 5
                };
                
                const map = new window.kakao.maps.Map(container, options);

                // 클러스터러 추가
                const clusterer = new window.kakao.maps.MarkerClusterer({
                    map: map,
                    averageCenter: true,
                    minLevel: 4,
                    styles: [{
                        width: '40px', height: '40px',
                        background: 'rgba(26, 66, 130, 0.9)',
                        color: '#fff',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        lineHeight: '40px',
                        borderRadius: '50%',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }]
                });

                if (properties && properties.length > 0) {
                    const markers = properties.filter(p => p.lat && p.lng).map(prop => {
                        return new window.kakao.maps.Marker({
                            position: new window.kakao.maps.LatLng(prop.lat, prop.lng),
                            title: prop.title
                        });
                    });
                    clusterer.addMarkers(markers);
                }
            });
        };

        return () => { document.head.removeChild(script); };
    }, [properties]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            <button className="map-btn" onClick={() => alert('실시간 재검색 기능은 추후 연동됩니다.')}>
                현위치에서 재검색
            </button>
            <div id="property-list-overlay" style={{ display: 'block', position: 'absolute', top: '15px', left: '15px', width: '280px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 99999, maxHeight: 'calc(100% - 30px)', overflowY: 'auto' }}>
                <div style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 999999, borderRadius: '10px 10px 0 0' }}>
                    <h3 style={{ margin:0, fontSize: '15px', color: '#508bf5', display: 'flex', alignItems: 'center' }}>
                        우리동네공실 
                    </h3>
                </div>
                <div style={{ padding: '15px' }}>
                    {properties?.slice(0, 5).map(p => (
                        <div key={p.id} style={{ borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'10px' }}>
                            <strong style={{fontSize:'14px', color:'#222'}}>{p.title}</strong>
                            <div style={{fontSize:'13px', color:'#e53e3e', fontWeight:'bold', marginTop:'4px'}}>{p.deposit && p.rent ? `보 ${p.deposit} / 월 ${p.rent}` : p.price}</div>
                        </div>
                    ))}
                    <div style={{textAlign:'center', fontSize:'12px', color:'#999'}}>...총 {properties?.length || 0}개 매물</div>
                </div>
            </div>
        </div>
    );
}
"""
with open(os.path.join(comp_dir, "KakaoMap.js"), "w", encoding="utf-8") as f:
    f.write(kakaomap_js)


# 2. News_Read 페이지 만들기 (/article/[id])
article_dir = os.path.join(app_dir, "article", "[id]")
os.makedirs(article_dir, exist_ok=True)
article_page_js = """import { createClient } from '@supabase/supabase-js'

export const revalidate = 60; // ISR

export default async function ArticlePage({ params }) {
    const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (!article) return <div className="container px-20 mt-50">기사를 찾을 수 없습니다.</div>;

    // 조회수 증가(비동기로 백그라운드 처리)를 서버단에서 하면 안되고 원래는 클라이언트에서 해야하지만
    // Vercel 환경이므로 무시하거나 클라이언트 컴포넌트를 분리해야 함. 일단 렌더링에 집중.
    
    return (
        <main className="container px-20 mt-50 mb-50" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '30px', borderBottom: '2px solid #222', paddingBottom: '20px' }}>
                <span style={{ fontSize:'13px', background:'#508bf5', color:'#fff', padding:'4px 8px', borderRadius:'4px', fontWeight:'bold' }}>{article.section1}</span>
                <h1 style={{ fontSize: '32px', fontWeight: '900', marginTop: '15px', color: '#111', lineHeight: '1.4' }}>{article.title}</h1>
                <p style={{ fontSize: '18px', color: '#555', marginTop: '15px', lineHeight:'1.5' }}>{article.subtitle}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px', fontSize:'14px', color:'#888' }}>
                    <span>입력 {new Date(article.created_at).toLocaleString()} | 조회수 {article.view_count || 1}</span>
                </div>
            </div>
            
            <div style={{ fontSize: '17px', lineHeight: '1.8', color: '#222', minHeight: '500px' }} 
                 dangerouslySetInnerHTML={{ __html: article.content }}>
            </div>
        </main>
    );
}
"""
with open(os.path.join(article_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(article_page_js)


# 3. page.js (Home) 업데이트하여 KakaoMap과 링크 연결하기
page_js_path = os.path.join(app_dir, "page.js")
with open(page_js_path, "r", encoding="utf-8") as f:
    page_content = f.read()

# 임포트 추가
if "import KakaoMap" not in page_content:
    page_content = page_content.replace(
        "import Link from 'next/link';", 
        "import Link from 'next/link';\nimport KakaoMap from '@/components/KakaoMap';"
    )

# 속성(properties) 불러오기 추가
if "const { data: properties }" not in page_content:
    page_content = page_content.replace(
        "const safeArticles = articles || [];",
        """const { data: properties } = await supabase.from('properties').select('id, title, deposit, rent, price, lat, lng').eq('status', 'active').limit(50);
  const safeArticles = articles || [];"""
    )

# KakaoMap 연동 (기존 hero-left 자리 교체)
safe_map_html = """<div className="hero-left" style={{ display: 'flex', marginTop: 0, flex: 2.8, position: 'relative', minHeight: '480px', padding: 0 }}>
                  <div style={{ position: 'absolute', top:0, left:0, width: '100%', height: '100%', display: 'flex', alignItems:'center', justifyContent:'center', background:'#e2e2e2', color:'#888', fontWeight:'bold' }}>
                      (Next.js 지도 API 연동 예정 구역)
                  </div>
              </div>"""

new_map_html = """<div className="hero-left" style={{ display: 'flex', marginTop: 0, flex: 2.8, position: 'relative', minHeight: '480px', padding: 0 }}>
                  <KakaoMap properties={properties} />
              </div>"""
page_content = page_content.replace(safe_map_html, new_map_html)

# 링크들 교체 (className="hi-item" 인 요소 클릭 시 상세 페이지로!)
# Link Wrapper로 씌우기
page_content = page_content.replace(
    """<div key={article.id} className="hi-item">""",
    """<Link href={`/article/${article.id}`} key={article.id} className="hi-item" style={{display:'flex', gap:'20px', cursor:'pointer'}}>"""
).replace(
    """</p>\n                                      </div>\n                                  </div>""",
    """</p>\n                                      </div>\n                                  </Link>"""
)

page_content = page_content.replace(
    """<div key={article.id} className="vid-item">""",
    """<Link href={`/article/${article.id}`} key={article.id} className="vid-item" style={{display:'block', cursor:'pointer'}}>"""
).replace(
    """</div>\n                          </div>""",
    """</div>\n                          </Link>"""
)

with open(page_js_path, "w", encoding="utf-8") as f:
    f.write(page_content)

print("Batch Update Completed")
