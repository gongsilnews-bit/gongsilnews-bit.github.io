
const https = require('https');

function getJSON(url, headers = {}) {
    return new Promise((resolve, reject) => {
        try {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                headers: headers,
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 400) {
                        reject(new Error(`HTTP Error: ${res.statusCode}`));
                        return;
                    }
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`JSON Parse Error: ${e.message}`));
                    }
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request Timeout (10s)'));
            });

            req.on('error', (e) => reject(e));
            req.end();
        } catch (error) {
            reject(error);
        }
    });
}

const KAKAO_REST_API_KEY = '535b712ad15df457168dcab800fcb4aa';

async function testKakao() {
    try {
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent('강남구')}&size=1`;
        const headers = { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` };
        const data = await getJSON(url, headers);
        console.log('Kakao API Status: OK');
        console.log('Result:', data.documents[0].place_name);
    } catch (err) {
        console.error('Kakao API Status: FAIL', err.message);
    }
}

testKakao();
