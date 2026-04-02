
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
    function showGongsilLoginModal(redirectUrl) {
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

        modal.style.display = 'flex';
    }

    // 로그인 클릭 핸들러
    window.handleLoginClick = async function(e) {
        if (e) e.preventDefault();
        try {
            let redirectPath = window.location.pathname;
            if (redirectPath !== '/' && !redirectPath.endsWith('.html') && !redirectPath.endsWith('/')) {
                redirectPath += '.html';
            }
            const redirectUrl = window.location.origin + redirectPath + window.location.search;
            
            // 모달 노출 (실제 구글 로그인은 모달 내 버튼에서 처리)
            showGongsilLoginModal(redirectUrl);

        } catch(err) {
            console.error("로그인 모달 표시 에러:", err);
        }
    };

    // 로그인 버튼에 이벤트 연결
    loginBtns.forEach(btn => btn.addEventListener('click', window.handleLoginClick));

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
                .greg-modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:flex-start; padding:40px 20px; box-sizing:border-box; overflow-y:auto; z-index:9999999; }
                .greg-box { background:#fff; border-radius:16px; width:100%; max-width:480px; box-shadow:0 10px 40px rgba(0,0,0,0.2); position:relative; padding:40px; animation: gregPopup 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); margin-bottom: 40px; }
                @keyframes gregPopup { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                .greg-header { text-align:center; margin-bottom:30px; }
                .greg-header h2 { font-size:22px; font-weight:800; color:#111; margin:0 0 8px 0; }
                .greg-header p { font-size:14px; color:#666; margin:0; }
                .greg-label { display:block; font-size:13px; font-weight:700; color:#444; margin-bottom:6px; }
                .greg-input { width:100%; padding:12px; border:1.5px solid #ddd; border-radius:8px; font-size:14px; margin-bottom:15px; box-sizing:border-box; transition:border 0.2s; background:#fdfdfd; font-family:inherit;}
                .greg-input:focus { outline:none; border-color:#1e56a0; background:#fff; box-shadow:0 0 0 3px rgba(30,86,160,0.1); }
                .greg-input[readonly] { background:#f1f5f9; color:#666; }
                .greg-roles { display:flex; gap:10px; margin-bottom:20px; }
                .greg-role-btn { flex:1; padding:14px; border:2px solid #eee; border-radius:10px; background:#fff; cursor:pointer; text-align:center; transition:all 0.2s; }
                .greg-role-btn span { display:block; font-size:13px; font-weight:800; color:#666; margin-top:4px; }
                .greg-role-btn.active { border-color:#1e56a0; background:#f4f6fa; }
                .greg-role-btn.active span { color:#1e56a0; }
                #gregRealtorFields { display:none; background:#f8f9fa; border:1px solid #e0e0e0; padding:20px; border-radius:12px; margin-bottom:20px; }
                .greg-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
                .greg-full { grid-column:span 2; }
                .greg-row { display:flex; gap:8px; margin-bottom:8px; }
                .greg-btn-sm { padding:0 12px; background:#333; color:#fff; border:none; border-radius:6px; font-size:13px; cursor:pointer; font-weight:bold; white-space:nowrap;}
                .greg-file-box { border:1.5px dashed #ccc; padding:15px; border-radius:8px; text-align:center; cursor:pointer; position:relative; background:#fff; margin-bottom:12px; transition:border 0.2s;}
                .greg-file-box:hover { border-color:#1e56a0; }
                .greg-file-box input { position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; }
                .greg-file-msg { font-size:12px; color:#888; pointer-events:none; }
                .greg-terms { border-top:1px solid #eee; padding-top:20px; margin-bottom:25px; }
                .greg-term-item { display:flex; gap:8px; margin-bottom:10px; font-size:13px; color:#555; cursor:pointer; align-items:flex-start;}
                .greg-term-item input { width:16px; height:16px; accent-color:#1e56a0; cursor:pointer; margin-top:0px; }
                .greg-submit { width:100%; padding:15px; background:#1e56a0; color:#fff; border:none; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer; transition:background 0.2s; box-shadow:0 4px 12px rgba(30,86,160,0.3); font-family:inherit;}
                .greg-submit:hover { background:#16427d; }
                .greg-submit:disabled { background:#ccc; cursor:not-allowed; box-shadow:none; }
                .greg-loader { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.9); z-index:10; display:none; flex-direction:column; justify-content:center; align-items:center; border-radius:16px; }
                .greg-spinner { width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #1e56a0; border-radius:50%; animation:gregSpin 1s linear infinite; margin-bottom:15px; }
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
                            <h3 style="font-size:14px; margin:0 0 15px 0; color:#111; padding-bottom:8px; border-bottom:1px solid #ccc;">🏢 부동산 / 기업 정보 입력</h3>
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
                                    <label class="greg-label">중개등록번호 <span style="color:red">*</span></label>
                                    <input type="text" id="gregCompReg" class="greg-input greg-req" placeholder="등록번호 입력">
                                </div>
                                <div>
                                    <label class="greg-label">사업자등록번호 <span style="color:red">*</span></label>
                                    <input type="text" id="gregBizReg" class="greg-input greg-req" placeholder="000-00-00000">
                                </div>
                                <div>
                                    <label class="greg-label">일반번호 <span style="color:red">*</span></label>
                                    <input type="tel" id="gregTel" class="greg-input greg-req" placeholder="02-000-0000">
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
                                    <input type="text" id="gregAddrDet" class="greg-input greg-req" placeholder="상세 주소를 입력하세요">
                                </div>
                                <div class="greg-full">
                                    <label class="greg-label">사업자등록증 첨부 <span style="color:red">*</span></label>
                                    <div class="greg-file-box">
                                        <div class="greg-file-msg" id="gregFileMsg1">📸 클릭하여 파일 첨부 (사진)</div>
                                        <input type="file" id="gregFile1" class="greg-req" accept="image/*">
                                    </div>
                                </div>
                                <div class="greg-full">
                                    <label class="greg-label">중개등록증 첨부 <span style="color:red">*</span></label>
                                    <div class="greg-file-box">
                                        <div class="greg-file-msg" id="gregFileMsg2">📸 클릭하여 파일 첨부 (사진)</div>
                                        <input type="file" id="gregFile2" class="greg-req" accept="image/*">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="greg-terms">
                            <label class="greg-term-item">
                                <input type="checkbox" id="gregChk1" required>
                                <span><strong>[필수]</strong> 공실뉴스 서비스 이용약관 동의</span>
                            </label>
                            <label class="greg-term-item">
                                <input type="checkbox" id="gregChk2" required>
                                <span><strong>[필수]</strong> 개인정보 수집 및 이용 방침 동의</span>
                            </label>
                        </div>

                        <button type="submit" id="gregSubmitBtn" class="greg-submit">공실뉴스 시작하기 ✨</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            // 이벤트 바인딩
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
                            i.value = '';
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
                        role: 'general', // 관리자 승인을 위해 기본 general, 추후 변경
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

                    offLoad();

                    if (role === 'realtor') {
                        alert("가입 신청이 완료되었습니다! 관리자 승인(최대 24시간) 후 부동산 회원 권한이 부여됩니다.");
                    } else {
                        alert("반갑습니다! 공실뉴스 가입이 완료되었습니다.");
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
        else if (userData.role === 'realtor') roleName = "부동산회원";
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
