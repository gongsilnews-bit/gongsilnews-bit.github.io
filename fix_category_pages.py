import re

def update_gnb(filepath):
    pass # Skip GNB update as it's already there

# Read news_all.html to use as template
with open('news_all.html', 'r', encoding='utf-8') as f:
    template = f.read()

categories = {
    'news_finance.html': { 'title': '부동산·주식·재테크', 'condition': ".eq('section1', '뉴스/칼럼').eq('section2', '부동산·주식·재테크')" },
    'news_politics.html': { 'title': '정치·경제·사회', 'condition': ".eq('section1', '뉴스/칼럼').eq('section2', '정치·경제·사회')" },
    'news_law.html': { 'title': '세무·법률', 'condition': ".eq('section1', '뉴스/칼럼').eq('section2', '세무·법률')" },
    'news_life.html': { 'title': '여행·건강·생활', 'condition': ".eq('section1', '뉴스/칼럼').in('section2', ['여행·맛집', '건강·헬스'])" },
    'news_etc.html': { 'title': '기타', 'condition': ".eq('section1', '뉴스/칼럼').in('section2', ['IT·가전·가구', '스포츠·연예·Car', '인물·미션·기타'])" }
}

for filename, cat_info in categories.items():
    cat = cat_info['title']
    cond = cat_info['condition']
    
    # Replace the header title
    out = template.replace('전체뉴스\n                </div>', f'{cat}\n                </div>')
    
    # Replace active tab script
    out = out.replace("a.innerText === '전체뉴스'", f"a.innerText === '{cat}'")
    
    # Replace data fetching logic
    # In loadAllNewsData
    out = out.replace(".select('*', { count: 'exact', head: true }).eq('status', 'published');",
                      f".select('*', {{ count: 'exact', head: true }}).eq('status', 'published'){cond};")
    
    # In fetchPageData
    out = out.replace(".eq('status', 'published')\n            .order('created_at'",
                      f".eq('status', 'published')\n            {cond}\n            .order('created_at'")
                      
    # In loadPopularSidebarNews
    out = out.replace(".select('id, title, view_count')\n            .eq('status', 'published')\n            .order('view_count'",
                      f".select('id, title, view_count')\n            .eq('status', 'published')\n            {cond}\n            .order('view_count'")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(out)
    print(f"Generated {filename}")

print("All done!")
