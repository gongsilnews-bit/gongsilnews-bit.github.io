import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. CSS 추가
css_to_add = '''
    .ai-chat-attach-btn {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 8px 12px 8px 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .ai-chat-attach-btn:hover { color: #f97316; }
    
    .ai-attach-menu {
        position: absolute;
        bottom: 80px;
        left: 16px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: none;
        flex-direction: column;
        padding: 8px 0;
        z-index: 10001;
        width: 140px;
    }
    .ai-attach-item {
        background: transparent;
        border: none;
        padding: 10px 16px;
        text-align: left;
        font-size: 13px;
        color: #334155;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .ai-attach-item:hover {
        background: #f8fafc;
        color: #f97316;
        font-weight: 600;
    }
'''

text = text.replace('    .ai-chat-input-wrapper {', css_to_add + '\n    .ai-chat-input-wrapper {')

# 2. HTML 수정
old_footer = '''        <div class="ai-chat-footer">
            <div class="ai-chat-input-wrapper">
                <input type="text" id="aiChatInput" placeholder="무엇을 변경하거나 만들고 싶으신가요?" onkeypress="if(event.key === 'Enter') submitAiChat()">
                <button class="ai-chat-submit" onclick="submitAiChat()">➤</button>
            </div>
            <div style="font-size:10px; color:#94a3b8; text-align:center; margin-top:8px;">AI가 생성한 원고는 반드시 사실 확인을 거쳐주세요.</div>
        </div>'''

new_footer = '''        <div class="ai-chat-footer" style="position: relative;">
            <div id="aiAttachMenu" class="ai-attach-menu">
                <button class="ai-attach-item" onclick="aiAttachAction('photo')"><span>🖼️</span> 사진 파일</button>
                <button class="ai-attach-item" onclick="aiAttachAction('video_url')"><span>🎬</span> 영상 URL</button>
                <button class="ai-attach-item" onclick="aiAttachAction('article_url')"><span>🔗</span> 기사 URL</button>
            </div>
            <input type="file" id="aiHiddenPhotoInput" accept="image/*" style="display: none;" onchange="aiPhotoSelected(this)">
            
            <div class="ai-chat-input-wrapper">
                <button class="ai-chat-attach-btn" onclick="toggleAiAttachMenu()">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                </button>
                <input type="text" id="aiChatInput" placeholder="무엇을 변경하거나 만들고 싶으신가요?" onkeypress="if(event.key === 'Enter') submitAiChat()">
                <button class="ai-chat-submit" onclick="submitAiChat()">➤</button>
            </div>
            <div style="font-size:10px; color:#94a3b8; text-align:center; margin-top:8px;">AI가 생성한 원고는 반드시 사실 확인을 거쳐주세요.</div>
        </div>'''

if old_footer in text:
    text = text.replace(old_footer, new_footer)
else:
    print("WARNING: Could not find strict exact old_footer to replace. Attempting regex.")
    text = re.sub(r'<div class="ai-chat-footer">.*?</div>\s*</div>\s*</div>', new_footer + '\n    </div>', text, flags=re.DOTALL)


# 3. JS 추가 (스크립트 태그 닫기 전에)
js_to_add = '''
    // --- AI Chat Attach Menu & Actions ---
    function toggleAiAttachMenu() {
        const menu = document.getElementById('aiAttachMenu');
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    }

    function aiAttachAction(type) {
        document.getElementById('aiAttachMenu').style.display = 'none';
        
        if (type === 'photo') {
            document.getElementById('aiHiddenPhotoInput').click();
        } else if (type === 'video_url') {
            const url = prompt("첨부할 동영상 URL을 입력해주세요 (예: 유튜브 링크):", "https://youtube.com/watch?v=");
            if(url && url.trim() !== "" && url.trim() !== "https://youtube.com/watch?v=") {
                sendCustomAiMsg(`[영상 링크 첨부됨]\\n${url}`);
            }
        } else if (type === 'article_url') {
            const url = prompt("참고할 기사 원문 URL을 입력해주세요:", "https://");
            if(url && url.trim() !== "" && url.trim() !== "https://") {
                sendCustomAiMsg(`[참조 기사 링크 첨부됨]\\n${url}`);
            }
        }
    }

    function aiPhotoSelected(inputElement) {
        if (inputElement.files && inputElement.files[0]) {
            const file = inputElement.files[0];
            sendCustomAiMsg(`[사진 파일 첨부됨]\\n파일명: ${file.name} (${Math.round(file.size/1024)}KB)`);
            inputElement.value = ""; // 초기화
        }
    }
    
    // 강제로 AI 채팅창에 일반 메시지를 전송처리하는 유틸
    function sendCustomAiMsg(userText) {
        const body = document.getElementById('aiChatBody');
        const userHtml = `
            <div class="chat-msg user" style="animation: fadeIn 0.3s;">
                <div class="bubble">${userText.replace(/\\n/g, '<br>')}</div>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', userHtml);
        body.scrollTop = body.scrollHeight;
        
        // 첨부파일의 경우 모의 응답 타이핑 스피너 띄우기
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
        
        setTimeout(() => {
            const typingEl = document.getElementById(typingId);
            if(typingEl) typingEl.remove();
            
            const botHtml = `
                <div class="chat-msg bot" style="animation: fadeIn 0.3s;">
                    <div class="bubble">해당 자료(${userText.includes('사진') ? '사진' : 'URL 링크'})를 확인했습니다! 이를 바탕으로 어떤 작업을 수행해드릴까요? 😊</div>
                </div>
            `;
            body.insertAdjacentHTML('beforeend', botHtml);
            body.scrollTop = body.scrollHeight;
        }, 1200);
    }
'''

text = text.replace('    function applyAiChatToEditor(btn) {', js_to_add + '\n    function applyAiChatToEditor(btn) {')

with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS")
