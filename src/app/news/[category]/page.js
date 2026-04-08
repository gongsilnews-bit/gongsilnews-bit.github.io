import { Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/Header';

const categoryMap = {
  'all': '전체뉴스',
  'local': '우리동네뉴스',
  'finance': '부동산·주식·재테크',
  'politics': '정치·경제·사회',
  'law': '세무·법률',
  'life': '여행·건강·생활',
  'etc': '기타'
};

function NewsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <div style={{ width: '200px', height: '140px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          <div style={{ flex: 1, padding: '10px 0' }}>
            <div style={{ height: '28px', backgroundColor: '#e2e8f0', width: '80%', marginBottom: '15px', borderRadius: '4px' }}></div>
            <div style={{ height: '16px', backgroundColor: '#e2e8f0', width: '100%', marginBottom: '8px', borderRadius: '4px' }}></div>
            <div style={{ height: '16px', backgroundColor: '#e2e8f0', width: '100%', marginBottom: '8px', borderRadius: '4px' }}></div>
            <div style={{ height: '16px', backgroundColor: '#e2e8f0', width: '40%', borderRadius: '4px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function AsyncNewsList({ sectionName }) {
  let query = supabase
    .from('articles')
    .select('id, title, excerpt, thumbnail_url, created_at, reporter_name, section1')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10);

  if (sectionName && sectionName !== '전체뉴스') {
    query = query.eq('section1', sectionName);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '16px' }}>해당 카테고리의 기사가 없습니다.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {data.map(news => (
        <div key={news.id} style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #eee', paddingBottom: '24px' }}>
          {news.thumbnail_url ? (
             <a href={`/news_read.html?id=${news.id}`} style={{ width: '220px', height: '150px', flexShrink: 0, display: 'block' }}>
               <img src={news.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} alt={news.title} />
             </a>
          ) : (
             <a href={`/news_read.html?id=${news.id}`} style={{ width: '220px', height: '150px', flexShrink: 0, display: 'block', backgroundColor: '#f0f0f0', borderRadius:'8px', border: '1px solid #ddd' }}></a>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <a href={`/news_read.html?id=${news.id}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.4', color: '#111' }}>
                  {news.title}
                </h3>
             </a>
             <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {news.excerpt || "기사 내용 요약이 없습니다..."}
             </p>
             <div style={{ fontSize: '13px', color: '#999', display: 'flex', gap: '12px' }}>
                <span style={{color: '#1a4282', fontWeight: 'bold'}}>[{news.section1 || '일반'}]</span>
                <span>{new Date(news.created_at).toLocaleDateString()}</span>
                <span>{news.reporter_name || '기자'}</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoryNewsPage({ params }) {
  const catKey = params.category || 'all';
  const sectionName = categoryMap[catKey] || '전체뉴스';

  return (
    <>
      <Header />
      <main className="container px-20">
        <div style={{ margin: '40px 0', borderBottom: '2px solid #222', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
           <i className="fa-regular fa-file-lines" style={{fontSize: '24px', color:'#1a4282'}}></i>
           <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>{sectionName}</h2>
        </div>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '60px' }}>
          {/* Left: Article List */}
          <div style={{ flex: 2 }}>
             <Suspense fallback={<NewsSkeleton />}>
                <AsyncNewsList sectionName={sectionName} />
             </Suspense>

             {/* Pagination Placeholder */}
             <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}>&lt; 이전</button>
                <span style={{ padding: '8px 16px', fontWeight: 'bold' }}>1 / 1</span>
                <button style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}>다음 &gt;</button>
             </div>
          </div>

          {/* Right: Sidebar / AD */}
          <div style={{ flex: 1 }}>
             <div style={{ width: '100%', height: '300px', backgroundColor: '#eaeaea', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#888', fontWeight: 'bold', marginBottom: '30px' }}>
                배너 광고 영역
             </div>
             
             <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>많이 본 뉴스</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ fontSize: '14px', lineHeight: '1.4' }}>1. 대법원, 신반포2차 재건축 상가 분쟁표...</li>
                  <li style={{ fontSize: '14px', lineHeight: '1.4' }}>2. 서울 아파트 공시가 18.7% 급등...</li>
                </ul>
             </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />
    </>
  );
}
