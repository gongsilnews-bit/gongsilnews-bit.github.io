// [뉴스 프로젝트] RSS 뉴스 및 지도 전용 Supabase 설정 (기존 프로젝트 유지)
const NEWS_SUPABASE_URL = 'https://imtdijfseaninhvjoklp.supabase.co';
const NEWS_SUPABASE_KEY = 'sb_publishable_fY0K_-WP3PyG5ihvxgCPSw_bYewHmnR';

const supabaseClient = window.supabase.createClient(NEWS_SUPABASE_URL, NEWS_SUPABASE_KEY);

let map;
let clusterer;
let allNewsData = []; // 로드된 뉴스 데이터를 저장
let allMarkers = []; // 지도에 표시된 마커들 (사이드바 연동용)
let currentCategory = '전체기사'; // 현재 선택된 카테고리
let currentPeriod = 'all'; // 현재 선택된 기간 필터
let ps; // 장소 검색 객체
let currentOverlay = null; // 현재 열린 오버레이

// 모든 알림을 커스텀 토스트로 띄우기 위한 전역 덮어쓰기
const originalAlert = window.alert;
window.alert = function(msg) {
    if (typeof window.showToast === 'function') {
        window.showToast('🚨 ' + msg);
    } else {
        originalAlert(msg);
    }
};

// 간단한 토스트 메시지 띄우기 함수 (커스텀 뷰 적용, 위치 동적 지정 가능)
window.showToast = function(msg, redirectUrl = null, verticalPos = 'top:20px; transform:translateX(-50%);') {
    let t = document.getElementById('gongsil-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'gongsil-toast';
        document.body.appendChild(t);
    }
    t.style.cssText = `position:fixed; left:50%; ${verticalPos} background:#222; color:#fff; padding:12px 24px; border-radius:30px; font-size:14px; font-weight:600; z-index:99999; opacity:0; transition:opacity 0.3s; pointer-events:none; box-shadow:0 4px 12px rgba(0,0,0,0.15); display:flex; align-items:center; gap:6px; white-space:nowrap;`;
    t.innerHTML = msg;
    t.style.opacity = '1';
    
    if (window.gongsilToastTimer) clearTimeout(window.gongsilToastTimer);
    
    if (redirectUrl) {
        window.gongsilToastTimer = setTimeout(() => { 
            t.style.opacity = '0';
            window.location.href = redirectUrl;
        }, 1500);
    } else {
        window.gongsilToastTimer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
    }
};

// 뉴스 네비게이션 설정
const NEWS_NAV_CONFIG = {
    'local': {
        name: '우리동네부동산',
        subs: ['아파트·오피스텔', '빌라·주택', '원룸·투룸', '상가·업무·공장·토지', '분양']
    },
    'column': {
        name: '뉴스/칼럼',
        subs: ['부동산·주식·재테크', '정치·경제·사회', '세무·법률', '여행·맛집', '건강·헬스', 'IT·가전·가구', '스포츠·연예·Car', '인물·미션·기타']
    },
    'interest': { name: 'MY관심뉴스', subs: ['찜한기사', '최근본기사'] }
};

// 1. 지도 초기화
function initMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 중심
        level: 8
    };
    const mapInstance = new kakao.maps.Map(container, options);

    // [중요] 모바일 터치 및 드래그 허용 설정
    mapInstance.setDraggable(true);
    mapInstance.setZoomable(true);

    // 마커 클러스터러 생성 (주황색 테마 커스텀)
    const clustererInstance = new kakao.maps.MarkerClusterer({
        map: mapInstance,
        averageCenter: true,
        minLevel: 6,
        styles: [{
            width: '40px', height: '40px',
            background: '#ff9f1c',
            color: '#fff',
            textAlign: 'center',
            lineHeight: '40px',
            borderRadius: '50%',
            fontWeight: 'bold',
            fontSize: '14px'
        }]
    });

    // 장소 검색 객체 생성 (라이브러리 로드 확인)
    if (kakao.maps.services && kakao.maps.services.Places) {
        ps = new kakao.maps.services.Places();
    }

    // 뉴스 네비게이션 초기화
    initNewsNavigation();

    return { map: mapInstance, clusterer: clustererInstance };
}


// 포털 뷰 열기
window.openPortalView = function(category = '전체기사') {
    const pv = document.getElementById('portal-view');
    if (pv) {
        pv.style.display = 'block';
        pv.scrollTop = 0;
        loadPortalNews(category);
    }
};

// 포털 뷰 닫기
window.closePortalView = function() {
    const pv = document.getElementById('portal-view');
    if (pv) pv.style.display = 'none';
};

// 포털 탭 선택
window.selectPortalTab = function(category) {
    if (typeof window.closeNewsDetail === 'function') {
        window.closeNewsDetail(); // 기사 상세뷰가 열려있다면 닫기
    }
    const title = document.getElementById('portalSectionTitle');
    if (title) title.textContent = (category === '전체기사' ? '최신 뉴스' : category);
    loadPortalNews(category);
};

// 포털 뉴스 상태 저장용
window.portalState = { currentCategory: '전체기사', offset: 0, itemsPerPage: 10, isFetching: false, allLoaded: false, articles: [] };

async function loadPortalNews(category, isLoadMore = false) {
    const container = document.getElementById('portalContainer');
    if (!container) return;

    if (!isLoadMore) {
        window.portalState.currentCategory = category;
        window.portalState.offset = 0;
        window.portalState.allLoaded = false;
        window.portalState.articles = [];
        container.innerHTML = '<div style="padding:60px;text-align:center;color:#999;">뉴스를 불러오는 중...</div>';
    } else {
        const btn = document.getElementById('portalLoadMoreBtn');
        if (btn) btn.innerText = '불러오는 중...';
    }

    if (window.portalState.isFetching) return;
    window.portalState.isFetching = true;

    try {
        // articles 테이블에서 published 기사 로드
        let sb = window.gongsiClient || supabaseClient;
        let query = sb.from('articles')
            .select('id, title, subtitle, content, section1, section2, article_type, reporter_name, reporter_email, keywords, view_count, created_at, rep_media_id')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        // 카테고리 필터
        if (window.portalState.currentCategory && window.portalState.currentCategory !== '전체기사') {
            const cat = window.portalState.currentCategory;
            if (cat.startsWith('검색결과:')) {
                const term = cat.split(':')[1].trim().replace(/^#/, '');
                query = query.or(`title.ilike.%${term}%,subtitle.ilike.%${term}%,keywords.ilike.%${term}%`);
            } else {
                query = query.or('section1.eq.' + cat + ',section2.eq.' + cat);
            }
        }
        
        // 페이징 처리
        const from = window.portalState.offset;
        const fetchCount = isLoadMore ? window.portalState.itemsPerPage : (5 + window.portalState.itemsPerPage);
        const to = from + fetchCount - 1;
        
        query = query.range(from, to);
        const { data: rawData, error } = await query;
        if (error) throw error;

        // article_media 별도 조회 (대표 미디어 썸네일용) - 실패해도 무시
        let mediaByArticleId = {};
        if (rawData && rawData.length > 0) {
            try {
                const articleIds = rawData.map(a => a.id);
                const { data: mediaRows, error: mediaErr } = await sb
                    .from('article_media')
                    .select('article_id, url, media_type, is_representative')
                    .in('article_id', articleIds);
                if (!mediaErr && mediaRows) {
                    mediaRows.forEach(m => {
                        if (!mediaByArticleId[m.article_id]) mediaByArticleId[m.article_id] = [];
                        mediaByArticleId[m.article_id].push(m);
                    });
                }
            } catch(e) {
                console.warn('article_media 조회 실패 (썸네일은 content에서 추출):', e);
            }
        }

        // 콘텐츠 파싱하여 image_url, video_id 결정
        const data = (rawData || []).map(function(a) {
            // 1순위: article_media에서 대표(is_representative=true) 미디어 URL 사용
            let imgUrl = null;
            let videoId = null;

            const mediaList = mediaByArticleId[a.id] || [];
            const repMedia = mediaList.find(m => m.is_representative) || mediaList[0];
            if (repMedia) {
                if (repMedia.media_type === 'youtube') {
                    // 유튜브 embed URL에서 videoId 추출
                    const ytM = repMedia.url.match(/embed\/([A-Za-z0-9_-]{11})/);
                    if (ytM) {
                        videoId = ytM[1];
                        imgUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                    }
                } else if (repMedia.url) {
                    imgUrl = repMedia.url;
                }
            }

            // 사용 안 함 (articles.image_url 컬럼 없음)
            // imgUrl은 article_media 조회 또는 content 파싱으로만 결정

            if (a.content) {
                // 3순위: content에서 유튜브 embed iframe URL 파싱 (videoId 없는 경우에만)
                if (!videoId) {
                    const ytPatterns = [
                        /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
                        /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/
                    ];
                    for (const pattern of ytPatterns) {
                        const match = a.content.match(pattern);
                        if (match && match[1]) {
                            videoId = match[1];
                            // 이미지가 없는 경우에만 유튜브 썸네일 사용
                            if (!imgUrl || imgUrl.includes('source.unsplash.com')) {
                                imgUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                            }
                            break;
                        }
                    }
                }

                // 4순위: content 내 일반 이미지 추출 (videoId도 image도 없을 때)
                if (!videoId && !imgUrl) {
                    const div = document.createElement('div');
                    div.innerHTML = a.content;
                    const imgNode = div.querySelector('img:not(.note-video-clip)');
                    if (imgNode && imgNode.src && !imgNode.src.includes('video-placeholder')) {
                        imgUrl = imgNode.src;
                    }
                }
            }

            // Unsplash 방어 코드
            if (imgUrl && imgUrl.includes('source.unsplash.com')) {
                imgUrl = null;
            }

            if (!imgUrl) {
                imgUrl = `https://via.placeholder.com/600x400/eeeeee/cccccc?text=Gongsil+News`;
            }

            let desc = a.subtitle || '';
            if (!desc && a.content) {
                desc = a.content.replace(/<[^>]+>/g, '').trim().substring(0, 120) + '...';
            }

            return Object.assign({}, a, { 
                _source: 'articles', 
                pub_date: a.created_at,
                image_url: imgUrl,
                video_id: videoId,
                description: desc,
                author: a.reporter_name || '공실뉴스'
            });
        });

        // 더 이상 데이터가 없으면
        if (!data || data.length === 0) {
            if (!isLoadMore) container.innerHTML = '<div style="padding:60px;text-align:center;color:#999;">표시할 뉴스가 없습니다.</div>';
            else {
                const btn = document.getElementById('portalLoadMoreBtn');
                if (btn) { btn.innerText = '모든 기사를 불러왔습니다'; btn.disabled = true; }
            }
            window.portalState.allLoaded = true;
            window.portalState.isFetching = false;
            return;
        }
        
        if (data.length < fetchCount) window.portalState.allLoaded = true;
        window.portalState.offset += data.length;
        window.portalState.articles.push(...data);

        // 유튜브 프리뷰 재생/정지 헬퍼 (글로벌)
        if (!window.playYtPreview) {
            window.playYtPreview = function(el, vid) {
                if (!vid) return;
                let i = el.querySelector('iframe.yt-preview');
                if (!i) {
                    i = document.createElement('iframe');
                    i.className = 'yt-preview';
                    i.src = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${vid}&rel=0&disablekb=1&fs=0`;
                    i.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;border:none;background:#000;border-radius:inherit;';
                    el.appendChild(i);
                }
            };
            window.stopYtPreview = function(el) {
                const i = el.querySelector('iframe.yt-preview');
                if (i) i.remove();
            };
        }

        // 첫 로딩일 경우 2단 레이아웃 (Layout 생성)
        if (!isLoadMore) {
            let leftHtml = '';
            let rightSideTopHtml = '';
            let listStartIndex = 0;

            // 1. 좌측 핫 아티클 (Top 1)
            if (data.length > 0) {
                const hot = data[0];
                const img = hot.image_url ? `<img src="${hot.image_url}" class="portal-hot-img" onload="if(this.src.includes('youtube.com') && this.naturalWidth === 120) { this.src='https://via.placeholder.com/600x400/eeeeee/cccccc?text=Gongsil+News'; this.onload=null; }" onerror="this.src='https://via.placeholder.com/600x400/eeeeee/cccccc?text=Gongsil+News';">` : '<div style="width:100%;height:100%;background:#eee;"></div>';
                const escHot = JSON.stringify(hot).replace(/"/g, '&quot;');
                
                let playOverlay = '';
                let hoverEvent = '';
                if (hot.video_id) {
                    playOverlay = '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:60px; height:60px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; padding-left:4px; z-index:5;"><svg viewBox="0 0 24 24" width="30" height="30" fill="white"><path d="M8 5v14l11-7z"/></svg></div>';
                    hoverEvent = `onmouseenter="window.playYtPreview(this, '${hot.video_id}')" onmouseleave="window.stopYtPreview(this)"`;
                }

                leftHtml += `
                    <a href="javascript:void(0)" class="portal-hot-article" onclick="window.showNewsDetail(${escHot})">
                        <div class="portal-hot-title">${hot.title}</div>
                        <div class="portal-hot-img-wrap" style="position:relative; margin-bottom:0px; overflow:hidden;" ${hoverEvent}>
                            ${img}
                            ${playOverlay}
                        </div>
                    </a>
                `;
                listStartIndex = 1;
            }

            // 2. 우측 상단 소형 기사 (최대 4개)
            if (data.length > 1) {
                const sideItems = data.slice(1, Math.min(5, data.length));
                listStartIndex += sideItems.length;
                
                sideItems.forEach(news => {
                    const esc = JSON.stringify(news).replace(/"/g, '&quot;');
                    const img = news.image_url ? `<img src="${news.image_url}" class="portal-side-item-img" onload="if(this.src.includes('youtube.com') && this.naturalWidth === 120) { this.src='https://via.placeholder.com/600x400/eeeeee/cccccc?text=Gongsil+News'; this.onload=null; }" onerror="this.src='https://via.placeholder.com/600x400/eeeeee/cccccc?text=Gongsil+News';">` : '<div style="width:100%;height:100%;background:#eee;"></div>';
                    let playOverlay = news.video_id ? '<div style="position:absolute; bottom:5px; left:5px; width:24px; height:24px; background:rgba(0,0,0,0.7); border-radius:4px; display:flex; align-items:center; justify-content:center; padding-left:2px; z-index:5;"><svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M8 5v14l11-7z"/></svg></div>' : '';
                    let hoverEvent = news.video_id ? `onmouseenter="window.playYtPreview(this, '${news.video_id}')" onmouseleave="window.stopYtPreview(this)"` : '';
                    rightSideTopHtml += `
                        <a href="javascript:void(0)" class="portal-side-item" onclick="window.showNewsDetail(${esc})">
                            <div class="portal-side-item-content">
                                <div class="portal-side-item-title">${news.title}</div>
                            </div>
                            <div class="portal-side-item-img-wrap" style="position:relative; overflow:hidden;" ${hoverEvent}>
                                ${img}
                                ${playOverlay}
                            </div>
                        </a>
                    `;
                });
            }

            // 3. 좌측 리스트 기사 생성
            const listItems = data.slice(listStartIndex);
            let listHtml = '<div id="portalListContainer">';
            listHtml += generatePortalListHtml(listItems);
            listHtml += '</div>';

            // 4. 많이 본 뉴스 더미 (일단 랜덤이나 최신 5개로 구성)
            const popularItems = data.slice(0, 5).map((n, i) => `
                <li style="cursor:pointer; transition:all 0.2s;" onmouseover="this.querySelector('.portal-popular-text').style.color='#111'; this.querySelector('.portal-popular-text').style.textDecoration='underline';" onmouseout="this.querySelector('.portal-popular-text').style.color='#555'; this.querySelector('.portal-popular-text').style.textDecoration='none';" onclick="window.showNewsDetail(${JSON.stringify(n).replace(/"/g, '&quot;')})">
                    <span class="portal-popular-num">${i+1}</span>
                    <span class="portal-popular-text" style="transition: color 0.1s;">${n.title}</span>
                </li>
            `).join('');

            // 전체 레이아웃 조합
            container.innerHTML = `
                <div class="portal-layout">
                    <!-- 탑 섹션 좌측 (메인 1개) -->
                    <div class="portal-main" style="padding-right: 40px; box-sizing: border-box;">
                        ${leftHtml}
                    </div>
                    <!-- 탑 섹션 우측 (소형 4개) -->
                    <div class="portal-side" style="padding-left: 20px; box-sizing: border-box; border-left: 1px solid #eee;">
                        <div class="portal-side-top" style="margin-bottom: 0;">
                            ${rightSideTopHtml}
                        </div>
                    </div>
                </div>
                
                <hr class="portal-divider" style="margin: 0 0 30px 0; border:none; height:1px; background:#444;">

                <div class="portal-layout">
                    <!-- 하단 리스트 영역 -->
                    <div class="portal-main" style="padding-right: 40px; box-sizing: border-box;">
                        ${listHtml}
                        ${window.portalState.allLoaded ? '' : '<button id="portalLoadMoreBtn" class="portal-btn-more" onclick="loadPortalNews(\'\', true)">기사 더보기 ↓</button>'}
                    </div>

                    <!-- 하단 사이드바 영역 -->
                    <div class="portal-side sticky-sidebar" style="padding-left: 20px; box-sizing: border-box; border-left: 1px solid #eee;">
                        <div class="portal-banner" style="margin-bottom: 30px;">
                            <!-- 광고 배너 공간 (더미) -->
                            <div style="padding:40px;">YOU HAVE ONLY 2 MOVES<br><span>(광고 영역)</span></div>
                        </div>
                        <div class="portal-popular">
                            <div class="portal-popular-title">가장 많이 본 기사</div>
                            <ul class="portal-popular-list">
                                ${popularItems}
                            </ul>
                        </div>
                        <div class="portal-banner" style="min-height:300px; background:#fffcf0; border-color:#ffe0b2;">
                            <div style="padding:40px; color:#ff9f1c;">부동산·주식·재테크<br>프리미엄 리포트</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 더보기 클릭 시: 기존 리스트 하단에 항목 추가
            const listContainer = document.getElementById('portalListContainer');
            if (listContainer) {
                listContainer.insertAdjacentHTML('beforeend', generatePortalListHtml(data));
            }
            const btn = document.getElementById('portalLoadMoreBtn');
            if (btn) {
                if (window.portalState.allLoaded) {
                    btn.innerText = '모든 기사를 불러왔습니다';
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'default';
                } else {
                    btn.innerText = '기사 더보기 ↓';
                }
            }
        }

    } catch (err) {
        console.error('포털 뉴스 로딩 오류:', err);
        const errMsg = err?.message || err?.details || JSON.stringify(err);
        if (!isLoadMore) container.innerHTML = `<div style="padding:60px;color:#e74c3c;text-align:center;">뉴스를 불러오지 못했습니다.<br><small style="font-size:11px;color:#999;">${errMsg}</small></div>`;
    } finally {
        window.portalState.isFetching = false;
    }
}

