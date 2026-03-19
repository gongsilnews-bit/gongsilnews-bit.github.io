
// [공실 프로젝트] 설정 (supabase_gongsi_config.js에서 생성된 글로벌 클라이언트 사용)
const supabase = window.gongsiClient;

if (!supabase) {
    console.error("공실 프로젝트 클라이언트가 초기화되지 않았습니다! supabase_gongsi_config.js 로드 확인 필요.");
}

// UI 요소 가져오기
const loginBtn = document.getElementById('headerLoginBtn');
const logoutBtn = document.getElementById('headerLogoutBtn');
const userProfile = document.getElementById('userProfile');
const userNameDisplay = document.getElementById('userNameDisplay');
const userRoleBadge = document.getElementById('userRoleBadge');

// 초기 상태 체크
async function initAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    handleAuthStateChange(session?.user ?? null);
}

// 로그인 상태 감지
supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user ?? null;
    handleAuthStateChange(user);
});

async function handleAuthStateChange(user) {
    if (user) {
        // 로그인 상태: UI 업데이트
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userNameDisplay) userNameDisplay.textContent = user.user_metadata.full_name || user.email.split('@')[0];
        if (userRoleBadge) userRoleBadge.textContent = "정보 확인중...";
        
        // Supabase DB(members)에서 권한 정보 가져오기
        await handleUserDocument(user);
    } else {
        // 로그아웃 상태: UI 업데이트
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (userProfile) userProfile.style.display = 'none';
        
        // 전역 상태 초기화
        window.currentUser = null;
        localStorage.removeItem('gongsil_user');
    }
}

// 동의 약관 모달 - 신규 가입 시에만 호출됨
function showTermsModal(onAgree, onCancel) {
    let modal = document.getElementById('termsModal');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'termsModal';
        modal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;">
                <div style="background:#fff; padding:30px; border-radius:12px; width:360px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <h3 style="margin-top:0; border-bottom:2px solid #ff9f1c; padding-bottom:12px; font-size:18px; color:#111;">🛡️ 서비스 이용 동의</h3>
                    <p style="font-size:13px; color:#666; line-height:1.6; margin-bottom:20px;">
                        반갑습니다! 공실뉴스에 처음 오셨군요.<br>안전한 서비스 이용을 위해 약관에 동의해 주세요.
                    </p>
                    
                    <div style="margin:20px 0; font-size:14px; color:#333; background:#f9f9f9; padding:15px; border-radius:8px;">
                        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px; cursor:pointer;">
                            <input type="checkbox" id="chkTerm1" style="width:16px; height:16px; accent-color:#ff9f1c;"> <b>[필수]</b> 공실뉴스 이용약관 동의
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" id="chkTerm2" style="width:16px; height:16px; accent-color:#ff9f1c;"> <b>[필수]</b> 개인정보 수집 및 처리방침 동의
                        </label>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <button id="btnCancelTerms" style="flex:1; padding:12px; border:none; border-radius:6px; background:#e5e7eb; color:#4b5563; font-weight:bold; cursor:pointer;">거부</button>
                        <button id="btnAgreeTerms" style="flex:2; padding:12px; border:none; border-radius:6px; background:#ff9f1c; color:#fff; font-weight:bold; cursor:pointer; font-size:15px;">동의하고 가입완료 🎉</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 이벤트 리스너 설정 (클린업을 위해 매번 새로 설정)
    const btnAgree = document.getElementById('btnAgreeTerms');
    const btnCancel = document.getElementById('btnCancelTerms');

    btnAgree.onclick = () => {
        const t1 = document.getElementById('chkTerm1').checked;
        const t2 = document.getElementById('chkTerm2').checked;
        if(!t1 || !t2) {
            alert("⚠️ 필수 약관에 모두 동의해주셔야 서비스 이용이 가능합니다.");
            return;
        }
        modal.style.display = 'none';
        if(onAgree) onAgree();
    };

    btnCancel.onclick = () => {
        modal.style.display = 'none';
        if(onCancel) onCancel();
    };
    
    document.getElementById('termsModal').style.display = 'flex';
    document.getElementById('chkTerm1').checked = false;
    document.getElementById('chkTerm2').checked = false;
}

// 구글 로그인 클릭 이벤트 (이제 바로 로그인 시도)
if(loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + (window.BASE_PATH || '')

            }
        });
        if (error) {
            console.error("로그인 에러:", error);
            alert("구글 로그인 중 오류가 발생했습니다: " + error.message);
        }
    });
}

// 로그아웃 클릭 이벤트
if(logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.reload();
        } else {
            console.error("로그아웃 에러:", error);
        }
    });
}

