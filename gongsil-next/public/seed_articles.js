const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjrjrjnsiynrcelzepju.supabase.co';
const supabaseKey = 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj';
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    { s1: '우리동네부동산', s2: '아파트·오피스텔' },
    { s1: '우리동네부동산', s2: '빌라·주택' },
    { s1: '우리동네부동산', s2: '원룸·투룸' },
    { s1: '우리동네부동산', s2: '상가·업무·공장·토지' },
    { s1: '우리동네부동산', s2: '분양' },
    { s1: '뉴스/칼럼', s2: '부동산·주식·재테크' },
    { s1: '뉴스/칼럼', s2: '정치·경제·사회' },
    { s1: '뉴스/칼럼', s2: '세무·법률' },
    { s1: '뉴스/칼럼', s2: '여행·맛집' },
    { s1: '뉴스/칼럼', s2: '건강·헬스' }
];

const locations = [
    { title: '강남역', lat: 37.4979, lng: 127.0276, address: '서울 강남구 역삼동' },
    { title: '역삼역', lat: 37.5006, lng: 127.0364, address: '서울 강남구 역삼동' },
    { title: '선릉역', lat: 37.5045, lng: 127.0490, address: '서울 강남구 대치동' },
    { title: '삼성역', lat: 37.5088, lng: 127.0632, address: '서울 강남구 삼성동' },
    { title: '서울역', lat: 37.5546, lng: 126.9706, address: '서울 중심가' },
    { title: '여의도역', lat: 37.5215, lng: 126.9242, address: '서울 영등포구 여의도동' },
    { title: '홍대입구역', lat: 37.5568, lng: 126.9237, address: '서울 마포구 동교동' },
    { title: '신촌역', lat: 37.5551, lng: 126.9369, address: '서울 마포구 노고산동' },
    { title: '명동역', lat: 37.5610, lng: 126.9863, address: '서울 중구 명동' },
    { title: '잠실역', lat: 37.5133, lng: 127.1001, address: '서울 송파구 신천동' },
    { title: '용산역', lat: 37.5298, lng: 126.9647, address: '서울 용산구 한강로3가' },
    { title: '마곡역', lat: 37.5602, lng: 126.8327, address: '서울 강서구 마곡동' }
];

const titles = [
    "부동산 시장의 새로운 변화, 내년부터 어떻게 될까?",
    "상승세 꺾인 아파트값, 매수 타이밍 언제가 좋을까?",
    "전문가가 분석한 1인가양 원룸 트렌드 리포트",
    "신도시 분양 청약 경쟁률 상상초월, 그 이유는?",
    "임대인·임차인이 꼭 알아야 할 개정 세무 법률 정리",
    "수익형 부동산, 상가 투자 시 유의해야 할 리스크 점검",
    "지하철 연장선 개통에 쏠리는 역세권 수혜지 TOP 5!!",
    "건강을 생각하는 에코 인테리어 인기몰이, 어떻게 바꿀까?",
    "여의도, 마곡 대규모 개발 소식에 주변 집값 들썩",
    "빌라 매입 시 사기 예방! 꼼꼼하게 따져봐야 할 필수 체크리스트"
];

const bodies = [
    "<p>부동산 관련 정책이 다양하게 발표되고 있습니다. 투자 및 실거주를 위해 장기적인 관점에서 신중히 접근할 필요가 있습니다.</p>",
    "<p>주거 트렌드가 급변하고 있습니다. 전문가들은 올해 하반기를 예의주시하고 있으며 다양한 데이터를 기반으로 한 분석이 필수적입니다.</p><p><b>핵심 전망 점검:</b> 지역별 자원 및 교통 인프라를 잘 살펴보고 결정하세요.</p>",
    "<p>최근 조사에 따르면 수요 대비 공급이 부족한 지역을 중심으로 상승세가 뚜렷합니다. 관련 시장 상황을 면밀히 분석하고 대비하는 것이 좋습니다.</p>",
    "<p><img src='https://source.unsplash.com/random/600x400/?building,city' style='max-width:100%; border-radius:8px;'></p><p>수많은 투자자들이 지켜보는 가운데, 상반기 분양 시장 결과가 향후 시장의 나침반이 될 것으로 기대됩니다. 주요 지역 개발 현황을 자세히 요약했습니다.</p>",
    "<p>이 기사는 시장 분위기를 그대로 전해드립니다. 최근 발표된 세무 항목 및 개정 사항에 유의하여 안전한 자산 관리를 실천해 보세요.</p>"
];

async function seed() {
    let articles = [];

    // 10 카테고리 당 10개씩 -> 총 100개
    for (let c of categories) {
        for (let i = 0; i < 10; i++) {
            // 랜덤 요소 선택
            const t = titles[Math.floor(Math.random() * titles.length)];
            const b = bodies[Math.floor(Math.random() * bodies.length)];
            // 임의의 지도 좌표 1~2개 선택
            const locCount = Math.floor(Math.random() * 2) + 1;
            let maps = [];
            for (let m=0; m<locCount; m++) {
                maps.push(locations[Math.floor(Math.random() * locations.length)]);
            }

            // 날짜: 최근 30일 이내 무작위
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            articles.push({
                title: `[테스트] ${c.s1} - ${c.s2} 이슈 (${i+1}) _ ${t}`,
                content: `<p>[${c.s1} > ${c.s2}] 테스트 데이터입니다.</p>${b}`,
                section1: c.s1,
                section2: c.s2,
                status: 'approve',
                article_type: 'normal',
                reporter_name: 'AI테스터',
                view_count: Math.floor(Math.random() * 100),
                lat: maps.length > 0 ? maps[0].lat : null,
                lng: maps.length > 0 ? maps[0].lng : null,
                created_at: date.toISOString()
            });
        }
    }

    console.log(`총 ${articles.length} 건 삽입 준비...`);
    
    // Chunk 단위 삽입 (한 번에 너무 많이 쏘면 에러날 수 있음)
    for (let i = 0; i < articles.length; i += 20) {
        const chunk = articles.slice(i, i + 20);
        const { error } = await supabase.from('articles').insert(chunk);
        if (error) {
            console.error('Error inserting:', error);
            return;
        }
        console.log(`Inserted ${i + chunk.length} / ${articles.length}`);
    }

    console.log("시딩 완전 종료!");
}

seed();