// 좌측 리스트 항목 HTML 생성 헬퍼 함수
function generatePortalListHtml(newsList) {
    if (!newsList || newsList.length === 0) return '';
    return newsList.map(news => {
        const esc = JSON.stringify(news).replace(/"/g, '&quot;');
        const img = news.image_url ? `<img src="${news.image_url}" class="portal-list-img" onload="if(this.src.includes('youtube.com') && this.naturalWidth === 120) { this.src='https://via.placeholder.com/600x400/eeeeee/cccccc?text=Gongsil+News'; this.onload=null; }" onerror="this.src='https://via.placeholder.com/600x400/eeeeee/cccccc?text=Gongsil+News';">` : '<div style="width:100%;height:100%;background:#f0f0f0;"></div>';
        let playOverlay = news.video_id ? '<div style="position:absolute; bottom:8px; left:8px; width:30px; height:30px; background:rgba(0,0,0,0.7); border-radius:4px; display:flex; align-items:center; justify-content:center; padding-left:3px; z-index:5;"><svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg></div>' : '';
        let hoverEvent = news.video_id ? `onmouseenter="window.playYtPreview(this, '${news.video_id}')" onmouseleave="window.stopYtPreview(this)"` : '';
        const date = news.pub_date ? new Date(news.pub_date).toLocaleDateString('ko-KR') : '-';
        return `
            <a href="javascript:void(0)" class="portal-list-item" onclick="window.showNewsDetail(${esc})">
                <div class="portal-list-content">
                    <div class="portal-list-title">${news.title}</div>
                    <div class="portal-list-desc">${news.description ? news.description.substring(0, 100) + '...' : ''}</div>
                    <div class="portal-list-meta">${news.author || '공실뉴스'} · ${date}</div>
                </div>
                <div class="portal-list-img-wrap" style="position:relative; overflow:hidden;" ${hoverEvent}>
                    ${img}
                    ${playOverlay}
                </div>
            </a>
        `;
    }).join('');
}

// 뉴스 1, 2단 네비게이션 연동
function initNewsNavigation() {
    const tier1Items = document.querySelectorAll('.news-tab-item');
    tier1Items.forEach(item => {
        item.addEventListener('click', () => {
            const catName = item.innerText.trim();
            const configKey = Object.keys(NEWS_NAV_CONFIG).find(key => NEWS_NAV_CONFIG[key].name === catName);
            
            if (configKey) {
                if (configKey === 'manage') {
                    // 기사관리 탭 클릭 시 관리자 페이지로 직접 이동 (서브메뉴 렌더링 생략)
                    window.location.href = 'user_admin.html?tab=news';
                    return;
                }

                // Tier 1 활성화 상태 변경
                tier1Items.forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                // 포털 모드 전환
                if (configKey === 'column') {
                    document.body.classList.add('portal-mode');
                    window.openPortalView();
                } else {
                    document.body.classList.remove('portal-mode');
                    window.closePortalView();
                }

                // Tier 2 렌더링
                renderTier2(configKey);

                // 탭 전환 시 첫 번째 서브 카테고리 기사 자동 로드
                const firstSub = NEWS_NAV_CONFIG[configKey].subs[0];
                if (configKey === 'column') {
                    window.selectPortalTab(firstSub);
                } else {
                    loadNews(firstSub);
                }
            }
        });
    });

    // 초기값 (우리동네부동산) 설정
    renderTier2('local');
}

function renderTier2(key) {
    const filterRow = document.querySelector('.filter-bar-news .filter-row');
    const filterBar = document.querySelector('.filter-bar-news');
    const sidebar = document.querySelector('.sidebar');
    const newsInterestTabs = document.getElementById('newsInterestTabs');
    const categoryTitle = document.getElementById('newsCategoryTitle');
    
    if (!filterRow || !filterBar || !sidebar) return;

    const config = NEWS_NAV_CONFIG[key];
    if (!config || !config.subs) return;

    const isSpecialNav = key === 'interest' || key === 'manage';

    if (isSpecialNav) {
        // 관심/관리 탭: 상단 필터바 숨기기, 사이드바 내에 탭 활성화
        filterBar.style.display = 'none';
        sidebar.classList.add('wish-mode');
        if (newsInterestTabs) {
            newsInterestTabs.innerHTML = config.subs.map((sub, idx) => 
                `<div class="news-interest-tab ${idx === 0 ? 'active' : ''}" onclick="selectNewsSubTab(this)">${sub}</div>`
            ).join('');
        }
        if (categoryTitle) categoryTitle.style.display = 'none';
    } else {
        // 일반 뉴스 탭: 상단 필터바 보이기, 사이드바 탭 숨기기
        filterBar.style.display = 'block';
        sidebar.classList.remove('wish-mode');
        filterRow.innerHTML = config.subs.map((sub, idx) => 
            `<button class="news-pill ${idx === 0 ? 'active' : ''}" onclick="selectSubTab(this)">${sub}</button>`
        ).join('');
        if (categoryTitle) {
            categoryTitle.style.display = 'block';
            categoryTitle.innerText = config.name;
        }
    }
}

// 탭 스타일 전용 클릭 핸들러 (MY관심기사 / 기사관리 용도)
window.selectNewsSubTab = function(el) {
    const tabs = document.querySelectorAll('.news-interest-tab');
    tabs.forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    
    const subName = el.innerText.trim();
    loadNews(subName);
}

window.selectSubTab = function(el) {
    // 포털 모드일 경우 (단일 선택 방식)
    if (document.body.classList.contains('portal-mode')) {
        document.querySelectorAll('.news-pill').forEach(p => p.classList.remove('active'));
        el.classList.add('active');
        const cat = el.innerText.replace('✓ ', '').trim();
        window.selectPortalTab(cat);
        return;
    }

    // 일반 모드 (다중 선택 방식)
    el.classList.toggle('active');
    
    // 선택된 모든 카테고리 기사들을 로드하기 위해 선택된 항목들 수집
    const activePills = document.querySelectorAll('.news-pill.active');
    const selectedCategories = Array.from(activePills).map(pill => pill.innerText.replace('✓ ', '').trim());
    
    console.log("Selected News Categories:", selectedCategories);
    
    // 데이터 로드 로직 호출
    if (selectedCategories.length > 0) {
        loadNews(selectedCategories.join(','));

    } else {
        loadNews('전체기사'); // 아무것도 선택 안된 경우 기본값
    }
}

// 2. 카카오 SDK 로드 및 초기화
if (typeof kakao === 'undefined') {
    if (document.getElementById('map')) {
        console.warn("❌ 카카오 지도를 불러오지 못했습니다! Kakao Developers 도메인 설정을 확인해주세요.");
    }
} else {
    kakao.maps.load(async () => {
        const mapObj = initMap();
        map = mapObj.map;
        clusterer = mapObj.clusterer;

        // 검색 이벤트 연결
        initSearchEvents();

        // ---- [추가] 뉴스 지도 전용 플로팅 검색 및 지역 선택 로직 ----
        window.globalGeocoder = new kakao.maps.services.Geocoder();
        window.globalPlaces = new kakao.maps.services.Places();
        window.currentRegCodeDo = '';
        window.currentRegCodeGu = '';
        window.currentSelectedSido = '서울특별시';
        window.currentSelectedGugun = '강남구';

        // 지도가 멈췄을 때 중앙 주소 파악하여 상단 탭 업데이트
        kakao.maps.event.addListener(map, 'idle', function() {
            let center = map.getCenter();
            window.globalGeocoder.coord2RegionCode(center.getLng(), center.getLat(), (result, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    for(let i = 0; i < result.length; i++) {
                        if (result[i].region_type === 'H') {
                            const doEl = document.getElementById('mapRegionDo');
                            const guEl = document.getElementById('mapRegionGu');
                            const dongEl = document.getElementById('mapRegionDong');
                            if(doEl) doEl.textContent = result[i].region_1depth_name || '-';
                            if(guEl) guEl.textContent = result[i].region_2depth_name || '-';
                            if(dongEl) dongEl.textContent = result[i].region_3depth_name || '-';
                            break;
                        }
                    }
                }
            });
            if (typeof window.updateMapArticleCount === 'function') {
                window.updateMapArticleCount();
            }
        });

        // 맵 내에 보이는 마커(기사) 갯수 업데이트 함수 (전역)
        window.updateMapArticleCount = function() {
            if (document.body.classList.contains('portal-mode')) return;
            const sidebarTitle = document.getElementById('newsCategoryTitle');
            if (!sidebarTitle || !map) return;
            
            const bounds = map.getBounds();
            if (!bounds) return;
            
            let count = 0;
            allMarkers.forEach(m => {
                if (m && bounds.contain(m.getPosition())) {
                    count++;
                }
            });
            
            let catName = '현재';
            const selectEl = document.querySelector('.news-select-filter');
            if (selectEl) {
                catName = selectEl.options[selectEl.selectedIndex].text;
            }
            sidebarTitle.innerHTML = `${catName} 지도기사 <span style="color:#ff9f1c; margin-left:4px;">${count}</span>개`;
        };

        window.toggleMapSearch = function() {
            const regionPanel = document.getElementById('regionSelectorPanel');
            if(regionPanel) regionPanel.style.display = 'none';
            const panel = document.getElementById('mapSearchPanel');
            if (!panel) return;
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                document.getElementById('mapSearchInput').focus();
            } else {
                panel.style.display = 'none';
            }
        };

        window.openRegionSelector = function(tabName) {
            const searchPanel = document.getElementById('mapSearchPanel');
            if(searchPanel) searchPanel.style.display = 'none';
            const panel = document.getElementById('regionSelectorPanel');
            if(!panel) return;
            if(panel.style.display === 'none') {
                panel.style.display = 'block';
            }
            window.switchRegTab(tabName);
        };

        window.switchRegTab = async function(tabName) {
            document.querySelectorAll('.region-tab').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.reg-panel').forEach(el => el.style.display = 'none');
            
            let activeBtn;
            if(tabName === 'sido') { activeBtn = document.getElementById('tabSido'); document.getElementById('panelSido').style.display = 'grid'; await window.loadRegSido(); }
            if(tabName === 'gugun') { activeBtn = document.getElementById('tabGugun'); document.getElementById('panelGugun').style.display = 'grid'; await window.loadRegGugun(); }
            if(tabName === 'dong') { activeBtn = document.getElementById('tabDong'); document.getElementById('panelDong').style.display = 'grid'; await window.loadRegDong(); }
            if(activeBtn) activeBtn.classList.add('active');
        };

        window.loadRegSido = async function() {
            const panel = document.getElementById('panelSido');
            if(!panel || panel.innerHTML.includes('reg-item-btn')) return;
            panel.innerHTML = '<div style="grid-column:1/-1; padding:20px; text-align:center;">로딩중...</div>';
            try {
                const res = await fetch('https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=*00000000');
                const data = await res.json();
                panel.innerHTML = data.regcodes.map(c => `<button class="reg-item-btn" onclick="window.onRegSelectSido('${c.code}', '${c.name}')">${c.name}</button>`).join('');
            } catch(e) { panel.innerHTML = '<div style="grid-column:1/-1; color:red; text-align:center;">데이터를 로드하지 못했습니다.</div>'; }
        };

        window.loadRegGugun = async function() {
            const panel = document.getElementById('panelGugun');
            if(!panel) return;
            if(!window.currentRegCodeDo) return panel.innerHTML = '<div style="grid-column:1/-1; padding:20px; text-align:center; color:#888;">먼저 시/도를 선택해주세요.</div>';
            panel.innerHTML = '<div style="grid-column:1/-1; padding:20px; text-align:center;">로딩중...</div>';
            const prefix = window.currentRegCodeDo.substring(0, 2);
            try {
                const res = await fetch(`https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=${prefix}*00000&is_ignore_zero=true`);
                const data = await res.json();
                const sorted = data.regcodes.sort((a,b) => a.name.localeCompare(b.name));
                panel.innerHTML = sorted.map(c => {
                    const name = c.name.split(' ').slice(1).join(' ');
                    return `<button class="reg-item-btn" onclick="window.onRegSelectGugun('${c.code}', '${name}')">${name}</button>`;
                }).join('');
            } catch(e) { panel.innerHTML = '<div style="grid-column:1/-1; color:red; text-align:center;">데이터를 로드하지 못했습니다.</div>'; }
        };

        window.loadRegDong = async function() {
            const panel = document.getElementById('panelDong');
            if(!panel) return;
            if(!window.currentRegCodeGu) return panel.innerHTML = '<div style="grid-column:1/-1; padding:20px; text-align:center; color:#888;">먼저 시/군/구를 선택해주세요.</div>';
            panel.innerHTML = '<div style="grid-column:1/-1; padding:20px; text-align:center;">로딩중...</div>';
            const prefix = window.currentRegCodeGu.substring(0, 5);
            try {
                const res = await fetch(`https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=${prefix}*&is_ignore_zero=true`);
                const data = await res.json();
                const sorted = data.regcodes.sort((a,b) => a.name.localeCompare(b.name));
                let html = '';
                sorted.forEach(c => {
                    if(c.code === window.currentRegCodeGu) return;
                    const parts = c.name.split(' ');
                    const name = parts[parts.length - 1];
                    html += `<button class="reg-item-btn" onclick="window.onRegSelectDong('${name}')">${name}</button>`;
                });
                panel.innerHTML = html || '<div style="grid-column:1/-1; padding:20px; text-align:center; color:#888;">세부 지역 없음</div>';
            } catch(e) { panel.innerHTML = '<div style="grid-column:1/-1; color:red; text-align:center;">데이터를 로드하지 못했습니다.</div>'; }
        };

        window.onRegSelectSido = function(code, name) {
            window.currentRegCodeDo = code;
            window.currentSelectedSido = name;
            window.moveToMapSearchByKeyword(name, 8); 
            window.switchRegTab('gugun');
        };
        window.onRegSelectGugun = function(code, name) {
            window.currentRegCodeGu = code;
            window.currentSelectedGugun = name;
            window.moveToMapSearchByKeyword(window.currentSelectedSido + ' ' + name, 6); 
            window.switchRegTab('dong');
        };
        window.onRegSelectDong = function(name) {
            window.moveToMapSearchByKeyword(window.currentSelectedSido + ' ' + window.currentSelectedGugun + ' ' + name, 4); 
            document.getElementById('regionSelectorPanel').style.display = 'none';
        };

        window.moveToMapSearchByKeyword = function(keyword, zlevel) {
            if(!window.globalPlaces || !map) return;
            window.globalPlaces.keywordSearch(keyword, (data, status) => {
                if (status === kakao.maps.services.Status.OK && data.length > 0) {
                    let coords = new kakao.maps.LatLng(data[0].y, data[0].x);
                    map.setCenter(coords);
                    map.setLevel(zlevel);
                }
            });
        };

        window.executeMapKeywordSearch = function() {
            const kw = document.getElementById('mapSearchInput').value.trim();
            const output = document.getElementById('mapSearchResultList');
            if (!kw) {
                output.innerHTML = '<div style="color:#e74c3c; padding:10px;">검색어를 입력해 주세요.</div>';
                return;
            }
            output.innerHTML = '<div style="padding:10px;">검색 중...</div>';
            
            window.globalPlaces.keywordSearch(kw, (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    output.innerHTML = data.map(item => `
                        <div style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;" onclick="window.moveToMapSearch(${item.y}, ${item.x}, '${item.place_name || ''}')">
                            <strong style="color:#111;">${item.place_name}</strong><br>
                            <span style="font-size:11px; color:#888;">${item.road_address_name || item.address_name}</span>
                        </div>
                    `).join('');
                } else {
                    window.globalGeocoder.addressSearch(kw, (addrData, addrStatus) => {
                        if (addrStatus === kakao.maps.services.Status.OK) {
                            output.innerHTML = addrData.map(item => `
                                <div style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;" onclick="window.moveToMapSearch(${item.y}, ${item.x}, '${item.address_name}')">
                                    <strong style="color:#111;">${item.address_name}</strong>
                                </div>
                            `).join('');
                        } else {
                            output.innerHTML = '<div style="padding:10px;">검색 결과가 없습니다.</div>';
                        }
                    });
                }
            });
        };

        window.moveToMapSearch = function(lat, lng, name) {
            if(!map) return;
            const coords = new kakao.maps.LatLng(parseFloat(lat), parseFloat(lng));
            map.setCenter(coords);
            map.setLevel(4);
            window.toggleMapSearch();
            if (name) setTimeout(() => document.getElementById('mapSearchInput').value = name, 100);
        };

        // 뉴스 데이터 로드
        await loadNews(currentCategory);
    });
}

