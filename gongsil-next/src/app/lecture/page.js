import { createClient } from '@supabase/supabase-js'
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
