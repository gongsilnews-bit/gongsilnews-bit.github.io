/* gongsil_render.js */
const supabase = window.gongsiClient;
let mapInstance = null; 

document.addEventListener('DOMContentLoaded', async () => {
    console.log("gongsil_render: DOMContentLoaded");
    const listArea = document.getElementById('propertyListArea');
    if (listArea) listArea.innerHTML = '<div style="padding:20px; text-align:center; color:#4285f4; font-weight:bold;">데이터를 불러오는 중입니다... 🔄</div>';

    // 지도 초기화 및 데이터 로드 시작
    try {
        if (typeof kakao !== 'undefined' && kakao.maps) {
            kakao.maps.load(() => {
                initMap();
                loadActiveProperties(); 
            });
        } else {
            console.warn("Kakao maps SDK not found immediately. Retrying in 1s...");
            setTimeout(() => {
                if (typeof kakao !== 'undefined') {
                    kakao.maps.load(() => {
                        initMap();
                        loadActiveProperties();
                    });
                }
            }, 1000);
        }
    } catch (e) {
        console.error("Initialization error:", e);
        if (listArea) listArea.innerHTML = `<div style="padding:20px; text-align:center; color:red;">초기화 오류: ${e.message}</div>`;
    }
});

function initMap() {
    const container = document.getElementById('map');
    if (!container) return;
    try {
        const options = {
            center: new kakao.maps.LatLng(37.5665, 126.9780), 
            level: 8
        };
        mapInstance = new kakao.maps.Map(container, options);
        window.mapInstance = mapInstance; 
        console.log('gongsil_render: 지도 초기화 완료');
    } catch (e) {
        console.error("Map init error:", e);
    }
}

let allActiveProperties = [];

async function loadActiveProperties() {
    const listArea = document.getElementById('propertyListArea');
    const countHeader = document.querySelector('#listCountHeader span');
    
    if (!supabase) {
        console.error("Supabase client not found.");
        if (listArea) listArea.innerHTML = '<div style="padding:20px; text-align:center; color:red;">Supabase 설정 오류</div>';
        return;
    }

    try {
        let userRole = 'guest';
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            const { data: profile } = await supabase.from('members').select('role').eq('id', session.user.id).maybeSingle();
            if (profile) userRole = profile.role;
        }
        window.currentUserRole = userRole;

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allActiveProperties = data || [];
        console.log("Loaded properties:", allActiveProperties.length);
        
        if (countHeader) countHeader.textContent = `지역 목록 ${allActiveProperties.length}개`;

        renderPropertyCards(allActiveProperties);
        addMarkersToMap(allActiveProperties);
    } catch (e) {
        console.error("Data load error:", e);
        if (listArea) listArea.innerHTML = `<div style="padding:20px; text-align:center; color:red;">데이터 로드 오류: ${e.message}</div>`;
    }
}