// 오버레이 닫기 함수 (전역에서 호출 가능해야 함)
window.closeOverlay = function () {
    if (currentOverlay) {
        currentOverlay.setMap(null);
        currentOverlay = null;
    }
}

// 검색 이벤트 설정
function initSearchEvents() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

// 검색 실행 함수
function performSearch() {
    const searchInput = document.querySelector('.search-input');
    const keyword = searchInput.value.trim();

    if (!keyword) {
        alert('검색어를 입력해주세요.');
        return;
    }

    // 1. 뉴스 리스트 필터링
    const filteredNews = allNewsData.filter(news =>
        news.title.includes(keyword) ||
        (news.description && news.description.includes(keyword)) ||
        (news.category && news.category.includes(keyword))
    );

    renderSidebar(filteredNews);
    renderMarkers(filteredNews);

    if (filteredNews.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        let hasCoords = false;
        filteredNews.forEach(news => {
            if (news.lat && news.lng) {
                bounds.extend(new kakao.maps.LatLng(news.lat, news.lng));
                hasCoords = true;
            }
        });
        if (hasCoords) {
            map.setBounds(bounds);
        }
    }

    // 2. 카카오 장소 검색
    if (ps) {
        ps.keywordSearch(keyword, (data, status, pagination) => {
            if (status === kakao.maps.services.Status.OK) {
                const place = data[0];
                const moveLatLon = new kakao.maps.LatLng(place.y, place.x);
                map.setCenter(moveLatLon);
                map.setLevel(5);
                console.log(`장소 검색 성공: ${place.place_name}`);
            } else {
                if (filteredNews.length === 0) {
                    alert('검색 결과가 없습니다.');
                }
            }
        });
    }
}


// 카테고리 버튼 클릭 이벤트 설정
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        // 버튼 스타일 업데이트
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // 검색어 초기화
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.value = '';

        currentCategory = e.target.getAttribute('data-category');
        console.log(`Category changed to: ${currentCategory}`);

        if (currentCategory === '부동산찾기') {
            await loadRealEstate();
            return;
        }

        await loadNews(currentCategory);
    });
});



