import os

# Create .env.local
env_content = """NEXT_PUBLIC_SUPABASE_URL=https://kjrjrjnsiynrcelzepju.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj
"""
with open("c:/Users/user/Desktop/test/gongsil-next/.env.local", "w", encoding="utf-8") as f:
    f.write(env_content)

# Overwrite page.js with SSR rendering for articles
page_js = """import { createClient } from '@supabase/supabase-js'
import Link from 'next/link';

export const revalidate = 60; // 60초마다 서버에서 몰래 백그라운드 최신화 (ISR 캐싱)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function Home() {
  // SSR: 서버 측에서 브라우저가 화면을 그리기 전에 즉각 데이터베이스를 조회!
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, subtitle, content, created_at, section1')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b pb-4 mb-8">
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">공실뉴스 <span className="text-xl text-gray-500 font-normal">Next.js SSR Version ⚡</span></h1>
          <p className="mt-2 text-gray-600">이 페이지는 깜빡임 대기시간 없이 0초 만에 렌더링 됩니다.</p>
        </header>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">최신 기사 (서버 사이드 렌더링)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.map(article => {
                // 썸네일 추출 로직 (서버에서 구워서 내려보냄)
                let thumbUrl = null;
                if (article.content) {
                    const ytMatch = article.content.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
                    if (ytMatch) {
                        thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
                    } else {
                        const imgMatch = article.content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                        if (imgMatch) thumbUrl = imgMatch[1];
                    }
                }
                
                return (
                  <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                    <div className="h-48 bg-gray-200 relative">
                        {thumbUrl ? (
                            <img src={thumbUrl} alt={article.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                            {article.section1}
                        </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {article.subtitle || article.content?.replace(/<[^>]+>/g, '').substring(0, 100)}
                      </p>
                      <div className="mt-4 text-xs text-gray-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
"""
with open("c:/Users/user/Desktop/test/gongsil-next/src/app/page.js", "w", encoding="utf-8") as f:
    f.write(page_js)

print("Setup completed")
