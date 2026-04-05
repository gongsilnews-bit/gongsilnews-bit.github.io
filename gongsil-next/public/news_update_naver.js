const fs = require('fs');
let html = fs.readFileSync('news.html', 'utf8');

// 1. CSS
html = html.replace(
    /#news-detail-view:not\(\.map-floating-mode\) \.detail-container \{[\s\S]*?background-color: #ffffff; \/\* 플로팅 뷰 자체는 지도 위에 뜨므로 하얀색 배경 유지 \*\//,
    `/* 네이버 뉴스 스타일 박스 렌더링 컨벤션 */
        .naver-style-card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
            border: 1px solid #e5e7eb;
            padding: 25px 35px;
            margin-bottom: 20px;
        }

        #news-detail-view:not(.map-floating-mode) .detail-container {
            max-width: 1100px; 
            margin: 20px auto 40px; 
            /* 내부 카드들이 배경을 가지므로 래퍼는 투명 */
        }

        /* 우리동네부동산 맵 위 플로팅 모드 (뉴스/칼럼과 동일한 레이아웃 + 지도 노출) */
        #news-detail-view.map-floating-mode {
            width: 1100px; /* 뉴스/칼럼 폭(1100px)과 동일하게 고정 */
            max-width: 100%; /* 모바일 대응 */
            height: 100%;
            border-right: 1px solid #ddd;
            box-shadow: 5px 0 20px rgba(0,0,0,0.1);
            animation: fadeIn 0.2s ease;
            position: absolute;
            left: 0;
            top: 0;
            background-color: #eff1f3; /* 플로팅 뷰 전체 회색 배경 처리 (네이버 뉴스 레이아웃) */
            padding-top: 10px;`
);

// 2. Wrap header and content in Left Col + First Card
html = html.replace(
    /<div class="detail-container">[\s]*<!-- 상단 헤더 영역.*?-->[\s]*<div class="detail-header-full"/,
    `<div class="detail-container">
                    <div class="detail-left-col">
                        <div class="naver-style-card">
                            <div class="detail-header-full"`
);

// 3. Close First Card & Open Second Card for FooterArea
html = html.replace(
    /<!-- 공통 기사 하단 영역 \(태그, 기자 정보, 댓글\) -->[\s]*<div id="articleFooterArea" style="margin-top: 40px; display: none;">/,
    `</div> <!-- .naver-style-card (본문) 끝 -->
                        
                        <!-- 공통 기사 하단 영역 (태그, 기자 정보, 댓글) -->
                        <div id="articleFooterArea" class="naver-style-card" style="margin-top: 0; display: none;">`
);

// 4. Close Second Card & Open Third Card for Related Articles
html = html.replace(
    /<!-- 하단 관련 기사 추천 -->[\s]*<div style="margin-top: 60px; padding-top: 40px; border-top: 2px solid #111;">/,
    `</div> <!-- #articleFooterArea .naver-style-card 끝 -->
                        
                        <!-- 하단 관련 기사 추천 -->
                        <div class="naver-style-card" style="margin-top: 0;">`
);

// 5. Close Left Col before sidebar
html = html.replace(
    /<\/div>[\s]*<div class="detail-sidebar">/,
    `</div> <!-- 하단 기사 추천 .naver-style-card 끝 -->
                        </div> <!-- detail-left-col 끝 -->
                    </div> <!-- detail-content 안남은 흔적 끝 (필요 시) -->
                    <div class="detail-sidebar">`
);

// Clean up mismatched </div> from .detail-content which was wrapped inside left-col
// In the original, detail-content had `</div>` before `<div class="detail-sidebar">`. We replaced it above, but need to be careful with nesting.
html = html.replace(
    `</div> <!-- 하단 기사 추천 .naver-style-card 끝 -->
                        </div> <!-- detail-left-col 끝 -->
                    </div> <!-- detail-content 안남은 흔적 끝 (필요 시) -->
                    <div class="detail-sidebar">`,
    `</div> <!-- 하단 기사 추천 .naver-style-card 끝 -->
                    </div> <!-- detail-left-col 끝 -->
                    <div class="detail-sidebar">`
);

// 6. Right Sidebar Cards
html = html.replace(
    /<div class="portal-sidebar-content">/,
    `<div class="portal-sidebar-content naver-style-card" style="padding: 25px;">`
);
html = html.replace(
    /<div class="map-sidebar-content">/,
    `<div class="map-sidebar-content naver-style-card" style="padding: 25px;">`
);

fs.writeFileSync('news.html', html, 'utf8');
console.log('news.html Naver layout refactored!');
