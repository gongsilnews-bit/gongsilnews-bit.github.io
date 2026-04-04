
// [공실 프로젝트] 인증 스크립트 - gongsiClient가 준비된 후에 실행됨

function _gongsiAuthInit(supabase) {
    // UI 요소
    const loginBtns = document.querySelectorAll('#headerLoginBtn, .headerLoginBtn');
    const logoutBtns = document.querySelectorAll('#headerLogoutBtn, .headerLogoutBtn');
    const userProfiles = document.querySelectorAll('#userProfile, .userProfile');
    const userNameDisplays = document.querySelectorAll('#userNameDisplay, .userNameDisplay');
    const userRoleBadges = document.querySelectorAll('#userRoleBadge, .userRoleBadge');

    // 로그인 상태 변경 처리
    async function handleAuthStateChange(user) {
        if (user) {
            loginBtns.forEach(btn => btn.style.display = 'none');
            userProfiles.forEach(p => { p.style.display = 'flex'; p.style.alignItems = 'center'; });
            userNameDisplays.forEach(d => d.textContent = user.user_metadata?.full_name || user.email.split('@')[0]);
            userRoleBadges.forEach(b => b.textContent = "정보 확인중...");
            await handleUserDocument(user);
        } else {
            loginBtns.forEach(btn => btn.style.display = 'inline-block');
            userProfiles.forEach(p => p.style.display = 'none');
            window.currentUser = null;
            localStorage.removeItem('gongsil_user');
        }
    }

    // 구글 로그인 실제 실행 함수
    window.executeGoogleOAuth = async function(redirectUrl) {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: { prompt: 'select_account' }
                }
            });
            if (error) {
                console.error("로그인 에러:", error);
                alert("구글 로그인 오류: " + error.message);
            }
        } catch(err) {
            console.error("로그인 처리 에러:", err);
            alert("로그인 에러: " + err.message);
        }
    };

    // 공실뉴스 특화 로그인 안내 모달 표시
    function showGongsilLoginModal(redirectUrl, action) {
        let modal = document.getElementById('gongsilLoginModal');
        if (!modal) {
            // 동적 스타일 추가
            const style = document.createElement('style');
            style.innerHTML = `
                .gongsil-login-modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(3px); display:flex; justify-content:center; align-items:center; z-index:9999999; }
                .glb-box { background:#fff; border-radius:12px; width:400px; max-width:90%; box-shadow:0 10px 40px rgba(0,0,0,0.2); position:relative; overflow:hidden; animation: glbPopup 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
                @keyframes glbPopup { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                .glb-close { position:absolute; top:15px; right:15px; font-size:24px; color:#aaa; background:none; border:none; cursor:pointer; font-weight:300; transition:color 0.2s; padding:5px; }
                .glb-close:hover { color:#111; }
                .glb-tabs { display:flex; justify-content:center; gap:12px; padding: 0 40px; margin-top:40px; margin-bottom: 25px; }
                .glb-tab { flex:1; text-align:center; padding:12px 0; border:1px solid #ddd; border-radius:6px; cursor:pointer; color:#444; background:#fff; font-size:14px; font-weight:bold; transition:all 0.2s; }
                .glb-tab:hover { background:#f4f6fa; border-color:#ccc; color:#1e56a0; }
                .glb-body { background:#f8f9fa; margin:0 25px 25px 25px; border-radius:12px; padding:30px 25px; text-align:center; }
                .glb-circle-logo { width:65px; height:65px; background:#fff; border-radius:50%; margin:0 auto 18px; display:flex; justify-content:center; align-items:center; font-weight:900; color:#1e56a0; font-size:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03); }
                .glb-title { font-size:18px; font-weight:800; color:#111; margin-bottom:12px; }
                .glb-desc { font-size:13.5px; color:#555; line-height:1.5; margin-bottom:20px; word-break:keep-all; }
                .glb-features { text-align:left; border-top:1px solid #e5e5e5; border-bottom:1px solid #e5e5e5; padding:20px 0; margin-bottom:20px; font-size:13px; color:#444; line-height:1.8; }
                .glb-features li { position:relative; padding-left:14px; margin-bottom:8px; }
                .glb-features li:last-child { margin-bottom:0; }
                .glb-features li::before { content:'·'; position:absolute; left:0; color:#1e56a0; font-weight:900; font-size:16px; line-height:1.2; }
                .glb-action { margin-bottom:10px; font-size:13px; color:#666; }
                .glb-btn-google { display:flex; align-items:center; justify-content:center; width:100%; border:1px solid #ddd; background:#fff; color:#222; font-size:15px; font-weight:bold; padding:14px; border-radius:8px; cursor:pointer; transition:background 0.2s; gap:10px; }
                .glb-btn-google:hover { background:#f1f1f1; }
                .glb-btn-google img { width:20px; height:20px; }
                .glb-footer { text-align:center; padding:15px; font-size:12px; color:#888; border-top:1px solid #f0f0f0; background:#fff; cursor:pointer; }
            `;
            document.head.appendChild(style);

            modal = document.createElement('div');
            modal.id = 'gongsilLoginModal';
            modal.className = 'gongsil-login-modal';
            modal.innerHTML = `
                <div class="glb-box" id="glbBox">
                    <button class="glb-close" onclick="document.getElementById('gongsilLoginModal').style.display='none'">&times;</button>
                    
                    <div class="glb-tabs">
                        <div class="glb-tab" onclick="document.getElementById('glbBtnGoogle').click();"><span style="margin-right:6px;">👤</span>회원가입</div>
                        <div class="glb-tab" onclick="document.getElementById('glbBtnGoogle').click();"><span style="margin-right:6px;">👤</span>로그인</div>
                    </div>

                    <div class="glb-body">
                        <div class="glb-circle-logo">공실뉴스</div>
                        <h3 class="glb-title">공실뉴스 회원이 되어 보세요</h3>
                        <p class="glb-desc">지금 바로 공실뉴스 회원으로 가입하시고, 독점 혜택을 누려보세요</p>
                        
                        <ul class="glb-features">
                            <li>프리미엄 부동산 뉴스와 분석 보고서 접근</li>
                            <li>동네별 실시간 공실 및 매물 동향 최신 정보</li>
                            <li>공실뉴스만의 독자적인 부동산 지수 열람</li>
                            <li>온/오프라인 세미나 우선 참가 기회</li>
                        </ul>
                        
                        <div class="glb-action">이미 회원이시면 <b>로그인</b>을 클릭해 주세요</div>
                        <button class="glb-btn-google" id="glbBtnGoogle">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google">
                            Google 계정으로 계속하기
                        </button>
                    </div>
                    
                    <div class="glb-footer" onclick="window.location.href='#'">
                        고객센터
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
        
        // 실행 버튼에 리다이렉트 URL 주입 이벤트 할당
        const btn = document.getElementById('glbBtnGoogle');
        // 기존 이벤트 리스너가 있다면 제거하기 위해 cloneNode 기법 사용
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            window.executeGoogleOAuth(redirectUrl);
        });

        const titleEl = modal.querySelector('.glb-title');
        const descEl = modal.querySelector('.glb-desc');
        if (action === 'login') {
            titleEl.textContent = '반갑습니다! 공실뉴스 로그인';
            descEl.textContent = '로그인하시고 공실뉴스만의 혜택을 누려보세요';
        } else {
            titleEl.textContent = '공실뉴스 회원이 되어 보세요';
            descEl.textContent = '지금 바로 공실뉴스 회원으로 가입하시고, 독점 혜택을 누려보세요';
        }
        modal.style.display = 'flex';
    }

    // 로그인 클릭 핸들러
    window.handleLoginClick = async function(e, action = 'signup') {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        try {
            let redirectPath = window.location.pathname;
            if (redirectPath !== '/' && !redirectPath.endsWith('.html') && !redirectPath.endsWith('/')) {
                redirectPath += '.html';
            }
            const redirectUrl = window.location.origin + redirectPath + window.location.search;
            
            // 모달 노출 (실제 구글 로그인은 모달 내 버튼에서 처리)
            showGongsilLoginModal(redirectUrl, action);

        } catch(err) {
            console.error("로그인 모달 표시 에러:", err);
        }
    };

    // 로그인 버튼에 이벤트 연결
    loginBtns.forEach(btn => btn.addEventListener('click', e => {
        // Find if this specific button says 로그인
        const isLogin = e.target.textContent.includes('로그인') || e.target.id === 'headerLoginOnlyBtn';
        window.handleLoginClick(e, isLogin ? 'login' : 'signup');
    }));

    // 로그아웃 버튼에 이벤트 연결
    logoutBtns.forEach(btn => btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signOut();
        if (!error) window.location.reload();
    }));

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthStateChange(session?.user ?? null);
    });

    // 세션 변경 감지
    supabase.auth.onAuthStateChange(async (event, session) => {
        handleAuthStateChange(session?.user ?? null);
    });

    // 스크립트 동적 로드 함수 (회원가입 모달에서 주소 검색/압축용)
    function loadScript(src, id) {
        return new Promise((resolve) => {
            if (document.getElementById(id)) { return resolve(); }
            const s = document.createElement('script');
            s.id = id; s.src = src; s.onload = resolve;
            document.head.appendChild(s);
        });
    }

    // 신규 가입 전용 정보 입력 모달(팝업)
    async function showRegisterProfileModal(user) {
        // 필수 의존성 스크립트 로드
        await loadScript("https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js", "img-compress-js");
        await loadScript("https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js", "daum-postcode-js");

        let modal = document.getElementById('gongsilRegisterModal');
        if (!modal) {
            const style = document.createElement('style');
            style.innerHTML = `
                .greg-modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:flex-start; padding:20px 16px; box-sizing:border-box; overflow-y:auto; z-index:9999999; }
                .greg-box { background:#fff; border-radius:14px; width:100%; max-width:440px; box-shadow:0 10px 40px rgba(0,0,0,0.2); position:relative; padding:28px 28px 24px; animation: gregPopup 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); margin-bottom: 20px; }
                @keyframes gregPopup { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                .greg-header { text-align:center; margin-bottom:20px; }
                .greg-header h2 { font-size:18px; font-weight:800; color:#111; margin:0 0 6px 0; }
                .greg-header p { font-size:12px; color:#666; margin:0; }
                .greg-label { display:block; font-size:12px; font-weight:700; color:#444; margin-bottom:4px; }
                .greg-input { width:100%; padding:9px 10px; border:1.5px solid #ddd; border-radius:7px; font-size:13px; margin-bottom:11px; box-sizing:border-box; transition:border 0.2s; background:#fdfdfd; font-family:inherit;}
                .greg-input:focus { outline:none; border-color:#1e56a0; background:#fff; box-shadow:0 0 0 3px rgba(30,86,160,0.1); }
                .greg-input[readonly] { background:#f1f5f9; color:#666; }
                .greg-roles { display:flex; gap:8px; margin-bottom:16px; }
                .greg-role-btn { flex:1; padding:10px; border:2px solid #eee; border-radius:8px; background:#fff; cursor:pointer; text-align:center; transition:all 0.2s; }
                .greg-role-btn span { display:block; font-size:12px; font-weight:800; color:#666; margin-top:3px; }
                .greg-role-btn.active { border-color:#1e56a0; background:#f4f6fa; }
                .greg-role-btn.active span { color:#1e56a0; }
                #gregRealtorFields { display:none; background:#f8f9fa; border:1px solid #e0e0e0; padding:14px; border-radius:10px; margin-bottom:16px; }
                .greg-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                .greg-full { grid-column:span 2; }
                .greg-row { display:flex; gap:8px; margin-bottom:8px; }
                .greg-btn-sm { padding:0 10px; background:#333; color:#fff; border:none; border-radius:6px; font-size:12px; cursor:pointer; font-weight:bold; white-space:nowrap;}
                .greg-file-box { border:1.5px dashed #ccc; padding:10px; border-radius:8px; text-align:center; cursor:pointer; position:relative; background:#fff; margin-bottom:10px; transition:border 0.2s;}
                .greg-file-box:hover { border-color:#1e56a0; }
                .greg-file-box input { position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; }
                .greg-file-msg { font-size:11px; color:#888; pointer-events:none; }
                .greg-terms { border-top:1px solid #eee; padding-top:14px; margin-bottom:18px; }
                .greg-term-item { display:flex; gap:7px; margin-bottom:5px; font-size:12px; color:#555; cursor:pointer; align-items:flex-start; }
                .greg-term-item input { width:15px; height:15px; accent-color:#1e56a0; cursor:pointer; margin-top:1px; flex-shrink:0; }
                .greg-term-item-label { flex:1; }
                .greg-term-toggle { background:none; border:1px solid #cde; cursor:pointer; font-size:10px; color:#1e56a0; padding:1px 5px; flex-shrink:0; transition:transform 0.25s; line-height:1.4; border-radius:3px; }
                .greg-term-toggle.open { transform:rotate(180deg); }
                .greg-term-box { max-height:0; overflow:hidden; font-size:11px; color:#666; background:#f9f9f9; padding:0 10px; border:0px solid #ddd; border-radius:5px; margin:0 0 3px 26px; line-height:1.6; transition:max-height 0.35s ease, padding 0.25s ease, border-width 0.1s; }
                .greg-term-box.open { max-height:140px; overflow-y:auto; padding:10px; border:1px solid #ddd; margin-bottom:10px; }
                .greg-term-box::-webkit-scrollbar { width:5px; }
                .greg-term-box::-webkit-scrollbar-thumb { background:#ccc; border-radius:3px; }
                .greg-submit { width:100%; padding:12px; background:#1e56a0; color:#fff; border:none; border-radius:9px; font-size:14px; font-weight:bold; cursor:pointer; transition:background 0.2s; box-shadow:0 4px 12px rgba(30,86,160,0.3); font-family:inherit;}
                .greg-submit:hover { background:#16427d; }
                .greg-submit:disabled { background:#ccc; cursor:not-allowed; box-shadow:none; }
                .greg-loader { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.9); z-index:10; display:none; flex-direction:column; justify-content:center; align-items:center; border-radius:14px; }
                .greg-spinner { width:36px; height:36px; border:3px solid #f3f3f3; border-top:3px solid #1e56a0; border-radius:50%; animation:gregSpin 1s linear infinite; margin-bottom:12px; }
                @keyframes gregSpin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
            `;
            document.head.appendChild(style);

            modal = document.createElement('div');
            modal.id = 'gongsilRegisterModal';
            modal.className = 'greg-modal';
            modal.innerHTML = `
                <div class="greg-box">
                    <div id="gregLoader" class="greg-loader">
                        <div class="greg-spinner"></div>
                        <p id="gregLoaderMsg" style="font-weight:bold; color:#1e56a0; font-size:15px;">정보 저장 중...</p>
                    </div>

                    <div class="greg-header">
                        <h2>공실뉴스 가입 마무리!</h2>
                        <p>원활한 서비스 이용을 위해 필수 정보를 입력해 주세요.</p>
                    </div>

                    <form id="gregForm">
                        <label class="greg-label">이메일 (확인전용)</label>
                        <input type="email" id="gregEmail" class="greg-input" value="${user.email}" readonly>

                        <label class="greg-label">이름 <span style="color:red">*</span></label>
                        <input type="text" id="gregName" class="greg-input" value="${user.user_metadata?.full_name || ''}" placeholder="성함을 입력하세요" required>

                        <label class="greg-label">연락처 <span style="color:red">*</span></label>
                        <input type="tel" id="gregPhone" class="greg-input" placeholder="010-0000-0000" required>

                        <label class="greg-label">활동 유형 <span style="color:red">*</span></label>
                        <div class="greg-roles">
                            <div class="greg-role-btn active" data-role="general">
                                <span style="font-size:24px; margin-bottom:5px;">👤</span>
                                <span>일반 회원</span>
                            </div>
                            <div class="greg-role-btn" data-role="realtor">
                                <span style="font-size:24px; margin-bottom:5px;">🏘️</span>
                                <span>부동산 회원</span>
                            </div>
                        </div>
                        <input type="hidden" id="gregRoleVal" value="general">

                        <!-- 부동산 회원 필드 -->
                        <div id="gregRealtorFields">
                            <h3 style="font-size:13px; margin:0 0 12px 0; color:#111; padding-bottom:7px; border-bottom:1px solid #ccc;">🏢 부동산 / 기업 정보 입력</h3>

                            <!-- 안내 메시지 -->
                            <div style="background:#fff8e1; border:1px solid #ffe082; border-radius:7px; padding:10px 12px; margin-bottom:14px; font-size:11.5px; color:#7a5800; line-height:1.6;">
                                ⚠️ <strong>상호명, 대표자명, 휴대번호, 주소</strong>는 필수 입력 항목입니다.<br>
                                나머지 항목(사업자번호, 등록증 첨부 등)은 나중에 <strong>정보 수정</strong>에서 완료하실 수 있습니다.<br>
                                단, <strong>미입력 항목이 있으면 공실 매물 등록이 제한</strong>됩니다.
                            </div>

                            <div class="greg-grid">
                                <div>
                                    <label class="greg-label">상호명 <span style="color:red">*</span></label>
                                    <input type="text" id="gregCompName" class="greg-input greg-req" placeholder="예: 공실뉴스 부동산중개">
                                </div>
                                <div>
                                    <label class="greg-label">대표자명 <span style="color:red">*</span></label>
                                    <input type="text" id="gregCeo" class="greg-input greg-req" placeholder="대표자 성함">
                                </div>
                                <div>
                                    <label class="greg-label" style="color:#888;">중개등록번호 <span style="font-size:10px; color:#aaa;">(선택)</span></label>
                                    <input type="text" id="gregCompReg" class="greg-input" placeholder="등록번호 입력">
                                </div>
                                <div>
                                    <label class="greg-label" style="color:#888;">사업자등록번호 <span style="font-size:10px; color:#aaa;">(선택)</span></label>
                                    <input type="text" id="gregBizReg" class="greg-input" placeholder="000-00-00000">
                                </div>
                                <div>
                                    <label class="greg-label" style="color:#888;">일반번호 <span style="font-size:10px; color:#aaa;">(선택)</span></label>
                                    <input type="tel" id="gregTel" class="greg-input" placeholder="02-000-0000">
                                </div>
                                <div>
                                    <label class="greg-label">휴대번호 <span style="color:red">*</span></label>
                                    <input type="tel" id="gregCell" class="greg-input greg-req" placeholder="010-0000-0000">
                                </div>
                                <div class="greg-full">
                                    <label class="greg-label">부동산 주소 <span style="color:red">*</span></label>
                                    <div class="greg-row">
                                        <input type="text" id="gregZip" class="greg-input greg-req" style="margin:0; flex:1;" placeholder="우편번호" readonly>
                                        <button type="button" class="greg-btn-sm" id="gregBtnZip">주소 찾기</button>
                                    </div>
                                    <input type="text" id="gregAddr" class="greg-input greg-req" style="margin-bottom:8px;" placeholder="기본 주소" readonly>
                                    <input type="text" id="gregAddrDet" class="greg-input" placeholder="상세 주소 (선택)">
                                </div>
                                <div class="greg-full">
                                    <label class="greg-label" style="color:#888;">사업자등록증 첨부 <span style="font-size:10px; color:#aaa;">(선택 — 나중에 정보수정에서 업로드 가능)</span></label>
                                    <div class="greg-file-box">
                                        <div class="greg-file-msg" id="gregFileMsg1">📸 클릭하여 파일 첨부 (사진)</div>
                                        <input type="file" id="gregFile1" accept="image/*">
                                    </div>
                                </div>
                                <div class="greg-full">
                                    <label class="greg-label" style="color:#888;">중개등록증 첨부 <span style="font-size:10px; color:#aaa;">(선택 — 나중에 정보수정에서 업로드 가능)</span></label>
                                    <div class="greg-file-box">
                                        <div class="greg-file-msg" id="gregFileMsg2">📸 클릭하여 파일 첨부 (사진)</div>
                                        <input type="file" id="gregFile2" accept="image/*">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="greg-terms">
                            <label class="greg-term-item" style="border-bottom:2px solid #1e56a0; padding-bottom:10px; margin-bottom:12px; font-size:13px; font-weight:800; color:#111;">
                                <input type="checkbox" id="gregChkAll" style="width:20px; height:20px;">
                                <div>
                                    모두 동의합니다.<br>
                                    <span style="font-size:11px; font-weight:normal; color:#666; margin-top:4px; display:block;">약관, 개인정보 수집 및 이용 안내, 제3자 정보제공, 서비스 홍보 및 마케팅 활용에 모두 동의.</span>
                                </div>
                            </label>

                            <label class="greg-term-item">
                                <input type="checkbox" class="greg-chk-ind" id="gregChk1" required>
                                <span class="greg-term-item-label"><strong>[필수]</strong> 이용약관동의</span>
                                <button type="button" class="greg-term-toggle" data-target="gregTermBox1" title="내용 보기">▼</button>
                            </label>
                            <div class="greg-term-box" id="gregTermBox1">
                                제 1 조 목적<br>이 약관은 공실뉴스(이하 회사)가 제공하는 모든 서비스(이하 서비스)를 이용하는 고객(이하 회원)과 회사가 서비스의 이용조건 및 절차, 권리와 의무, 기타 필요한 사항을 규정함을 목적으로 합니다.<br><br>
                                제 2 조 약관의 효력과 변경<br>서비스는 본 약관에 규정된 조항을 회원이 수락하는 것을 조건으로 제공되며 회원이 회원가입시 "동의" 단추를 누름과 동시에 이 약관에 동의하는 것으로 간주됩니다.<br>이 약관은 온라인을 통해 공시함으로써 효력을 발생합니다.<br>회사는 불가피한 변경의 사유가 있을 때 약관을 임의로 변경할 권한을 가지며 변경된 약관은 온라인을 통해 공지됨으로써 효력이 발생됩니다.<br>회원은 변경된 약관에 동의하지 않을 경우 탈퇴를 요청할 수 있으며 변경된 약관의 효력발생일 이후에도 계속적으로 서비스를 이용하는 경우에는 회원이 약관의 변경 사항에 동의한 것으로 봅니다.<br><br>
                                제 3 조 약관 외 준칙<br>이 약관에 명시되지 않은 사항에 대해서는 국내 관련 법령 규정에 따릅니다.<br><br>
                                제 4 조 이용계약의 체결<br>이용계약은 회원의 회원가입신청을 회사가 승낙 함으로써 성립합니다.<br>회사는 신청서의 내용이 허위이거나 규정한 제반 사항을 위반하여 신청한 경우 가입 신청을 거절할 수 있습니다.<br><br>
                                제 5 조 이용계약의 해지<br>회원은 회사에 언제든 이용계약의 해지를 요청할 수 있습니다.<br>회사는 회원의 해지 요청이 접수된 즉시 회원을 탈퇴 처리 하고 관련 법령 및 개인정보처리방침에 명시된 경우를 제외한 개인정보를 삭제합니다.<br>회사는 회원이 제9조 회원의 의무에 위배되는 행위를 한 경우 사전통지 없이 이용계약의 해지, 제한, 정지할 수 있습니다.<br><br>
                                제 6 조 서비스<br>회사는 다음과 같은 서비스를 제공합니다.<br>- 뉴스 서비스<br>- 동영상 서비스<br>- 게시판 서비스<br>- 설문조사 서비스<br>- DB 서비스<br>회사는 필요한 경우 서비스 내용을 추가, 변경, 삭제할 수 있습니다.<br><br>
                                제 7 조 회사의 의무<br>회사는 지속적, 안정적으로 서비스가 제공되도록 최선의 노력을 다하여야 합니다.<br>회사는 24시간 365일 서비스 제공을 원칙으로 합니다. 다만 정기점검, 천재지변, 비상사태 등 부득이한 사유가 발생한 경우 서비스를 일시 중단할 수 있습니다.<br><br>
                                제 8 조 개인정보의 보호<br>회사는 서비스와 관련하여 수집된 회원의 개인정보를 본인의 사전 승낙없이 제3자에게 공개 또는 배포할 수 없습니다. 다만 관련 법령에 의한 관계기관의 요구가 있을 경우 그러하지 아니합니다.<br>회사는 개인정보 보호책임자를 비롯한 개인정보에 관한 기타 사항을 별도로 정한 "개인정보처리방침"에 기재하여 공지합니다.<br><br>
                                제 9 조 회원의 의무<br>ID와 비밀번호에 관한 관리책임은 회원에게 있습니다.<br>회원은 자신의 ID를 제3자에게 양도, 대여할 수 없습니다.<br>회원은 자신의 ID가 부정하게 사용된 경우 반드시 회사에 통보하여야 합니다.<br>회원은 회원가입시 입력항목에 허위, 오기, 누락이 없도록 하여야 합니다.<br>회원은 제3자의 권리나 저작권 등을 침해하는 행위를 할 수 없습니다.<br>회원은 이 약관 및 관계법령에서 규정한 사항을 준수하여야 하며 기타 회사의 업무에 방해되는 행위를 하여서는 안됩니다.<br>회원은 회사의 사전 승낙없이 서비스를 이용하여 어떠한 영리행위도 할 수 없습니다.<br><br>
                                제 10 조 저작권<br>회사의 모든 서비스에 대한 저작권은 회사 및 회사에 콘텐츠를 제공하는 제공처, 광고주에 있습니다. 이 모든 저작물은 저작권법 및 관계 법령에 의해 보호받으며 회사, 콘텐츠 제공처, 광고주의 사전 승낙 없이 복제, 출판, 전송, 배포, 방송 기타 방법에 의하여 이용하거나 제3자에게 이용하게 할 수 없으며, 저작물에 대한 저작권 침해는 관계 법령의 적용을 받습니다.<br>회사는 회원이 서비스내의 기사의견, 게시판 등에 올린 내용에 대해 책임이 없습니다.<br>회사는 저작권에 관한 기타 사항을 별도로 정한 "저작권정책"에 기재하여 공지합니다.<br><br>
                                제 11 조 기타<br>본 약관은 공정거래위원회 표준 약관에 근거하여 작성되었습니다.
                            </div>

                            <label class="greg-term-item">
                                <input type="checkbox" class="greg-chk-ind" id="gregChk2" required>
                                <span class="greg-term-item-label"><strong>[필수]</strong> 개인정보 수집 및 이용에 대한 안내</span>
                                <button type="button" class="greg-term-toggle" data-target="gregTermBox2" title="내용 보기">▼</button>
                            </label>
                            <div class="greg-term-box" id="gregTermBox2">
                                제 1 조 수집하는 개인정보 항목 및 수집방법<br>회사는 회원 가입, 서비스제공, 기타상담 등을 위해 개인정보를 수집하고 있으며, 또한 설문조사나 이벤트 시에 집단적인 통계분석을 위해서나 경품발송을 위한 목적으로도 개인정보 기재를 요청할 수 있습니다. 그러나, 회사는 이용자의 기본적 인권 침해의 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록 등)는 가급적 수집하지 않으며 부득이하게 수집해야 할 경우 이용자들의 사전동의를 반드시 구합니다. 이때에도 기입하신 정보는 해당서비스 제공이나 회원님께 사전에 밝힌 목적 이외의 다른 어떠한 목적으로도 사용되지 않음을 알려드립니다.<br><br>
                                제 2 조 개인정보의 수집 및 이용목적<br>회사는 아래와 같은 목적으로 개인정보를 수집합니다.<br>- 서비스 제공에 관한 계약이행 및 서비스제공에 따른 요금정산<br>- 회원관리<br>- 서비스 안내등 마케팅 및 광고<br><br>
                                제 3 조 개인정보 수집에 대한 동의<br>회사는 회원님의 개인정보 수집에 대하여 동의를 받고 있으며, 회사 내의 회원가입 절차 중 이용약관 및 개인정보처리방침에 개인정보 수집 동의절차를 마련해 두고 있습니다.<br><br>
                                제 4 조 개인정보의 이용 현황<br>회사는 이용자들의 개인정보를 고지한 범위내에서 사용하며, 이용자의 사전 동의 없이는 동 범위를 초과하여 이용하거나 외부에 공개하지 않습니다.<br><br>
                                제 5 조 개인정보의 제3자 제공 및 처리 위탁 현황<br>개인정보 제3자 제공 : 회사는 고객님의 동의없이 고객님의 정보를 제3자에게 제공하지 않습니다.
                            </div>

                            <label class="greg-term-item">
                                <input type="checkbox" class="greg-chk-ind" id="gregChk3" required>
                                <span class="greg-term-item-label"><strong>[필수]</strong> 객원 기자 활동 및 책임 귀속 동의서</span>
                                <button type="button" class="greg-term-toggle" data-target="gregTermBox3" title="내용 보기">▼</button>
                            </label>
                            <div class="greg-term-box" id="gregTermBox3">
                                ※ 중요 : 본 서비스는 객원 기자(부동산기자, 비지니스기자)가 직접 콘텐츠를 등록하는 플랫폼으로, 작성된 기사에 대한 모든 법적 책임은 작성자에게 있습니다. 아래 내용을 충분히 숙지하신 후 동의해 주시기 바랍니다.<br><br>
                                1. 기사 작성 및 저작권 준수 (필수)<br>모든 기사는 사실에 근거해야 하며, 타인의 명예훼손, 개인정보 침해, 허위사실 유포를 금지합니다. 기사에 포함된 텍스트, 사진, 영상 등은 저작권법에 위배되지 않는 본인의 창작물이어야 합니다. 제3자의 저작권을 침해하여 발생하는 모든 문제는 작성자가 책임집니다.<br><br>
                                2. 법적 책임의 귀속 및 면책 (필수)<br>본 기사로 인해 발생하는 민·형사상 모든 법적 분쟁의 책임은 작성자인 '객원 기자' 본인에게 있습니다. [공실뉴스]는 기사 게재 공간을 제공하는 플랫폼으로서 기사 내용의 진실성을 보증하지 않으며, 이와 관련한 어떠한 법적 책임도 지지 않습니다.<br><br>
                                3. 손해배상 및 구상권 동의 (필수)<br>작성된 기사로 인해 언론사가 제3자로부터 손해배상 청구, 소송, 언론중재 신청 등을 당할 경우, 작성자는 언론사를 면책시켜야 하며 발생한 모든 법적 비용(배상금, 변호사 선임비 등)을 전액 보상해야 합니다.<br><br>
                                4. 기사 관리 및 삭제 권한 (필수)<br>언론사는 부적절한 기사(허위 사실, 권리 침해, 과도한 광고 등)에 대해 별도 통보 없이 수정, 삭제 또는 비공개 처리할 수 있는 권한을 가집니다.<br><br>
                                위 내용을 모두 읽었으며, 기사 작성에 따른 법적 책임이 본인에게 있음을 확약하며 동의합니다.
                            </div>

                            <label class="greg-term-item">
                                <input type="checkbox" class="greg-chk-ind" id="gregChk4">
                                <span class="greg-term-item-label"><strong>[선택]</strong> 이벤트 등 프로모션 알림 메일 수신</span>
                            </label>
                        </div>

                        <button type="submit" id="gregSubmitBtn" class="greg-submit">공실뉴스 시작하기 ✨</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            // 이벤트 바인딩
            // 약관 아코디언 토글
            modal.querySelectorAll('.greg-term-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = btn.dataset.target;
                    const box = modal.querySelector('#' + targetId);
                    if (!box) return;
                    const isOpen = box.classList.toggle('open');
                    btn.classList.toggle('open', isOpen);
                    btn.textContent = isOpen ? '▲' : '▼';
                });
            });

            const roleBtns = modal.querySelectorAll('.greg-role-btn');
            const roleVal = modal.querySelector('#gregRoleVal');
            const realtorFields = modal.querySelector('#gregRealtorFields');
            const reqInputs = modal.querySelectorAll('.greg-req');
            const submitBtn = modal.querySelector('#gregSubmitBtn');

            roleBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    roleBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const role = btn.dataset.role;
                    roleVal.value = role;

                    if (role === 'realtor') {
                        realtorFields.style.display = 'block';
                        submitBtn.textContent = '부동산 가입 신청하기 🚀';
                        reqInputs.forEach(i => i.required = true);
                    } else {
                        realtorFields.style.display = 'none';
                        submitBtn.textContent = '공실뉴스 시작하기 ✨';
                        reqInputs.forEach(i => {
                            i.required = false;
                        });
                    }
                });
            });

            modal.querySelector('#gregBtnZip').addEventListener('click', () => {
                if (typeof daum === 'undefined') { alert("주소 스크립트 로드 대기 중입니다."); return; }
                new daum.Postcode({
                    oncomplete: function(data) {
                        let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                        modal.querySelector('#gregZip').value = data.zonecode;
                        modal.querySelector('#gregAddr').value = addr;
                        modal.querySelector('#gregAddrDet').focus();
                    }
                }).open();
            });

            modal.querySelector('#gregFile1').addEventListener('change', (e) => {
                const f = e.target.files[0];
                modal.querySelector('#gregFileMsg1').textContent = f ? `📄 ${f.name} (선택됨)` : '📸 클릭하여 파일 첨부 (사진)';
                modal.querySelector('#gregFileMsg1').style.color = f ? '#1e56a0' : '#888';
                modal.querySelector('#gregFileMsg1').style.fontWeight = f ? 'bold' : 'normal';
            });
            modal.querySelector('#gregFile2').addEventListener('change', (e) => {
                const f = e.target.files[0];
                modal.querySelector('#gregFileMsg2').textContent = f ? `📄 ${f.name} (선택됨)` : '📸 클릭하여 파일 첨부 (사진)';
                modal.querySelector('#gregFileMsg2').style.color = f ? '#1e56a0' : '#888';
                modal.querySelector('#gregFileMsg2').style.fontWeight = f ? 'bold' : 'normal';
            });

            // 전체 동의 체크박스 로직
            const chkAll = modal.querySelector('#gregChkAll');
            const chkInds = modal.querySelectorAll('.greg-chk-ind');
            chkAll.addEventListener('change', (e) => {
                const checked = e.target.checked;
                chkInds.forEach(chk => chk.checked = checked);
            });
            chkInds.forEach(chk => {
                chk.addEventListener('change', () => {
                    const allChecked = Array.from(chkInds).every(c => c.checked);
                    chkAll.checked = allChecked;
                });
            });

            // 입력 필드 자동 하이픈 포매팅 (숫자만 입력해도 - 추가)
            function autoFormatPhone(e) {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val.startsWith('02')) {
                    if (val.length < 3) { e.target.value = val; return; }
                    if (val.length < 6) { e.target.value = val.replace(/(\d{2})(\d{1,3})/, '$1-$2'); return; }
                    if (val.length < 10) { e.target.value = val.replace(/(\d{2})(\d{3})(\d{1,4})/, '$1-$2-$3'); return; }
                    e.target.value = val.replace(/(\d{2})(\d{4})(\d{1,4})/, '$1-$2-$3');
                } else {
                    if (val.length < 4) { e.target.value = val; return; }
                    if (val.length < 7) { e.target.value = val.replace(/(\d{3})(\d{1,3})/, '$1-$2'); return; }
                    if (val.length < 11) { e.target.value = val.replace(/(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3'); return; }
                    e.target.value = val.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
                }
            }
            
            function autoFormatBizNo(e) {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length < 4) { e.target.value = val; return; }
                if (val.length < 6) { e.target.value = val.replace(/(\d{3})(\d{1,2})/, '$1-$2'); return; }
                e.target.value = val.replace(/(\d{3})(\d{2})(\d{1,5})/, '$1-$2-$3');
            }

            function autoFormatBrokerReg(e) {
                let val = e.target.value.replace(/[^0-9]/g, '');
                // 일반적인 중개등록번호 자리수 가이드: XXXXX-YYYY-ZZZZZ 형태로 유도
                if (val.length < 6) { e.target.value = val; return; }
                if (val.length < 10) { e.target.value = val.replace(/(\d{5})(\d{1,4})/, '$1-$2'); return; }
                e.target.value = val.replace(/(\d{5})(\d{4})(\d{1,5})/, '$1-$2-$3');
            }

            modal.querySelector('#gregPhone').addEventListener('input', autoFormatPhone);
            modal.querySelector('#gregTel').addEventListener('input', autoFormatPhone);
            modal.querySelector('#gregCell').addEventListener('input', autoFormatPhone);
            modal.querySelector('#gregBizReg').addEventListener('input', autoFormatBizNo);
            modal.querySelector('#gregCompReg').addEventListener('input', autoFormatBrokerReg);

            modal.querySelector('#gregForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const loader = modal.querySelector('#gregLoader');
                const loaderMsg = modal.querySelector('#gregLoaderMsg');
                
                function setLoad(text) {
                    loader.style.display = 'flex';
                    loaderMsg.textContent = text;
                }
                function offLoad() { loader.style.display = 'none'; }

                const name = modal.querySelector('#gregName').value;
                const phone = modal.querySelector('#gregPhone').value;
                const role = roleVal.value;
                const status = role === 'realtor' ? 'pending' : 'active';

                setLoad("회원 정보를 등록하고 있습니다...");

                try {
                    let licenseUrl = null;
                    let brokerLicenseUrl = null;

                    if (role === 'realtor') {
                        if (typeof imageCompression === 'undefined') { throw new Error("이미지 컴프레서 라이브러리가 로드되지 않았습니다."); }
                        const lFile = modal.querySelector('#gregFile1').files[0];
                        const bFile = modal.querySelector('#gregFile2').files[0];
                        const upOpts = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };

                        if (lFile) {
                            setLoad("사업자등록증 사진 업로드 중...");
                            const compL = await imageCompression(lFile, upOpts);
                            const nameL = `${user.id}/${Date.now()}_license.${compL.name.split('.').pop()}`;
                            const { error: eL } = await supabase.storage.from('member_documents').upload(nameL, compL);
                            if (eL) throw eL;
                            const { data: dL } = supabase.storage.from('member_documents').getPublicUrl(nameL);
                            licenseUrl = dL.publicUrl;
                        }

                        if (bFile) {
                            setLoad("중개등록증 사진 업로드 중...");
                            const compB = await imageCompression(bFile, upOpts);
                            const nameB = `${user.id}/${Date.now()}_broker.${compB.name.split('.').pop()}`;
                            const { error: eB } = await supabase.storage.from('member_documents').upload(nameB, compB);
                            if (eB) throw eB;
                            const { data: dB } = supabase.storage.from('member_documents').getPublicUrl(nameB);
                            brokerLicenseUrl = dB.publicUrl;
                        }
                    }

                    const memberData = {
                        id: user.id,
                        email: user.email,
                        role: role,
                        name: name,
                        phone: phone,
                        status: status,
                        created_at: new Date().toISOString()
                    };

                    if (role === 'realtor') {
                        memberData.company_name = modal.querySelector('#gregCompName').value;
                        memberData.company_reg_no = modal.querySelector('#gregCompReg').value;
                        memberData.ceo_name = modal.querySelector('#gregCeo').value;
                        memberData.biz_reg_no = modal.querySelector('#gregBizReg').value;
                        memberData.tel_num = modal.querySelector('#gregTel').value;
                        memberData.cell_num = modal.querySelector('#gregCell').value;
                        memberData.zipcode = modal.querySelector('#gregZip').value;
                        memberData.address = modal.querySelector('#gregAddr').value;
                        memberData.address_detail = modal.querySelector('#gregAddrDet').value;
                        memberData.license_image = licenseUrl;
                        memberData.license_image_brokerage = brokerLicenseUrl;
                    }

                    const { error: inErr } = await supabase.from('members').insert([memberData]);
                    if (inErr) throw inErr;

                    if (role === 'realtor') {
                        setLoad("국세청 및 국토부 API를 통해 부동산 인증을 진행 중입니다...");
                        try {
                            const params = {
                                memberId: user.id,
                                bizRegNo: memberData.biz_reg_no || "",
                                brokerRegNo: memberData.company_reg_no || "",
                                companyName: memberData.company_name || ""
                            };
                            
                            const { data, error: fnErr } = await supabase.functions.invoke('swift-responder', {
                                body: params
                            });
                            
                            if (fnErr) console.warn("인증 함수 오류:", fnErr);
                            
                            offLoad();
                            
                            if (data && data.status === 'auto_verified') {
                                alert(data.message);
                            } else {
                                alert(data?.message || "가입 신청 완료! 일부 확인이 필요한 항목이 있어, 관리자 검토 후(최대 24시간) 권한이 부여됩니다.");
                            }
                        } catch(e) {
                            console.error("인증 처리 중 오류:", e);
                            offLoad();
                            alert("가입 신청 완료! 관리자 승인 후 권한이 부여됩니다.");
                        }
                    } else {
                        offLoad();
                        alert("반갑습니다! 공실뉴스 일반 회원 가입이 완료되었습니다.");
                    }

                    modal.style.display = 'none';
                    // 새로운 권한으로 UI 갱신을 위해 handleUserDocument 강제 재호출
                    await handleUserDocument(user);

                } catch (err) {
                    offLoad();
                    console.error("회원가입 처리 에러:", err);
                    alert("처리 중 오류가 발생했습니다: " + err.message);
                }
            });
        }
        const titleEl = modal.querySelector('.glb-title');
        const descEl = modal.querySelector('.glb-desc');
        if (action === 'login') {
            titleEl.textContent = '반갑습니다! 공실뉴스 로그인';
            descEl.textContent = '로그인하시고 공실뉴스만의 혜택을 누려보세요';
        } else {
            titleEl.textContent = '공실뉴스 회원이 되어 보세요';
            descEl.textContent = '지금 바로 공실뉴스 회원으로 가입하시고, 독점 혜택을 누려보세요';
        }
        modal.style.display = 'flex';
    }

    // DB에서 유저 권한 조회
    async function handleUserDocument(user) {
        try {
            const ADMIN_EMAIL = 'gongsilnews@gmail.com';
            let { data: userData, error } = await supabase
                .from('members')
                .select('*')
                .eq('email', user.email)
                .maybeSingle();
            if (error) throw error;
            if (userData) {
                if (userData.id !== user.id) {
                    await supabase.from('members').update({ id: user.id }).eq('email', user.email);
                }
                if (user.email === ADMIN_EMAIL) userData.role = 'admin';
                updateRoleUI(userData, supabase);
                window.currentUser = { ...user, profile: userData };
                localStorage.setItem('gongsil_user', JSON.stringify(window.currentUser));
            } else {
                console.log("신규 가입자 감지 → 홈 화면 통합 모달형 프로필 등록 창 열기");
                showRegisterProfileModal(user);
            }
        } catch (err) {
            console.error("회원 정보 조회 에러:", err);
            userRoleBadges.forEach(b => { b.textContent = "조회 에러"; b.style.background = "red"; b.style.color = "white"; });
        }
    }

    function updateRoleUI(userData) {
        if (!userRoleBadges || userRoleBadges.length === 0) return;
        const existingGear = document.getElementById('adminGearBtn');
        if (existingGear) existingGear.remove();
        const targetPage = userData.role === 'admin'
            ? (window.BASE_PATH || '') + '/admin/'
            : (window.BASE_PATH || '') + '/user_admin.html';
        let roleName = "일반회원";
        if (userData.role === 'admin') roleName = "최고관리자";
        else if (userData.role === 'realtor') {
            if (userData.verification_status === 'approved' || userData.verification_status === 'auto_verified') {
                roleName = "부동산회원";
            } else {
                roleName = "부동산회원(정보입력중)";
            }
        }
        const membershipName = userData.membership === 'paid' ? " (유료)" : " (무료)";
        const displayText = userData.role === 'admin' ? roleName + " >>" : roleName + membershipName + " >>";
        userRoleBadges.forEach(badge => {
            badge.textContent = displayText;
            if (userData.role === 'admin') { badge.style.background = "#e74c3c"; badge.style.color = "white"; }
            else if (userData.role === 'realtor') { badge.style.background = "#1a73e8"; badge.style.color = "white"; }
            else if (userData.membership === 'paid') { badge.style.background = "#ff9f1c"; badge.style.color = "white"; }
            else { badge.style.background = "#f0f0f0"; badge.style.color = "#555"; }
            badge.style.cssText += "; cursor:pointer; display:inline-flex; align-items:center; padding:5px 12px; border-radius:6px; font-weight:bold; font-size:12px;";
            badge.title = userData.role === 'admin' ? '관리자 페이지' : '마이페이지';
            badge.onclick = () => { window.location.href = targetPage; };
        });
    }

    console.log("Gongsil Auth initialized successfully.");
}

// config.js가 gongsiClient를 만들고 나서 이 함수를 호출
window._gongsiAuthBootstrap = function() {
    if (window.gongsiClient) {
        _gongsiAuthInit(window.gongsiClient);
    }
};

// 이미 gongsiClient가 있으면 바로 실행, 없으면 config.js 폴링 후 콜백으로 실행됨
if (window.gongsiClient) {
    _gongsiAuthInit(window.gongsiClient);
} else {
    // 폴링으로 클라이언트 대기
    let _authRetry = 0;
    const _authPoll = setInterval(() => {
        _authRetry++;
        if (window.gongsiClient) {
            clearInterval(_authPoll);
            _gongsiAuthInit(window.gongsiClient);
        } else if (_authRetry > 30) {
            clearInterval(_authPoll);
            console.error("gongsiClient 초기화 30회 실패 - 로그인 버튼 비활성화 상태");
        }
    }, 200);
}