// 3. 데이터 로드
async function loadNews(category) {
    try {
        console.log(`Loading news for category: ${category}`);

        // 사이드바 제목 업데이트
        const sidebarTitle = document.querySelector('.sidebar-header h2');
        if (sidebarTitle) {
            if (document.body.classList.contains('portal-mode')) {
                sidebarTitle.textContent = category === '우리동네부동산' ? '우리동네부동산' : category;
            } else {
                let catName = '현재';
                const selectEl = document.querySelector('.news-select-filter');
                if (selectEl) {
                    catName = selectEl.options[selectEl.selectedIndex].text;
                }
                sidebarTitle.innerHTML = `${catName} 지도기사 <span style="color:#ff9f1c; margin-left:4px;">0</span>개`;
            }
        }

        let sb = window.gongsiClient || supabaseClient;
        let query = sb.from('articles').select('*').eq('status', 'published');

        if (category === '찜한기사' || category === '최근본기사') {
            const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
            const prefix = category === '찜한기사' ? 'gongsil_article_scraps_' : 'gongsil_article_recent_';
            const storageKey = ud.id ? prefix + ud.id : prefix + 'guest';
            const ids = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (ids.length === 0) {
                renderSidebar([]);
                renderMarkers([]);
                const content = document.getElementById('news-content');
                if (content) content.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:14px;">'+(category==='찜한기사'?'찜한 기사가 없습니다.':'최근 본 기사가 없습니다.')+'</div>';
                return;
            }
            query = query.in('id', ids);
            // 순서 강제 유지를 위해 DB 조회 후 JS에서 정렬
        } else {
            query = query.order('created_at', { ascending: false });
            
            // 일반 카테고리 매핑 로직
            let dbCategory = category;
            const COLUMN_SUBS = NEWS_NAV_CONFIG['column'].subs;
            
            if (category === '우리동네부동산') {
                dbCategory = '우리동네부동산';
            } else if (COLUMN_SUBS.includes(category)) {
                dbCategory = '전체기사'; 
            }

            // 기간 필터 적용
            if (currentPeriod !== 'all') {
                const now = new Date();
                let targetDate = new Date();
                if (currentPeriod === 'today') targetDate.setHours(0, 0, 0, 0);
                else if (currentPeriod === 'week') targetDate.setDate(now.getDate() - 7);
                else if (currentPeriod === 'month') targetDate.setMonth(now.getMonth() - 1);
                else if (currentPeriod === '6month') targetDate.setMonth(now.getMonth() - 6);
                query = query.gte('created_at', targetDate.toISOString());
            }

            if (dbCategory !== '전체기사') {
                const categories = dbCategory.split(',').map(s => s.trim()).filter(Boolean);
                if (categories.length > 0) {
                    const escaped = categories.map(c => `"${c}"`).join(',');
                    query = query.or(`section1.in.(${escaped}),section2.in.(${escaped})`);
                }
            }
            query = query.limit(100);
        }

        const { data: rawArticles, error } = await query;
        if (error) throw error;

        // 실제 기사 객체 리스트를 호환 포맷으로 변환 (뉴스 지도 마커용 더미 좌표 추가)
        const baseLat = 37.5665; // 서울시청 기준
        const baseLng = 126.9780;

        let finalNewsList = (rawArticles || []).map((a, i) => {
            // 강남역, 잠실, 지역 임의 산포 (테스트/초기 화면용)
            let mLat = a.lat || (baseLat + (Math.random() - 0.5) * 0.1);
            let mLng = a.lng || (baseLng + (Math.random() - 0.5) * 0.1);

            return {
                ...a,
                id: a.id,
                _source: 'articles',
                title: a.title,
                description: a.subtitle || (a.content ? a.content.replace(/<[^>]+>/g, '').substring(0, 100) : ''),
                category: (a.section1 === '우리동네부동산' && a.section2) ? a.section2 : (a.section1 || '공실뉴스'),
                author: a.reporter_name || '공실뉴스',
                pub_date: a.created_at,
                view_count: a.view_count || 0,
                lat: mLat,
                lng: mLng,
                raw: a // 원본 데이터 보존
            };
        });

        if (category === '찜한기사' || category === '최근본기사') {
            const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
            const prefix = category === '찜한기사' ? 'gongsil_article_scraps_' : 'gongsil_article_recent_';
            const storageKey = ud.id ? prefix + ud.id : prefix + 'guest';
            const ids = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // 저장된 순서(최신순)대로 정렬
            finalNewsList.sort((a, b) => {
                const idxA = ids.indexOf(a.id);
                const idxB = ids.indexOf(b.id);
                return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
            });
        }

        allNewsData = finalNewsList;

        renderSidebar(finalNewsList);
        renderMarkers(finalNewsList);

    } catch (err) {
        console.error('Error:', err);
        const content = document.getElementById('news-content');
        if (content) content.innerHTML = '<div style="padding:20px;">데이터를 불러오지 못했습니다.</div>';
    }
}

