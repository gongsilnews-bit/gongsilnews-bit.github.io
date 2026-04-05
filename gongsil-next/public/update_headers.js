const fs = require('fs');

const files = ['materials.html', 'community.html', 'my_study.html', 'study_detail.html'];

const supabaseHeadStr = `
    <!-- Supabase & Auth Logic -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="base_path.js"></script>
    <script src="supabase_gongsi_config.js"></script>
`;

const supabaseBodyStr = `
    <script type="module" src="supabase_auth.js"></script>
    <!-- 공실챗봇 스크립트 로드 -->
    <script src="gongsil_chatbot.js?v=20260329"></script>
`;

const newHeaderRightStr = `<div class="header-right" style="display: flex; align-items: center;">
            <div id="userProfile" style="display: none; align-items: center; gap: 10px; margin-right: 15px;">
                <span id="userNameDisplay" style="font-size: 14px; font-weight: bold; color: #333;">이름</span>
                <span id="userRoleBadge" style="font-size: 11px; padding: 3px 6px; border-radius: 4px; background: #f0f0f0; color: #555;">로딩중</span>
                <a href="#" id="headerLogoutBtn" class="btn-login" style="background:#666; color:white; border:none;">로그아웃</a>
            </div>
            <a href="#" class="btn-login" style="background:var(--primary-color, #ff9f1c); color:white; border:none; margin-right:10px;">스터디등록</a>
            <a href="#" id="headerLoginBtn" class="btn-login">구글 로그인</a>
            <a href="https://smartstore.naver.com/mygongsil/products/10361563253" target="_blank" class="btn-biz">중개사무소 가입 및 상품문의 ></a>
        </div>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add Supabase HTML header
    if (!content.includes('supabase-js@2')) {
        content = content.replace('</head>', supabaseHeadStr + '\n</head>');
    }

    // 2. Add Supabase body script
    if (!content.includes('supabase_auth.js')) {
        content = content.replace('</body>', supabaseBodyStr + '\n</body>');
    }

    // 3. Replace <div class="header-right"...> [...] </div>
    // \s\S matches across multiple lines.
    // (?=<\/header>) looks ahead to stop at the header closing tag.
    const regex = /<div class="header-right"[\s\S]*?(?=<\/header>)/;
    
    // Instead of replacing the whole regex, just replace the header-right match string
    if (regex.test(content)) {
        content = content.replace(regex, newHeaderRightStr + '\n    ');
        console.log(`Updated ${file}`);
        fs.writeFileSync(file, content, 'utf8');
    } else {
        console.log(`Could not find header-right in ${file}`);
    }
});
