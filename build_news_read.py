import sys

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

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
        
        /* Left: Read Area */
        .news-read-area {
            flex: 1;
        }
        
        .detail-breadcrumb { font-size: 14px; color: #1e56a0; margin-bottom: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .detail-title { font-size: 32px; font-weight: 800; color: #111; line-height: 1.35; margin-bottom: 25px; word-break: keep-all; letter-spacing: -1px; }
        .detail-meta { 
            display: flex; 
            justify-content: space-between;
            align-items: center;
            border-top: 2px solid #111; 
            border-bottom: 1px solid #eee; 
            padding: 16px 0; 
            margin-bottom: 40px; 
            font-size: 14px; 
            color: #666; 
        }
        .meta-info { display: flex; gap: 20px; }
        
        .article-body { font-size: 17px; line-height: 1.8; color: #333; font-family: 'Pretendard', sans-serif; }
        .article-body p { margin-bottom: 24px; }
        .article-body b { display: block; margin: 30px 0 20px; color: #111; font-size: 19px; font-weight: 700; background: #fdfdfd; padding: 15px; border-left: 4px solid #1e56a0; }
        .article-img-wrap { width: 100%; border-radius: 8px; overflow: hidden; margin: 30px 0; text-align: center; }
        .article-img { max-width: 100%; display: block; margin: 0 auto; object-fit: contain;}
        
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
        <div id="scrollIndicator" style="position:fixed; top:0; left:0; height:4px; background:#f97316; z-index:999999; width:0%; transition:width 0.1s;"></div>
        <div class="news-layout">
            <!-- 좌측 본문 영역 (1200px 레이아웃의 좌측 본문) -->
            <div class="news-read-area">
                <div class="detail-breadcrumb" id="detailCategory">로딩 중...</div>
                <h1 class="detail-title" id="detailTitle">기사를 불러오는 중입니다...</h1>
                
                <div class="detail-meta">
                    <div class="meta-info">
                        <span id="detailAuthor" style="color: #111; font-weight: bold;">공실뉴스</span>
                        <span style="display:inline-block; width:1px; height:12px; background:#ddd; margin:0 4px;"></span>
                        <span id="detailDate">입력 -</span>
                        <span style="display:inline-block; width:1px; height:12px; background:#ddd; margin:0 4px;"></span>
                        <span id="detailViews">조회수 0</span>
                    </div>
                    <div class="meta-stats" style="display: flex; gap: 16px; align-items: center;">
                        <span style="cursor:pointer; color:#888; transition:color 0.2s;" onmouseover="this.style.color='#ff9f1c'" onmouseout="this.style.color='#888'" title="공유하기" onclick="window.shareUrl()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></span>
                    </div>
                </div>
                
                <div class="article-body" id="detailBody">
                    <div style="padding: 100px 0; text-align: center; color:#888;">
                        <svg class="animate-spin" style="animation: spin 1s linear infinite; margin: 0 auto 10px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                        로딩 중...
                    </div>
                </div>
                
                <!-- 댓글 및 푸터 영역 -->
                <div id="articleFooterArea" style="margin-top: 40px; display: none;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #ccc; border-bottom:1px solid #ccc; padding:15px 0; margin-bottom:50px; font-size:15px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span id="footerReporter" style="font-weight:800; color:#111;">공실뉴스</span>
                        </div>
                        <div style="color:#888; font-size:13px;">
                            저작권자 © 공실뉴스 무단전재 및 재배포 금지
                        </div>
                    </div>

                    <div class="comments-section" style="margin-bottom: 60px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <div style="font-size:22px; font-weight:800;" id="portalCommentCount">0개의 댓글</div>
                            <div style="font-size:14px; color:#555; cursor:pointer;">내 댓글 〉</div>
                        </div>
                        
                        <div style="border:1px solid #ddd; border-radius:6px; padding:15px; margin-bottom:30px; background:#fff;">
                            <div style="font-weight:bold; margin-bottom:12px; color:#333; font-size:14px;" id="commentUserName">로그인이 필요합니다</div>
                            <textarea id="commentInput" placeholder="댓글을 남겨보세요" style="width:100%; height:44px; border:none; resize:none; font-family:inherit; font-size:15px; outline:none; background:transparent;"></textarea>
                            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #eee; padding-top:12px; margin-top:8px;">
                                <div style="font-size:13px; color:#999; display:flex; align-items:center; gap:16px;">
                                    <span><span style="font-weight:bold; color:#111;" id="commentLength">0</span> / 400</span>
                                    <label style="cursor:pointer; display:flex; align-items:center; gap:4px; color:#555;">
                                        <input type="checkbox" id="isSecretComment" style="accent-color:#ff9f1c;"> 비밀댓글
                                    </label>
                                </div>
                                <button style="background:#f59e0b; color:#fff; border:none; border-radius:4px; padding:8px 24px; font-weight:bold; cursor:pointer; font-size:14px;" onclick="window.submitReadComment()">등록</button>
                            </div>
                        </div>

                        <div id="portalCommentList">
                            <div style="padding:20px; text-align:center; color:#999; font-size:14px;">첫 댓글을 남겨보세요.</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center;">
                    <button onclick="window.history.back()" style="padding: 10px 40px; background: #f4f6fa; border: 1px solid #ddd; border-radius: 4px; font-weight: bold; cursor: pointer; color: #333; font-size: 15px;">목록으로 돌아가기</button>
                </div>
            </div>
            
            <!-- 우측 사이드바 -->
            <div class="news-sidebar">
                
                <div class="sb-widget">
                    <div style="font-weight:bold; font-size:15px; color:#ff9f1c; margin-bottom:10px;">HOT 매물/광고</div>
                    <div style="width:100%; height:140px; background:#e0e0e0; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#999;">공실가이드맵 (지도 이미지)</div>
                    <div style="background:#333; color:#fff; text-align:center; padding:8px; font-size:12px; margin-top:8px; border-radius:4px;">강남구 역삼동 신축 빌딩 (수익률 6%)</div>
                </div>

                <div class="sb-widget">
                    <div style="background:#00b894; color:#fff; text-align:center; padding:15px; border-radius:8px; margin-bottom:10px; font-weight:bold; font-size:14px; cursor:pointer;">
                        공실알림<br><span style="font-size:12px;font-weight:normal;">(관심도 1,000개 부동산 가입)</span>
                    </div>
                    <div style="background:#00cec9; color:#fff; text-align:center; padding:15px; border-radius:8px; margin-bottom:30px; font-weight:bold; font-size:14px; cursor:pointer;" onclick="window.location.href='gongsil/index.html'">
                        신축/분양/권리조회<br><span style="font-size:12px;font-weight:normal;">(부동산 전문가에게 의뢰)</span>
                    </div>
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
    document.addEventListener('DOMContentLoaded', async () => {
        await loadArticle();
        await loadPopularSidebarNews();
        await loadRecommendSidebarProps();
    });
    
    async function loadArticle() {
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;
        
        const params = new URLSearchParams(window.location.search);
        const articleId = params.get('article_id');
        
        if(!articleId) {
            document.getElementById('detailBody').innerHTML = '<div style="padding: 100px 0; text-align: center;">기사를 찾을 수 없습니다.</div>';
            return;
        }
        
        // 조회수 증가 및 기사 데이터 로딩
        await sb.rpc('increment_view_count', { article_id: articleId });
        const { data: news, error } = await sb.from('articles').select('*').eq('id', articleId).single();
        
        if(error || !news) {
            document.getElementById('detailBody').innerHTML = '<div style="padding: 100px 0; text-align: center;">기사를 불러오는 중 오류가 발생했습니다.</div>';
            return;
        }
        
        // 하이라이팅: 기사 카테고리 로직
        const categoryBadge = news.section1 ? `[${news.section1}${news.section2 ? ' > '+news.section2 : ''}]` : '전체뉴스';
        document.getElementById('detailCategory').innerText = categoryBadge;
        document.getElementById('detailTitle').innerText = news.title;
        const authorStr = news.reporter_name || '공실뉴스';
        document.getElementById('detailAuthor').innerText = authorStr;
        if(document.getElementById('footerReporter')) document.getElementById('footerReporter').innerText = authorStr;
        
        const dateStr = new Date(news.created_at).toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
        document.getElementById('detailDate').innerText = '입력 ' + dateStr;
        document.getElementById('detailViews').innerText = '조회수 ' + (news.view_count || 1);
        
        let contentHtml = '';
        if (news.image_url) {
            contentHtml += `<div class="article-img-wrap"><img src="${news.image_url}" class="article-img" alt="기사 이미지" onerror="this.src='https://via.placeholder.com/600x400?text=NoImage'"></div>`;
        }
        if (news.subtitle) {
            contentHtml += `<b style="margin-top:0;">${news.subtitle}</b>`;
        }
        
        if (news.content && news.content.includes('<p>')) {
             contentHtml += `${news.content}`;
        } else if (news.content) {
             const lines = news.content.split('\\n');
             lines.forEach(line => {
                 if(line.trim() !== '') contentHtml += `<p>${line}</p>`;
             });
        }
        document.getElementById('detailBody').innerHTML = contentHtml;
        document.getElementById('articleFooterArea').style.display = 'block';
        window.currentArticleId = articleId;
        window.loadReadComments(articleId);

        // GNB 네비게이션 활성화
        const menuLinks = document.querySelectorAll('.gnb-new a');
        let matched = false;
        if(news.section1) {
            menuLinks.forEach(a => {
                const text = a.innerText.trim();
                // "부동산·주식·재테크", "정치·경제·사회" 등과 매칭되는지 확인.
                if(text.includes(news.section1) || (news.section1.includes('부동산') && text.includes('부동산'))) {
                    a.style.color = '#1e56a0';
                    a.style.fontWeight = '800';
                    matched = true;
                }
            });
        }
        if(!matched) {
            menuLinks.forEach(a => {
                if(a.innerText === '전체뉴스') {
                    a.style.color = '#1e56a0';
                    a.style.fontWeight = '800';
                }
            });
        }
    }
    
    // 댓글 관련 기능 추가
    window.loadReadComments = async function(articleId) {
        if (!articleId) return;
        const sb = window.gongsiClient || window.supabaseClient;
        if (!sb) return;
        
        document.getElementById('portalCommentCount').innerText = '0개의 댓글';
        const listEl = document.getElementById('portalCommentList');
        if (listEl) listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#999; font-size:14px;">댓글을 불러오는 중...</div>';
        
        const { data: comments, error } = await sb.from('comments').select('*').eq('article_id', articleId).order('created_at', { ascending: false });
        if (error) {
            if (listEl) listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#e11d48; font-size:14px;">댓글을 불러올 수 없습니다.</div>';
            return;
        }
        
        const { data: sessionData } = await sb.auth.getSession();
        const currentUserId = sessionData?.session?.user?.id;
        
        if(currentUserId) {
            const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
            document.getElementById('commentUserName').innerText = (ud.profile?.name || ud.email?.split('@')[0] || '사용자') + '님';
        } else {
            document.getElementById('commentUserName').innerText = '로그인이 필요합니다';
        }
        
        document.getElementById('portalCommentCount').innerText = (comments ? comments.length : 0) + '개의 댓글';
        
        if (!comments || comments.length === 0) {
            if (listEl) listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#999; font-size:14px;">첫 댓글을 남겨보세요.</div>';
            return;
        }
        
        listEl.innerHTML = comments.map(c => {
            const name = c.user_name || '사용자';
            const firstChar = name.charAt(0);
            const cd = new Date(c.created_at);
            const dateStr = cd.getFullYear() + '.' + (cd.getMonth()+1).toString().padStart(2,'0') + '.' + cd.getDate().toString().padStart(2,'0');
            const isMine = currentUserId && (currentUserId === c.user_id);
            
            let displayContent = c.content;
            let isSecretLabel = '';
            if (c.is_secret) {
                isSecretLabel = '<span style="color:#ef4444; font-size:13px; font-weight:bold; margin-right:6px;">[비밀댓글]</span>';
                if (!isMine) {
                    displayContent = '<span style="color:#aaa;">방문자와 작성자만 볼 수 있는 비밀댓글입니다. 🔒</span>';
                }
            }
            
            return `
                <div style="display:flex; gap:14px; margin-bottom:20px; border-bottom:1px solid #f2f4f7; padding-bottom:20px;">
                    <div style="width:42px; height:42px; border-radius:50%; border:2px solid #333; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:bold; font-size:16px;">
                        ${firstChar}
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <div style="display:flex; align-items:center; font-size:13px;">
                                <span style="font-weight:bold; color:#111;">${name}</span>
                                <span style="color:#ddd; margin: 0 8px;">|</span>
                                <span style="color:#999;">${dateStr}</span>
                            </div>
                        </div>
                        <div style="font-size:15px; color:#222; line-height:1.6; margin-bottom:12px; white-space:pre-wrap; word-break:break-all;">${isSecretLabel}${displayContent}</div>
                    </div>
                </div>
            `;
        }).join('');
    };
    
    window.submitReadComment = async function() {
        const sb = window.gongsiClient || window.supabaseClient;
        if (!sb || !window.currentArticleId) return;
        
        const { data: { session } } = await sb.auth.getSession();
        if (!session || !session.user) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        
        const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
        const userName = ud.profile?.name || (ud.email ? ud.email.split('@')[0] : '사용자');
        const inputEl = document.getElementById('commentInput');
        const content = inputEl ? inputEl.value.trim() : '';
        if (!content) {
            alert('댓글 내용을 입력하세요.');
            return;
        }
        
        const isSecret = document.getElementById('isSecretComment')?.checked || false;
        
        const { error } = await sb.from('comments').insert([{
            article_id: window.currentArticleId,
            user_id: session.user.id,
            user_name: userName,
            content: content,
            is_secret: isSecret
        }]);
        
        if (error) {
            alert('댓글 작성 실패: ' + error.message);
            return;
        }
        
        inputEl.value = '';
        window.loadReadComments(window.currentArticleId);
    };
    
    const cInput = document.getElementById('commentInput');
    if(cInput) {
        cInput.addEventListener('input', function() {
            const lenEl = document.getElementById('commentLength');
            if(lenEl) lenEl.innerText = this.value.length;
        });
    }
    
    window.addEventListener('scroll', () => {
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        const scrollPercent = docHeight > 0 ? (scrollPos / docHeight) * 100 : 0;
        const indicator = document.getElementById('scrollIndicator');
        if(indicator) indicator.style.width = scrollPercent + '%';
        
        // Sticky Header scroll detection
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 40) {
                header.classList.add('is-sticky');
            } else {
                header.classList.remove('is-sticky');
            }
        }
    });

    // Text Banner Ticker Animation & Dropdown
    document.addEventListener("DOMContentLoaded", function() {
        const container = document.getElementById('txt-banner-container');
        const bannerList = document.getElementById('txt-banner-list');
        const dropdown = document.querySelector('.txt-dropdown');
        if (!bannerList || !container || !dropdown) return;
        
        const items = bannerList.querySelectorAll('li');
        if (items.length <= 1) return;
        
        let idx = 0;
        const itemHeight = 24; 
        
        const firstClone = items[0].cloneNode(true);
        bannerList.appendChild(firstClone);
        const totalItems = items.length + 1;
        
        let tickerInterval;
        function startTicker() {
            tickerInterval = setInterval(() => {
                idx++;
                bannerList.style.transition = 'transform 0.5s ease-in-out';
                bannerList.style.transform = `translateY(-${idx * itemHeight}px)`;
                if (idx === totalItems - 1) {
                    setTimeout(() => {
                        bannerList.style.transition = 'none';
                        bannerList.style.transform = `translateY(0)`;
                        idx = 0;
                    }, 500);
                }
            }, 3000);
        }
        startTicker();
        
        container.addEventListener('mouseenter', () => {
            clearInterval(tickerInterval);
            dropdown.style.display = 'block';
        });
        container.addEventListener('mouseleave', () => {
            startTicker();
            dropdown.style.display = 'none';
        });
    });
    
    window.shareUrl = function() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert("URL이 복사되었습니다. 원하는 곳에 붙여넣기 하세요!");
        });
    }
    
    async function loadPopularSidebarNews() {
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;
        const { data, error } = await sb.from('articles').select('id, title, view_count').eq('status', 'published').order('view_count', { ascending: false }).limit(5);
        const c = document.getElementById('popularNewsSidebarContainer');
        if(error || !data) return;
        c.innerHTML = data.map((item, i) => `
            <li class="pop-item" onclick="window.location.href='news_read.html?article_id=${item.id}'">
                <span class="pop-ranking">${i+1}</span>
                <span class="pop-title">${item.title}</span>
            </li>
        `).join('');
    }
    
    async function loadRecommendSidebarProps() {
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

with open("news_read.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Created news_read.html successfully!")
