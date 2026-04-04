import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. API 기능 연결 (submitAiChat 교체)
old_submit = '''    function submitAiChat() {
        const input = document.getElementById('aiChatInput');
        const text = input.value.trim();
        if (!text) return;
        
        const body = document.getElementById('aiChatBody');
        
        // 유저 메시지 마크업
        const userHtml = 
            <div class="chat-msg user" style="animation: fadeIn 0.3s;">
                <div class="bubble">\</div>
            </div>
        ;
        body.insertAdjacentHTML('beforeend', userHtml);
        input.value = '';
        body.scrollTop = body.scrollHeight;
        
        // 임시 로딩(타이핑) 상태 추가
        const typingId = 'typing_' + Date.now();
        const typingHtml = 
            <div class="chat-msg bot" id="\">
                <div class="bubble">
                    <div class="typing-indicator"><span></span><span></span><span></span></div>
                </div>
            </div>
        ;
        body.insertAdjacentHTML('beforeend', typingHtml);
        body.scrollTop = body.scrollHeight;
        
        // AI응답 스피너 대기 후 봇 메시지 띄우기 (데모 시뮬레이션)
        setTimeout(() => {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            const botHtml = 
                <div class="chat-msg bot" style="animation: fadeIn 0.3s;">
                    <div class="bubble">
                        네, 입력하신 정보에 맞추어 초안을 준비했습니다!<br><br>
                        <strong>[제목]</strong><br>
                        대치동 은마아파트 급매물, 시장에 미칠 영향은?<br><br>
                        방금 에디터에 적용해 보시겠어요?
                    </div>
                    <div>
                        <button class="chat-action-btn" onclick="applyAiChatToEditor(this)">✏️ 본문에 입력</button>
                    </div>
                </div>
            ;
            body.insertAdjacentHTML('beforeend', botHtml);
            body.scrollTop = body.scrollHeight;
        }, 1500);
    }'''

new_submit = '''    async function submitAiChat() {
        const input = document.getElementById('aiChatInput');
        const text = input.value.trim();
        if (!text) return;
        
        const body = document.getElementById('aiChatBody');
        
        // 유저 메시지 마크업
        const userHtml = 
            <div class="chat-msg user" style="animation: fadeIn 0.3s;">
                <div class="bubble">\</div>
            </div>
        ;
        body.insertAdjacentHTML('beforeend', userHtml);
        input.value = '';
        body.scrollTop = body.scrollHeight;
        
        // 로딩(타이핑) 상태 추가
        const typingId = 'typing_' + Date.now();
        const typingHtml = 
            <div class="chat-msg bot" id="\">
                <div class="bubble">
                    <div class="typing-indicator"><span></span><span></span><span></span></div>
                </div>
            </div>
        ;
        body.insertAdjacentHTML('beforeend', typingHtml);
        body.scrollTop = body.scrollHeight;
        
        try {
            // 실제 OpenAI API 호출 (발급받은 실제 API_KEY 문자열을 넣어 상용으로 전환하세요)
            const API_KEY = "YOUR_OPENAI_API_KEY"; 
            
            if (API_KEY === "YOUR_OPENAI_API_KEY") {
                // 키가 설정되지 않은 경우 데모 응답으로 부드럽게 폴백(Fallback) 됩니다.
                throw new Error("OpenAI API 키가 설정되지 않아 데모 메시지를 출력합니다.");
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': Bearer \
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: '당신은 AI 부동산 웹 기사/콘텐츠 작성기입니다. 사용자의 입력을 바탕으로 전문적이고 가독성 높은 기사 초안, 블로그 내용, 쇼츠 대본 등을 작성해줍니다. 결과는 HTML 형식 안에서 깔끔하게 단락을 나누어 제공하세요. 응답 마지막에 에디터로 입력할 수 있는 초안이라면 [버튼생성] 이라는 플래그 단어를 반드시 넣어주세요.' },
                        { role: 'user', content: text }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error("API 연동 중 오류 발생: " + response.status);
            }
            
            const data = await response.json();
            const reply = data.choices[0].message.content;

            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            
            // 답변 포맷 처리 및 버튼 생성 플래그 검사
            let formattedReply = reply;
            let showButton = false;
            if (formattedReply.includes('[버튼생성]')) {
                showButton = true;
                formattedReply = formattedReply.replace('[버튼생성]', '').trim();
            }
            
            const botHtml = 
                <div class="chat-msg bot" style="animation: fadeIn 0.3s;">
                    <div class="bubble">\</div>
                    \
                </div>
            ;
            body.insertAdjacentHTML('beforeend', botHtml);
            body.scrollTop = body.scrollHeight;

        } catch (e) {
            console.warn(e);
            // API 연동 실패 혹은 키 미설정시 데모(Mock) 응답 구동
            setTimeout(() => {
                const typingEl = document.getElementById(typingId);
                if (typingEl) typingEl.remove();

                const botHtml = 
                    <div class="chat-msg bot" style="animation: fadeIn 0.3s;">
                        <div class="bubble">
                            <span style="font-size:11px;color:#f97316;">[\]</span><br><br>
                            네, 입력하신 정보에 맞추어 초안을 준비했습니다!<br><br>
                            <strong>[제목]</strong><br>
                            대치동 은마아파트 급매물, 시장에 미칠 영향은?<br><br>
                            본문:<br>
                            최근 대치동 은마아파트에서 급매물이 등장하여 부동산 시장의 이목이 쏠리고 있습니다. 기존 호가 대비 파격적인 가격으로 조정된 이번 매물은...<br><br>
                            방금 에디터에 적용해 보시겠어요?
                        </div>
                        <div>
                            <button class="chat-action-btn" onclick="applyAiChatToEditor(this)">✏️ 본문에 입력</button>
                        </div>
                    </div>
                ;
                body.insertAdjacentHTML('beforeend', botHtml);
                body.scrollTop = body.scrollHeight;
            }, 1000);
        }
    }'''

