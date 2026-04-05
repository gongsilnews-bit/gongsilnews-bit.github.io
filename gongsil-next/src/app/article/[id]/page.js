import { createClient } from '@supabase/supabase-js'

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
