
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
            // [신규 가입자] 회원가입 마무리 페이지로 이동
            console.log("신규 가입자 감지: 가입 마무리 페이지로 이동합니다.");
            window.location.href = window.BASE_PATH + '/register_profile.html';
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

    // 기존 톱니바퀴 버튼이 있으면 제거
    const existingGear = document.getElementById('adminGearBtn');
    if (existingGear) existingGear.remove();

    // 이동할 페이지 결정
    const targetPage = userData.role === 'admin'
        ? window.BASE_PATH + '/admin/'
        : window.BASE_PATH + '/user_admin.html';
    const tooltipLabel = userData.role === 'admin' ? '관리자페이지로 이동' : '마이페이지로 이동';

    // 역할 텍스트 결정
    let roleName = "일반회원";
    if (userData.role === 'admin') roleName = "최고관리자";
    else if (userData.role === 'realtor') roleName = "부동산회원";

    // 등급 텍스트 결정
    const membershipName = userData.membership === 'paid' ? " (유료)" : " (무료)";
    
    // 최종 표시 텍스트 (관리자는 등급 표시 생략)
    const displayText = userData.role === 'admin' ? roleName + " >>" : roleName + membershipName + " >>";

    userRoleBadge.textContent = displayText;

    // 역할 및 등급별 배지 스타일 설정
    if (userData.role === 'admin') {
        userRoleBadge.style.background = "#e74c3c";
        userRoleBadge.style.color = "white";
    } else if (userData.role === 'realtor') {
        // 부동산회원은 블루 계통
        userRoleBadge.style.background = "#1a73e8";
        userRoleBadge.style.color = "white";
    } else if (userData.membership === 'paid') {
        // 일반 유료 회원 스타일
        userRoleBadge.style.background = "#ff9f1c";
        userRoleBadge.style.color = "white";
    } else {
        // 일반 무료 회원 스타일
        userRoleBadge.style.background = "#f0f0f0";
        userRoleBadge.style.color = "#555";
    }

    // 기본 공통 스타일
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

    // 호버 효과
    userRoleBadge.onmouseenter = () => {
        userRoleBadge.style.transform = "translateY(-1px)";
        userRoleBadge.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        if(userData.role === 'admin') userRoleBadge.style.background = "#c0392b";
        else if(userData.role === 'realtor') userRoleBadge.style.background = "#1557b0";
        else if(userData.membership === 'paid') userRoleBadge.style.background = "#e67e22";
        else userRoleBadge.style.background = "#e5e5e5";
    };
    userRoleBadge.onmouseleave = () => {
        userRoleBadge.style.transform = "translateY(0)";
        userRoleBadge.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
        if(userData.role === 'admin') userRoleBadge.style.background = "#e74c3c";
        else if(userData.role === 'realtor') userRoleBadge.style.background = "#1a73e8";
        else if(userData.membership === 'paid') userRoleBadge.style.background = "#ff9f1c";
        else userRoleBadge.style.background = "#f0f0f0";
    };
}

// 실행
initAuth();

export { supabase };