text = text.replace(old_submit, new_submit)


# 2. 사방에서 크기조절을 위한 마크업 및 JS 주입
resize_handles_css = '''
    /* 사방 크기조절 핸들 */
    .resizer { position: absolute; z-index: 9999; }
    .resizer-n { top: -3px; left: 0; right: 0; height: 6px; cursor: n-resize; }
    .resizer-s { bottom: -3px; left: 0; right: 0; height: 6px; cursor: s-resize; }
    .resizer-e { top: 0; bottom: 0; right: -3px; width: 6px; cursor: e-resize; }
    .resizer-w { top: 0; bottom: 0; left: -3px; width: 6px; cursor: w-resize; }
    .resizer-ne { top: -3px; right: -3px; width: 8px; height: 8px; cursor: ne-resize; }
    .resizer-nw { top: -3px; left: -3px; width: 8px; height: 8px; cursor: nw-resize; }
    .resizer-se { bottom: -3px; right: -3px; width: 8px; height: 8px; cursor: se-resize; }
    .resizer-sw { bottom: -3px; left: -3px; width: 8px; height: 8px; cursor: sw-resize; }
    </style>
'''
text = text.replace('    </style>', resize_handles_css)

resize_handles_html = '''    <div id="aiChatWidget" class="ai-chat-widget">
        <!-- Resize Handles -->
        <div class="resizer resizer-n" data-resize="n"></div>
        <div class="resizer resizer-s" data-resize="s"></div>
        <div class="resizer resizer-e" data-resize="e"></div>
        <div class="resizer resizer-w" data-resize="w"></div>
        <div class="resizer resizer-ne" data-resize="ne"></div>
        <div class="resizer resizer-nw" data-resize="nw"></div>
        <div class="resizer resizer-se" data-resize="se"></div>
        <div class="resizer resizer-sw" data-resize="sw"></div>
        
        <div class="ai-chat-header">'''
text = text.replace('    <div id="aiChatWidget" class="ai-chat-widget">\n        <div class="ai-chat-header">', resize_handles_html)


