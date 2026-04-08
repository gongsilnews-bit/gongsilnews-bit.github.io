import { supabase } from '../lib/supabase';

export default async function NewsList({ category, limit = 5 }) {
    // Fetch articles from Supabase
    // If category is provided, we can filter, but for now we'll fetch general articles and offset if needed
    // In a real scenario, we would use .eq('category_id', category)
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, thumbnail_url, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
        return <div style={{padding: '20px', color: '#999'}}>등록된 최신 기사가 없습니다.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {data.map(news => (
                <div key={news.id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                    <a href={`/news_read.html?id=${news.id}`} style={{ width: '140px', height: '100px', flexShrink: 0, display: 'block', textDecoration: 'none' }}>
                        <img 
                            src={news.thumbnail_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
                            alt={news.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', background: '#ddd' }} 
                        />
                    </a>
                    <div style={{ flex: 1 }}>
                        <a href={`/news_read.html?id=${news.id}`} style={{ textDecoration: 'none' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', lineHeight: '1.4', color: '#111' }}>
                                {news.title}
                            </h3>
                        </a>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {news.excerpt || "기사 본문 요약 내용이 없습니다."}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
