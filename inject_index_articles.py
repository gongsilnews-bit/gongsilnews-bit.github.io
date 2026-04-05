import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add IDs and empty the placeholders for each section
# 부동산·주식·재테크
html = re.sub(
    r'(<h2 class="sec-title">부동산·주식·재테크</h2>\s*</div>\s*<div class="hot-issue-wrap">\s*<div class="hi-left">\s*<div class="hi-list">)(.*?)(</div>\s*</div>\s*<div class="hi-right">)',
    r'\1\n<!-- Loaded dynamically -->\n\3',
    html, flags=re.DOTALL
)
html = html.replace('<div class="hi-list">\n<!-- Loaded dynamically -->', '<div class="hi-list" id="home-news-finance">')

# 정치·경제·사회
html = re.sub(
    r'(<h2 class="sec-title">정치·경제·사회</h2>\s*</div>\s*<div class="hot-issue-wrap">\s*<div class="hi-left">\s*<div class="hi-list">)(.*?)(</div>\s*</div>\s*<div class="hi-right">)',
    r'\1\n<!-- Loaded dynamically -->\n\3',
    html, flags=re.DOTALL
)
html = html.replace('<div class="hi-list">\n<!-- Loaded dynamically -->', '<div class="hi-list" id="home-news-politics">')

# 세무·법률
html = re.sub(
    r'(<h2 class="sec-title">세무·법률</h2>\s*</div>\s*<div class="hi-list">)(.*?)(</div>\s*</div>\s*<div class="hi-left" style="flex: 1;">)',
    r'\1\n<!-- Loaded dynamically -->\n\3',
    html, flags=re.DOTALL
)
html = html.replace('<div class="hi-list">\n<!-- Loaded dynamically -->', '<div class="hi-list" id="home-news-law">')

# 여행·건강·생활
html = re.sub(
    r'(<h2 class="sec-title">여행·건강·생활</h2>\s*</div>\s*<div class="hi-list">)(.*?)(</div>\s*</div>\s*</div>\s*</div>)',
    r'\1\n<!-- Loaded dynamically -->\n\3',
    html, flags=re.DOTALL
)
html = html.replace('<div class="hi-list">\n<!-- Loaded dynamically -->', '<div class="hi-list" id="home-news-life">')

# 기타
html = re.sub(
    r'(<h2 class="sec-title">기타</h2>\s*</div>\s*<div class="hi-list">)(.*?)(</div>\s*</div>\s*<div class="hi-right" style="position:relative; margin-top:52px;">)',
    r'\1\n<!-- Loaded dynamically -->\n\3',
    html, flags=re.DOTALL
)
html = html.replace('<div class="hi-list">\n<!-- Loaded dynamically -->', '<div class="hi-list" id="home-news-etc">')


# 2. Add the script to fetch and render
script_code = """
    <!-- Index News Fetch Script -->
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            const NEWS_URL = 'https://imtdijfseaninhvjoklp.supabase.co';
            const NEWS_KEY = 'sb_publishable_fY0K_-WP3PyG5ihvxgCPSw_bYewHmnR';
            if(!window.supabase) return;
            const newsDb = window.supabase.createClient(NEWS_URL, NEWS_KEY);
            
            async function fetchAndRenderNews(targetId, sec1, sec2Array, limit=2) {
                const target = document.getElementById(targetId);
                if(!target) return;
                
                let query = newsDb.from('articles').select('id, title, subtitle, content, thumbnail, created_at, status')
                                  .eq('status', 'published')
                                  .eq('section1', sec1);
                
                if (sec2Array && sec2Array.length > 0) {
                    const inStr = sec2Array.map(c => `"${c}"`).join(',');
                    query = query.in('section2', sec2Array);
                }
                
                query = query.order('created_at', {ascending: false}).limit(limit);
                
                const {data, error} = await query;
                if(error) {
                    console.error('Error fetching '+targetId, error);
                    target.innerHTML = '<div style="padding:20px;color:#999;font-size:14px;">데이터를 불러오지 못했습니다.</div>';
                    return;
                }
                
                if(!data || data.length === 0) {
                    target.innerHTML = '<div style="padding:20px;color:#999;font-size:14px;">최근 등록된 기사가 없습니다.</div>';
                    return;
                }
                
                let html = '';
                data.forEach(item => {
                    const timeStr = item.created_at ? item.created_at.substring(0, 10).replace(/-/g, '.') : '';
                    let desc = item.subtitle;
                    if(!desc && item.content) {
                        desc = item.content.replace(/<[^>]+>/g, '').substring(0, 100);
                    }
                    if(!desc) desc = '';
                    
                    let imgHtml = '';
                    if(item.thumbnail) {
                        imgHtml = `<div class="hi-img"><img src="${item.thumbnail}" alt="" onerror="this.src=\'https://via.placeholder.com/140x100\'"></div>`;
                    } else {
                        imgHtml = `<div class="hi-img"><img src="default_article.png" alt="" onerror="this.src=\'https://via.placeholder.com/140x100?text=No+Image\'"></div>`;
                    }
                    
                    html += `
                        <div class="hi-item" style="cursor:pointer;" onclick="window.location.href='news_read.html?id=${item.id}'">
                            ${imgHtml}
                            <div class="hi-txt">
                                <h3>${item.title || '제목없음'}</h3>
                                <p style="display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${desc}</p>
                                <div style="font-size:12px; color:#999; margin-top:8px;">${timeStr}</div>
                            </div>
                        </div>
                    `;
                });
                target.innerHTML = html;
            }

            // 1. 부동산 주식 재테크
            fetchAndRenderNews('home-news-finance', '뉴스/칼럼', ['부동산·주식·재테크']);
            // 2. 정치 경제 사회
            fetchAndRenderNews('home-news-politics', '뉴스/칼럼', ['정치·경제·사회']);
            // 3. 세무 법률
            fetchAndRenderNews('home-news-law', '뉴스/칼럼', ['세무·법률']);
            // 4. 여행 건강 생활 (여행·맛집 + 건강·헬스)
            fetchAndRenderNews('home-news-life', '뉴스/칼럼', ['여행·맛집', '건강·헬스']);
            // 5. 기타 (IT·가전·가구 + 스포츠·연예·Car + 인물·미션·기타)
            fetchAndRenderNews('home-news-etc', '뉴스/칼럼', ['IT·가전·가구', '스포츠·연예·Car', '인물·미션·기타']);
        });
    </script>
</body>"""

html = html.replace('</body>', script_code)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html correctly.")
