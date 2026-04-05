
// [공실 프로젝트] 회원 로그인 및 물건 등록 전용 Supabase 설정
const GONGSI_CONFIG = {
    URL: 'https://kjrjrjnsiynrcelzepju.supabase.co',
    KEY: 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj'
};

function _createGongsiClient() {
    if (window.supabase && !window.gongsiClient) {
        window.gongsiClient = window.supabase.createClient(GONGSI_CONFIG.URL, GONGSI_CONFIG.KEY);
        console.log("Gongsi Supabase Client Initialized");
        // supabase_auth.js가 이미 로드됐지만 클라이언트가 없어서 초기화 못 했을 경우 재시도
        if (typeof window._gongsiAuthBootstrap === 'function') {
            window._gongsiAuthBootstrap();
        }
    }
}

// SDK가 이미 있으면 바로 생성, 없으면 로드 완료 후 생성
if (window.supabase) {
    _createGongsiClient();
} else {
    // CDN script가 아직 로드 중일 수 있음 → DOMContentLoaded 후 재시도
    document.addEventListener('DOMContentLoaded', _createGongsiClient);
    // 혹은 짧은 폴링으로 체크
    let _retry = 0;
    const _poll = setInterval(() => {
        _retry++;
        if (window.supabase) {
            clearInterval(_poll);
            _createGongsiClient();
        } else if (_retry > 20) {
            clearInterval(_poll);
            console.error("Supabase SDK 로드 실패 (CDN 연결 오류)");
        }
    }, 200);
}

// 글로벌 네비게이션(자료실 GNB) 동적 연동 스크립트
// 사이트의 모든 HTML 파일(index.html, board.html, news.html 등)의 "자료실" 하위 메뉴를 DB 기반으로 실시간 교체합니다.
document.addEventListener('DOMContentLoaded', () => {
    // 조금 기달렸다가 실행 (gongsiClient 로드 보장용)
    setTimeout(async () => {
        const sb = window.gongsiClient;
        if(!sb) return;
        
        try {
            const { data: boards } = await sb.from('boards')
                                            .select('board_id, board_name')
                                            .eq('is_active', true)
                                            .order('created_at', { ascending: true });
                                            
            if(boards && boards.length > 0) {
                // 부모 경로 깊이 탐지하여 상대경로 보정 (예: admin/ 폴더 안에 있을 경우 대비, 하지만 일단 절대경로/상대경로 유연하게 처리)
                const isSubFolder = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/gongsil/');
                const basePath = isSubFolder ? '../' : '';
                
                const gnbLinks = document.querySelectorAll('.gnb-new a');
                let boardAnchor = null;
                for(const a of Array.from(gnbLinks)) {
                    if(a.innerText.trim() === '자료실') {
                        boardAnchor = a;
                        break;
                    }
                }
                
                if(boardAnchor) {
                    const dropdown = boardAnchor.nextElementSibling;
                    if(dropdown && dropdown.classList.contains('gnb-dropdown')) {
                        const ul = dropdown.querySelector('ul');
                        if(ul) {
                            ul.innerHTML = boards.map(b => `
                                <li style="border-bottom: 1px solid #eee;">
                                    <a href="${basePath}board.html?id=${b.board_id}" style="display: block; padding: 12px 0; font-size: 14px; color: #222; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#f4f6fa'; this.style.color='#508bf5'; this.style.fontWeight='bold'" onmouseout="this.style.background='#fff'; this.style.color='#222'; this.style.fontWeight='normal'">
                                        ${b.board_name}
                                    </a>
                                </li>
                            `).join('');
                        }
                    }
                }
            }
        } catch(e) {
            console.warn("게시판 동적 메뉴 세팅 실패:", e);
        }
    }, 500);
});