// 부동산 데이터 로드 함수
async function loadRealEstate() {
    try {
        console.log('Loading Real Estate Data...');
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 유효 기간 내의 부동산만 조회
        // (start_date <= today) AND (end_date >= today OR end_date IS NULL)
        const { data: estateList, error } = await supabaseClient
            .from('real_estate')
            .select('*')
            .lte('start_date', today)
            .or(`end_date.gte.${today},end_date.is.null`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 전역 데이터 업데이트 (검색용)
        allNewsData = estateList.map(item => ({
            ...item,
            title: item.company_name, // 검색 호환성을 위해 title 매핑
            description: item.address + ' ' + (item.description || ''),
            category: '부동산'
        }));

        renderRealEstateSidebar(estateList);
        renderMarkers(allNewsData); // 기존 마커 렌더링 재사용 (호환)

    } catch (err) {
        console.error('Error loading real estate:', err);
        const content = document.getElementById('news-content');
        if (content) content.innerHTML = '<div style="padding:20px;">부동산 정보를 불러오지 못했습니다.</div>';
    }
}

// 부동산 리스트 렌더링
function renderRealEstateSidebar(estateList) {
    const container = document.getElementById('news-content');
    if (!container) return;

    container.innerHTML = '';

    if (!estateList || estateList.length === 0) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">등록된 부동산이 없습니다.</div>';
        return;
    }

    estateList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'news-card estate-card'; // estate-card 클래스 추가
        card.id = `news-card-${index}`;

        // SNS 아이콘 생성 함수
        const createSnsLink = (url, icon, color) => url ? `<a href="${url}" target="_blank" style="text-decoration:none; margin-right:8px; color:${color}; font-size:18px;">${icon}</a>` : '';

        const snsLinks = `
            ${createSnsLink(item.youtube_url, '📹', '#FF0000')}
            ${createSnsLink(item.blog_url, '📝', '#00C73C')}
            ${createSnsLink(item.instagram_url, '📷', '#E1306C')}
            ${createSnsLink(item.facebook_url, '페이스북', '#1877F2')}
            ${createSnsLink(item.threads_url, '@', '#000000')}
        `;

        // 연락처 포맷팅
        const contactInfo = [item.phone_mobile, item.phone_office].filter(Boolean).join(' / ');

        card.innerHTML = `
            <div class="news-tag">[부동산]</div>
            <h3 class="news-card-title" style="font-size:16px;">${item.company_name}</h3>
            
            <div style="font-size:13px; color:#555; margin-bottom:8px;">
                <div><strong>대표:</strong> ${item.ceo_name}</div>
                <div><strong>주소:</strong> ${item.address}</div>
                ${item.registration_number ? `<div><strong>등록번호:</strong> ${item.registration_number}</div>` : ''}
            </div>

            <div style="margin-bottom:8px;">
                ${snsLinks}
            </div>

            <div style="font-size:13px; font-weight:bold; color:#333;">
                📞 ${contactInfo || '연락처 없음'}
            </div>
            
            ${item.inquiry_url ? `<a href="${item.inquiry_url}" target="_blank" class="estate-btn">문의하기</a>` : ''}
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.news-card').forEach(el => el.classList.remove('active'));
            card.classList.add('active');

            if (map && item.lat && item.lng) {
                const moveLatLon = new kakao.maps.LatLng(item.lat, item.lng);
                map.panTo(moveLatLon);
                map.setLevel(4); // 좀 더 확대해서 보여줌
            }
        });

        container.appendChild(card);
    });
}


// 4. 사이드바 렌더링
function renderSidebar(newsList) {
    const container = document.getElementById('news-content');
    if (!container) return;

    container.innerHTML = '';

    if (newsList.length === 0) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">표시할 뉴스가 없습니다.</div>';
        return;
    }

    newsList.forEach((news, index) => {
        const date = new Date(news.pub_date).toLocaleDateString();
        const card = document.createElement('div');
        card.classList.add('news-card'); // classList 사용으로 안정성 강화
        card.id = `news-card-${index}`;

        const isPortal = document.body.classList.contains('portal-mode');
        // 디버깅용 확인 (브라우저 콘솔에서 확인 가능)
        if (index === 0) console.log("Card render mode (isPortal):", isPortal);

        const imgHtml = (isPortal && news.image_url) ? `
            <div class="card-img-wrap">
                <img src="${news.image_url}" class="card-img" onload="if(this.src.includes('youtube.com') && this.naturalWidth === 120) { this.src='https://via.placeholder.com/300x180?text=Gongsil+News'; this.onload=null; }" onerror="this.src='https://via.placeholder.com/300x180?text=Gongsil+News'">
            </div>
        ` : '';

        const locationBadge = (news.lat && news.lng) ? '📍' : '';
        let displayCategory = news.category;
        if (displayCategory === '공실뉴스') displayCategory = '우리동네부동산';
        const categoryBadge = displayCategory ? `[${displayCategory}] ` : '';

        const escNews = JSON.stringify(news).replace(/"/g, '&quot;');
        const bodyContent = `
            <div class="card-body">
                <div class="news-tag">${categoryBadge}NEWS ${locationBadge}</div>
                <h3 class="news-card-title">${news.title}</h3>
                <p class="news-desc">${news.description ? news.description.substring(0, 80) + '...' : ''}</p>
                <div class="news-meta">
                    <span>${date} · ${news.author || '공실뉴스'}</span>
                    <a href="javascript:void(0)" data-article-id="${news.id || news.article_id}" onclick="event.stopPropagation(); window.toggleNewsDetail(event, ${escNews});" class="news-link">기사상세보기 &rarr;</a>
                </div>
            </div>
        `;

        card.innerHTML = imgHtml + bodyContent;

        card.addEventListener('click', () => {
            document.querySelectorAll('.news-card').forEach(el => el.classList.remove('active'));
            card.classList.add('active');

            if (!isPortal && map && news.lat && news.lng) {
                // 우리동네부동산: 리스트 클릭 시 기존에 열려있던 상세보기 기사창 닫기
                window.closeNewsDetail();

                const moveLatLon = new kakao.maps.LatLng(news.lat, news.lng);
                map.panTo(moveLatLon);
                map.setLevel(4);
                if (allMarkers[index]) {
                    kakao.maps.event.trigger(allMarkers[index], 'click');
                }
            } else {
                // 포털 모드거나 위치 정보 없으면 바로 상세 보기
                window.showNewsDetail(news);
            }
        });

        container.appendChild(card);
    });
}

// 5. 마커 렌더링 (커스텀 원형 마커 적용)
function renderMarkers(newsList) {
    allMarkers = []; // 전역 마커 배열 초기화

    if (currentOverlay) {
        currentOverlay.setMap(null);
        currentOverlay = null;
    }


    // 커스텀 마커 이미지 (주황색 원 + 숫자 1, 테두리 흰색) - Base64 SVG
    // SVG: <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#ff9f1c" stroke="white" stroke-width="2"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-family="sans-serif" font-weight="bold" fill="white">1</text></svg>
    const svgBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiNmZjlmMWMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj4xPC90ZXh0Pjwvc3ZnPg==";

    const markerImageSize = new kakao.maps.Size(40, 40);
    const markerImageOption = { offset: new kakao.maps.Point(20, 20) };
    const markerImage = new kakao.maps.MarkerImage(svgBase64, markerImageSize, markerImageOption);

    newsList.forEach((news, index) => {
        if (news.lat && news.lng) {
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(news.lat, news.lng),
                title: news.title,
                image: markerImage // 커스텀 이미지 적용
            });

            // 마커 클릭 이벤트
            kakao.maps.event.addListener(marker, 'click', function () {
                // 1. 사이드바 연동
                const card = document.getElementById(`news-card-${index}`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    document.querySelectorAll('.news-card').forEach(el => el.classList.remove('active'));
                    card.classList.add('active');
                }

                // 2. 커스텀 오버레이 표시
                if (currentOverlay) {
                    currentOverlay.setMap(null);
                }

                const date = new Date(news.pub_date).toLocaleDateString();

                // 제목 글자수 제한 (25자)
                let displayTitle = news.title;
                if (displayTitle.length > 25) {
                    displayTitle = displayTitle.substring(0, 25) + '...';
                }

                const escNews = JSON.stringify(news).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                // 기사 설명 부분 정제 (HTML 태그 제거 및 길이 제한)
                let cleanDesc = (news.description || '').replace(/<[^>]+>/g, '').trim();
                if (cleanDesc.length > 50) cleanDesc = cleanDesc.substring(0, 50) + '...';

                const content = `
                    <div class="overlay-wrap" style="width: 280px; background: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); text-align: left; font-family: 'Pretendard', sans-serif; position: relative; z-index: 9999 !important;">
                        <div class="overlay-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <h3 class="overlay-title" style="font-size: 15px; font-weight: 700; color: #222; margin: 0; line-height: 1.4; width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayTitle}</h3>
                            <button class="overlay-close" onclick="closeOverlay()" style="background: none; border: none; font-size: 20px; color: #999; cursor: pointer; padding: 0; margin-left: 8px; line-height: 1;">×</button>
                        </div>
                        <div class="overlay-body">
                            <div class="overlay-desc" style="font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${cleanDesc}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="overlay-meta" style="font-size: 11px; color: #999; font-weight: 400; margin: 0;">${date} | ${news.author || '공실뉴스'}</div>
                                <a href="javascript:void(0)" onclick="window.showNewsDetail(${escNews})" class="overlay-link" style="display: block; text-align: right; font-size: 12px; color: #3b82f6; text-decoration: none; font-weight: 600; margin: 0;">기사 보러가기 &rarr;</a>
                            </div>
                        </div>
                        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #ffffff; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.05));"></div>
                    </div>
                `;


                const overlay = new kakao.maps.CustomOverlay({
                    content: content,
                    map: map,
                    position: marker.getPosition(),
                    zIndex: 9999 // 오버레이를 지도의 최상층 레이어로 배정
                });

                currentOverlay = overlay;
                map.panTo(marker.getPosition());
            });


            // 전역 배열에 저장 (인덱스 매칭을 위해)
            allMarkers[index] = marker;
        }
    });

    // 클러스터러에는 유효한 마커만 추가
    const validMarkers = allMarkers.filter(m => m !== null && m !== undefined);
    clusterer.addMarkers(validMarkers);

    if (typeof window.updateMapArticleCount === 'function') {
        window.updateMapArticleCount();
    }
}
// 뉴스 상세 보기 표시 함수
window.toggleNewsDetail = function(event, news) {
    const detailView = document.getElementById('news-detail-view');
    const targetId = news.id || news.article_id;
    // 이미 현재 클릭한 기사가 열려있다면 닫기 실행
    if (window.currentArticleId === targetId && detailView && detailView.style.display === 'block') {
        window.closeNewsDetail(); // 기존 닫기 함수를 호출 (텍스트 원복 포함)
    } else {
        window.showNewsDetail(news);
    }
};

window.scrapArticle = function() {
    const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
    if (!ud.id) {
        alert("로그인 후 이용 가능합니다.");
        return;
    }
    if (!window.currentArticleId) return;

    const storageKey = 'gongsil_article_scraps_' + ud.id;
    let scraps = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (!scraps.includes(window.currentArticleId)) {
        scraps.unshift(window.currentArticleId);
        localStorage.setItem(storageKey, JSON.stringify(scraps));
        showToast("✓ 뉴스 스크랩을 완료했습니다.");
    } else {
        showToast("이미 스크랩한 기사입니다.");
    }
};

window.showNewsDetail = async function(news) {
    const detailView = document.getElementById('news-detail-view');
    const closeBtn = document.getElementById('btnCloseDetail');
    if (!detailView || !news) return;

    // 기사 변경/열림 시 스크롤 최상단으로 리셋
    detailView.scrollTop = 0;
    if (document.body.classList.contains('portal-mode')) {
        window.scrollTo(0, 0);
    }

    window.currentArticleId = news.id || news.article_id;

    // 최근 본 기사 저장 로직 추가
    if (window.currentArticleId) {
        const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
        const recentKey = ud.id ? 'gongsil_article_recent_' + ud.id : 'gongsil_article_recent_guest';
        let recents = JSON.parse(localStorage.getItem(recentKey) || '[]');
        recents = recents.filter(id => id !== window.currentArticleId);
        recents.unshift(window.currentArticleId);
        if (recents.length > 50) recents.pop();
        localStorage.setItem(recentKey, JSON.stringify(recents));
    }

    // 모든 링크 텍스트를 기본값으로 초기화
    document.querySelectorAll('.news-link').forEach(link => {
        link.innerHTML = '기사상세보기 &rarr;';
        link.style.color = '';
        link.style.fontWeight = '';
    });
    
    // 현재 열린 기사 링크 텍스트를 '기사닫기 ✕'로 변경 및 오렌지색 강조
    const activeLink = document.querySelector(`.news-link[data-article-id="${window.currentArticleId}"]`);
    if (activeLink) {
        activeLink.innerHTML = '기사닫기 ✕';
        activeLink.style.color = '#ff9f1c';
        activeLink.style.fontWeight = 'bold';
    }
    if (window.currentArticleId) {
        const url = new URL(window.location);
        url.searchParams.set('article_id', window.currentArticleId);
        window.history.pushState({ articleId: window.currentArticleId }, '', url);
    }

    // 포털 모드인지 확인하여 렌더링 위치 및 기존 컨텐츠 숨김 제어
    if (document.body.classList.contains('portal-mode')) {
        detailView.classList.remove('map-floating-mode');
        if (closeBtn) closeBtn.innerHTML = '목록 보기 ✕';
        
        const portalBody = document.querySelector('.portal-body');
        if (portalBody) portalBody.style.display = 'none'; // 목록 숨기기
        document.getElementById('portal-view').appendChild(detailView);
    } else {
        detailView.classList.add('map-floating-mode');
        if (closeBtn) closeBtn.innerHTML = '닫기 ✕';
        
        const mapWrapper = document.querySelector('.map-wrapper');
        if (mapWrapper) mapWrapper.appendChild(detailView);
    }

    // 기본 정보 먼저 표시 (로딩 상태)
    const pubDate = news.pub_date || news.created_at;
    const category = news.section1 || news.category || '전체기사';
    const section2  = news.section2 ? ' > ' + news.section2 : '';
    
    let displayBreadcrumb = `뉴스/칼럼 > ${category}${section2}`;
    if (news.section1 === '우리동네부동산') {
        displayBreadcrumb = news.section2 || news.section1;
    }
    
    document.getElementById('detailCategory').innerText = displayBreadcrumb;
    document.getElementById('detailTitle').innerText = news.title || '(제목 없음)';
    const stickyReadTitle = document.getElementById('stickyReadTitle');
    if(stickyReadTitle) stickyReadTitle.innerText = news.title || '(제목 없음)';
    
    document.getElementById('detailAuthor').innerText = news.reporter_name || news.author || '공실뉴스';
    document.getElementById('detailDate').innerText = `입력 ${new Date(pubDate).toLocaleString('ko-KR')}`;
    document.getElementById('detailViews').innerText = `조회수 ${news.view_count || 0}`;

    const btnViewOriginal = document.getElementById('btnViewOriginal');
    if (btnViewOriginal) {
        if (news._source === 'articles' || news.article_type) {
            btnViewOriginal.href = `news_read.html?article_id=${news.id}`;
            btnViewOriginal.style.display = 'inline-block';
        } else if (news.link) {
            btnViewOriginal.href = news.link;
            btnViewOriginal.style.display = 'inline-block';
        } else {
            btnViewOriginal.style.display = 'none';
        }
    }

    const bodyContainer = document.getElementById('detailBody');
    bodyContainer.innerHTML = '<div style="padding:40px;text-align:center;color:#aaa;">본문을 불러오는 중...</div>';
    detailView.style.display = 'block';
    if (document.body.classList.contains('portal-mode')) {
        document.getElementById('portal-view').scrollTop = 0;
    } else {
        detailView.scrollTop = 0;
    }

    // ── articles 테이블 기사 (직접 작성, article_id 또는 _source='articles') ──
    if (news._source === 'articles' || news.article_type) {
        try {
            var sb = window.gongsiClient;
            if (!sb) { sb = window.supabaseClient; }

            // 미디어 로드
            var mRes = await sb.from('article_media').select('*').eq('article_id', news.id).order('sort_order');
            var mediaList = mRes.data || [];

            // 조회수 +1
            sb.from('articles').update({ view_count: (news.view_count || 0) + 1 }).eq('id', news.id);

            // 본문 조립
            var contentHtml = '';

            // 이미지/영상 처리
            var repMedia = mediaList.find(function(m){ return m.is_representative; }) || mediaList[0];
            if (repMedia && repMedia.media_type === 'image') {
                contentHtml += '<figure style="margin:0 0 20px;"><img src="' + repMedia.url + '" style="width:100%;border-radius:8px;" alt=""><figcaption style="font-size:12px;color:#888;text-align:center;margin-top:6px;">' + (repMedia.caption || '') + '</figcaption></figure>';
            }

            // 본문이 있으면 HTML 그대로, 없으면 미디어 전체 표시
            if (news.content && news.content.trim().length > 10) {
                contentHtml += news.content;
            } else if (mediaList.length > 0) {
                mediaList.forEach(function(m, i) {
                    if (i === 0 && repMedia === m) return; // 대표이미지 중복 방지
                    if (m.media_type === 'image') {
                        contentHtml += '<figure style="margin:16px 0;"><img src="' + m.url + '" style="width:100%;border-radius:8px;" alt=""><figcaption style="font-size:12px;color:#888;text-align:center;margin-top:6px;">' + (m.caption || '') + '</figcaption></figure>';
                    } else if (m.media_type === 'youtube') {
                        contentHtml += '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:16px 0"><iframe src="' + m.url + '" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>';
                    }
                });
            }

            if (!contentHtml) {
                contentHtml = '<p style="color:#888;font-style:italic;">본문 내용이 없습니다.</p>';
            }

            // 카드뉴스 위아래 텍스트
            if (news.card_text_above) {
                contentHtml = '<div style="margin-bottom:16px;line-height:1.9;">' + news.card_text_above + '</div>' + contentHtml;
            }
            if (news.card_text_below) {
                contentHtml += '<div style="margin-top:16px;line-height:1.9;">' + news.card_text_below + '</div>';
            }

            // 관련기사
            if (news.related_articles && Array.isArray(news.related_articles) && news.related_articles.length > 0) {
                let relatedHtml = '<div style="margin-top:40px; margin-bottom:30px; padding:25px; border:2px solid #ffb966; border-radius:12px; background:#fffcf5;">';
                relatedHtml += '<div style="font-size:18px; font-weight:800; color:#111; margin-bottom:15px; display:flex; align-items:center; gap:8px;">';
                relatedHtml += '<span style="color:#ea580c; font-size:16px;">▶</span> 관련기사</div>';
                relatedHtml += '<ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px;">';
                news.related_articles.forEach(r => {
                    relatedHtml += '<li style="display:flex; gap:8px; font-size:15px; cursor:pointer;" onclick="window.location.href=\'index.html?article_id=' + r.id + '\'">'
                        + '<span style="color:#aaa;">ㄴ</span>'
                        + '<span style="color:#333; font-weight:600; text-decoration:none;" onmouseover="this.style.textDecoration=\'underline\'; this.style.color=\'#ea580c\';" onmouseout="this.style.textDecoration=\'none\'; this.style.color=\'#333\';">' + (r.title||'제목 없음') + '</span>'
                        + '</li>';
                });
                relatedHtml += '</ul></div>';
                contentHtml += relatedHtml;
            }

            // 키워드 및 기자 정보는 하단 공통 푸터로 위임

            bodyContainer.innerHTML = contentHtml;

        } catch(err) {
            bodyContainer.innerHTML = '<p style="color:#e11d48;">본문 로드 오류: ' + err.message + '</p>';
        }
    } else {
        // ── news 테이블 기사 (RSS / 기존) ──────────────────────────────
        let rssContentHtml = '';
    
    if (news.image_url) {
        rssContentHtml += `
            <div class="article-img-wrap">
                <img src="${news.image_url}" class="article-img" alt="기사 이미지">
            </div>
        `;
    }

    if (news.description) {
        rssContentHtml += `<b>${news.description}</b>`;
    }

    rssContentHtml += `
        <p>본 기사는 공실뉴스의 공식 기사입니다. 전문을 확인하시려면 아래 공식 링크를 통해 확인하실 수 있습니다.</p>
        <p style="margin-top:20px;">
            <a href="${news.link}" target="_blank" style="color:#ff9f1c; font-weight:bold; text-decoration:underline;">[기사 전문 보기] ${news.link}</a>
        </p>
    `;

        bodyContainer.innerHTML = rssContentHtml;
    }
    
    // ── 공통 하단 푸터 (태그, 기자명, 댓글) 처리 ──
    const articleFooter = document.getElementById('articleFooterArea');
    if (articleFooter) {
        articleFooter.style.display = 'block';
        
        // 키워드
        const kwBox = document.getElementById('footerKeywords');
        if (kwBox) {
            if (news.keywords) {
                let parsedKeywords = news.keywords.split(/[\s,]+/).map(k => k.replace(/^#+/, '').trim()).filter(Boolean);
                kwBox.innerHTML = parsedKeywords.map(function(k) {
                    return '<span style="background:#f1f3f5; color:#495057; font-size:14px; padding:6px 14px; border-radius:30px; cursor:pointer;" onmouseover="this.style.background=\'#e9ecef\'" onmouseout="this.style.background=\'#f1f3f5\'" onclick="window.searchByKeyword(\'' + k + '\')">#' + k + '</span>';
                }).join('');
                kwBox.style.display = 'flex';
                kwBox.style.flexWrap = 'wrap';
                kwBox.style.gap = '8px';
            } else {
                kwBox.style.display = 'none';
            }
        }

        window.searchByKeyword = function(keyword) {
            if (typeof window.closeNewsDetail === 'function') {
                window.closeNewsDetail(); 
            }
            
            // 지도 컨테이너를 숨기고 포털 뷰를 띄우기 위해 클래스 추가
            document.body.classList.add('portal-mode');
            
            // 탭 활성화 상태 변경 (뉴스/칼럼 탭 활성화)
            const tabs = document.querySelectorAll('.news-tab-item');
            if (tabs.length > 0) {
                tabs.forEach(el => el.classList.remove('active'));
                const columnTab = Array.from(tabs).find(el => el.textContent.trim() === '뉴스/칼럼');
                if (columnTab) columnTab.classList.add('active');
            }

            if (typeof window.openPortalView === 'function') {
                window.openPortalView('검색결과:' + keyword);
            } else if (typeof window.loadPortalNews === 'function') {
                window.loadPortalNews('검색결과:' + keyword);
            }
            
            const title = document.getElementById('portalSectionTitle');
            if (title) title.textContent = '검색결과: #' + keyword;
        };
        
        // 기자 정보
        const reporterBox = document.getElementById('footerReporter');
        if (reporterBox) {
            reporterBox.innerText = news.reporter_name || '공실뉴스';
        }
        
        // 댓글 로드 및 UI 설정
        const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
        const profile = ud.profile || {};
        const userName = profile.name || (ud.email ? ud.email.split('@')[0] : '');
        
        const commentUserNameEl = document.getElementById('commentUserName');
        const commentInputEl = document.getElementById('commentInput');
        
        if (commentUserNameEl) {
            if (ud.email) {
                commentUserNameEl.innerText = userName;
                commentUserNameEl.style.color = '#333';
            } else {
                commentUserNameEl.innerText = '로그인이 필요합니다';
                commentUserNameEl.style.color = '#999';
            }
        }
        
        if (commentInputEl) {
            if (ud.email) {
                commentInputEl.disabled = false;
                commentInputEl.placeholder = '댓글을 남겨보세요';
            } else {
                commentInputEl.disabled = true;
                commentInputEl.placeholder = '로그인 후 댓글을 달 수 있습니다.';
            }
            commentInputEl.value = '';
            const lenEl = document.getElementById('commentLength');
            if (lenEl) lenEl.innerText = '0';
            
            // 글자수 카운팅
            commentInputEl.oninput = function() {
                if (this.value.length > 400) this.value = this.value.substring(0, 400);
                if (lenEl) lenEl.innerText = this.value.length;
            };
        }
        
        window.loadPortalComments(news.id || news.article_id);
    }
    
    // 많이 본 뉴스 연동
    if (typeof window.loadPopularNews === 'function') {
        let popCat = category;
        if (news.section1 === '우리동네부동산' && news.section2) {
            popCat = news.section2;
        }
        window.loadPopularNews(popCat);
    }

    // 등록 부동산 매물 연동
    if (typeof window.loadSidebarProperties === 'function') {
        window.loadSidebarProperties();
    }
};

window.popularNewsCache = window.popularNewsCache || {};
window.loadPopularNews = async function(category) {
    const listEl = document.getElementById('detailPopularNewsList');
    const titleEl = document.getElementById('detailPopularNewsTitle');
    if (!listEl) return;

    if (titleEl) {
        titleEl.innerHTML = category === '전체기사' ? `많이 본 뉴스` : `<span style="color:#ff9f1c">${category}</span> 많이 본 뉴스`;
    }

    // 캐시 확인 (5분)
    const now = Date.now();
    const cache = window.popularNewsCache[category];
    let topArticles = [];

    if (cache && now - cache.time < 5 * 60 * 1000) {
        topArticles = cache.data;
    } else {
        const sb = window.gongsiClient || window.supabaseClient;
        if (!sb) return;

        let query = sb.from('articles').select('id, title, view_count').eq('status', 'published');
        if (category !== '전체기사') {
            query = query.or(`section1.eq."${category}",section2.eq."${category}"`);
        }
        query = query.order('view_count', { ascending: false }).limit(5);

        const { data, error } = await query;
        if (!error && data) {
            topArticles = data;
            window.popularNewsCache[category] = { time: now, data: topArticles };
        }
    }

    if (topArticles.length === 0) {
        listEl.innerHTML = '<li style="padding:10px; color:#999; font-size:13px; text-align:center;">조회된 뉴스가 없습니다.</li>';
        return;
    }

    listEl.innerHTML = topArticles.map((a, i) => `
        <li style="cursor:pointer; display:flex; align-items:flex-start; margin-bottom:12px; transition:all 0.2s;" onmouseover="this.querySelector('.portal-popular-text').style.color='#111'; this.querySelector('.portal-popular-text').style.textDecoration='underline';" onmouseout="this.querySelector('.portal-popular-text').style.color='#555'; this.querySelector('.portal-popular-text').style.textDecoration='none';" onclick="window.showNewsDetail({id: ${a.id}, article_id: ${a.id}, _source:'articles'})">
            <span class="portal-popular-num" style="color:${i < 3 ? '#ff9f1c' : '#999'}; font-weight:bold; font-size:14px; margin-right:8px; display:inline-block; text-align:center;">${i+1}</span>
            <span class="portal-popular-text" style="color:#555; font-size:14px; font-weight:600; line-height:1.4; word-break:keep-all; flex:1; transition: color 0.1s;">${a.title}</span>
        </li>
    `).join('');
};

// ── 사이드바 등록 부동산 매물 로드 ──
window.loadSidebarProperties = async function() {
    const container = document.getElementById('sidebarPropertyList');
    if (!container) return;

    const sb = window.gongsiClient;
    if (!sb) {
        container.innerHTML = '<div style="padding:10px; color:#bbb; font-size:12px; text-align:center;">부동산 데이터 연결 중...</div>';
        return;
    }

    const { data: props, error } = await sb
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('ad_rank', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

    if (error || !props || props.length === 0) {
        container.innerHTML = '<div style="padding:10px; color:#bbb; font-size:12px; text-align:center;">등록된 매물이 없습니다.</div>';
        return;
    }

    function formatPrice(trade, deposit, monthly) {
        const wand = v => v >= 10000 ? Math.floor(v/10000) + '억' + (v%10000 > 0 ? ' ' + (v%10000).toLocaleString() : '') : v.toLocaleString() + '만';
        if (trade === '매매') return '매매 ' + wand(deposit);
        if (trade === '전세') return '전세 ' + wand(deposit);
        if (trade === '월세') return '월세 ' + wand(deposit) + '/' + monthly.toLocaleString() + '만';
        if (trade === '단기') return '단기 ' + wand(deposit) + '/' + monthly.toLocaleString() + '만';
        return trade;
    }

    container.innerHTML = props.map(p => {
        const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : '';
        const imgStyle = imgUrl ? `background:#eee url('${imgUrl}') center/cover` : 'background:#eee';
        const priceStr = formatPrice(p.trade_type, p.deposit, p.monthly_rent);
        const areaStr = p.dedicated_area ? `전용 ${p.dedicated_area}㎡` : '';
        let propTitle = p.building_name || p.property_type || '공실매물';
        if (p.main_category === '아파트·오피스텔' || !p.main_category) {
            let aptName = p.building_name || p.property_type || '';
            let dongStr = p.dong_number ? (String(p.dong_number).includes('동') ? p.dong_number : `${p.dong_number}동`) : '';
            let roomStr = p.room_number ? (String(p.room_number).includes('호') ? p.room_number : `${p.room_number}호`) : '';
            if (aptName || dongStr || roomStr) propTitle = `${aptName} ${dongStr} ${roomStr}`.trim();
        }

        const supAreaM2 = p.supply_area ? parseFloat(p.supply_area) : 0;
        const excAreaM2 = p.dedicated_area ? parseFloat(p.dedicated_area) : (p.area ? parseFloat(p.area) : 0);
        const fmtM2P = (m2) => m2 ? `${m2}㎡(${(m2 / 3.3058).toFixed(1)}평)` : '';
        let areaDisplay = '';
        if (supAreaM2 && excAreaM2) areaDisplay = `${fmtM2P(supAreaM2)} / ${fmtM2P(excAreaM2)}`;
        else if (supAreaM2) areaDisplay = fmtM2P(supAreaM2);
        else if (excAreaM2) areaDisplay = fmtM2P(excAreaM2);
        else areaDisplay = '정보없음';

        const directionStr = p.room_direction || p.direction || '';
        let subInfoArr = [];
        if (p.property_type) subInfoArr.push(p.property_type);
        if (directionStr) subInfoArr.push(directionStr);
        if (areaDisplay !== '정보없음') subInfoArr.push(areaDisplay);
        const subInfoHtml = subInfoArr.join(' <span style="color:#ddd; margin:0 4px;">|</span> ');

        const optionsStr = (p.options && Array.isArray(p.options) && p.options.length > 0) ? p.options.join(', ') : '';
        let roomFeatureArr = [];
        roomFeatureArr.push(`룸 ${p.room_count||'0'}개`);
        if (p.bathroom_count) roomFeatureArr.push(`욕실 ${p.bathroom_count}개`);
        if (optionsStr) roomFeatureArr.push(optionsStr);
        const roomInfoHtml = roomFeatureArr.join(', ');

        const regDate = new Date(p.created_at);
        const dateStr = `${regDate.getFullYear()}.${String(regDate.getMonth()+1).padStart(2,'0')}.${String(regDate.getDate()).padStart(2,'0')}.`;

        const badgeText = (function(pf) {
            if (!pf) return '공실매물';
            if (pf.includes('100') || pf.includes('양타')) return '수수료100%';
            if (pf.includes('50') || pf.includes('단타')) return '수수료50%';
            if (pf.includes('25')) return '수수료25%';
            if (pf.includes('공동')) return '공동중개';
            return '공동중개';
        })(p.brokerage_fee);

        return `
        <div class="property-card" onclick="window.openPropPanel('${p.id}')">
            <div class="property-info" style="${imgUrl ? '' : 'width: 100%;'}">
                <div class="card-prop-title">${propTitle}</div>
                <div class="card-price">${priceStr}</div>
                <div class="card-prop-sub">${subInfoHtml}</div>
                <div class="card-prop-rooms">${roomInfoHtml}</div>
                <div class="card-prop-footer">
                    <span class="tag-confirm">${badgeText}</span>
                    <span class="card-prop-date">${dateStr}</span>
                </div>
            </div>
            ${imgUrl ? `<div class="property-image"><img src="${imgUrl}" alt="매물사진"></div>` : ''}
        </div>`;
    }).join('');
};