// Supabase DB에 유저 정보 저장 및 불러오기 (권한 판별용)
async function handleUserDocument(user) {
    try {
        const ADMIN_EMAIL = 'gongsilnews@gmail.com';
        
        // 1. members 테이블에서 이메일로 조회
        let { data: userData, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

        if (error) throw error;

        if (userData) {
            // [기존 회원] 바로 UI 업데이트
            if (userData.id !== user.id) {
                await supabase.from('members').update({ id: user.id }).eq('email', user.email);
            }
            if (user.email === ADMIN_EMAIL) userData.role = 'admin';
            updateRoleUI(userData);
            
            // 전역 및 로컬스토리지 저장
            window.currentUser = { ...user, profile: userData };
            localStorage.setItem('gongsil_user', JSON.stringify(window.currentUser));
        } else {
            // [신규 가입자] 약관 동의 모달 띄우기
            showTermsModal(
                async () => {
                    // 동의함 -> 회원 등록 진행
                    const { data: preRegData } = await supabase
                        .from('pre_registered_realtors')
                        .select('*')
                        .eq('email', user.email.toLowerCase())
                        .maybeSingle();
                    
                    let initialRole = "general";
                    let initialExpiredAt = null;
                    
                    if (user.email === ADMIN_EMAIL) {
                        initialRole = "admin";
                    } else if (preRegData) {
                        if (preRegData.note && preRegData.note.includes('role:')) {
                            initialRole = preRegData.note.split('role:')[1];
                        } else {
                            initialRole = "realtor";
                        }
                        initialExpiredAt = preRegData.expired_date;
                        if (initialRole === 'general') initialExpiredAt = null;
                    }

                    const newUserData = {
                        id: user.id,
                        email: user.email,
                        role: initialRole,
                        expired_at: initialExpiredAt,
                        created_at: new Date().toISOString()
                    };

                    const { data: savedData, error: insertError } = await supabase
                        .from('members')
                        .insert([newUserData])
                        .select()
                        .maybeSingle();

                    if (insertError) throw insertError;
                    userData = savedData || newUserData;
                    updateRoleUI(userData);

                    window.currentUser = { ...user, profile: userData };
                    localStorage.setItem('gongsil_user', JSON.stringify(window.currentUser));
                },
                async () => {
                    // 동의 거부 -> 로그아웃
                    alert("약관에 동의하지 않으시면 서비스 이용이 불가능하여 로그아웃됩니다.");
                    await supabase.auth.signOut();
                    window.location.reload();
                }
            );
        }

    } catch (error) {
        console.error("회원 정보 조회 에러:", error);
        if (userRoleBadge) {
            userRoleBadge.textContent = "조회 에러";
            userRoleBadge.style.background = "red";
            userRoleBadge.style.color = "white";
        }
    }
}

function updateRoleUI(userData) {
    if(!userRoleBadge) return;

    // 기존 톱니바퀴 버튼이 있으면 제거 (관리자 설정 버튼이 배지에 통합되므로)
    const existingGear = document.getElementById('adminGearBtn');
    if (existingGear) existingGear.remove();

    // 이동할 페이지 결정
    const targetPage = userData.role === 'admin'
        ? window.BASE_PATH + '/admin/'
        : window.BASE_PATH + '/user_admin.html';
    const tooltipLabel = userData.role === 'admin' ? '관리자페이지로 이동' : '마이페이지로 이동';

    // 역할별 배지 스타일 및 텍스트 설정
    if (userData.role === 'admin') {
        userRoleBadge.textContent = "최고관리자 >>";
        userRoleBadge.style.background = "#e74c3c";
        userRoleBadge.style.color = "white";
    } else if (userData.role === 'realtor') {
        userRoleBadge.textContent = "부동산회원 >>";
        userRoleBadge.style.background = "#ff9f1c";
        userRoleBadge.style.color = "white";
    } else {
        userRoleBadge.textContent = "일반회원 >>";
        userRoleBadge.style.background = "#f0f0f0";
        userRoleBadge.style.color = "#555";
    }

    // 배지를 클릭 가능한 버튼 형태로 변경
    userRoleBadge.style.cursor = "pointer";
    userRoleBadge.style.display = "inline-flex";
    userRoleBadge.style.alignItems = "center";
    userRoleBadge.style.padding = "5px 12px";
    userRoleBadge.style.borderRadius = "6px";
    userRoleBadge.style.fontWeight = "bold";
    userRoleBadge.style.fontSize = "12px";
    userRoleBadge.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    userRoleBadge.style.transition = "all 0.2s ease";
    userRoleBadge.title = tooltipLabel;

    userRoleBadge.onclick = () => {
        window.location.href = targetPage;
    };

    // 호버 효과 추가
    userRoleBadge.onmouseenter = () => {
        userRoleBadge.style.transform = "translateY(-1px)";
        userRoleBadge.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        if(userData.role === 'admin') userRoleBadge.style.background = "#c0392b";
        else if(userData.role === 'realtor') userRoleBadge.style.background = "#e67e22";
        else userRoleBadge.style.background = "#e5e5e5";
    };
    userRoleBadge.onmouseleave = () => {
        userRoleBadge.style.transform = "translateY(0)";
        userRoleBadge.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
        if(userData.role === 'admin') userRoleBadge.style.background = "#e74c3c";
        else if(userData.role === 'realtor') userRoleBadge.style.background = "#ff9f1c";
        else userRoleBadge.style.background = "#f0f0f0";
    };
}

// 실행
initAuth();

export { supabase };
