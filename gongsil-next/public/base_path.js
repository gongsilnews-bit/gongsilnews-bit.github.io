/**
 * base_path.js
 * 이제 깃허브 저장소 이름이 gongsilnews-bit.github.io 이므로 
 * 로컬과 깃허브 모두에서 최상위 루트(/)로 서비스됩니다. 
 * 예전처럼 /gongsil/ 과 같은 하위 경로가 없으므로 BASE_PATH는 빈 문자열로 고정합니다.
 */

(function() {
    // 깃허브 메인 도메인을 사용하게 되었으므로 어떤 환경이든 기본 경로는 '' 입니다.
    window.BASE_PATH = '';
    console.log('[BASE_PATH 설정]', window.BASE_PATH || '(로컬/메인루트)');
})();
