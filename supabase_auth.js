
// [공실 프로젝트] 설정 (supabase_gongsi_config.js에서 생성된 글로벌 클라이언트 사용)
const supabase = window.gongsiClient;

if (!supabase) {
    console.error("공실 프로젝트 클라이언트가 초기화되지 않았습니다! supabase_gongsi_config.js 로드 확인 필요.");
}

// UI 요소 가져오기 (다중 요소 지원을 위해 class와 id 모두 선택)
const loginBtns = document.querySelectorAll('#headerLoginBtn, .headerLoginBtn');
const logoutBtns = document.querySelectorAll('#headerLogoutBtn, .headerLogoutBtn');
const userProfiles = document.querySelectorAll('#userProfile, .userProfile');
const userNameDisplays = document.querySelectorAll('#userNameDisplay, .userNameDisplay');
const userRoleBadges = document.querySelectorAll('#userRoleBadge, .userRoleBadge');

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
        loginBtns.forEach(btn => btn.style.display = 'none');
        userProfiles.forEach(p => p.style.display = 'flex');
        userNameDisplays.forEach(d => d.textContent = user.user_metadata.full_name || user.email.split('@')[0]);
        userRoleBadges.forEach(b => b.textContent = "정보 확인중...");
        
        // Supabase DB(members)에서 권한 정보 가져오기
        await handleUserDocument(user);
    } else {
        // 로그아웃 상태: UI 업데이트
        loginBtns.forEach(btn => btn.style.display = 'inline-block');
        userProfiles.forEach(p => p.style.display = 'none');
        
        // 전역 상태 초기화
        window.currentUser = null;
        localStorage.removeItem('gongsil_user');
    }
}

// 구글 로그인 클릭 이벤트 (현재 페이지로 돌아오기 위해 window.location.href 사용)
loginBtns.forEach(loginBtn => {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        let redirectPath = window.location.pathname;
        // GitHub Pages Clean URL(예: /gongsil)인 경우 뒤에 /가 붙어 404가 나는 것을 방지하기 위해 .html을 붙임
        if (redirectPath !== '/' && !redirectPath.endsWith('.html') && !redirectPath.endsWith('/')) {
            redirectPath += '.html';
        }
        const redirectUrl = window.location.origin + redirectPath + window.location.search;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });
        if (error) {
            console.error("로그인 에러:", error);
            alert("구글 로그인 중 오류가 발생했습니다: " + error.message);
        }
    });
});

// 로그아웃 클릭 이벤트
logoutBtns.forEach(logoutBtn => {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.reload();
        } else {
            console.error("로그아웃 에러:", error);
        }
    });
});

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
        userRoleBadges.forEach(badge => {
            badge.textContent = "조회 에러";
            badge.style.background = "red";
            badge.style.color = "white";
        });
    }
}

function updateRoleUI(userData) {
    if(!userRoleBadges || userRoleBadges.length === 0) return;

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

    userRoleBadges.forEach(badge => {
        badge.textContent = displayText;

        // 역할 및 등급별 배지 스타일 설정
        if (userData.role === 'admin') {
            badge.style.background = "#e74c3c";
            badge.style.color = "white";
        } else if (userData.role === 'realtor') {
            badge.style.background = "#1a73e8";
            badge.style.color = "white";
        } else if (userData.membership === 'paid') {
            badge.style.background = "#ff9f1c";
            badge.style.color = "white";
        } else {
            badge.style.background = "#f0f0f0";
            badge.style.color = "#555";
            
            // Top transparent header might need white background for text visibility if on hero, but we rely on its own transparent style if needed.
            // Let's ensure default text color handles hero correctly, or we can use specific styles:
            // Since top header `.userRoleBadge` has rgba(255,255,255,0.2) and color #fff, we might override it here. 
            // In fact, modifying styles inline here will override the CSS.
        }

        // 기본 공통 스타일
        badge.style.cursor = "pointer";
        badge.style.display = "inline-flex";
        badge.style.alignItems = "center";
        badge.style.padding = "5px 12px";
        badge.style.borderRadius = "6px";
        badge.style.fontWeight = "bold";
        badge.style.fontSize = "12px";
        badge.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
        badge.style.transition = "all 0.2s ease";
        badge.title = tooltipLabel;

        badge.onclick = () => {
            window.location.href = targetPage;
        };

        // 호버 효과
        badge.onmouseenter = () => {
            badge.style.transform = "translateY(-1px)";
            badge.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            if(userData.role === 'admin') badge.style.background = "#c0392b";
            else if(userData.role === 'realtor') badge.style.background = "#1557b0";
            else if(userData.membership === 'paid') badge.style.background = "#e67e22";
            else badge.style.background = "#e5e5e5";
        };
        badge.onmouseleave = () => {
            badge.style.transform = "translateY(0)";
            badge.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
            if(userData.role === 'admin') badge.style.background = "#e74c3c";
            else if(userData.role === 'realtor') badge.style.background = "#1a73e8";
            else if(userData.membership === 'paid') badge.style.background = "#ff9f1c";
            else {
                badge.style.background = "#f0f0f0";
                badge.style.color = "#555";
            }
        };
    });
}

// 실행
initAuth();

// export { supabase };
