import re

with open('register.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update UI for Address search to include Building Info button
ui_original = """            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <h2 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">위치/주소</h2>
                <button type="button" onclick="searchAddress()" style="background: #333d4b; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    🔍 찾기
                </button>
            </div>"""

ui_new = """            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <h2 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">위치/주소</h2>
                    <button type="button" onclick="fetchBuildingInfo()" style="background: #10b981; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight:bold;">
                        🏢 건축물대장 자동입력
                    </button>
                    <span id="bldStatus" style="font-size:12px; color:#ef4444; font-weight:bold;"></span>
                </div>
                <button type="button" onclick="searchAddress()" style="background: #333d4b; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    🔍 찾기
                </button>
            </div>"""

html = html.replace(ui_original, ui_new)

# Update searchAddress function to store bcode and jibun
js_search_orig = """                    document.getElementById('sido').value = sido;
                    document.getElementById('sigungu').value = sigungu;
                    document.getElementById('dong').value = dongRi;
                    document.getElementById('buildingName').value = buildingName;"""

js_search_new = """                    document.getElementById('sido').value = sido;
                    document.getElementById('sigungu').value = sigungu;
                    document.getElementById('dong').value = dongRi;
                    document.getElementById('buildingName').value = buildingName;
                    
                    // 건축물대장 연동을 위한 숨겨진 데이터 저장
                    window.currentBcode = data.bcode; // 10자리 (시군구5 + 법정동5)
                    window.currentJibun = data.jibunAddress || data.autoJibunAddress || "";
                    if(data.buildingName) {
                        document.getElementById('bldStatus').innerText = "✓ 주소 준비완료 (가져오기 클릭)";
                        document.getElementById('bldStatus').style.color = "#10b981";
                    }"""

html = html.replace(js_search_orig, js_search_new)

# Add fetchBuildingInfo function inside script
fetch_logic = """
        window.fetchBuildingInfo = async function() {
            if(!window.currentBcode || !window.currentJibun) {
                alert("먼저 '🔍 찾기' 버튼을 눌러 주소를 완벽하게 선택해주세요.");
                return;
            }
            
            const statusEl = document.getElementById('bldStatus');
            statusEl.innerText = "⏳ 가져오는 중...";
            statusEl.style.color = "#f59e0b";
            
            try {
                const sigunguCd = window.currentBcode.substring(0, 5);
                const bjdongCd = window.currentBcode.substring(5, 10);
                
                // 지번 추출 (e.g. 역삼동 123-45 -> bun: 0123, ji: 0045)
                const jibunMatch = window.currentJibun.match(/\\d+(-[\\d]+)?$/);
                let bun = "0000";
                let ji = "0000";
                if(jibunMatch) {
                    const parts = jibunMatch[0].split('-');
                    bun = parts[0].padStart(4, '0');
                    if(parts.length > 1) ji = parts[1].padStart(4, '0');
                } else {
                    throw new Error("지번을 유추할 수 없습니다. (도로명만 있는 경우 자동입력 불가)");
                }
                
                const apiKey = "0c70894217e28613a63cea5f413098c837a45e1d3fdba3fa94b9dc273cf12e7d"; // 사용자 제공
                
                // CORS 우회를 위해 allorigins 또는 프록시 사용
                const targetUrl = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrBasisOulnInfo?serviceKey=${apiKey}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&platGbCd=0&bun=${bun}&ji=${ji}&numOfRows=10&pageNo=1&_type=json`;
                // proxy bypass
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
                
                const response = await fetch(proxyUrl);
                const result = await response.json();
                const rawJson = JSON.parse(result.contents); // allorigins returns contents as string
                
                if(rawJson.response && rawJson.response.body && rawJson.response.body.items) {
                    let item = rawJson.response.body.items.item;
                    if(Array.isArray(item)) item = item[0]; // 여러동일 경우 첫번째 기준
                    if(!item) throw new Error("건축물대장 정보가 없습니다.");
                    
                    console.log("건축물 정보 반환:", item);
                    
                    // 1. 주차장 대수 (옥내 + 옥외 등)
                    const totalParking = (parseInt(item.indrAutoUtcnt||0) + parseInt(item.indrMechUtcnt||0) + parseInt(item.oudrAutoUtcnt||0) + parseInt(item.oudrMechUtcnt||0));
                    if(totalParking > 0) {
                        const sel = document.getElementById('parkingCount');
                        if(totalParking >= 3) sel.value = "3대이상";
                        else sel.value = totalParking + "대";
                    }
                    
                    // 2. 면적 (대지면적 연면적 등이 있으나 주로 해당 호실 전용면적은 전유부에서 가져와야 함)
                    // 표제부에서는 일반적인 건물 스펙만. 공급면적을 대략적으로 사용할 수도 있음.
                    if(item.totArea) {
                        document.getElementById('supplyArea').value = item.totArea;
                        if(typeof convertArea === 'function') convertArea('m2', 'supply');
                    }
                    
                    // 3. 엘리베이터 여부
                    const totalElvt = (parseInt(item.rideUseElvtCnt||0) + parseInt(item.emgenUseElvtCnt||0));
                    // (UI에 엘리베이터가 있다면 체크하겠지만 없으므로 설명에 추가 가능)
                    if(totalElvt > 0) {
                        const desc = document.getElementById('description');
                        if(desc && !desc.value.includes("엘리베이터")) {
                            desc.value += `\\n✨ 특징: 엘리베이터 있음 (총 ${totalElvt}대)`;
                        }
                    }
                    
                    statusEl.innerText = "✓ 성공 (총괄표제부 연동 완료)";
                    statusEl.style.color = "#10b981";
                    
                } else {
                    throw new Error("결과 없음 (서버 오류 또는 데이터 없음)");
                }
                
            } catch(e) {
                console.error(e);
                statusEl.innerText = "❌ 실패: " + e.message;
                statusEl.style.color = "#ef4444";
            }
        };
"""

if "window.fetchBuildingInfo" not in html:
    html = html.replace("window.searchAddress = function() {", fetch_logic + "\n        window.searchAddress = function() {")

with open('register.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Patch applied")
