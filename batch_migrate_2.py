import os

app_dir = "c:/Users/user/Desktop/test/gongsil-next/src/app"

# 1. 공통 카테고리 (뉴스, 전체뉴스, 주식, 정치 등) 페이지
category_dir = os.path.join(app_dir, "[category]")
os.makedirs(category_dir, exist_ok=True)

category_page_js = """import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const revalidate = 60; // ISR 60초 캐싱

const categoryMap = {
    'news-all': '전체뉴스',
    'news': '우리동네뉴스',
    'finance': '부동산·주식·재테크',
    'politics': '정치·경제·사회',
    'law': '세무·법률',
    'life': '여행·건강·생활',
    'etc': '기타'
};

export default async function CategoryPage({ params, searchParams }) {
    let { category } = await params;
    const sectionName = categoryMap[category];
    
    if (!sectionName) {
        return <div className="container px-20 py-60 text-center">존재하지 않는 카테고리입니다.</div>;
    }

    const { page } = await searchParams || {};
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = 12;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    let query = supabase.from('articles').select('id, title, content, created_at, section1, view_count, image_url', { count: 'exact' }).eq('status', 'published');
    
    if (category !== 'news-all') {
        query = query.eq('section1', sectionName);
    }
    
    const { data: articles, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    function getThumbnail(content, image_url) {
        if (image_url) return image_url;
        if (!content) return null;
        const ytMatch = content.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
        if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
        const imgMatch = content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
        if (imgMatch) return imgMatch[1];
        return null;
    }

    return (
        <main className="container px-20 mt-50 mb-50" style={{ minHeight:'600px' }}>
            <div className="sec-title-wrap" style={{ borderBottom:'2px solid #111', paddingBottom:'15px', marginBottom:'30px' }}>
                <h2 className="sec-title" style={{ fontSize:'24px', margin:0 }}>{sectionName}</h2>
                <span style={{ marginLeft:'15px', color:'#777', fontSize:'14px' }}>총 {count || 0}개의 기사가 있습니다.</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'24px' }}>
                {articles?.map(article => {
                    const thumb = getThumbnail(article.content, article.image_url);
                    return (
                        <Link href={`/article/${article.id}`} key={article.id} style={{ border:'1px solid #eee', borderRadius:'8px', overflow:'hidden', display:'block', transition:'transform 0.2s, boxShadow 0.2s' }} className="hover:shadow-lg hover:-translate-y-1">
                            {thumb ? (
                                <div style={{ height:'160px', background:`url(${thumb}) center/cover` }}></div>
                            ) : (
                                <div style={{ height:'160px', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa' }}>No Image</div>
                            )}
                            <div style={{ padding:'16px' }}>
                                <div style={{ fontSize:'12px', color:'#508bf5', fontWeight:'bold', marginBottom:'8px' }}>{article.section1}</div>
                                <h3 style={{ fontSize:'16px', fontWeight:'700', color:'#111', lineHeight:'1.4', marginBottom:'8px', height:'44px', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                                    {article.title}
                                </h3>
                                <div style={{ fontSize:'12px', color:'#999', display:'flex', justifyContent:'space-between' }}>
                                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                    <span>조회 {article.view_count || 0}</span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
                <div style={{ display:'flex', justifyContent:'center', gap:'10px', marginTop:'50px' }}>
                    {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                        <Link key={p} href={`/${category}?page=${p}`} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border: p === currentPage ? '1px solid #1a4282' : '1px solid #ddd', background: p === currentPage ? '#1a4282' : '#fff', color: p === currentPage ? '#fff' : '#555', borderRadius:'4px', fontWeight:'bold' }}>
                            {p}
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
"""
with open(os.path.join(category_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(category_page_js)

# 2. 부동산 특강(Study) 페이지 만들기
study_dir = os.path.join(app_dir, "lecture")
os.makedirs(study_dir, exist_ok=True)

study_page_js = """import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const revalidate = 60; // ISR

export default async function StudyPage() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <main className="container px-20 mt-50 mb-50" style={{ minHeight:'600px' }}>
            <div className="sec-title-wrap" style={{ borderBottom:'2px solid #111', paddingBottom:'15px', marginBottom:'30px' }}>
                <h2 className="sec-title" style={{ fontSize:'24px', margin:0 }}>부동산 특강</h2>
            </div>
            
            <div className="lecture-grid">
                {courses?.map(course => (
                    <Link href={`/lecture/${course.id}`} key={course.id} className="lecture-card">
                        <div className="lecture-thumb">
                            {course.thumbnail_url ? 
                                <img src={course.thumbnail_url} alt={course.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                : <div style={{width:'100%', height:'100%', background:'#ddd', display:'flex', alignItems:'center', justifyContent:'center', color:'#999'}}>No Image</div>
                            }
                            <span className="badge-new">{course.category || '특강'}</span>
                        </div>
                        <div className="lecture-info">
                            <h3 className="lecture-title">{course.title}</h3>
                            <div className="lecture-meta">
                                <span className="instructor">👤 {course.instructor_name || '전문강사'}</span>
                            </div>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #eee', paddingTop:'12px', marginTop:'12px' }}>
                                <span style={{ fontSize:'16px', fontWeight:'900', color:'#e53e3e' }}>
                                    {course.price === 0 ? '무료' : `${course.price.toLocaleString()}원`}
                                </span>
                                <span style={{ fontSize:'12px', color:'#fff', background:'#1a4282', padding:'4px 10px', borderRadius:'20px', fontWeight:'bold' }}>
                                    수강신청
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
"""
with open(os.path.join(study_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(study_page_js)

print("Batch migrate 2 complete.")
