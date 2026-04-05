import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// ==========================================
// [필수!] Firebase 콘솔 -> 프로젝트 설정 -> 내 앱(</>) 에서
// 발급받은 firebaseConfig 내용을 아래에 붙여넣으세요!
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDquhmogvO1syGx5vP-SMOn8b3-elzONrA",
    authDomain: "gongsilnews-79294.firebaseapp.com",
    projectId: "gongsilnews-79294",
    storageBucket: "gongsilnews-79294.firebasestorage.app",
    messagingSenderId: "439665439508",
    appId: "1:439665439508:web:117a3e5dc992ecf9e8c801",
    measurementId: "G-4JTHNLM3NC"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// UI 요소 가져오기
const loginBtn = document.getElementById('headerLoginBtn');
const logoutBtn = document.getElementById('headerLogoutBtn');
const userProfile = document.getElementById('userProfile');
const userNameDisplay = document.getElementById('userNameDisplay');
const userRoleBadge = document.getElementById('userRoleBadge');

// 로그인 상태 감지
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 로그인 상태: UI 업데이트
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userNameDisplay) userNameDisplay.textContent = user.displayName || user.email.split('@')[0];
        if (userRoleBadge) userRoleBadge.textContent = "정보 확인중...";
        
        // Firestore에서 권한 정보 가져오기
        await handleUserDocument(user);
    } else {
        // 로그아웃 상태: UI 업데이트
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (userProfile) userProfile.style.display = 'none';
        
        // 전역 상태 초기화 (필요하다면 window 객체 활용 가능)
        window.currentUser = null;
    }
});

// 동의 약관 모달 생성 및 관리 기능 (법적 이슈 해결)
function showTermsModal() {
    let modal = document.getElementById('termsModal');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'termsModal';
        modal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;">
                <div style="background:#fff; padding:30px; border-radius:12px; width:360px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <h3 style="margin-top:0; border-bottom:2px solid #ff9f1c; padding-bottom:12px; font-size:18px; color:#111;">🛡️ 서비스 이용 동의</h3>
                    <p style="font-size:13px; color:#666; line-height:1.6; margin-bottom:20px;">
                        최초 로그인 시 자동으로 <b>일반회원</b>으로 가입됩니다. 안전한 서비스 이용을 위해 아래 약관에 동의해 주세요.
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
                        <button onclick="document.getElementById('termsModal').style.display='none';" style="flex:1; padding:12px; border:none; border-radius:6px; background:#e5e7eb; color:#4b5563; font-weight:bold; cursor:pointer;">취소</button>
                        <button id="btnAgreeLogin" style="flex:2; padding:12px; border:none; border-radius:6px; background:#ff9f1c; color:#fff; font-weight:bold; cursor:pointer; font-size:15px;">동의하고 구글 로그인 🚀</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 동의하고 로그인 버튼 이벤트
        document.getElementById('btnAgreeLogin').addEventListener('click', () => {
            const t1 = document.getElementById('chkTerm1').checked;
            const t2 = document.getElementById('chkTerm2').checked;
            
            if(!t1 || !t2) {
                alert("⚠️ 서비스 가입을 위해 필수 약관에 모두 동의해주셔야 합니다.");
                return;
            }
            // 모달 닫기
            modal.style.display = 'none';
            
            // 승인 완료되면 실제 구글 로그인 수행
            signInWithPopup(auth, provider).catch(error => {
                console.error("로그인 에러:", error);
                alert("구글 로그인 중 오류가 발생했습니다: " + error.message);
            });
        });
    }
    
    // 모달 보여줄 때 체크박스 초기화
    document.getElementById('termsModal').style.display = 'flex';
    document.getElementById('chkTerm1').checked = false;
    document.getElementById('chkTerm2').checked = false;
}

// 구글 로그인 클릭 이벤트 방인
if(loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // 로그인 팝업 띄우기 전, 약관동의 창부터 팝업
        showTermsModal(); 
    });
}

