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
                    <a href="#">자료실</a>
                    <a href="#">부동산특강</a>
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
