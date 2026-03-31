const fs = require('fs');
let text = fs.readFileSync('news.html', 'utf8');

// 1. CSS update: detail-container styling and map-floating-mode background
text = text.replace(
    /#news-detail-view:not\(\.map-floating-mode\) \.detail-container \{[\s\S]*?background-color: #ffffff; \/\* 플로팅 뷰 자체는 지도 위에 뜨므로 하얀색 배경 유지 \*\//,
    `/* 네이버 스타일 레이아웃 (개별 카드) */
        .naver-card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            border: 1px solid #e1e4e8;
            padding: 30px 40px;
            margin-bottom: 20px;
        }

        #news-detail-view:not(.map-floating-mode) .detail-container {
            max-width: 1100px; 
            margin: 20px auto 40px; 
            /* 개별 카드가 배경을 가짐 */
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
            background-color: #eff1f3; /* 플로팅 뷰 전체 배경 회색 (네이버 스타일) */`
);

// 2. detail-container 구조 개편 (왼쪽 분리)
text = text.replace(
    /<div class="detail-container">[\s\S]*?<div class="detail-header-full" style="grid-column: 1 \/ -1; margin-bottom: 0; position: relative;">/,
    `<div class="detail-container">
                    <!-- 네이버 스타일 좌측 메인 영역 (기사, 댓글 등 분리된 카드) -->
                    <div class="detail-left-col">
                        <!-- 기사 본문 카드 -->
                        <div class="naver-card">
                            <!-- 상단 헤더 영역 -->
                            <div class="detail-header-full" style="margin-bottom: 0; position: relative;">`
);

// 본문 하단 (태그 등) 과 댓글, 추천기사 등을 별도 카드로 분리
text = text.replace(
    /<!-- 댓글 섹션 -->[\s]*<div class="comments-section" style="margin-bottom: 60px;">/,
    `</div> <!-- 본문 영역 카드 끝 -->
                        
                        <!-- 댓글 섹션 (별도 카드) -->
                        <div class="comments-section naver-card" style="margin-bottom: 20px;">`
);

// 함께 보면 좋은 뉴스
text = text.replace(
    /<!-- 하단 관련 기사 추천 -->[\s]*<div style="margin-top: 60px; padding-top: 40px; border-top: 2px solid #111;">/,
    `</div> <!-- 댓글 섹션 카드 끝 -->
                        <!-- 하단 관련 기사 추천 (별도 카드) -->
                        <div class="naver-card" style="margin-top: 0; border-top: none; padding-top: 30px;">`
);

// 좌측 컬럼 끝나는 곳
text = text.replace(
    /<\/div>[\s]*<div class="detail-sidebar">/,
    `</div>
                    </div> <!-- detail-left-col 끝 -->
                    
                    <div class="detail-sidebar">`
);

// 사이드바 분리
text = text.replace(
    /<div class="portal-sidebar-content">/,
    `<div class="portal-sidebar-content naver-card" style="padding: 25px;">`
);

text = text.replace(
    /<div class="map-sidebar-content">/,
    `<div class="map-sidebar-content naver-card" style="padding: 25px;">`
);

fs.writeFileSync('news.html', text, 'utf8');
console.log('Update Complete!');
