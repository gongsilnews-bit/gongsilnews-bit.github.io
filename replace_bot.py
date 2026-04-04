import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Using regex to capture the exact submitAiChat function
pattern = re.compile(r'    function submitAiChat\(\) \{.*?    \}', re.DOTALL)
match = pattern.search(text)

if match:
    new_func = '''    async function submitAiChat() {
        const input = document.getElementById('aiChatInput');
        const userText = input.value.trim();
        if (!userText) return;
        
        const body = document.getElementById('aiChatBody');
        
        const userHtml = `
            <div class="chat-msg user" style="animation: fadeIn 0.3s;">
                <div class="bubble">${userText}</div>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', userHtml);
        input.value = '';
        body.scrollTop = body.scrollHeight;
        
        const typingId = 'typing_' + Date.now();
        const typingHtml = `
            <div class="chat-msg bot" id="${typingId}">
                <div class="bubble">
                    <div class="typing-indicator"><span></span><span></span><span></span></div>
                </div>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', typingHtml);
        body.scrollTop = body.scrollHeight;
        
        try {
            const API_KEY = "YOUR_OPENAI_API_KEY"; 
            if (API_KEY === "YOUR_OPENAI_API_KEY") {
                throw new Error("mock_mode");
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: '당신은 AI 부동산 웹 기사/콘텐츠 작성기입니다. 사용자의 입력을 바탕으로 전문적이고 가독성 높은 기사 초안 등 텍스트를 작성해줍니다. 응답 마지막에 에디터로 입력할 수 있는 초안이라면 [버튼생성] 이라는 플래그 단어를 반드시 넣어주세요.' },
                        { role: 'user', content: userText }
                    ]
                })
            });
            
            if (!response.ok) throw new Error("API_ERROR");
            
            const data = await response.json();
            let reply = data.choices[0].message.content;

            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            
            let showButton = false;
            if (reply.includes('[버튼생성]')) {
                showButton = true;
                reply = reply.replace('[버튼생성]', '').trim();
            }
            
            const botHtml = `
                <div class="chat-msg bot" style="animation: fadeIn 0.3s;">
                    <div class="bubble">${reply.replace(/\\n/g, '<br>')}</div>
                    ${ showButton ? `<div><button class="chat-action-btn" onclick="applyAiChatToEditor(this)">✏️ 본문에 입력</button></div>` : '' }
                </div>
            `;
            body.insertAdjacentHTML('beforeend', botHtml);
            body.scrollTop = body.scrollHeight;

        } catch (e) {
            // API 연동 실패 혹은 키 미설정시 데모(Mock) 응답 구동
            setTimeout(() => {
                const typingEl = document.getElementById(typingId);
                if (typingEl) typingEl.remove();
                
                let mockReply = "";
                let showBtn = false;
                const lowerText = userText.toLowerCase();
                
                if (lowerText.includes("기사작성 해줘") || lowerText.includes("기사") || lowerText.includes("작성해 줘")) {
                    mockReply = "훌륭합니다! 어떤 주제나 매물을 다룬 기사를 원하시나요? (예: 은마아파트 30평형 전세, 강남역 상가 월세 동향 등 자유롭게 말씀해주세요.)";
                } else if (lowerText.includes("은마") || lowerText.includes("대치동") || lowerText.includes("아파트") || lowerText.includes("원룸") || lowerText.includes("급매") || lowerText.includes("월세") || lowerText.includes("전세") || lowerText.length > 8) {
                    mockReply = `주신 내용을 바탕으로 기사 초안을 준비했습니다!<br><br>
                    <strong>[제목]</strong><br>
                    ${lowerText.substring(0, 10)}${lowerText.length > 10 ? '...' : ''} 관련 부동산 최신 동향 및 분석<br><br>
                    <strong>[본문]</strong><br>
                    최근 시장에서 ${lowerText.substring(0, 15)}${lowerText.length > 15 ? '...' : ''} 매물에 대한 관심이 집중되고 있습니다. 현장 취재 결과 주변 시세 대비 합리적인 조건으로 인해 수요자들의 문의가 크게 증가하고 있으며, 향후 가치 상승이 기대되는 지역입니다.<br>
                    보다 자세한 상담이나 현장 방문은 지역 전문 공인중개사와 상의하는 것이 유리합니다.<br><br>에디터 본문에 바로 삽입하시겠습니까?`;
                    showBtn = true;
                } else if (lowerText.includes("안녕")) {
                    mockReply = "안녕하세요! 공실뉴스 부동산 AI 마법사입니다. 기사, 블로그, 쇼츠 대본까지 전부 제가 도와드릴테니 편하게 말씀해주세요. 🪄";
                } else {
                    mockReply = "지금은 AI가 학습 중입니다. '기사 작성해줘' 또는 원하시는 매물 정보(지역, 아파트명 등)를 구체적으로 입력해주시면 멋진 초안을 만들어 드립니다!";
                }

                const botHtml = `
                    <div class="chat-msg bot" style="animation: fadeIn 0.3s;">
                        <div class="bubble">
                            <span style="font-size:10px;color:#9ca3af;">(Demo Smart Bot)</span><br>
                            ${mockReply}
                        </div>
                        ${ showBtn ? `<div><button class="chat-action-btn" onclick="applyAiChatToEditor(this)">✏️ 본문에 입력</button></div>` : '' }
                    </div>
                `;
                body.insertAdjacentHTML('beforeend', botHtml);
                body.scrollTop = body.scrollHeight;
            }, 800);
        }
    }'''
    text = text.replace(match.group(0), new_func)
    
    with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS SMART BOT REPLACED")
else:
    print("NOT FOUND submitAiChat")