resize_logic = '''
    // --- 8-Direction Resizable AI Chat Widget ---
    document.addEventListener('DOMContentLoaded', () => {
        const chatWidget = document.getElementById('aiChatWidget');
        const resizers = chatWidget.querySelectorAll('.resizer');
        
        // 크기 조절 (리사이즈) 로직
        let r_isResizing = false;
        let r_currentResizer = null;
        let r_startX, r_startY, r_startW, r_startH, r_startL, r_startT;
        
        for (let resizer of resizers) {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                r_isResizing = true;
                r_currentResizer = resizer.getAttribute('data-resize');
                
                const rect = chatWidget.getBoundingClientRect();
                r_startX = e.clientX;
                r_startY = e.clientY;
                r_startW = rect.width;
                r_startH = rect.height;
                // top/left를 명시적으로 계산 (right/bottom 제거 효과)
                chatWidget.style.bottom = 'auto';
                chatWidget.style.right = 'auto';
                r_startL = rect.left;
                r_startT = rect.top;
                chatWidget.style.left = r_startL + 'px';
                chatWidget.style.top = r_startT + 'px';
            });
        }
        
        document.addEventListener('mousemove', (e) => {
            if (!r_isResizing) return;
            const dx = e.clientX - r_startX;
            const dy = e.clientY - r_startY;
            
            let newW = r_startW;
            let newH = r_startH;
            let newL = r_startL;
            let newT = r_startT;
            
            // 방향별 리사이즈 계산
            if (r_currentResizer.includes('e')) newW = r_startW + dx;
            if (r_currentResizer.includes('s')) newH = r_startH + dy;
            if (r_currentResizer.includes('w')) {
                newW = r_startW - dx;
                newL = r_startL + dx;
            }
            if (r_currentResizer.includes('n')) {
                newH = r_startH - dy;
                newT = r_startT + dy;
            }
            
            // 최소 크기 제한 방어
            if (newW > 350) { 
                chatWidget.style.width = newW + 'px';
                if (r_currentResizer.includes('w')) chatWidget.style.left = newL + 'px';
            }
            if (newH > 400) {
                chatWidget.style.height = newH + 'px';
                if (r_currentResizer.includes('n')) chatWidget.style.top = newT + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            r_isResizing = false;
            r_currentResizer = null;
        });
'''

# We need to insert this resize logic exactly after the drag logic DOMContentLoaded declaration.
# But there's already document.addEventListener('DOMContentLoaded', () => { ... drag logic ... });
# The easiest way is to inject it near the end of that script.
# I'll replace         });\n    });\n\n    function closeAiChatWidget() with the resize logic appended into the same block.

text = text.replace('''        });
    });

    function closeAiChatWidget()''', '''        });
        
        // 아래부터 사방향 리사이즈 로직입니다.
        const resizers = chatWidget.querySelectorAll('.resizer');
        let r_isResizing = false;
        let r_currentResizer = null;
        let r_startX, r_startY, r_startW, r_startH, r_startL, r_startT;
        
        for (let resizer of resizers) {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                // 드래그 충돌 방지
                e.stopPropagation();
                
                r_isResizing = true;
                r_currentResizer = resizer.getAttribute('data-resize');
                
                const rect = chatWidget.getBoundingClientRect();
                r_startX = e.clientX;
                r_startY = e.clientY;
                r_startW = rect.width;
                r_startH = rect.height;
                chatWidget.style.bottom = 'auto';
                chatWidget.style.right = 'auto';
                r_startL = rect.left;
                r_startT = rect.top;
                chatWidget.style.left = r_startL + 'px';
                chatWidget.style.top = r_startT + 'px';
            });
        }
        
        document.addEventListener('mousemove', (e) => {
            if (!r_isResizing) return;
            const dx = e.clientX - r_startX;
            const dy = e.clientY - r_startY;
            let newW = r_startW, newH = r_startH, newL = r_startL, newT = r_startT;
            
            if (r_currentResizer.includes('e')) newW = r_startW + dx;
            if (r_currentResizer.includes('s')) newH = r_startH + dy;
            if (r_currentResizer.includes('w')) { newW = r_startW - dx; newL = r_startL + dx; }
            if (r_currentResizer.includes('n')) { newH = r_startH - dy; newT = r_startT + dy; }
            
            if (newW >= 350) { 
                chatWidget.style.width = newW + 'px';
                if (r_currentResizer.includes('w')) chatWidget.style.left = newL + 'px';
            }
            if (newH >= 400) {
                chatWidget.style.height = newH + 'px';
                if (r_currentResizer.includes('n')) chatWidget.style.top = newT + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            r_isResizing = false;
            r_currentResizer = null;
        });
        
    });

    function closeAiChatWidget()''')

with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS_2")