// ─── 매물 상세 패널 (슬라이드 인) ───
window.openPropPanel = async function(propertyId) {
    const panel = document.getElementById('propDetailPanel');
    const dim   = document.getElementById('propDetailDim');
    if (!panel) return;

    // 로딩 상태 먼저 표시
    panel.style.display = 'flex';
    dim.style.display   = 'block';
    document.getElementById('propPanelPrice').textContent = '불러오는 중...';
    document.getElementById('propPanelTrade').textContent = '';

    const sb = window.gongsiClient;
    if (!sb) return;

    const { data: p, error } = await sb.from('properties').select('*').eq('id', propertyId).maybeSingle();
    if (error || !p) {
        document.getElementById('propPanelPrice').textContent = '데이터를 불러오지 못했습니다.';
        return;
    }

    // 가격 포맷
    function wand(v) {
        v = Number(v) || 0;
        if (v >= 10000) {
            const uk = Math.floor(v / 10000);
            const man = v % 10000;
            return `${uk}억${man > 0 ? ' ' + man + '만' : ''}`;
        }
        return v.toLocaleString() + '만';
    }
    let priceStr = '';
    const t = p.trade_type || '';
    if (t === '매매' || t === '전세') priceStr = wand(p.deposit);
    else priceStr = wand(p.deposit) + ' / ' + (p.monthly_rent || 0).toLocaleString() + '만';

    // 이미지
    const imgs = p.images && p.images.length > 0 ? p.images : [];
    window._propPanelPhotos = imgs;
    window._propPanelPhotoIdx = 0;
    const imgEl = document.getElementById('propPanelImg');
    const noImgEl = document.getElementById('propPanelNoImg');
    const prevBtn = document.getElementById('propPanelImgPrev');
    const nextBtn = document.getElementById('propPanelImgNext');
    const cntEl   = document.getElementById('propPanelImgCount');
    if (imgs.length > 0) {
        imgEl.src = imgs[0];
        imgEl.style.display = 'block';
        noImgEl.style.display = 'none';
        if (imgs.length > 1) {
            prevBtn.style.display = nextBtn.style.display = 'block';
            cntEl.style.display = 'inline-block';
            cntEl.textContent = `1/${imgs.length}`;
        } else {
            prevBtn.style.display = nextBtn.style.display = cntEl.style.display = 'none';
        }
    } else {
        imgEl.style.display = 'none';
        noImgEl.style.display = 'flex';
        prevBtn.style.display = nextBtn.style.display = cntEl.style.display = 'none';
    }

    // 기본 정보 채우기
    document.getElementById('propPanelTrade').textContent = t;
    document.getElementById('propPanelPrice').textContent = priceStr;
    const bTrade = document.getElementById('propPanelBottomTrade');
    const bPrice = document.getElementById('propPanelBottomPrice');
    if (bTrade) bTrade.textContent = t;
    if (bPrice) bPrice.textContent = priceStr;
    document.getElementById('propPanelMeta').textContent = [p.property_type, p.dedicated_area ? `전용 ${p.dedicated_area}㎡` : ''].filter(Boolean).join(' · ');
    document.getElementById('propPanelAddrText').textContent = [p.sido, p.sigungu, p.dong].filter(Boolean).join(' ');

    const fmtM2P = (m2) => m2 ? `${m2}㎡(${(m2 / 3.3058).toFixed(1)}평)` : '';
    const sArea = parseFloat(p.supply_area) || 0;
    const dArea = parseFloat(p.dedicated_area) || parseFloat(p.area) || 0;
    let areaDisplay = '-';
    if (sArea && dArea) areaDisplay = `${fmtM2P(sArea)} / ${fmtM2P(dArea)}`;
    else if (sArea) areaDisplay = fmtM2P(sArea);
    else if (dArea) areaDisplay = fmtM2P(dArea);

    let address = [p.sido, p.sigungu, p.dong, p.detail_address].filter(Boolean).join(' ');
    let docFeaturesStr = p.building_name || p.property_type || '-';
    const isGeneral = p.main_category === '상가·업무·공장·토지' || p.main_category === '빌라·주택';
    if (p.is_room_private) {
        if (isGeneral) {
            address = [p.sido, p.sigungu, p.dong].filter(Boolean).join(' ');
            docFeaturesStr = p.property_type || '-';
        }
    }

    const tTrade = document.getElementById('propInfoTrade');
    if (tTrade) tTrade.textContent = t || '-';
    
    document.getElementById('propInfoLoc').textContent = address || '-';
    document.getElementById('propInfoFeatures').textContent = docFeaturesStr;
    document.getElementById('propInfoAreaDetail').textContent = areaDisplay;
    document.getElementById('propInfoFloor').textContent = `${p.current_floor || '-'}층 / ${p.total_floor || '-'}층`;
    document.getElementById('propInfoRooms').textContent = `${p.room_count || '0'}개 / ${p.bathroom_count || '0'}개`;
    document.getElementById('propInfoDir').textContent = p.room_direction || p.direction || '-';
    document.getElementById('propInfoPark').textContent = p.parking_count || '정보없음';
    document.getElementById('propInfoMoveIn').textContent = p.move_in_date || '협의가능';
    document.getElementById('propInfoMaint').textContent = p.maintenance_fee ? `${p.maintenance_fee}만원` : '-';
    document.getElementById('propInfoOpt').textContent = (p.options && Array.isArray(p.options) && p.options.length > 0) ? p.options.join(', ') : '-';
    
    // 로드뷰 처리
    const rvContainer = document.getElementById('propRoadview');
    if (rvContainer) {
        if (typeof kakao !== 'undefined' && kakao.maps && p.latitude && p.longitude) {
            rvContainer.innerHTML = '';
            const rv = new kakao.maps.Roadview(rvContainer);
            const rvClient = new kakao.maps.RoadviewClient();
            const position = new kakao.maps.LatLng(p.latitude, p.longitude);
            rvClient.getNearestPanoId(position, 50, function(panoId) {
                if(panoId) rv.setPanoId(panoId, position);
                else rvContainer.innerHTML = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#999; font-size:13px;">해당 지역은 로드뷰가 제공되지 않습니다.</div>';
            });
        } else {
            rvContainer.innerHTML = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#999; font-size:13px;">위치 정보가 없습니다.</div>';
        }
    }
    document.getElementById('propInfoDesc').textContent  = p.description || '상세 설명이 없습니다.';

    // 등록자 정보
    let contactHtml = `<div>${p.author_name || '-'}</div><div>📞 ${p.author_phone || '비공개'}</div>`;
    document.getElementById('propInfoContact').innerHTML = contactHtml;

    // 공실열람 링크에 ID 파라미터 추가
    const moreLink = panel.querySelector('a[href^="gongsil.html"]');
    if (moreLink) moreLink.href = `gongsil.html?property_id=${p.id}`;
    
    panel.scrollTop = 0;
};

