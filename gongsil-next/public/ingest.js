
require('dotenv').config();
const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// 공용 HTTP GET 요청 함수 (타임아웃 및 헤더 포함)
function fetchContent(url, headers = {}) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + (urlObj.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          ...headers
        },
        timeout: 20000 // 20초 타임아웃
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          resolve(data);
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('전송 시간 초과 (20s)'));
      });

      req.on('error', (e) => reject(e));
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

const parser = new Parser({
  customFields: {
    item: [
      ['georss:point', 'geoPoint'],
      ['content:encoded', 'contentEncoded']
    ],
  },
});

const KAKAO_REST_API_KEY = '535b712ad15df457168dcab800fcb4aa';

const RSS_FEEDS = [
  { url: 'https://www.gongsilnews.com/rss/allArticle.xml', category: '전체기사' },
  { url: 'https://www.gongsilnews.com/rss/S1N1.xml', category: '공실뉴스' },
  { url: 'https://www.gongsilnews.com/rss/S1N4.xml', category: '뉴스칼럼' },
  { url: 'https://www.gongsilnews.com/rss/S1N5.xml', category: '공실스터디' }
];

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 에러: SUPABASE_URL 또는 SUPABASE_KEY가 .env 파일에 없습니다.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// 지역명 추출을 위한 확장된 리스트
const REGIONS = [
  '강남', '서초', '송파', '강동', '용산', '성동', '광진', '동대문', '중랑', '성북', '강북', '도봉', '노원', '은평', '서대문', '마포', '양천', '강서', '구로', '금천', '영등포', '동작', '관악', '종로', '중구',
  '수원', '성남', '분당', '판교', '용인', '수지', '기흥', '고양', '일산', '과천', '안양', '평촌', '군포', '산본', '의왕', '부천', '광명', '하남', '미사', '구리', '남양주', '다산', '별내', '시흥', '안산', '평택', '고덕', '화성', '동탄', '오산', '김포', '파주', '운정', '양주', '포천', '여주', '이천', '가평', '양평',
  '인천', '송도', '청라', '검단', '부평', '부산', '해운대', '대구', '수성', '대전', '유성', '광주', '울산', '세종', '제주',
  '압구정', '청담', '삼성', '대치', '도곡', '개포', '일원', '수서', '반포', '잠원', '방배', '양재', '역삼', '선릉', '잠실', '신천', '풍납', '가락', '문정', '한남', '이태원', '보광', '동부이촌', '성수', '금호', '옥수', '왕십리', '여의도', '목동', '상계', '중계', '하계', '마곡', '흑석', '노량진', '아현', '북아현', '공덕', '상암', '연희', '가로수길', '경리단길', '샤로수길', '망리단길'
];

async function getCoordinates(query) {
  if (!query) return null;
  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=1`;
    const headers = { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` };
    const jsonStr = await fetchContent(url, headers);
    const data = JSON.parse(jsonStr);

    if (data && data.documents && data.documents.length > 0) {
      const { x, y } = data.documents[0];
      return { lat: parseFloat(y), lng: parseFloat(x) };
    }
  } catch (error) {
    // console.error(`  - 위치 검색 실패 "${query}":`, error.message);
  }
  return null;
}

function extractRegion(title) {
  for (const region of REGIONS) {
    if (title.includes(region)) return region;
  }
  return null;
}

async function fetchAndStoreNews() {
  console.log(`\n==================================================`);
  console.log(`기사 수집 시작: ${new Date().toLocaleString()}`);
  console.log(`==================================================`);

  let totalNew = 0;

  for (const feedInfo of RSS_FEEDS) {
    try {
      console.log(`\n[${feedInfo.category}] 피드 가져오는 중...`);
      const xml = await fetchContent(feedInfo.url);
      const feed = await parser.parseString(xml);
      console.log(`- ${feed.items.length}개의 기사를 찾았습니다.`);

      let newCount = 0;
      for (const item of feed.items) {
        try {
          const pubDate = new Date(item.pubDate);
          if (isNaN(pubDate.getTime())) continue;

          let lat = null, lng = null;

          // 1. RSS 제공 좌표 우선 사용
          if (item.geoPoint && typeof item.geoPoint === 'string') {
            const parts = item.geoPoint.trim().split(/\s+/);
            if (parts.length === 2) {
              lat = parseFloat(parts[0]);
              lng = parseFloat(parts[1]);
            }
          }

          // 2. 좌표가 없거나 기본값(서울시청 등)인 경우 제목에서 지역 추출후 재검색
          const isBasicPoint = (lat && Math.abs(lat - 37.566) < 0.01 && Math.abs(lng - 126.978) < 0.01);

          if (!lat || !lng || isBasicPoint) {
            const region = extractRegion(item.title);
            if (region) {
              await new Promise(r => setTimeout(r, 150)); // API 부하 방지 및 안정성
              const coords = await getCoordinates(region);
              if (coords) {
                lat = coords.lat;
                lng = coords.lng;
              }
            }
          }

          let imageUrl = null;
          const content = item.content || item.contentEncoded || '';
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];

          // HTML 태그 제거 및 길이 제한
          const cleanDescription = (item.contentSnippet || item.content || '').substring(0, 300).replace(/<[^>]*>?/gm, '');

          const newsData = {
            title: item.title,
            link: item.link,
            description: cleanDescription,
            pub_date: pubDate.toISOString(),
            author: item.author || item.creator || '공실뉴스',
            lat: lat,
            lng: lng,
            image_url: imageUrl,
            source: 'gongsilnews',
            category: feedInfo.category
          };

          const { error } = await supabase.from('news').upsert(newsData, { onConflict: 'link' });

          if (error) {
            process.stdout.write('x');
          } else {
            process.stdout.write('.');
            newCount++;
          }
        } catch (itemError) {
          // 개별 아이템 에러 무시
        }
      }
      console.log(`\n- [${feedInfo.category}] 처리 완료: ${newCount}개`);
      totalNew += newCount;

    } catch (err) {
      console.error(`❌ ${feedInfo.category} 연결 또는 파싱 실패:`, err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`모든 작업 완료! 총 처리된 기사: ${totalNew}`);
  console.log(`종료 시간: ${new Date().toLocaleString()}`);
  console.log(`==================================================\n`);
}

fetchAndStoreNews();
