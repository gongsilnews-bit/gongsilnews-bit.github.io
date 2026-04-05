import { createClient } from '@supabase/supabase-js'
import Link from 'next/link';
import KakaoMap from '@/components/KakaoMap';

export const revalidate = 60; // ISR 캐싱 60초

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 썸네일 자동 추출 함수
function getThumbnail(content, image_path) {
    if (image_path) return image_path;
    if (!content) return null;
    const ytMatch = content.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
    const imgMatch = content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
    if (imgMatch) return imgMatch[1];
    return null;
}

export default async function Home() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, subtitle, image_path, content, created_at, section1')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50);
    
  if (error) console.error("Supabase Error:", error);

  // 카테고리별 분류 (서버 사이드에서 고속으로 쪼갬)
  const { data: properties } = await supabase.from('properties').select('id, title, deposit, rent, price, lat, lng').eq('status', 'active').limit(50);
  const safeArticles = articles || [];
  const localNews = safeArticles.filter(a => a.section1 === '우리동네부동산').slice(0, 3);
  const financeNews = safeArticles.filter(a => a.section1 === '부동산·주식·재테크').slice(0, 3);
  const politicsNews = safeArticles.filter(a => a.section1 === '정치·경제·사회').slice(0, 3);

  return (
    <>
      <main className="container px-20 relative" style={{ position: 'relative' }}>
          
          <div className="quick-menu" id="quickMenu">
              <div className="qm-item"><span>📌</span>관심매물</div>
              <div className="qm-item"><span>🕒</span>최근조회</div>
              <div className="qm-item"><span>📋</span>문의내역</div>
              <div className="qm-item" style={{background:'#f9f9f9'}}><span>🔝</span>TOP</div>
          </div>

          <div className="hero-section" style={{ padding: '0 25px 0 0', border: '0.5px solid #dcdcdc', borderTop: 'none', marginBottom: 0, background: '#fff' }}>
              <div className="hero-left" style={{ display: 'flex', marginTop: 0, flex: 2.8, position: 'relative', minHeight: '480px', padding: 0 }}>
                  <KakaoMap properties={properties} />
              </div>
              
              <div className="hero-right" style={{ marginTop: 0 }}>
                  <div className="banner-box" style={{ marginTop: 0, marginBottom: '30px', width: '100%', height: '180px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#555', textAlign: 'center' }}>배너 1</div>
                  
                  <div className="hn-header">
                      <h2>HOT 공실뉴스</h2>
                      <Link href="/news-all">더보기 &gt;</Link>
                  </div>
                  <div className="hn-list" style={{ marginBottom: 0 }}>
                      <div className="hn-item">
                          <div className="hn-img" style={{ background: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80') center/cover" }}></div>
                          <div className="hn-txt">
                              <h4>부동산 규제지역 추가 해제... 주택시장 훈풍 부나</h4>
                              <span>2026.04.01</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="ticker-bar">
              <Link href="/market" className="ticker-label">
                  실시간 부동산 지수 (Next.js 연동 준비중)
              </Link>
          </div>

          <div className="mt-50 mb-50">
              <div className="sec-title-wrap">
                  <h2 className="sec-title">부동산·주식·재테크</h2>
              </div>
              <div className="hot-issue-wrap">
                  <div className="hi-left">
                      <div className="hi-list">
                          {financeNews.map(article => {
                              const thumb = getThumbnail(article.content, article.image_path);
                              return (
                                  <Link href={`/article/${article.id}`} key={article.id} className="hi-item" style={{display:'flex', gap:'20px', cursor:'pointer'}}>
                                      {thumb ? (
                                          <img src={thumb} alt={article.title} />
                                      ) : (
                                          <div style={{width:'140px', height:'100px', background:'#eee', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa'}}>No Image</div>
                                      )}
                                      <div className="hi-txt">
                                          <h3>{article.title}</h3>
                                          <p dangerouslySetInnerHTML={{ __html: article.subtitle || article.content?.substring(0, 150) }}></p>
                                      </div>
                                  </Link>
                              );
                          })}
                      </div>
                  </div>
                  <div className="hi-right">
                      <div className="box-placeholder">
                          <span style={{color:'#999'}}>광고 또는 비디오 박스 영역</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="video-wrap mb-50">
              <div className="sec-title-wrap">
                  <h2 className="sec-title">우리동네부동산</h2>
              </div>
              <div className="video-grid">
                  {localNews.map(article => {
                      const thumb = getThumbnail(article.content, article.image_path);
                      return (
                          <Link href={`/article/${article.id}`} key={article.id} className="vid-item" style={{display:'block', cursor:'pointer'}}>
                              {thumb ? (
                                  <div className="vid-thumb" style={{ background: `url(${thumb}) center/cover` }}>
                                      <div className="vid-play"></div>
                                  </div>
                              ) : (
                                  <div className="vid-thumb" style={{ background: '#222', display:'flex', alignItems:'center', justifyContent:'center', color:'#999' }}>
                                      No Image
                                  </div>
                              )}
                              <div className="vid-title">{article.title}</div>
                          </Link>
                      );
                  })}
              </div>
          </div>
      </main>
      
      <div className="premium-bg">
          <div className="container px-20">
              <div className="sec-title-wrap">
                  <h2 className="sec-title" style={{color:'#fff'}}>드론영상 (자료실)</h2>
              </div>
              <div className="prem-grid">
                  {/* Drone videos hardcoded for design demonstration */}
                  <div className="prem-card">
                      <div className="prem-img" style={{background:'#555'}}></div>
                      <div className="prem-title">강남 주요 오피스 권역 임대차 동향</div>
                      <div className="prem-desc">2026년 1분기 GBD 테헤란로 일대 프라임급 오피스 공실률 및 임대료 동향</div>
                  </div>
              </div>
          </div>
      </div>
      
      <footer className="footer" style={{marginTop:'50px'}}>
        <div className="container">
            <div className="f-logos">
                <div className="f-logo">공실뉴스 NEXT.JS</div>
            </div>
            <div className="f-info">
                최고의 속도로 제공되는 공실뉴스 포털입니다. <br/>
                Next.js SSR 기반으로 0초만에 화면을 렌더링하고 있습니다.
            </div>
            <div className="f-copyright">
                © GONGSILNEWS. All Rights Reserved.
            </div>
        </div>
      </footer>
    </>
  );
}