window.closePropPanel = function() {
    const panel = document.getElementById('propDetailPanel');
    const dim   = document.getElementById('propDetailDim');
    if (panel) panel.style.display = 'none';
    if (dim)   dim.style.display   = 'none';
};

window.propPanelPrevImg = function() {
    if (!window._propPanelPhotos || window._propPanelPhotos.length <= 1) return;
    window._propPanelPhotoIdx = (window._propPanelPhotoIdx - 1 + window._propPanelPhotos.length) % window._propPanelPhotos.length;
    document.getElementById('propPanelImg').src = window._propPanelPhotos[window._propPanelPhotoIdx];
    document.getElementById('propPanelImgCount').textContent = `${window._propPanelPhotoIdx + 1}/${window._propPanelPhotos.length}`;
};

window.propPanelNextImg = function() {
    if (!window._propPanelPhotos || window._propPanelPhotos.length <= 1) return;
    window._propPanelPhotoIdx = (window._propPanelPhotoIdx + 1) % window._propPanelPhotos.length;
    document.getElementById('propPanelImg').src = window._propPanelPhotos[window._propPanelPhotoIdx];
    document.getElementById('propPanelImgCount').textContent = `${window._propPanelPhotoIdx + 1}/${window._propPanelPhotos.length}`;
};

