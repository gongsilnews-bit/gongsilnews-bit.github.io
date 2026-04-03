// admin_darkmode.js - 모든 내부 어드민 페이지 공통 다크모드 처리
(function () {
    // 즉시 적용 (화면 깜빡임 방지)
    if (localStorage.getItem('admin_dark_mode') === '1') {
        document.documentElement.classList.add('dark-mode');
    }

    // 부모 shell에서 postMessage로 전달받아 실시간 전환
    window.addEventListener('message', function (e) {
        if (e.data === 'darkmode:on') {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('admin_dark_mode', '1');
        }
        if (e.data === 'darkmode:off') {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('admin_dark_mode', '0');
        }
    });
})();
