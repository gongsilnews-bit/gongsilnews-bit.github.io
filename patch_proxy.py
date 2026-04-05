import re

with open('register.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change the logic in fetchBuildingInfo
old_logic = """                // CORS 우회를 위해 allorigins 또는 프록시 사용
                const targetUrl = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrBasisOulnInfo?serviceKey=${apiKey}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&platGbCd=0&bun=${bun}&ji=${ji}&numOfRows=10&pageNo=1&_type=json`;
                // proxy bypass
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
                
                const response = await fetch(proxyUrl);
                const result = await response.json();
                const rawJson = JSON.parse(result.contents); // allorigins returns contents as string"""

new_logic = """                // 직접 호출 (정부 API _type=json 은 CORS를 허용하는 경우가 많음)
                const targetUrl = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrBasisOulnInfo?serviceKey=${apiKey}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&platGbCd=0&bun=${bun}&ji=${ji}&numOfRows=10&pageNo=1&_type=json`;
                
                const response = await fetch(targetUrl);
                
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                
                const contentType = response.headers.get("content-type");
                let rawJson;
                if (contentType && contentType.indexOf("application/xml") !== -1) {
                    // 에러 시 XML로 떨어질 때가 있음
                    const text = await response.text();
                    console.log("정부 API XML 에러 반환:", text);
                    if(text.includes('INVALID_REQUEST_PARAMETER_ERROR')) throw new Error("API 파라미터 에러 (주소가 잘못되었습니다.)");
                    if(text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) throw new Error("API 키가 아직 등록되지 않았거나 잘못되었습니다. (발급 후 1~2시간 소요될 수 있음)");
                    throw new Error("정부 API XML 형식 에러 (콘솔 확인 요망)");
                } else {
                    rawJson = await response.json();
                }"""

html = html.replace(old_logic, new_logic)

with open('register.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("success")
