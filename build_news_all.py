import sys

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Split before <main class="container...
split_idx = html.find('<main class="container')
header_html = html[:split_idx]

content = header_html + """
    <style>
        .news-layout {
            display: flex;
            gap: 40px;
            margin-top: 30px;
            margin-bottom: 60px;
        }
        /* Left: List */
        .news-list-area {
            flex: 1;
        }
        .list-header {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 20px;
            color: var(--brand-navy);
            border-bottom: 2px solid #222;
            padding-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .an-card {
            display: flex;
            gap: 20px;
            border-bottom: 1px solid #eee;
            padding: 24px 0;
            align-items: center;
        }
        .an-img {
            width: 160px;
            height: 100px;
            border-radius: 6px;
            object-fit: cover;
            background: #f4f6fa;
            flex-shrink: 0;
        }
        .an-body {
            flex: 1;
        }
        .an-title {
            font-size: 18px;
            font-weight: 700;
            color: #111;
            margin-bottom: 8px;
            line-height: 1.4;
            cursor: pointer;
        }
        .an-title:hover {
            color: var(--brand-blue);
            text-decoration: underline;
        }
        .an-desc {
            font-size: 14px;
            color: #555;
            line-height: 1.5;
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .an-meta {
            font-size: 13px;
            color: #999;
        }
        
        /* Pagination */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 40px;
            gap: 10px;
        }
        .page-btn {
            border: 1px solid #ddd;
            background: #fff;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 14px;
            color: #555;
            cursor: pointer;
        }
        .page-btn:hover { background: #f9f9f9; }
        .page-info { font-size: 14px; color: #333; font-weight: bold; margin: 0 10px;}
        
        /* Right: Sidebar */
        .news-sidebar {
            width: 320px;
            flex-shrink: 0;
        }
        .sb-banner {
            width: 100%;
            height: 200px;
            background: #e2e2e2;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: #888;
            margin-bottom: 40px;
        }
        .sb-widget {
            margin-bottom: 40px;
        }
        .sb-title {
            font-size: 16px;
            font-weight: 800;
            color: #111;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #111;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .sb-title-more {
            font-size: 12px;
            color: #888;
            font-weight: 400;
            cursor: pointer;
        }
        
        /* Popular List */
        .pop-list { list-style: none; margin: 0; padding: 0; }
        .pop-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; cursor:pointer;}
        .pop-item:hover .pop-title { text-decoration: underline; color: var(--brand-blue); }
        .pop-ranking { font-size: 18px; font-weight: 900; color: #111; width: 14px; font-style: italic;}
        .pop-title { font-size: 14px; color: #333; line-height: 1.4; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        /* Prop List */
        .prop-item { display: flex; gap: 15px; margin-bottom: 20px; cursor: pointer; padding-bottom: 15px; border-bottom: 1px solid #f2f2f2;}
        .prop-item:hover .prop-title { text-decoration: underline; color: var(--brand-blue); }
        .prop-info { flex: 1; }
        .prop-title { font-size: 13px; font-weight: bold; color: #111; margin-bottom: 4px; line-height: 1.3;}
        .prop-price { font-size: 14px; font-weight: 900; color: #1a73e8; margin-bottom: 4px;}
        .prop-meta { font-size: 11px; color: #777; line-height: 1.4;}
        .prop-img-wrapper { width: 80px; height: 80px; flex-shrink: 0; border-radius: 6px; overflow: hidden; background: #eee;}
        .prop-img { width: 100%; height: 100%; object-fit: cover; }
        .prop-badge { font-size: 10px; color:#e74c3c; border:1px solid #e74c3c; border-radius:3px; padding:1px 4px; display:inline-block; margin-top:4px;}

    </style>

    <main class="container px-20 relative">
        <div class="news-layout">
            <!-- 좌측 뉴스 리스트 (전체뉴스) -->
            <div class="news-list-area">
                <div class="list-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    전체뉴스
                </div>
                
                <div id="allNewsContainer">
                    <div style="padding: 50px 0; text-align: center; color: #888;">
                        <svg class="animate-spin" style="animation: spin 1s linear infinite; margin: 0 auto 10px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                        뉴스를 불러오는 중입니다...
                    </div>
                </div>
                
                <div class="pagination">
                    <button class="page-btn" id="btnPrevPage" onclick="changePage(-1)">&lt; 이전</button>
                    <span class="page-info"><span id="currentPageDisplay">1</span> / <span id="totalPagesDisplay">-</span></span>
                    <button class="page-btn" id="btnNextPage" onclick="changePage(1)">다음 &gt;</button>
                </div>
            </div>
            
            <!-- 우측 사이드바 -->
            <div class="news-sidebar">
                <!-- 배너 영역 -->
                <div class="sb-banner">
                    배너 1
                </div>
                
                <!-- 많이 본 뉴스 5개 -->
                <div class="sb-widget">
                    <div class="sb-title">많이 본 뉴스</div>
                    <ul class="pop-list" id="popularNewsSidebarContainer">
                        <!-- 동적 렌더링 -->
                    </ul>
                </div>
                
                <!-- 추천공실 매물리스트 -->
                <div class="sb-widget">
                    <div class="sb-title">
                        추천 공실
                        <span class="sb-title-more" onclick="window.location.href='gongsil/index.html'">더보기 &gt;</span>
                    </div>
                    <div id="recommendPropSidebarContainer">
                        <!-- 동적 렌더링 -->
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Supabase 등 공통 스크립트 로드 -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="supabase_gongsi_config.js"></script>
    <script src="supabase_auth.js"></script>
    
    <script>
    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let totalItems = 0;
    let allNewsDataCache = []; // 캐시 보관용
    
    document.addEventListener('DOMContentLoaded', async () => {
        // 메인 GNB의 '전체뉴스' 링크 활성화 스타일 (선택사항)
        const menuLinks = document.querySelectorAll('.gnb-new a');
        menuLinks.forEach(a => {
            if(a.innerText === '전체뉴스') {
                a.style.color = '#1e56a0';
                a.style.fontWeight = '800';
            }
        });
        
        await loadAllNewsData();
        await loadPopularSidebarNews();
        await loadRecommendSidebarProps();
    });
    
    // 1. 전체뉴스 리스트 로드 (페이지네이션)
    async function loadAllNewsData() {
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;
        
        // Count query
        const { count, error: countErr } = await sb.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published');
        if(!countErr) totalItems = count || 0;
        
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
        document.getElementById('totalPagesDisplay').innerText = totalPages;
        
        fetchPageData();
    }
    
    async function fetchPageData() {
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;
        
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIdx = startIdx + ITEMS_PER_PAGE - 1;
        
        const container = document.getElementById('allNewsContainer');
        container.innerHTML = '<div style="padding: 20px;text-align:center;color:#666;">로딩중...</div>';
        
        const { data, error } = await sb.from('articles')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(startIdx, endIdx);
            
        if(error || !data) {
            container.innerHTML = '<div style="padding: 20px; text-align:center;">데이터를 불러올 수 없습니다.</div>';
            return;
        }
        
        container.innerHTML = '';
        data.forEach(news => {
            const dateStr = new Date(news.created_at).toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
            
            const card = document.createElement('div');
            card.className = 'an-card';
            
            const imgHtml = news.image_url ? `<img src="${news.image_url}" class="an-img" onerror="this.src='https://via.placeholder.com/160x100?text=News'">` : `<div class="an-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:12px;">NO IMAGE</div>`;
            
            // 상세 이동 시, news.html?article_id=X 활용 (혹은 별도 detail URL 있다면 구조 변경)
            const detailUrl = `news.html?article_id=${news.id}`; 
            
            const categoryBadge = news.section1 ? `[${news.section1}${news.section2 ? ' > '+news.section2 : ''}]` : '';
            
            card.innerHTML = `
                ${imgHtml}
                <div class="an-body">
                    <div class="an-title" onclick="window.location.href='${detailUrl}'">${news.title}</div>
                    <div class="an-desc">${news.subtitle || news.content?.replace(/<[^>]+>/g, '').substring(0, 150) || ''}</div>
                    <div class="an-meta"><span style="color:#1e56a0; font-weight:bold; margin-right:8px;">${categoryBadge}</span> ${dateStr} · ${news.reporter_name || '공실뉴스'}</div>
                </div>
            `;
            container.appendChild(card);
        });
        
        document.getElementById('currentPageDisplay').innerText = currentPage;
        
        // 버튼 활성화 처리
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
        document.getElementById('btnPrevPage').disabled = (currentPage <= 1);
        document.getElementById('btnNextPage').disabled = (currentPage >= totalPages);
    }
    
    function changePage(delta) {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
        let newPage = currentPage + delta;
        if(newPage < 1) newPage = 1;
        if(newPage > totalPages) newPage = totalPages;
        
        if(newPage !== currentPage) {
            currentPage = newPage;
            fetchPageData();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // 2. 우측 사이드바: 많이 본 뉴스 (Top 5)
    async function loadPopularSidebarNews() {
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;
        
        const { data, error } = await sb.from('articles')
            .select('id, title, view_count')
            .eq('status', 'published')
            .order('view_count', { ascending: false })
            .limit(5);
            
        const c = document.getElementById('popularNewsSidebarContainer');
        if(error || !data) return;
        
        c.innerHTML = data.map((item, i) => `
            <li class="pop-item" onclick="window.location.href='news.html?article_id=${item.id}'">
                <span class="pop-ranking">${i+1}</span>
                <span class="pop-title">${item.title}</span>
            </li>
        `).join('');
    }
    
    // 3. 우측 사이드바: 추천공실 매물리스트
    //    매물 클릭 시 공실열람으로 이동
    async function loadRecommendSidebarProps() {
        // 임시 샘플 표출 (실제 DB 연결할 경우 maps_apart 테이블 등에서 추출)
        const container = document.getElementById('recommendPropSidebarContainer');
        const cdnBase = 'https://raw.githubusercontent.com/gongsilnews-bit/gongsilnews-bit.github.io/main';
        
        const sampleProps = [
            { title: "서초대로오피스텔 101동 101호", price: "매매 10억", meta: "서초동 · 면적 84㎡(25.4평)<br>동 3개, 욕실 2개, 엘리베이터, 주차가능", badge: "공동중개", img: cdnBase + "/images/dummy1.jpg" },
            { title: "강남대로빌딩 301호", price: "월세 1억/500", meta: "역삼동 · 면적 150㎡(45평)<br>사무실용도, 접근성 우수", badge: "수수료조율", img: cdnBase + "/images/dummy2.jpg" },
            { title: "논현빌라 201동 101호", price: "전세 5억", meta: "논현동 · 면적 59㎡(18평)<br>신축투룸, 풀옵션", badge: "추천", img: cdnBase + "/images/dummy3.jpg" },
            { title: "목동신시가지 7단지 701동", price: "매매 15억", meta: "목동 · 면적 134㎡(40평)<br>대형평수, 학군우수", badge: "급매", img: cdnBase + "/images/dummy4.jpg" }
        ];
        
        container.innerHTML = sampleProps.map(item => `
            <div class="prop-item" onclick="window.location.href='gongsil/index.html'">
                <div class="prop-info">
                    <div class="prop-title">${item.title}</div>
                    <div class="prop-price">${item.price}</div>
                    <div class="prop-meta">${item.meta}</div>
                    <span class="prop-badge">${item.badge}</span>
                </div>
                <div class="prop-img-wrapper">
                    <img src="${item.img}" class="prop-img" onerror="this.src='https://via.placeholder.com/80?text=NoImg'">
                </div>
            </div>
        `).join('');
    }
    
    </script>
</body>
</html>
"""

with open("news_all.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Created news_all.html successfully.")