// 로그아웃 클릭 이벤트
if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            alert('로그아웃 되었습니다.');
            // 필요시 화면 새로고침
            // window.location.reload();
        }).catch(error => {
            console.error("로그아웃 에러:", error);
        });
    });
}

// Firestore에 유저 정보 저장 및 불러오기 (권한 판별용)
async function handleUserDocument(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        let userData;

        if (userSnap.exists()) {
            // 이미 존재하는 회원 정보 로드
            userData = userSnap.data();
            
            // UI에 권한 표시 업데이트
            if(userData.role === 'realtor') {
                userRoleBadge.textContent = "부동산회원";
                userRoleBadge.style.background = "#ff9f1c"; // 브랜드 컬러 
                userRoleBadge.style.color = "white";
                
                // [참고] 만료일 체크 로직 예시
                /*
                if(userData.expiredDate) {
                    const expireTime = userData.expiredDate.toDate();
                    if(new Date() > expireTime) {
                        userRoleBadge.textContent = "기간 만료";
                        userRoleBadge.style.background = "#e74c3c";
                        userData.role = "general"; // 권한 임시 강등 처리 등 로직 추가 가능
                    }
                }
                */
            } else {
                userRoleBadge.textContent = "일반회원";
                userRoleBadge.style.background = "#f0f0f0";
                userRoleBadge.style.color = "#555";
            }
        } else {
            // [추가된 핵심 기능] 신규 가입자 -> 사전 등록 여부 우선 확인
            const preRegRef = doc(db, "pre_registered_realtors", user.email.toLowerCase());
            const preRegSnap = await getDoc(preRegRef);
            
            let initialRole = "general";
            let initialExpiredDate = null;
            
            if (preRegSnap.exists()) {
                // 관리자가 미리 등록해둔 이메일이라면 특수 권한 부여
                initialRole = "realtor";
                initialExpiredDate = preRegSnap.data().expiredDate;
                
                // (선택) 데이터 사용 후 사전등록 db에서 데이터를 삭제하려면 여기서 deleteDoc 호출 가능
            }

            userData = {
                email: user.email,
                name: user.displayName,
                role: initialRole, // 기본값 general, 사등록자는 realtor
                expiredDate: initialExpiredDate,
                createdAt: new Date()
            };
            await setDoc(userRef, userData);
        }
            
        // --- UI 버튼 및 권한 표시 업데이트 로직 (최고관리자 포함) ---
        const ADMIN_EMAIL = 'gongsilnews@gmail.com';
        
        if (user.email === ADMIN_EMAIL) {
            userRoleBadge.innerHTML = "최고관리자 ⚙️";
            userRoleBadge.style.background = "#e74c3c"; // 빨간색 계열
            userRoleBadge.style.color = "white";
            userRoleBadge.style.cursor = "pointer";
            userRoleBadge.title = "클릭하여 관리자 페이지로 이동";
            userRoleBadge.onclick = () => { window.location.href = '/admin/'; };
        } else {
            if (userData.role === 'realtor') {
                userRoleBadge.textContent = "부동산회원";
                userRoleBadge.style.background = "#ff9f1c";
                userRoleBadge.style.color = "white";
            } else {
                userRoleBadge.textContent = "일반회원 ⚙️";
                userRoleBadge.style.background = "#f0f0f0";
                userRoleBadge.style.color = "#555";
            }
            userRoleBadge.style.cursor = "pointer";
            userRoleBadge.title = "클릭하여 마이페이지(공실등록)로 이동";
            userRoleBadge.onclick = () => { window.location.href = '/user_admin.html'; };
        }
        
        // 전역에서 사용할 수 있게 저장 (로컬스토리지에도 저장하여 타 페이지에서 프로필 사용)
        window.currentUser = { uid: user.uid, ...userData };
        localStorage.setItem('gongsil_user', JSON.stringify(window.currentUser));

    } catch (error) {
        console.error("회원 정보 조회 에러:", error);
        if (userRoleBadge) {
            userRoleBadge.textContent = "조회 에러";
            userRoleBadge.style.background = "red";
            userRoleBadge.style.color = "white";
        }
    }
}
