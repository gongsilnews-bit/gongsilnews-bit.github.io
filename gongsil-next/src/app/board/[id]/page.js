import { createClient } from '@supabase/supabase-js'

export const revalidate = 60;

export default async function BoardReadPage({ params }) {
    const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: board } = await supabase
        .from('boards')
        .select('*')
        .eq('id', id)
        .single();

    if (!board) return <div className="container px-20 mt-50 mb-50 text-center">자료를 찾을 수 없습니다.</div>;

    return (
        <main className="container px-20 mt-50 mb-50" style={{ maxWidth: '800px', minHeight: '600px' }}>
            <div style={{ paddingBottom: '20px', borderBottom: '2px solid #111', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                    {board.tags?.map(t => <span key={t} style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#334155' }}>{t}</span>)}
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111', lineHeight: '1.4' }}>{board.title}</h1>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', fontSize: '14px', color: '#777' }}>
                    <span>{new Date(board.created_at).toLocaleString()} | 조회수 {board.view_count || 0}</span>
                </div>
            </div>

            {board.image_url && (
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <img src={board.image_url} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                </div>
            )}

            <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }} dangerouslySetInnerHTML={{ __html: board.content }}></div>
        </main>
    );
}
