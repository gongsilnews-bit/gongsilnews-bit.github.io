import { Suspense } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import KakaoMap from '../components/KakaoMap';
import NewsList from '../components/NewsList';

// Fallback skeleton for Suspense (PPR hole)
function NewsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <div style={{ width: '140px', height: '100px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ height: '24px', backgroundColor: '#e2e8f0', width: '80%', marginBottom: '10px', borderRadius: '4px' }}></div>
            <div style={{ height: '16px', backgroundColor: '#e2e8f0', width: '100%', marginBottom: '6px', borderRadius: '4px' }}></div>
            <div style={{ height: '16px', backgroundColor: '#e2e8f0', width: '60%', borderRadius: '4px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  // SSR: Fetch top 3 hot news from supabase server-side (for the Hero section)
  let hotNews = [];
  try {
    const { data } = await supabase
      .from('articles')
      .select('id, title, thumbnail_url, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) hotNews = data;
  } catch (err) {
    console.error('Failed to fetch hot news:', err);
  }

  return (
    <>
      <Header />
      <main className="container px-20 relative" style={{ position: 'relative' }}>
        <div className="hero-section" style={{ padding: '0 25px 0 0', border: '0.5px solid #dcdcdc', borderTop: 'none', marginBottom: '0', background: '#fff' }}>
          
          {/* Left: Real React Kakao Map */}
          <div className="hero-left" style={{ display: 'flex', marginTop: '0', flex: '2.8', position: 'relative', minHeight: '480px', padding: '0' }}>
            <KakaoMap />
          </div>
          
          {/* Right: AD & HOT NEWS SSR */}
          <div className="hero-right" style={{ marginTop: '0' }}>
            <div className="banner-box" style={{ marginTop: '0', marginBottom: '30px', width: '100%', height: '180px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#555', textAlign: 'center' }}>배너 1</div>
            
            <div className="hn-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #1a4282', paddingBottom: '10px'}}>
              <h2 style={{fontSize: '18px', fontWeight: '800', color: '#1a4282'}}>HOT 공실뉴스</h2>
              <a href="/news/all" style={{fontSize: '12px', color: '#666', fontWeight: '600', textDecoration:'none'}}>더보기 &gt;</a>
            </div>
            <div className="hn-list" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {hotNews.map((news) => (
                <div className="hn-item" key={news.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => { /* fallback */ }}>
                  <a href={`/news_read.html?id=${news.id}`} className="hn-img" style={{ display: 'block', width: '90px', height: '65px', background: `url('${news.thumbnail_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'}') center/cover`, borderRadius: '6px', flexShrink: 0 }}></a>
                  <div className="hn-txt">
                    <a href={`/news_read.html?id=${news.id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.4', marginBottom: '6px', color: '#111', wordBreak: 'keep-all' }}>{news.title}</h4>
                    </a>
                    <span style={{ fontSize: '12px', color: '#999' }}>{new Date(news.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CSS for Pulse Animation used in Skeleton */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}} />

        {/* 1. Hot Issue: Real Estate & Finance (PPR) */}
        <div style={{ marginTop: '50px', marginBottom: '50px' }}>
            <div className="sec-title-wrap" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '18px', backgroundColor: '#1a4282', marginRight: '10px' }}></div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a4282', letterSpacing: '-0.5px' }}>부동산·주식·재테크</h2>
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <Suspense fallback={<NewsSkeleton />}>
                        <NewsList limit={3} />
                    </Suspense>
                </div>
                <div style={{ flex: 1, height: '260px' }}>
                    <div className="box-placeholder" style={{ backgroundColor: '#e2e8f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ color: '#999' }}>광고 또는 비디오 박스 영역</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. Politics & Economy (PPR) */}
        <div style={{ marginTop: '50px', marginBottom: '50px' }}>
            <div className="sec-title-wrap" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '18px', backgroundColor: '#1a4282', marginRight: '10px' }}></div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a4282', letterSpacing: '-0.5px' }}>정치·경제·사회</h2>
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <Suspense fallback={<NewsSkeleton />}>
                        {/* Adding an artificial delay or offset logic would go here, we just use limit for demonstration */}
                        <NewsList limit={3} />
                    </Suspense>
                </div>
                <div style={{ flex: 1, height: '260px' }}>
                    <div className="box-placeholder" style={{ backgroundColor: '#e2e8f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ color: '#999' }}>광고 또는 비디오 박스 영역</span>
                    </div>
                </div>
            </div>
        </div>

      </main>
    </>
  );
}