function renderPropertyCards(props) {
    const listArea = document.getElementById('propertyListArea');
    if (!listArea) return;
    listArea.innerHTML = '';

    if (props.length === 0) {
        listArea.innerHTML = '<div style="padding:50px 20px; text-align:center; color:#999;">등록된 공실매물이 없습니다.</div>';
        return;
    }

    props.forEach(p => {
        try {
            const card = document.createElement('div');
            // 매물 아이디 일치 여부에 따라 active 상태 유지
            if (p.id === window.currentlySelectedPropertyId) {
                card.className = 'property-card active';
            } else {
                card.className = 'property-card';
            }
            card.id = `property-card-${p.id}`;
            card.onclick = () => {
                const detailView = document.getElementById('propertyDetailView');
                const isPanelOpen = detailView && detailView.style.display === 'flex';
                
                if (window.currentlySelectedPropertyId === p.id && isPanelOpen) {
                    if (typeof window.hidePropertyDetail === 'function') {
                        window.hidePropertyDetail();
                    } else {
                        card.classList.remove('active');
                        window.currentlySelectedPropertyId = null;
                        if (detailView) detailView.style.display = 'none';
                    }
                } else {
                    document.querySelectorAll('.property-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    window.currentlySelectedPropertyId = p.id;
                    if (typeof window.showPropertyDetail === 'function') {
                        window.showPropertyDetail(p);
                    }
                }
            };
            
            const priceStr = formatPriceDisplay(p);
            const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/150/EEEEEE/999999?text=No+Image';

            // 아파트/오피스텔 상단 이름
            let propTitle = p.building_name || p.property_type || '공실매물';
            if (p.main_category === '아파트·오피스텔') {
                let aptName = p.building_name || p.property_type || '';
                let dongStr = '';
                if (p.dong_number) dongStr = String(p.dong_number).includes('동') ? p.dong_number : `${p.dong_number}동`;
                let roomStr = '';
                if (p.room_number) roomStr = String(p.room_number).includes('호') ? p.room_number : `${p.room_number}호`;
                let tempStr = `${aptName} ${dongStr} ${roomStr}`.trim();
                if (tempStr) propTitle = tempStr;
            }

            const badgeText = (function(pf) {
                if (!pf) return '공실매물';
                if (pf.includes('100') || pf.includes('양타')) return '수수료100%';
                if (pf.includes('50') || pf.includes('단타')) return '수수료50%';
                if (pf.includes('25')) return '수수료25%';
                if (pf.includes('공동')) return '공동중개';
                return '공동중개';
            })(p.brokerage_fee);

            // 면적 표시
            const supAreaM2 = p.supply_area ? parseFloat(p.supply_area) : 0;
            const excAreaM2 = p.dedicated_area ? parseFloat(p.dedicated_area) : (p.area ? parseFloat(p.area) : 0);
            const fmtM2P = (m2) => m2 ? `${m2}㎡(${(m2 / 3.3058).toFixed(1)}평)` : '';
            let areaDisplay = '';
            if (supAreaM2 && excAreaM2) areaDisplay = `${fmtM2P(supAreaM2)} / ${fmtM2P(excAreaM2)}`;
            else if (supAreaM2) areaDisplay = fmtM2P(supAreaM2);
            else if (excAreaM2) areaDisplay = fmtM2P(excAreaM2);
            else areaDisplay = '정보없음';

            // 서브 정보: 물건종류 | 방향 | 면적
            const directionStr = p.room_direction || p.direction || '';
            let subInfoArr = [];
            if (p.property_type) subInfoArr.push(p.property_type);
            if (directionStr) subInfoArr.push(directionStr);
            if (areaDisplay !== '정보없음') subInfoArr.push(areaDisplay);
            const subInfoHtml = subInfoArr.join(' <span style="color:#ddd; margin:0 4px;">|</span> ');

            // 룸/옵션 정보
            const optionsStr = (p.options && Array.isArray(p.options) && p.options.length > 0) ? p.options.join(', ') : '';
            let roomFeatureArr = [];
            roomFeatureArr.push(`룸 ${p.room_count||'0'}개`);
            if (p.bathroom_count) roomFeatureArr.push(`욕실 ${p.bathroom_count}개`);
            if (optionsStr) roomFeatureArr.push(optionsStr);
            const roomInfoHtml = roomFeatureArr.join(', ');

            // 등록일
            const regDate = new Date(p.created_at);
            const dateStr = `${regDate.getFullYear()}.${String(regDate.getMonth()+1).padStart(2,'0')}.${String(regDate.getDate()).padStart(2,'0')}.`;

            let imgHtml = '';
            if (p.images && p.images.length > 0) {
                imgHtml = `<div class="property-image"><img src="${p.images[0]}" alt="매물사진"></div>`;
            } else {
                imgHtml = `<div class="property-image"><img src="https://via.placeholder.com/150/EEEEEE/999999?text=No+Image" alt="매물사진"></div>`;
            }

            card.innerHTML = `
                        <div class="property-info" style="${imgHtml ? '' : 'width: 100%;'}">
                            <div class="card-prop-title">${propTitle}</div>
                            <div class="card-price">${priceStr}</div>
                            <div class="card-prop-sub">${subInfoHtml}</div>
                            <div class="card-prop-rooms">${roomInfoHtml}</div>
                            <div class="card-prop-footer">
                                <span class="tag-confirm">${badgeText}</span>
                                <span class="card-prop-date">${dateStr}</span>
                            </div>
                        </div>
                        ${imgHtml}
                    `;
            listArea.appendChild(card);
        } catch (e) {
            console.error("Card render error:", e, p);
        }
    });
}

function formatPriceDisplay(p) {
    const dep = formatPriceValue(p.deposit);
    if (p.trade_type === '매매' || p.trade_type === '전세') return `${p.trade_type} ${dep}`;
    return `${p.trade_type} ${dep}/${p.monthly_rent || 0}`;
}

function formatPriceValue(val) {
    val = Number(val);
    if (!val || val === 0) return '0';
    if (val >= 10000) {
        const uk = Math.floor(val / 10000);
        const man = val % 10000;
        return man > 0 ? `${uk}억 ${man}` : `${uk}억`;
    }
    return val.toLocaleString();
}

window.showPropertyDetail = function(p) {
    const detailView = document.getElementById('propertyDetailView');
    if (!detailView) return;

    try {
        // --- 노출 영역 블라인드 처리 추가 ---
        let detailOverlay = document.getElementById('exposureBlindOverlay_render');
        if (!detailOverlay) {
            detailOverlay = document.createElement('div');
            detailOverlay.id = 'exposureBlindOverlay_render';
            detailOverlay.innerHTML = `
                <div style="text-align:center; padding: 40px; margin-top: 150px;">
                    <h2 style="font-size: 26px; color: #1a73e8; margin-bottom: 25px;">공동중개물건입니다</h2>
                    <h2 style="font-size: 32px; color: #1a73e8; margin-bottom: 35px; line-height: 1.4;">부동산회원만<br>열람할 수 있습니다</h2>
                    <a href="#" onclick="if(document.getElementById('headerLoginBtn')) document.getElementById('headerLoginBtn').click(); return false;" style="font-size: 22px; color: #1a73e8; font-weight: bold; text-decoration: none;">구글 로그인으로 회원가입/로그인 >></a>
                </div>
            `;
            detailOverlay.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.92); z-index: 50; display: flex; align-items: flex-start; justify-content: center; backdrop-filter: blur(2px);";
            detailView.appendChild(detailOverlay);
        }

        if (p.exposure_target === 'realtor_only' && window.currentUserRole !== 'realtor' && window.currentUserRole !== 'admin') {
            detailOverlay.style.display = 'flex';
        } else {
            detailOverlay.style.display = 'none';
        }

        const priceStr = formatPriceDisplay(p);
        
        detailView.querySelector('.detail-price-title').textContent = priceStr;
        const metaTop = detailView.querySelector('.detail-meta-top');
        if (metaTop) {
            const regDate = new Date(p.created_at);
            metaTop.innerHTML = `<span>등록번호 ${p.id}</span><span>${regDate.toLocaleDateString()}</span>`;
        }

        detailView.querySelector('.detail-loc-text').textContent = `${p.sido || ''} ${p.sigungu || ''} ${p.dong || ''} · 관리비 ${p.maintenance_fee || 0}만원`;
        detailView.querySelector('.detail-desc-box').textContent = p.description || '상세 설명이 없습니다.';
        detailView.querySelector('.bottom-price').textContent = priceStr;
        
        const features = detailView.querySelectorAll('.feature-item');
        if (features[0]) features[0].innerHTML = `<div class="feature-icon">📐</div>전용 ${p.area || '-'}㎡`;
        if (features[1]) features[1].innerHTML = `<div class="feature-icon">🚪</div>${p.room_count || '-'} (욕실 ${p.bathroom_count || '-'}개)`;
        
        const galleryImg = detailView.querySelector('.detail-gallery img');
        if (galleryImg) {
            galleryImg.src = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/600x400/DDDDDD/666666?text=No+Image';
        }

        if (typeof window.fetchApartmentPublicData === 'function') {
            window.fetchApartmentPublicData(p);
        }

        detailView.style.display = 'flex';
    } catch (e) {
        console.error("Detail show error:", e);
    }
};

