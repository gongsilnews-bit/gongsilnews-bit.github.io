import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to replace the entire catch (e) { ... } block
# Let's locate it via regex
catch_pattern = re.compile(r'} catch \(e\) {.*?setTimeout\(\(\) => {.*?body\.scrollTop = body\.scrollHeight;\n\s*}, 1000\);\n\s*}', re.DOTALL)
match = catch_pattern.search(text)

if match:
    # Build smart mock
    smart_mock = r'''} catch (e) {
            console.warn(e);
            
            // API 연동 실패 혹은 키 미설정시 데모(Mock) 스마트 응답 구동
            setTimeout(() => {
                const typingEl = document.getElementById(typingId);
                if (typingEl) typingEl.remove();

                let mockReply = "";
                let showBtn = false;
                
                // 간단한 룰베이스 챗봇 (스마트 모의 대화)
                const userInput = text.toLowerCase();
                
                if (userInput.includes("기사작성 해줘") || userInput.includes("기사작성") || userInput === "기사" || userInput.includes("기사 써줘")) {
                    mockReply = "기사 작성이 필요하시군요! 어떤 주제나 매물로 기사를 원하시나요? (예: 은마아파트 30평형 전세, 강남역 상가 월세 등 매물 상세 정보나 주제를 알려주세요.)";
                } else if (userInput.includes("은마") || userInput.includes("대치동") || userInput.includes("아파트") || userInput.includes("원룸") || userInput.includes("급매") || userInput.includes("월세") || userInput.includes("전세") || userInput.length > 15) {
                    mockReply = `말씀하신 정보를 바탕으로 기사 초안을 작성했습니다!<br><br>
                    <strong>[제목]</strong><br>
                    ${text.substring(0, 10)}... 관련 부동산 최신 동향 및 분석<br><br>
                    <strong>[본문]</strong><br>
                    최근 시장에서 ${text.substring(0, 15)}... 매물에 대한 관심이 집중되고 있습니다. 현장 취재 결과 주변 시세 대비 합리적인 조건으로 인해 수요자들의 문의가 크게 증가하고 있으며, 향후 가치 상승이 기대되는 지역입니다.<br>
                    보다 자세한 상담이나 현장 방문은 지역 전문 공인중개사와 상의하는 것이 유리합니다.<br><br>에디터 본문에 바로 삽입하시겠습니까?`;
                    showBtn = true;
                } else if (userInput.includes("안녕")) {
                    mockReply = "안녕하세요! 공실뉴스 부동산 AI 마법사입니다. 기사, 블로그, 쇼츠 대본까지 전부 제가 도와드릴테니 편하게 말씀해주세요. 🪄";
                } else {
                    mockReply = "AI가 학습 중입니다. '기사 작성해줘' 또는 매물 정보(지역, 아파트명, 특징 등)를 자세히 입력해주시면 멋진 초안을 만들어 드립니다!";
                }

                const botHtml = `
                    <div class="chat-msg bot" style="animation: fadeIn 0.3s; width: 100%;">
                        <div class="bubble">
                            <span style="font-size:10px;color:#9ca3af;">(Demo Mode)</span><br>
                            ${mockReply}
                        </div>
                        ${ showBtn ? `<div><button class="chat-action-btn" onclick="applyAiChatToEditor(this)">✏️ 본문에 입력</button></div>` : '' }
                    </div>
                `;
                body.insertAdjacentHTML('beforeend', botHtml);
                body.scrollTop = body.scrollHeight;
            }, 800);
        }'''
    
    text = text.replace(match.group(0), smart_mock)
    with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS SMART MOCK")
else:
    print("CATCH block not found")

