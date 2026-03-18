
// [뉴스 프로젝트] RSS 뉴스 및 지도 전용 Supabase 설정 (기존 프로젝트 유지)
const NEWS_SUPABASE_URL = 'https://imtdijfseaninhvjoklp.supabase.co';
const NEWS_SUPABASE_KEY = 'sb_publishable_fY0K_-WP3PyG5ihvxgCPSw_bYewHmnR';

const supabaseClient = window.supabase.createClient(NEWS_SUPABASE_URL, NEWS_SUPABASE_KEY);

let map, clusterer;
let allNewsData = []; // 로드된 뉴스 데이터를 저장
let allMarkers = []; // 지도에 표시된 마커들 (사이드바 연동용)
let currentCategory = '전체기사'; // 현재 선택된 카테고리
let currentPeriod = 'all'; // 현재 선택된 기간 필터
let ps; // 장소 검색 객체
let currentOverlay = null; // 현재 열린 오버레이

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
            background: '#3b82f6',
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

    return { map: mapInstance, clusterer: clustererInstance };
}

// 2. 카카오 SDK 로드 및 초기화
if (typeof kakao === 'undefined') {
    alert("❌ 카카오 지도를 불러오지 못했습니다!\nKakao Developers 도메인 설정을 확인해주세요.");
} else {
    kakao.maps.load(async () => {
        const mapObj = initMap();
        map = mapObj.map;
        clusterer = mapObj.clusterer;

        // 검색 이벤트 연결
        initSearchEvents();

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
            sidebarTitle.textContent = category;
        }

        let query = supabaseClient
            .from('news')
            .select('*')
            .order('pub_date', { ascending: false }); // Limit은 뒤에 적용

        // 기간 필터 적용
        if (currentPeriod !== 'all') {
            const now = new Date();
            let targetDate = new Date();

            if (currentPeriod === 'today') {
                targetDate.setHours(0, 0, 0, 0); // 오늘 0시
            } else if (currentPeriod === 'week') {
                targetDate.setDate(now.getDate() - 7);
            } else if (currentPeriod === 'month') {
                targetDate.setMonth(now.getMonth() - 1);
            } else if (currentPeriod === '6month') {
                targetDate.setMonth(now.getMonth() - 6);
            }

            // pub_date는 timestamp 형식이거나 YYYY-MM-DDT... 형식이므로 ISOString 사용
            // 단, 시간대(KST) 고려가 필요할 수 있으나 UTC 기준으로 간단히 처리
            query = query.gte('pub_date', targetDate.toISOString());
        }

        query = query.limit(1000); // 1000개 제한은 마지막에

        if (category !== '전체기사') {
            query = query.eq('category', category);
        }

        const { data: newsList, error } = await query;

        if (error) throw error;

        allNewsData = newsList;

        renderSidebar(newsList);
        renderMarkers(newsList);

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
        card.className = 'news-card';
        card.id = `news-card-${index}`;

        const locationBadge = (news.lat && news.lng) ? '📍' : '';
        const categoryBadge = news.category ? `[${news.category}] ` : '';

        card.innerHTML = `
            <div class="news-tag">${categoryBadge}NEWS ${locationBadge}</div>
            <h3 class="news-card-title">${news.title}</h3>
            <p class="news-desc">${news.description ? news.description.substring(0, 60) + '...' : ''}</p>
            <div class="news-meta">
                <span>${date} · ${news.author || '공실뉴스'}</span>
                <a href="${news.link}" target="_blank" class="news-link">보기 &rarr;</a>
            </div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.news-card').forEach(el => el.classList.remove('active'));
            card.classList.add('active');

            if (map && news.lat && news.lng) {
                const moveLatLon = new kakao.maps.LatLng(news.lat, news.lng);
                map.panTo(moveLatLon);
                map.setLevel(4); // 확대

                // 마커 클릭 트리거 (오버레이 표시)
                // allMarkers는 renderMarkers 함수에서 채워지는 전역 배열이라고 가정
                if (allMarkers[index]) {
                    kakao.maps.event.trigger(allMarkers[index], 'click');
                }
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


    // 커스텀 마커 이미지 (파란색 원 + 숫자 1, 테두리 흰색) - Base64 SVG
    // SVG: <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="2"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-family="sans-serif" font-weight="bold" fill="white">1</text></svg>
    const svgBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiMzYjgyZjYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj4xPC90ZXh0Pjwvc3ZnPg==";

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

                const content = `
                    <div class="overlay-wrap" style="width: 300px; background: #ffffff; border-radius: 20px; padding: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.05); text-align: left; font-family: 'Pretendard', sans-serif; position: relative; z-index: 9999 !important;">
                        <div class="overlay-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <h3 class="overlay-title" style="font-size: 17px; font-weight: 700; color: #222; margin: 0; line-height: 1.35; width: 240px; word-break: keep-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${displayTitle}</h3>
                            <button class="overlay-close" onclick="closeOverlay()" style="background: none; border: none; font-size: 22px; color: #ccc; cursor: pointer; padding: 0; margin-left: 10px; line-height: 1;">×</button>
                        </div>
                        <div class="overlay-body">
                            <div class="overlay-desc" style="font-size: 13px; color: #666; margin-bottom: 12px; display: block;">${(news.description || '').length > 29 ? (news.description || '').substring(0, 29) + '...' : (news.description || '')}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="overlay-meta" style="font-size: 12px; color: #888; font-weight: 400; margin: 0;">${date} | ${news.author || '공실뉴스'}</div>
                                <a href="${news.link}" target="_blank" class="overlay-link" style="display: block; text-align: right; font-size: 12px; color: #3b82f6; text-decoration: none; font-weight: 600; margin: 0;">기사 보러가기 →</a>
                            </div>
                        </div>
                        <div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid #ffffff; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.05));"></div>
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
}

// 초기화 완료
document.addEventListener('DOMContentLoaded', () => {
    console.log('초기화 완료');
});
