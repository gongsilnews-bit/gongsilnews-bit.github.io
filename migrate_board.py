import os

app_dir = "c:/Users/user/Desktop/test/gongsil-next/src/app"

# 1. 자료실 목록 페이지 (/board/page.js)
board_dir = os.path.join(app_dir, "board")
os.makedirs(board_dir, exist_ok=True)

board_page_js = """import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const revalidate = 60;

export default async function BoardPage({ searchParams }) {
    const { category, page } = await searchParams || {};
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const currentPage = parseInt(page) || 1;
    const itemsPerPage = 10;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    let query = supabase.from('boards').select('*', { count: 'exact' });
    if (category && category !== '전체') {
        // Here we assume category filtering might use tags or category columns
        query = query.contains('tags', [category]);
    }

    const { data: boards, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    return (
        <main className="container px-20 relative mt-50 mb-50" style={{ minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #222', paddingBottom: '15px' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#102c57' }}>
                    자료실 <span style={{ fontSize: '16px', fontWeight: '500', color: '#666', marginLeft: '10px' }}>(드론영상, 앱, 디자인 등)</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {['전체', '드론', '아파트', '빌딩', '단독/다가구/빌라', '도로'].map(cat => (
                    <Link key={cat} href={cat === '전체' ? '/board' : `/board?category=${cat}`} 
                          style={{ border: '1px solid #ddd', background: (!category && cat==='전체') || category === cat ? '#102c57' : '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', color: (!category && cat==='전체') || category === cat ? '#fff' : '#666', fontWeight: '600' }}>
                        {cat}
                    </Link>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '40px', marginTop: '20px', marginBottom: '60px' }}>
                {/* 리스트 영역 */}
                <div style={{ flex: 1 }}>
                    {boards?.length > 0 ? boards.map(b => (
                        <Link href={`/board/${b.id}`} key={b.id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', padding: '24px 10px', alignItems: 'center', transition: 'background 0.2s', borderRadius: '8px' }} className="hover:bg-gray-50">
                            <div style={{ width: '140px', height: '90px', borderRadius: '6px', background: b.image_url ? `url(${b.image_url}) center/cover` : '#f4f6fa', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px' }}>
                                {!b.image_url && 'No Image'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '8px', lineHeight: '1.4' }}>
                                    {b.tags && b.tags.length > 0 && <span style={{ color: '#508bf5', marginRight: '5px' }}>[{b.tags[0]}]</span>} 
                                    {b.title}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.5', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: b.content.substring(0, 100) }}></p>
                                <div style={{ fontSize: '12px', color: '#999', display: 'flex', gap: '15px' }}>
                                    <span>{new Date(b.created_at).toLocaleDateString()}</span>
                                    <span>조회 {b.view_count || 0}</span>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>등록된 자료가 없습니다.</div>
                    )}

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div style={{ display:'flex', justifyContent:'center', gap:'10px', marginTop:'40px' }}>
                            {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                                <Link key={p} href={`/board?page=${p}${category ? '&category='+category : ''}`} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border: p === currentPage ? '1px solid #1a4282' : '1px solid #ddd', background: p === currentPage ? '#1a4282' : '#fff', color: p === currentPage ? '#fff' : '#555', borderRadius:'4px', fontWeight:'bold' }}>
                                    {p}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* 사이드바 */}
                <div style={{ width: '320px', flexShrink: 0 }}>
                    <div style={{ width: '100%', height: '200px', background: '#e2e2e2', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#888', marginBottom: '40px' }}>
                        광고 배너 영역
                    </div>
                </div>
            </div>
        </main>
    );
}
"""

with open(os.path.join(board_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(board_page_js)

# 2. 자료실 상세 페이지 (/board/[id]/page.js)
board_read_dir = os.path.join(board_dir, "[id]")
os.makedirs(board_read_dir, exist_ok=True)

board_read_page_js = """import { createClient } from '@supabase/supabase-js'

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
"""

with open(os.path.join(board_read_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(board_read_page_js)

print("Board generation complete.")
