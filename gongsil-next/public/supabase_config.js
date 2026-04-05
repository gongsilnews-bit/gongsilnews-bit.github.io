
// [공실 프로젝트] 회원 로그인 및 물건 등록 전용 Supabase 설정
// 주의: '뉴스(RSS)' 프로젝트와는 별개의 새로운 '공실' 프로젝트 정보를 입력하세요.

const GONGSI_CONFIG = {
    URL: 'https://kjrjrjnsiynrcelzepju.supabase.co', // 이미지에서 확인된 공실 프로젝트 URL
    KEY: 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj' // 사용자 제공 API KEY
};

// 글로벌 공실 클라이언트 생성 (window.gongsiClient)
if (window.supabase) {
    if (!window.gongsiClient) {
        window.gongsiClient = window.supabase.createClient(GONGSI_CONFIG.URL, GONGSI_CONFIG.KEY);
        console.log("Gongsi(Auth/Property) Supabase Client Initialized");
    }
} else {
    console.error("Supabase SDK not loaded!");
}
