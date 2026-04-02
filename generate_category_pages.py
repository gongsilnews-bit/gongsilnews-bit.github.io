import re

GNB_HTML = """<nav class="gnb-new">
                    <a href="news_all.html">전체뉴스</a>
                    <a href="news.html">우리동네뉴스</a>
                    <a href="news_finance.html">부동산·주식·재테크</a>
                    <a href="news_politics.html">정치·경제·사회</a>
                    <a href="news_law.html">세무·법률</a>
                    <a href="news_life.html">여행·건강·생활</a>
                    <a href="news_etc.html">기타</a>
                    <span class="divider"></span>
                    <a href="gongsil/index.html">공실열람</a>
                    <div style="position: relative; display: inline-block;" onmouseover="this.querySelector('.gnb-dropdown').style.display='block'" onmouseout="this.querySelector('.gnb-dropdown').style.display='none'">
                        <a href="board.html" style="padding: 10px 0; transition: color 0.2s;" onmouseover="this.style.color='#1e56a0'" onmouseout="this.style.color=''">자료실</a>
                        <div class="gnb-dropdown" style="display: none; position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: 140px; background: #fff; border: 1px solid #333; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999; border-radius: 4px; overflow: hidden; padding: 0;">
                            <ul style="list-style: none; margin: 0; padding: 0; text-align: center;">
                                <li style="border-bottom: 1px solid #eee;"><a href="board.html?cat=drone" style="display: block; padding: 12px 0; font-size: 14px; color: #222; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f4f6fa'; this.style.color='#1e56a0'; this.style.fontWeight='bold'" onmouseout="this.style.background='#fff'; this.style.color='#222'; this.style.fontWeight='normal'">드론영상</a></li>
                                <li style="border-bottom: 1px solid #eee;"><a href="board.html?cat=app" style="display: block; padding: 12px 0; font-size: 14px; color: #222; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f4f6fa'; this.style.color='#1e56a0'; this.style.fontWeight='bold'" onmouseout="this.style.background='#fff'; this.style.color='#222'; this.style.fontWeight='normal'">APP(앱)</a></li>
                                <li style="border-bottom: 1px solid #eee;"><a href="board.html?cat=design" style="display: block; padding: 12px 0; font-size: 14px; color: #222; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f4f6fa'; this.style.color='#1e56a0'; this.style.fontWeight='bold'" onmouseout="this.style.background='#fff'; this.style.color='#222'; this.style.fontWeight='normal'">디자인</a></li>
                                <li style="border-bottom: 1px solid #eee;"><a href="board.html?cat=sound" style="display: block; padding: 12px 0; font-size: 14px; color: #222; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f4f6fa'; this.style.color='#1e56a0'; this.style.fontWeight='bold'" onmouseout="this.style.background='#fff'; this.style.color='#222'; this.style.fontWeight='normal'">음원</a></li>
                                <li><a href="board.html?cat=form" style="display: block; padding: 12px 0; font-size: 14px; color: #222; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f4f6fa'; this.style.color='#1e56a0'; this.style.fontWeight='bold'" onmouseout="this.style.background='#fff'; this.style.color='#222'; this.style.fontWeight='normal'">계약서/양식</a></li>
                            </ul>
                        </div>
                    </div>
                    <a href="index.html#special-lecture" onclick="if(window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/gongsilnews-bit.github.io/')) { const target = document.getElementById('special-lecture'); if(target){ target.scrollIntoView({behavior: 'smooth'}); history.pushState(null, null, '#special-lecture'); return false; } }">부동산특강</a>
                    <a href="#">중개업소무료가입</a>
                </nav>"""

def update_gnb(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find <nav class="gnb-new"> ... </nav>
    pattern = r'<nav class="gnb-new">.*?</nav>'
    updated = re.sub(pattern, GNB_HTML, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(updated)
    print(f"Updated GNB in {filepath}")

update_gnb('index.html')
update_gnb('news.html')
update_gnb('news_all.html')

# Now read news_all.html to use as template
with open('news_all.html', 'r', encoding='utf-8') as f:
    template = f.read()

categories = {
    'news_finance.html': '부동산·주식·재테크',
    'news_politics.html': '정치·경제·사회',
    'news_law.html': '세무·법률',
    'news_life.html': '여행·건강·생활',
    'news_etc.html': '기타'
}

for filename, cat in categories.items():
    # Replace the header title
    out = template.replace('전체뉴스\n                </div>', f'{cat}\n                </div>')
    
    # Replace active tab script
    out = out.replace("a.innerText === '전체뉴스'", f"a.innerText === '{cat}'")
    
    # Replace data fetching logic
    # In loadAllNewsData
    out = out.replace(".select('*', { count: 'exact', head: true }).eq('status', 'published');",
                      f".select('*', {{ count: 'exact', head: true }}).eq('status', 'published').eq('section1', '{cat}');")
    
    # In fetchPageData
    out = out.replace(".eq('status', 'published')\n            .order('created_at'",
                      f".eq('status', 'published')\n            .eq('section1', '{cat}')\n            .order('created_at'")
                      
    # In loadPopularSidebarNews
    out = out.replace(".select('id, title, view_count')\n            .eq('status', 'published')\n            .order('view_count'",
                      f".select('id, title, view_count')\n            .eq('status', 'published')\n            .eq('section1', '{cat}')\n            .order('view_count'")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(out)
    print(f"Generated {filename}")

print("All done!")
