import re

html_path = 'c:/Users/user/Desktop/test/index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_style = '''<style>
    :root {
        --primary: #0f172a; /* Slate 900 */
        --brand: #f97316; /* Orange 500 */
        --bg-gray: #f8fafc; /* Slate 50 */
        --border: rgba(0, 0, 0, 0.05);
        --text-main: #0f172a;
        --text-sub: #64748b; /* Slate 500 */
        --card-shadow: 0 4px 15px rgba(0,0,0,0.03);
        --card-hover-shadow: 0 12px 30px rgba(0,0,0,0.08);
        --radius: 16px;
    }
    html, body {
        font-family: 'Pretendard', -apple-system, sans-serif;
        margin: 0; padding: 0;
        background-color: var(--bg-gray);
        color: var(--text-main);
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        min-height: 100vh !important;
        letter-spacing: -0.3px;
    }
    a { text-decoration: none; color: inherit; transition: color 0.2s; }
    ul, li { list-style: none; padding: 0; margin: 0; }
    
    /* Global Container */
    .container {
        width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        box-sizing: border-box;
    }

    /* Top Strip (Login/Links) */
    .top-strip {
        background: #ffffff;
        border-bottom: 1px solid var(--border);
        height: 48px;
        display: flex;
        align-items: center;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-sub);
    }
    .top-strip-inner {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 20px;
    }

    /* Main Header */
    .main-header {
        background: #ffffff;
        border-bottom: 1px solid var(--border);
        padding: 20px 0;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 1px 10px rgba(0,0,0,0.02);
    }
    .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .logo-area { display: flex; align-items: center; gap: 40px; }
    .logo-area img { height: 42px; transition: transform 0.2s; }
    .logo-area img:hover { transform: scale(1.02); }
    
    .main-nav {
        display: flex;
        gap: 35px;
        font-size: 18px;
        font-weight: 700;
    }
    .main-nav a { padding: 10px 0; border-bottom: 2px solid transparent; }
    .main-nav a:hover { color: var(--brand); border-bottom-color: var(--brand); }

    .header-search { display: flex; align-items: center; gap: 20px; }
    .btn-search {
        background: none; border: none; cursor: pointer; font-size: 20px; color: var(--text-main); padding: 8px; border-radius: 50%; transition: background 0.2s;
    }
    .btn-search:hover { background: #f1f5f9; }
    .btn-biz {
        background: var(--primary); color: #fff; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; transition: all 0.2s;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
    }
    .btn-biz:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(15, 23, 42, 0.3); }

    /* Layout Grids */
    .section-spacing { margin-top: 80px; margin-bottom: 80px; }
    
    /* Section 1: Top Headline & Map */
    .top-section {
        display: flex;
        gap: 30px;
        margin-top: 50px;
        height: 520px;
    }
    .top-left {
        flex: 2.2;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        overflow: hidden;
        position: relative;
        background: #fff;
        box-shadow: var(--card-shadow);
        transition: box-shadow 0.3s;
    }
    .top-left:hover { box-shadow: var(--card-hover-shadow); }
    .map-frame { width: 100%; height: 100%; border: none; background: #f8fafc; }
    
    .top-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 30px;
        background: #ffffff;
        box-shadow: var(--card-shadow);
        transition: box-shadow 0.3s;
    }
    .top-right:hover { box-shadow: var(--card-hover-shadow); }
    
    .top-right-title {
        font-size: 19px;
        font-weight: 800;
        margin-bottom: 25px;
        color: var(--primary);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .top-right-title::before { content: ''; width: 4px; height: 18px; background: var(--brand); border-radius: 2px; }
    .live-news-list { display: flex; flex-direction: column; gap: 20px; flex:1; overflow-y: auto; padding-right: 5px; }
    
    /* Custom Scrollbar */
    .live-news-list::-webkit-scrollbar { width: 5px; }
    .live-news-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; }
    
    .live-news-item {
        display: flex;
        gap: 16px;
        cursor: pointer;
        padding: 10px;
        border-radius: 12px;
        transition: all 0.2s;
    }
    .live-news-item:hover { background: #f8fafc; transform: translateX(5px); }
    .live-news-item:hover .lni-title { color: var(--brand); }
    .lni-img { width: 90px; height: 65px; flex-shrink: 0; background: #e2e8f0; border-radius: 8px; overflow: hidden; position: relative; }
    .lni-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .live-news-item:hover .lni-img img { transform: scale(1.1); }
    .lni-content { display: flex; flex-direction: column; justify-content: center; }
    .lni-title { font-size: 15px; font-weight: 700; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--primary); }
    .lni-date { font-size: 12px; color: var(--text-sub); margin-top: 6px; font-weight: 500; }

    /* Section Area Headers */
    .sec-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 30px;
    }
    .sec-title { font-size: 26px; font-weight: 800; margin: 0; color: var(--primary); letter-spacing: -0.5px; }
    .sec-more { font-size: 15px; color: var(--text-sub); font-weight: 600; padding: 6px 16px; border-radius: 20px; background: #f1f5f9; transition: all 0.2s; }
    .sec-more:hover { color: #fff; background: var(--primary); }

    /* Section 2: Hot Issues (Grid) */
    .hot-news-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 30px;
    }
    .hn-card { 
        display: flex; flex-direction: column; background: #fff; border-radius: var(--radius); padding: 16px;
        box-shadow: var(--card-shadow); border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hn-card:hover { transform: translateY(-8px); box-shadow: var(--card-hover-shadow); border-color: transparent; }
    .hn-card:hover .hn-title { color: var(--brand); }
    .hn-card:hover .hn-img img { transform: scale(1.08); }
    
    .hn-img { width: 100%; height: 180px; background: #e2e8f0; overflow: hidden; border-radius: 10px; margin-bottom: 20px; position: relative; }
    .hn-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .hn-tag { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; backdrop-filter: blur(4px); }
    
    .hn-title { font-size: 17px; font-weight: 700; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--primary); transition: color 0.2s; }
    .hn-meta { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-sub); padding-top: 12px; border-top: 1px solid #f1f5f9; }

    /* Section 3: Video News (Dark Immersive) */
    .video-section {
        background: #0f172a; /* Deep elegant navy */
        padding: 80px 0;
        margin: 80px 0;
    }
    .video-section .sec-title { color: #fff; }
    .video-section .sec-more { background: rgba(255,255,255,0.1); color: #cbd5e1; }
    .video-section .sec-more:hover { background: var(--brand); color: #fff; }
    
    .video-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
    }
    .vid-card { position: relative; cursor: pointer; border-radius: var(--radius); transition: transform 0.3s; }
    .vid-card:hover { transform: translateY(-10px); }
    .vid-thumb { width: 100%; height: 240px; background: #1e293b; border-radius: var(--radius); overflow: hidden; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .vid-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: all 0.4s ease; transform: scale(1.01); }
    .vid-card:hover .vid-thumb img { opacity: 1; transform: scale(1.05); }
    
    /* Play button with glassmorphism */
    .play-icon { position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); width: 64px; height: 64px; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.3); }
    .play-icon::after { content: ''; display: block; border-left: 18px solid #fff; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 6px; }
    .vid-card:hover .play-icon { background: var(--brand); border-color: var(--brand); transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }
    
    .vid-title { font-size: 18px; font-weight: 700; margin-top: 20px; line-height: 1.5; color: #f8fafc; }

    /* Section 4: Premium Property Listings */
    .prop-section { margin-bottom: 80px; }
    .prop-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
    .prop-card { background: #fff; border-radius: var(--radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border); transition: all 0.3s; cursor: pointer; }
    .prop-card:hover { transform: translateY(-8px); box-shadow: var(--card-hover-shadow); }
    .pc-img { height: 220px; background: #e2e8f0; position: relative; overflow: hidden; }
    .pc-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .prop-card:hover .pc-img img { transform: scale(1.08); }
    
    .pc-content { padding: 24px; }
    .pc-badge { display: inline-block; padding: 6px 12px; font-size: 12px; font-weight: 800; border-radius: 6px; margin-bottom: 15px; letter-spacing: 0.5px; }
    .pc-badge.apt { background: #eff6ff; color: #2563eb; }
    .pc-badge.biz { background: #fef3c7; color: #d97706; }
    .pc-badge.opi { background: #f1f5f9; color: #475569; }
    .pc-badge.vil { background: #dcfce7; color: #16a34a; }
    
    .pc-price { font-size: 22px; font-weight: 800; color: var(--primary); margin-bottom: 8px; letter-spacing: -0.5px; }
    .pc-title { font-size: 15px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 20px; font-weight: 500; }
    .pc-meta { display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 16px; font-weight: 600; }

    /* Section 5: Study & Notices Combined */
    .bottom-split {
        display: flex;
        gap: 50px;
        margin-bottom: 100px;
    }
    .bs-left { flex: 2; }
    .bs-right { flex: 1; }
    .study-list { display: flex; flex-direction: column; gap: 24px; }
    .study-item { display: flex; gap: 24px; border: 1px solid var(--border); padding: 20px; border-radius: var(--radius); background: #fff; box-shadow: var(--card-shadow); transition: all 0.3s; cursor: pointer; }
    .study-item:hover { box-shadow: var(--card-hover-shadow); transform: translateY(-4px); border-color: transparent; }
    .si-img { width: 160px; height: 110px; background: #e2e8f0; border-radius: 10px; overflow: hidden; flex-shrink: 0; position: relative; }
    .si-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
    .study-item:hover .si-img img { transform: scale(1.1); }
    
    .si-content { display: flex; flex-direction: column; justify-content: center; }
    .si-badge { font-size: 12px; color: var(--brand); font-weight: 800; margin-bottom: 8px; }
    .si-title { font-size: 19px; font-weight: 800; margin-bottom: 12px; line-height: 1.4; color: var(--primary); }
    .si-author { font-size: 14px; color: var(--text-sub); font-weight: 500; display: inline-flex; align-items: center; gap: 8px; }
    .si-author span { color: #eab308; } /* Star color */

    .notice-card { background: #fff; border-radius: var(--radius); padding: 30px; box-shadow: var(--card-shadow); border: 1px solid var(--border); }
    .notice-list { display: flex; flex-direction: column; }
    .notice-item { padding: 18px 0; border-bottom: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 8px; text-decoration: none; transition: all 0.2s; }
    .notice-item:last-child { border-bottom: none; padding-bottom: 0; }
    .notice-item:first-child { padding-top: 0; }
    .notice-item:hover { transform: translateX(5px); }
    .notice-item:hover .ni-title { color: var(--brand); }
    .ni-title { font-size: 15px; font-weight: 600; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ni-date { font-size: 13px; color: #94a3b8; font-weight: 500; }

    /* Footer Banner */
    .chat-banner { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); text-align: center; padding: 80px 0; border-top: 1px solid var(--border); position: relative; overflow: hidden; }
    .chat-banner h2 { margin-top:0; font-size:32px; font-weight:800; margin-bottom:15px; color: var(--primary); letter-spacing: -1px; }
    .chat-banner p { color: var(--text-sub); font-size: 18px; margin-bottom: 40px; font-weight: 500; }
    .chat-banner img { height: 320px; object-fit: contain; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.1)); transition: transform 0.5s; }
    .chat-banner:hover img { transform: translateY(-10px); }

    /* Footer */
    .g-footer { background: #fff; padding: 60px 0; font-size: 14px; color: var(--text-sub); border-top: 1px solid var(--border); line-height: 1.8; }
    .f-links { margin-bottom: 25px; display: flex; gap: 24px; font-weight: 700; color: var(--primary); }
</style>'''

html = re.sub(r'<style>.*?</style>', new_style, html, flags=re.DOTALL)

# Also fix the property badge classes since we styled them cleanly:
# Replace the static inline styles of badges with simply adding the classes apt, biz, opi, vil.
html = html.replace('<span class="pc-badge">아파트</span>', '<span class="pc-badge apt">아파트</span>')
html = html.replace('<span class="pc-badge" style="background:#fff3cd; color:#856404;">상가/사무실</span>', '<span class="pc-badge biz">상가/사무실</span>')
html = html.replace('<span class="pc-badge" style="background:#e2e3e5; color:#383d41;">오피스텔</span>', '<span class="pc-badge opi">오피스텔</span>')
html = html.replace('<span class="pc-badge" style="background:#d4edda; color:#155724;">빌라/투룸</span>', '<span class="pc-badge vil">빌라/투룸</span>')

# Wrap `.notice-list` inside `.notice-card` for styling
html = re.sub(r'(<div class="notice-list".*?>.*?</div>)', r'<div class="notice-card">\1</div>', html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