window.hidePropertyDetail = function() {
    const detailView = document.getElementById('propertyDetailView');
    if (detailView) detailView.style.display = 'none';
};

function addMarkersToMap(props) {
    if (!window.mapInstance) {
        console.warn("Map instance not ready for markers.");
        return;
    }
    
    // Clear existing markers
    if (propertyMarkers) {
        propertyMarkers.forEach(marker => marker.setMap(null));
    }
    propertyMarkers = []; // Reset the array

    const geocoder = new kakao.maps.services.Geocoder();

    props.forEach(p => {
        const isGeneralBuilding = p.main_category === '상가·업무·공장·토지' || p.main_category === '빌라·주택';
        let searchAddr = `${p.sido || ''} ${p.sigungu || ''} ${p.dong || ''} ${p.detail_address || ''}`;
        if (p.is_room_private && isGeneralBuilding) {
            searchAddr = `${p.sido || ''} ${p.sigungu || ''} ${p.dong || ''}`;
        }

        geocoder.addressSearch(searchAddr, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                
                let markerConfig = {
                    map: window.mapInstance,
                    position: coords
                };
                if (p.is_room_private && isGeneralBuilding) {
                    const svgObj = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="30" fill="%233b82f6" fill-opacity="0.4"/></svg>`;
                    markerConfig.image = new kakao.maps.MarkerImage(`data:image/svg+xml;utf8,${svgObj}`, new kakao.maps.Size(80, 80), { offset: new kakao.maps.Point(40, 40) });
                }
                
                const marker = new kakao.maps.Marker(markerConfig);
                marker.propertyData = p; // Store property data in marker
                propertyMarkers.push(marker);

                const infowindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:12px;">${formatPriceDisplay(p)}</div>`
                });

                kakao.maps.event.addListener(marker, 'click', () => {
                    // 지도 클릭 시 리스트 활성화 연동
                    document.querySelectorAll('.property-card').forEach(c => c.classList.remove('active'));
                    const targetCard = document.getElementById(`property-card-${p.id}`);
                    if (targetCard) {
                        targetCard.classList.add('active');
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }

                    showPropertyDetail(p);
                    infowindow.open(window.mapInstance, marker);
                    setTimeout(() => infowindow.close(), 3000);
                });
                
                // 마커를 지도 중심 근처로 이동 (하나만 있다면)
                // if (props.length === 1) window.mapInstance.setCenter(coords);
            }
        });
    });
}