// ── 포털 댓글 로드 및 등록 함수 ──
window.loadPortalComments = async function(articleId) {
    if (!articleId) return;
    const sb = window.gongsiClient || window.supabaseClient;
    if (!sb) return;
    
    document.getElementById('portalCommentCount').innerText = '0개의 댓글';
    const listEl = document.getElementById('portalCommentList');
    if (listEl) listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#999; font-size:14px;">댓글을 불러오는 중...</div>';
    
    // DB에서 해당 기사의 댓글 가져오기
    const { data: comments, error } = await sb.from('comments').select('*').eq('article_id', articleId).order('created_at', { ascending: false });
    
    if (error) {
        console.error('댓글 로드 중 오류:', error);
        if (listEl) listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#e11d48; font-size:14px;">댓글을 불러올 수 없습니다.</div>';
        return;
    }
    
    const { data: sessionData } = await sb.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    
    document.getElementById('portalCommentCount').innerText = (comments ? comments.length : 0) + '개의 댓글';
    
    if (!comments || comments.length === 0) {
        if (listEl) listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#999; font-size:14px;">첫 댓글을 남겨보세요.</div>';
        return;
    }
    
    // 부모 댓글과 답글 분리
    const parents = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);

    function renderSingleComment(c, isReply) {
        const name = c.user_name || '사용자';
        const firstChar = name.charAt(0);
        const cd = new Date(c.created_at);
        const diffMin = Math.floor((Date.now() - cd.getTime()) / 60000);
        let dateStr = '';
        if (diffMin < 60) dateStr = diffMin <= 0 ? '방금전' : diffMin + '분전';
        else if (diffMin < 24 * 60) dateStr = Math.floor(diffMin / 60) + '시간전';
        else dateStr = cd.getFullYear() + '.' + (cd.getMonth()+1).toString().padStart(2,'0') + '.' + cd.getDate().toString().padStart(2,'0');

        const isMine = currentUserId && (currentUserId === c.user_id);
        
        let displayContent = c.content;
        let isSecretLabel = '';
        if (c.is_secret) {
            isSecretLabel = '<span style="color:#ef4444; font-size:13px; font-weight:bold; margin-right:6px;">[비밀댓글]</span>';
            if (!isMine) {
                displayContent = '<span style="color:#aaa;">방문자와 작성자만 볼 수 있는 비밀댓글입니다. 🔒</span>';
                // 비밀댓글일 경우 내용 파싱(다운표 이스케이프) 시 텍스트만 처리
            }
        }
        
        const escContent = JSON.stringify(c.content).replace(/"/g, '&quot;'); // 본래 내용만 에디터에 전달
        
        let actionHtml = '';
        if (isMine) {
            actionHtml = `
                <span style="color:#ddd; margin:0 4px;">|</span>
                <span style="font-size:12px; color:#999; cursor:pointer;" onmouseover="this.style.color='#111'" onmouseout="this.style.color='#999'" onclick="window.editPortalComment('${c.id}')">수정</span>
                <span style="color:#ddd; margin:0 4px;">|</span>
                <span style="font-size:12px; color:#ef4444; cursor:pointer;" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='#ef4444'" onclick="window.deletePortalComment('${c.id}')">삭제</span>
            `;
        }

        const marginLeft = isReply ? '40px' : '0px';
        const replyTag = isReply ? '<span style="color:#ff9f1c; font-weight:bold; margin-right:4px;">↳</span>' : '';

        return `
            <div style="display:flex; gap:14px; margin-bottom:20px; border-bottom:1px solid #f2f4f7; padding-bottom:20px; margin-left:${marginLeft};">
                <div style="width:42px; height:42px; border-radius:50%; border:2px solid #333; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:bold; font-size:16px;">
                    ${firstChar}
                </div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <div style="display:flex; align-items:center; font-size:13px; flex-wrap:wrap;">
                            <span style="font-weight:bold; color:#111;">${name}</span>
                            <span style="color:#ddd; margin: 0 8px;">|</span>
                            <span style="color:#999;">${dateStr}</span>
                            ${actionHtml}
                        </div>
                    </div>
                    <div id="comment-content-${c.id}" style="font-size:15px; color:#222; line-height:1.6; margin-bottom:12px; white-space:pre-wrap; word-break:break-all;">${isSecretLabel}${replyTag}${displayContent}</div>
                    
                    <div style="display:flex; gap:15px; align-items:center; font-size:13px; color:#888;">
                        ${!isReply && currentUserId ? `<span style="cursor:pointer;" onmouseover="this.style.color='#111'" onmouseout="this.style.color='#888'" onclick="window.toggleReplyInput('${c.id}')">답글 작성</span>` : ''}
                        <div style="display:flex; gap:12px;">
                            <span style="cursor:pointer; display:flex; align-items:center; gap:4px;" onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#888'" onclick="window.votePortalComment('${c.id}', true)">👍 <span id="like-cnt-${c.id}">${c.likes||0}</span></span>
                            <span style="cursor:pointer; display:flex; align-items:center; gap:4px;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#888'" onclick="window.votePortalComment('${c.id}', false)">👎 <span id="dislike-cnt-${c.id}">${c.dislikes||0}</span></span>
                        </div>
                    </div>
                    
                    <!-- 답글/수정 입력 영역 (JS 동적 렌더) -->
                    <div id="reply-container-${c.id}" data-comment='${escContent}' style="display:none; margin-top:15px; padding-left:15px; border-left:2px solid #ddd;">
                        <textarea id="reply-input-${c.id}" style="width:100%; height:70px; padding:10px; border:1px solid #ddd; border-radius:6px; resize:none; font-family:inherit; font-size:14px; margin-bottom:10px;"></textarea>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <label style="cursor:pointer; display:flex; align-items:center; gap:4px; font-size:13px; color:#555;">
                                <input type="checkbox" id="reply-secret-${c.id}" style="accent-color:#ff9f1c;"> 비밀답글
                            </label>
                            <div>
                                <button onclick="document.getElementById('reply-container-${c.id}').style.display='none'" style="background:#eee; color:#555; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:5px;">취소</button>
                                <button id="reply-submit-btn-${c.id}" style="background:#ff9f1c; color:#fff; border:none; padding:6px 16px; border-radius:4px; font-weight:bold; cursor:pointer;">등록</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (listEl) {
        listEl.innerHTML = parents.map(p => {
            let html = renderSingleComment(p, false);
            const childReplies = replies.filter(r => r.parent_id === p.id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
            childReplies.forEach(r => {
                html += renderSingleComment(r, true);
            });
            return html;
        }).join('');
    }
};

window.submitPortalComment = async function() {
    const sb = window.gongsiClient || window.supabaseClient;
    if (!sb || !window.currentArticleId) return;
    
    // 로그인 체크
    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
    const profile = ud.profile || {};
    const userName = profile.name || (ud.email ? ud.email.split('@')[0] : '사용자');
    
    const inputEl = document.getElementById('commentInput');
    const content = inputEl ? inputEl.value.trim() : '';
    if (!content) {
        alert('댓글 내용을 입력하세요.');
        return;
    }
    
    const secretChk = document.getElementById('isSecretComment');
    const isSecret = secretChk ? secretChk.checked : false;
    
    // DB 삽입
    const { error } = await sb.from('comments').insert([{
        article_id: window.currentArticleId,
        user_id: session.user.id,
        user_name: userName,
        content: content,
        is_secret: isSecret
    }]);
    
    if (error) {
        if (error.code === '42P01') {
            alert('댓글 테이블(comments)이 아직 생성되지 않았습니다. 관리자에게 문의하세요.');
        } else {
            console.error('댓글 등록 오류:', error);
            alert('댓글 등록에 실패했습니다. (' + error.message + ')');
        }
        return;
    }
    
    inputEl.value = '';
    const lenEl = document.getElementById('commentLength');
    if (lenEl) lenEl.innerText = '0';
    
    // 목록 새로고침
    window.loadPortalComments(window.currentArticleId);
};

// 댓글 기능 (답글창 토글, 수정, 삭제, 추천/비공)
window.toggleReplyInput = function(commentId) {
    const container = document.getElementById('reply-container-' + commentId);
    if (!container) return;
    if (container.style.display === 'none') {
        container.style.display = 'block';
        const input = document.getElementById('reply-input-' + commentId);
        input.value = '';
        input.placeholder = '답글을 남겨보세요...';
        const btn = document.getElementById('reply-submit-btn-' + commentId);
        btn.innerText = '등록';
        btn.onclick = () => window.submitPortalReply(commentId);
        input.focus();
    } else {
        container.style.display = 'none';
    }
};

window.editPortalComment = function(commentId) {
    const container = document.getElementById('reply-container-' + commentId);
    const contentDiv = document.getElementById('comment-content-' + commentId);
    if (!container || !contentDiv) return;
    
    container.style.display = 'block';
    const input = document.getElementById('reply-input-' + commentId);
    input.value = JSON.parse('"' + container.getAttribute('data-comment').replace(/&quot;/g, '\\"') + '"'); // 기초 파싱
    input.placeholder = '수정할 내용을 입력하세요...';
    const btn = document.getElementById('reply-submit-btn-' + commentId);
    btn.innerText = '수정 완료';
    btn.onclick = () => window.submitPortalEdit(commentId);
    input.focus();
};

window.submitPortalReply = async function(parentId) {
    const sb = window.gongsiClient || window.supabaseClient;
    const inputEl = document.getElementById('reply-input-' + parentId);
    const content = inputEl ? inputEl.value.trim() : '';
    if (!content) { alert('댓글 내용을 입력하세요.'); return; }
    
    // 비밀답글 여부 확인
    const secretChk = document.getElementById('reply-secret-' + parentId);
    const isSecret = secretChk ? secretChk.checked : false;

    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) { alert('로그인이 필요합니다.'); return; }
    
    const ud = JSON.parse(localStorage.getItem('gongsil_user') || '{}');
    const profile = ud.profile || {};
    const userName = profile.name || (ud.email ? ud.email.split('@')[0] : '사용자');
    
    const { error } = await sb.from('comments').insert([{
        article_id: window.currentArticleId,
        user_id: session.user.id,
        user_name: userName,
        content: content,
        parent_id: parentId,
        is_secret: isSecret
    }]);
    
    if (error) {
        if (error.code === '42703' || (error.message && error.message.includes('parent_id'))) {
            alert('DB에 parent_id 등 답글을 위한 컬럼이 없습니다. (우측 또는 아래 SQL 실행 필요)');
        } else if (error.code === '42703' && error.message.includes('is_secret')) {
             alert('DB에 is_secret 컬럼이 없습니다. SQL을 실행해 추가해주세요.');
        } else { alert('답글 등록 오류: ' + error.message); }
        return;
    }
    
    window.loadPortalComments(window.currentArticleId);
};

window.submitPortalEdit = async function(commentId) {
    const sb = window.gongsiClient || window.supabaseClient;
    const inputEl = document.getElementById('reply-input-' + commentId);
    const content = inputEl ? inputEl.value.trim() : '';
    if (!content) { alert('내용을 입력하세요.'); return; }
    
    const { error } = await sb.from('comments').update({ content: content }).eq('id', commentId);
    if (error) { alert('수정 오류: ' + error.message); return; }
    
    window.loadPortalComments(window.currentArticleId);
};

window.deletePortalComment = async function(commentId) {
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;
    const sb = window.gongsiClient || window.supabaseClient;
    const { error } = await sb.from('comments').delete().eq('id', commentId);
    if (error) { alert('삭제 오류: ' + error.message); return; }
    window.loadPortalComments(window.currentArticleId);
};

window.votePortalComment = async function(commentId, isLike) {
    const votedMap = JSON.parse(localStorage.getItem('gongsil_voted_comments') || '{}');
    if (votedMap[commentId]) {
        alert('이미 참여하셨습니다!');
        return;
    }
    
    const sb = window.gongsiClient || window.supabaseClient;
    
    const { data: c, error: cErr } = await sb.from('comments').select('likes, dislikes').eq('id', commentId).single();
    if (cErr || !c) { alert('댓글을 찾을 수 없습니다.'); return; }
    
    let newLikes = c.likes || 0;
    let newDislikes = c.dislikes || 0;
    if (isLike) newLikes++; else newDislikes++;
    
    const { error } = await sb.from('comments').update({ likes: newLikes, dislikes: newDislikes }).eq('id', commentId);
    if (error) {
        alert('추천을 반영할 수 없습니다. DB의 RLS 정책 오류이거나 로그인 사용자 권한 문제입니다.\n(DB에 UPDATE 정책 추가 필요)');
        return;
    }
    
    votedMap[commentId] = true;
    localStorage.setItem('gongsil_voted_comments', JSON.stringify(votedMap));
    
    if (isLike) document.getElementById('like-cnt-' + commentId).innerText = newLikes;
    else document.getElementById('dislike-cnt-' + commentId).innerText = newDislikes;
};

// 뉴스 상세 보기 닫기 함수
window.closeNewsDetail = function() {
    const detailView = document.getElementById('news-detail-view');
    if (detailView) {
        detailView.style.display = 'none';

        // 모든 링크 텍스트 기사 닫기에서 원상복구
        document.querySelectorAll('.news-link').forEach(link => {
            link.innerHTML = '기사상세보기 &rarr;';
            link.style.color = '';
            link.style.fontWeight = '';
        });
        
        // 포털 모드인 경우 숨겼던 목록 컨테이너 복구
        if (document.body.classList.contains('portal-mode')) {
            const portalBody = document.querySelector('.portal-body');
            if (portalBody) portalBody.style.display = 'block';
        }
    }
    
    // URL 파라미터 복구 (초기화)
    if (window.currentArticleId) {
        const url = new URL(window.location);
        url.searchParams.delete('article_id');
        window.history.pushState({}, '', url);
        window.currentArticleId = null;
    }
};

// URL 공유 기능
window.shareArticleUrl = function() {
    if (!window.currentArticleId) return;
    const url = new URL(window.location);
    url.searchParams.set('article_id', window.currentArticleId);
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url.toString()).then(() => {
            alert('기사 주소가 복사되었습니다.\n' + url.toString());
        }).catch(err => {
            alert('주소 복사에 실패했습니다.');
        });
    } else {
        const tempInput = document.createElement('input');
        tempInput.value = url.toString();
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('기사 주소가 복사되었습니다.\n' + url.toString());
    }
};

// 이전/다음 기사 탐색 (같은 카테고리 내에서 시간순 탐색)
window.navigateArticle = async function(direction) {
    if (!window.currentArticleId) return;

    // 현재 기사의 카테고리 및 작성일자 정보 가져오기
    const isPortal = document.body.classList.contains('portal-mode');
    const navArr = isPortal ? (window.portalState && window.portalState.articles ? window.portalState.articles : []) : (typeof allNewsData !== 'undefined' ? allNewsData : []);
    
    let currentNews = navArr.find(a => (a.id || a.article_id) === window.currentArticleId);
    
    if (!currentNews) {
        // 배열에 없으면 딥링크 등으로 직접 들어온 경우 -> 서버에서 직접 조회
        const sb = window.gongsiClient || supabaseClient;
        if (sb) {
            const { data } = await sb.from('articles').select('*').eq('id', window.currentArticleId).single();
            if (data) currentNews = data;
        }
    }

    if (!currentNews) {
        alert('현재 기사 정보를 확인할 수 없어 탐색이 불가능합니다.');
        return;
    }

    const cat = currentNews.section1; // 1차 카테고리 기준
    const createdAt = currentNews.created_at || currentNews.pub_date;
    
    // direction = 1 : 이전 기사 (과거 시간) -> DB에서는 created_at < current
    // direction = -1 : 다음 기사 (최신 시간) -> DB에서는 created_at > current
    // 사용자가 < (왼쪽) 클릭 시 1 넘김 -> "과거" 기사를 뜻함. 
    // 사용자가 > (오른쪽) 클릭 시 -1 넘김 -> "최신" 기사를 뜻함.
    
    try {
        const sb = window.gongsiClient || supabaseClient;
        let query = sb.from('articles').select('*').eq('status', 'published');
        
        if (cat && cat !== '전체기사') {
            query = query.or(`section1.eq.${cat},section2.eq.${cat}`);
        }

        if (direction === 1) {
            // 과거 기사 탐색
            query = query.lt('created_at', createdAt).order('created_at', { ascending: false }).limit(1);
        } else {
            // 최신 기사 탐색
            query = query.gt('created_at', createdAt).order('created_at', { ascending: true }).limit(1);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
            alert(direction === 1 ? '마지막(가장 과거) 기사입니다.' : '첫 번째(가장 최신) 기사입니다.');
            return;
        }

        const targetNews = data[0];
        targetNews._source = 'articles'; // 렌더링 호환용
        window.showNewsDetail(targetNews);

    } catch (e) {
        console.error("탐색 에러:", e);
        alert('기사 탐색 중 오류가 발생했습니다.');
    }
};

// 초기화 완료 및 스크롤 인디케이터 로직
document.addEventListener('DOMContentLoaded', () => {
    console.log('초기화 완료');
    
    // 기사 상세 뷰 스크롤 이벤트 (인디케이터 표출 및 프로그레스 갱신)
    const detailView = document.getElementById('news-detail-view');
    if (detailView) {
        detailView.addEventListener('scroll', function() {
            const header = document.getElementById('stickyReadHeader');
            const detailTitle = document.getElementById('detailTitle');
            const progressInd = document.getElementById('readProgressIndicator');
            
            if(!header || !detailTitle || !progressInd) return;

            // 타이틀이 화면 위로 사라지면 플로팅 헤더 나타남
            const titleRect = detailTitle.getBoundingClientRect();
            // margin 등을 고려해 약간 여유를 둡니다.
            if (titleRect.bottom < -20) {
                header.classList.add('visible');
            } else {
                header.classList.remove('visible');
            }

            // 스크롤 프로그레스 계산
            const scrollTop = detailView.scrollTop;
            const scrollHeight = detailView.scrollHeight - detailView.clientHeight;
            let progress = 0;
            if(scrollHeight > 0) {
                progress = (scrollTop / scrollHeight) * 100;
            }
            if(progress > 100) progress = 100;
            if(progress < 0) progress = 0;
            progressInd.style.width = progress + '%';
            
            // 빅 네비게이션 화살표 스크롤 중 숨김 처리
            const bigArrows = document.querySelectorAll('.big-nav-arrow');
            bigArrows.forEach(a => a.classList.add('hidden'));

            if (window.scrollNavTimeout) clearTimeout(window.scrollNavTimeout);
            window.scrollNavTimeout = setTimeout(() => {
                bigArrows.forEach(a => a.classList.remove('hidden'));
            }, 600); // 스크롤 멈추고 0.6초 후 표시
        });
    }

    // 초기 URL 딥링킹(공유된 기사 링크로 진입 시) 검사
    setTimeout(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedArticleId = urlParams.get('article_id');
        const sb = window.gongsiClient || supabaseClient;
        if (sharedArticleId && sb) {
            // 일단 포털 모드로 강제 지정
            if (!document.body.classList.contains('portal-mode')) {
                document.body.classList.add('portal-mode');
            }
            try {
                const { data, error } = await sb.from('articles').select('*').eq('id', sharedArticleId).single();
                if (data && !error) {
                    data._source = 'articles';
                    window.showNewsDetail(data);
                }
            } catch(e) {}
        }
    }, 1000); // supabase 로드 후 실행 대기
});

// 폰트 확대/축소 기능
let currentArticleFontSize = 17;
window.changeArticleFontSize = function(delta) {
    const bodyContainer = document.getElementById('detailBody');
    if(!bodyContainer) return;
    currentArticleFontSize += delta;
    if(currentArticleFontSize < 12) currentArticleFontSize = 12;
    if(currentArticleFontSize > 32) currentArticleFontSize = 32;
    bodyContainer.style.fontSize = currentArticleFontSize + 'px';
};
