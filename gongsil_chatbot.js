// 공실챗봇 (AI 비서) 공통 모듈
// 모든 페이지에서 스크립트 하나만 로드하면 챗봇이 둥둥 뜨도록 설정합니다.

function initGongsilChatbot() {
    // 이미 챗봇이 삽입되어 있으면 중복 렌더링을 막습니다.
    if (document.getElementById('ai-companion-container')) return;

    // 1. 챗봇 HTML 생성 및 삽입
    const chatbotHtml = `
    <!-- AI 도우미 챗봇 (파란색 계통 귀여운 로봇 디자인) -->
    <div id="ai-companion-container">
        <div id="aiBotBtn" class="ai-bot-btn" title="AI 비서 열기" onclick="toggleAIChat()">
            <!-- 귀여운 커스텀 로봇 아이콘 -->
            <svg class="bot-icon" width="45" height="45" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M38 25 L25 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
              <circle cx="25" cy="5" r="5" fill="#0ea5e9" />
              <path d="M62 25 L75 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
              <circle cx="75" cy="5" r="5" fill="#0ea5e9" />
              <path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" />
              <rect x="38" y="80" width="24" height="6" rx="3" fill="#0f172a" />
              <circle cx="43" cy="83" r="1.5" fill="#38bdf8" />
              <circle cx="50" cy="83" r="1.5" fill="#38bdf8" />
              <circle cx="57" cy="83" r="1.5" fill="#38bdf8" />
              <path d="M10 42 h 15 v 20 h -15 z" fill="#0284c7" />
              <path d="M75 42 h 15 v 20 h -15 z" fill="#0284c7" />
              <circle cx="50" cy="50" r="34" fill="#ffffff" />
              <rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" />
              <rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
              <rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
            </svg>
            <div class="bot-badge">N</div>
            <div class="bot-tooltip">안녕! 부동산 AI 공실이에요 💙</div>
        </div>

        <!-- 채팅창 -->
        <div id="aiChatWindow" class="ai-chat-window">
            <div class="chat-header">
                <div class="chat-title">
                    <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <path d="M38 25 L25 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                      <circle cx="25" cy="5" r="5" fill="#38bdf8" />
                      <path d="M62 25 L75 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                      <circle cx="75" cy="5" r="5" fill="#38bdf8" />
                      <path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" />
                      <rect x="38" y="80" width="24" height="6" rx="3" fill="#0f172a" />
                      <path d="M10 42 h 15 v 20 h -15 z" fill="#0284c7" />
                      <path d="M75 42 h 15 v 20 h -15 z" fill="#0284c7" />
                      <circle cx="50" cy="50" r="34" fill="#ffffff" />
                      <rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" />
                      <rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                      <rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                    </svg>
                    공실챗봇
                </div>
                <button class="chat-close" title="닫기" onclick="toggleAIChat()">×</button>
            </div>
            <div class="chat-body" id="aiChatBody">
                <div class="chat-msg ai-msg">
                    <div class="msg-avatar">
                        <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <path d="M38 25 L25 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                          <circle cx="25" cy="5" r="5" fill="#0ea5e9" />
                          <path d="M62 25 L75 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                          <circle cx="75" cy="5" r="5" fill="#0ea5e9" />
                          <path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" />
                          <rect x="38" y="80" width="24" height="6" rx="3" fill="#0f172a" />
                          <path d="M10 42 h 15 v 20 h -15 z" fill="#0ea5e9" />
                          <path d="M75 42 h 15 v 20 h -15 z" fill="#0ea5e9" />
                          <circle cx="50" cy="50" r="34" fill="#ffffff" />
                          <rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" />
                          <rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                          <rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                        </svg>
                    </div>
                    <div class="msg-content">
                        안녕하세요! 💙 무엇을 도와드릴까요?<br>회원가입, 요금 안내 등 언제든 질문해 주세요!
                    </div>
                </div>
                <!-- Quick Chips -->
                <div class="chat-chips">
                    <span class="chip" onclick="sendQuickMsg('✨ 회원가입 방법 알려줘')">👤 회원가입 방법</span>
                    <span class="chip" onclick="sendQuickMsg('💡 요금제는 어떻게 되나요?')">💳 요금제 안내</span>
                    <span class="chip" onclick="sendQuickMsg('📝 손님 브리핑 멘트 짜줘')">📝 브리핑 작성 (AI)</span>
                </div>
            </div>
            <!-- 첨부파일 미리보기 구역 -->
            <div id="aiImgPreviewContainer" style="display:none; padding:10px 16px; background:#f8fafc; border-top:1px solid #e0f2fe; position:relative;">
                <img id="aiImgPreview" src="" alt="첨부 이미지" style="height:60px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); border:1px solid #cbd5e1; object-fit:cover;">
                <button onclick="removeAiChatImage()" style="position:absolute; top:4px; left:60px; background:#ef4444; color:white; border:none; width:22px; height:22px; border-radius:50%; font-size:12px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.2);">×</button>
            </div>
            <div class="chat-footer">
                <label for="aiChatFile" class="chat-attach" title="사진 첨부">
                    <svg width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </label>
                <input type="file" id="aiChatFile" accept="image/*" style="display:none;" onchange="handleAiChatFileUpload(event)">
                <input type="text" id="aiChatInput" title="메시지 입력란" placeholder="사진 📎 후 물어보세요..." autocomplete="off" onkeypress="if(event.key==='Enter') sendAIMsg()">
                <button class="chat-send" title="전송" onclick="sendAIMsg()">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                </button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', chatbotHtml);

    // 2. 챗봇 CSS 삽입
    const style = document.createElement('style');
    style.textContent = `
    /* AI Chatbot Styles - Blue Cute Robot Version */
    #ai-companion-container {
        position: fixed; top: 130px; right: 30px;
        z-index: 10000; pointer-events: none;
    }
    #ai-companion-container * { pointer-events: auto; }

    .ai-bot-btn {
        width: 68px; height: 68px;
        background: linear-gradient(135deg, #38bdf8, #0284c7);
        color: white; border-radius: 50%;
        box-shadow: 0 8px 24px rgba(2, 132, 199, 0.35);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative;
        animation: gentleFloat 2.5s ease-in-out infinite;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 3px solid rgba(255,255,255,0.4);
    }
    .ai-bot-btn:hover { transform: scale(1.08); box-shadow: 0 12px 30px rgba(2, 132, 199, 0.45); }
    .bot-icon { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
    .bot-badge {
        position: absolute; top: -4px; right: -4px;
        background: #ef4444; color: white;
        font-size: 11px; font-weight: 800; width: 22px; height: 22px;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .bot-tooltip {
        position: absolute; right: 85px; top: 16px;
        background: #ffffff; padding: 12px 18px; border-radius: 12px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.1); border: 2px solid #e0f2fe;
        font-size: 13.5px; font-weight: 800; color: #0284c7;
        white-space: nowrap; pointer-events: none;
        animation: floatTooltip 3s infinite ease-in-out;
    }
    .bot-tooltip::after {
        content: ''; position: absolute; right: -7px; top: 14px;
        border-width: 6px 0 6px 7px; border-style: solid;
        border-color: transparent transparent transparent #e0f2fe;
    }

    @keyframes gentleFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }

    @keyframes floatTooltip {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-4px); }
    }

    /* Chat Window */
    .ai-chat-window {
        position: absolute; top: 80px; right: 0;
        width: 370px; height: 550px;
        background: #ffffff; border-radius: 20px;
        box-shadow: 0 12px 50px rgba(15, 23, 42, 0.15);
        display: none; flex-direction: column; overflow: hidden;
        transform-origin: top right;
        animation: popInSmooth 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        border: 1px solid #e0f2fe;
    }
    @keyframes popInSmooth {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }

    .chat-header {
        background: linear-gradient(135deg, #0ea5e9, #0284c7);
        padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
    }
    .chat-title { font-weight: 800; color: #fff; display:flex; gap:10px; align-items:center; font-size:16px; letter-spacing: -0.3px;}
    .chat-close { background: none; border: none; font-size: 26px; color: rgba(255,255,255,0.7); cursor: pointer; padding:0; line-height:1; }
    .chat-close:hover { color: #fff; }

    .chat-body {
        flex: 1; padding: 20px; overflow-y: auto; background: #f0f9ff;
        display: flex; flex-direction: column; gap: 18px; scroll-behavior: smooth;
    }
    .chat-msg { display: flex; gap: 10px; max-width: 90%; }
    .ai-msg { align-self: flex-start; }
    .my-msg { align-self: flex-end; flex-direction: row-reverse; }

    .msg-avatar { 
        width: 40px; height: 40px; background: #bae6fd;
        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
        flex-shrink: 0; margin-top:2px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 2px solid #fff;
    }
    .my-msg .msg-avatar { display: none; }

    .msg-content {
        background: #fff; border: 1px solid #e0f2fe; padding: 14px 16px;
        border-radius: 4px 16px 16px 16px; font-size: 14px; color: #334155;
        line-height: 1.5; box-shadow: 0 2px 8px rgba(0,0,0,0.02); font-weight: 500;
    }
    .my-msg .msg-content {
        background: #0ea5e9; color: #fff; border: none;
        border-radius: 16px 4px 16px 16px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
    }

    .chat-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px; }
    .chip { 
        border: 1px solid #bae6fd; color: #0284c7; background: #fff; 
        padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; 
        cursor: pointer; transition: all 0.2s; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .chip:hover { background: #0284c7; color: #fff; border-color:#0284c7; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(2, 132, 199, 0.2); }

    .chat-attach {
        display: flex; align-items: center; justify-content: center;
        width: 38px; height: 38px; cursor: pointer; background: #f1f5f9;
        border-radius: 50%; transition: 0.2s; flex-shrink: 0;
    }
    .chat-attach:hover { background: #e2e8f0; }

    .chat-footer {
        padding: 16px; border-top: 1px solid #e0f2fe; background: #fff;
        display: flex; gap: 12px; align-items: center;
    }
    .chat-footer input {
        flex: 1; border: 1px solid #bae6fd; background: #f8fafc; padding: 14px 18px;
        border-radius: 24px; outline: none; font-size: 14px; font-family: inherit; transition: 0.2s;
    }
    .chat-footer input:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
    .chat-send { 
        background: #0ea5e9; border: none; color: white; width: 46px; height: 46px; 
        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
        cursor: pointer; flex-shrink: 0; transition:0.2s; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.2);
    }
    .chat-send:hover { background: #0284c7; transform: scale(1.05); }

    .typing-dots { display: flex; gap: 4px; padding: 6px 4px; align-items:center; }
    .dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: bounceDot 1.4s infinite ease-in-out both; }
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounceDot { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    `;
    document.head.appendChild(style);
}

// 스크립트가 로드될 때 DOM 상태에 따라 렌더링을 안전하게 시작합니다!
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGongsilChatbot);
} else {
    initGongsilChatbot();
}

// 3. 글로벌 함수 및 변수 정의
const aiAvatarSvg = `
<svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 25 L25 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
    <circle cx="25" cy="5" r="5" fill="#0ea5e9" />
    <path d="M62 25 L75 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
    <circle cx="75" cy="5" r="5" fill="#0ea5e9" />
    <path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" />
    <rect x="38" y="80" width="24" height="6" rx="3" fill="#0f172a" />
    <path d="M10 42 h 15 v 20 h -15 z" fill="#0ea5e9" />
    <path d="M75 42 h 15 v 20 h -15 z" fill="#0ea5e9" />
    <circle cx="50" cy="50" r="34" fill="#ffffff" />
    <rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" />
    <rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
    <rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
</svg>`;

window.toggleAIChat = function() {
    const aiWindow = document.getElementById('aiChatWindow');
    const aiInput = document.getElementById('aiChatInput');
    const tooltip = document.querySelector('.bot-tooltip');
    const badge = document.querySelector('.bot-badge');
    
    if (aiWindow.style.display === 'flex') {
        aiWindow.style.display = 'none';
    } else {
        aiWindow.style.display = 'flex';
        if (tooltip) tooltip.style.display = 'none';
        if (badge) badge.style.display = 'none';
        setTimeout(() => aiInput.focus(), 100);
        scrollToBottom();
    }
};

window.sendQuickMsg = function(text) {
    const aiInput = document.getElementById('aiChatInput');
    aiInput.value = text;
    window.sendAIMsg();
};

window.currentAiImageB64 = null;
window.currentAiMimeType = null;

window.handleAiChatFileUpload = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        window.currentAiImageB64 = dataUrl.split(',')[1];
        window.currentAiMimeType = file.type;
        document.getElementById('aiImgPreview').src = dataUrl;
        document.getElementById('aiImgPreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // 같은 파일 다시 선택 가능하게 초기화
};

window.removeAiChatImage = function() {
    window.currentAiImageB64 = null;
    window.currentAiMimeType = null;
    document.getElementById('aiImgPreviewContainer').style.display = 'none';
    document.getElementById('aiImgPreview').src = '';
};

window.sendAIMsg = function() {
    const aiInput = document.getElementById('aiChatInput');
    const text = aiInput.value.trim();
    if (!text && !window.currentAiImageB64) return;
    
    let userText = text;
    if (!userText && window.currentAiImageB64) {
        userText = "이 사진을 바탕으로 부동산 관점에서 파악할 수 있는 특징을 자세하고 친절하게 설명해줘.";
    }
    
    // 내가 보낼 메시지 (채팅창 UI용)
    let myMsgHtml = text;
    if (window.currentAiImageB64) {
        myMsgHtml += `<br><img src="data:${window.currentAiMimeType};base64,${window.currentAiImageB64}" style="max-height:150px; border-radius:8px; margin-top:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">`;
    }
    if (!text && window.currentAiImageB64) {
        myMsgHtml = `<img src="data:${window.currentAiMimeType};base64,${window.currentAiImageB64}" style="max-height:150px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">`;
    }
    
    appendMessage('my', myMsgHtml);
    aiInput.value = '';
    
    // 임시로 사진 정보를 보관하고 UI 리셋 (다음 첨부를 위해)
    const imgB64 = window.currentAiImageB64;
    const imgMime = window.currentAiMimeType;
    window.removeAiChatImage();
    
    const typingId = 'typing-' + Date.now();
    appendTyping(typingId);
    
    setTimeout(async () => {
        let reply = '';
        
        // ========= 1. 무료 모드 (키워드 매칭 규칙 기반) =========
        if (userText.includes('가입') || userText.includes('등록') || userText.includes('시작')) {
            reply = '<b>[회원가입 안내]</b> 👤<br>공실열람 회원가입은 아주 간단합니다!<br>우측 상단의 <b>[프로필 아이콘]</b>을 클릭하신 후, <b>[회원가입]</b> 메뉴를 통해 원하시는 계정으로 1분 만에 가입하실 수 있습니다.<br><br>👉 <a href="register.html" style="color:#0284c7;text-decoration:underline;font-weight:bold;">회원가입 페이지로 바로 이동하기</a>';
            removeTyping(typingId);
            appendMessage('ai', reply);
            return;
        } 
        else if (userText.includes('요금') || userText.includes('결제') || userText.includes('무료') || userText.includes('가격')) {
            reply = '<b>[요금제 안내]</b> 💳<br>부동산 중개사님들을 위한 요금제는 다음과 같습니다:<br><br>✅ <b>기본 플랜:</b> 월 30,000원<br>(공실 열람 무제한, AI 비서 일 100회 무료 제공)<br>✅ <b>무료 플랜:</b> 기본적인 메뉴 탐색과 제한된 검색 기능 지원<br><br>가입 후 마이페이지에서 상세 요금제 가입이 가능합니다!';
            removeTyping(typingId);
            appendMessage('ai', reply);
            return;
        }
        else if (userText.includes('비밀번호') || userText.includes('비번') || userText.includes('찾기')) {
            reply = '<b>[비밀번호 찾기]</b> 🔐<br>비밀번호를 잊으셨나요? 로그인 페이지 하단의 <b>"비밀번호 찾기"</b> 버튼을 클릭하여 가입하신 이메일로 비밀번호 재설정 링크를 받으실 수 있습니다.';
            removeTyping(typingId);
            appendMessage('ai', reply);
            return;
        }
        else if (userText.includes('사용법') || userText.includes('이용방법')) {
            reply = '<b>[공실열람 이용방법]</b> 📚<br>상단의 탭을 통해 원하시는 메뉴(공실, 지도, 뉴스 기사, 관리자)로 이동해 보세요. 궁금한 점이 생기면 언제든 저 공실챗봇을 불러주세요!';
            removeTyping(typingId);
            appendMessage('ai', reply);
            return;
        }
        
        // ========= 2. 유료 모드 (실제 인공지능 API 연동) =========
        const GEMINI_API_KEY = "AIzaSyCkB_55N7V9w1267m3ozCdC-091byCo13A"; 
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + GEMINI_API_KEY;

        const aiPrompt = "당신은 항상 밝고 친절한 부동산 중개 비서 AI '공실이'입니다. 부동산 관점에서 전문적이고 도움되는 답변을 한국어로 작성해주세요. 그리고 답변에 파란색 하트(💙)나 반짝이(✨) 같은 이모지를 적절히 사용하여 다정하게 구어체로 대답해야 합니다. 기계처럼 딱딱하게 말하지 마세요. 사용자 질문: " + userText;

        const parts = [{ text: aiPrompt }];
        if (imgB64) {
            parts.push({
                inlineData: {
                    mimeType: imgMime,
                    data: imgB64
                }
            });
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: parts }]
                })
            });

            if (!response.ok) {
                const errBody = await response.text();
                let errMsg = response.status + " 오류";
                try {
                    const errJson = JSON.parse(errBody);
                    if(errJson.error && errJson.error.message) {
                        errMsg = errJson.error.message;
                    }
                } catch(e) {}
                console.error("Gemini API 오류 응답:", response.status, errBody);
                throw new Error("API 오류: " + errMsg);
            }

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;
            
            // 단순 텍스트 줄바꿈을 HTML <br>로 변환
            reply = aiText.replace(/\n/g, '<br>');
        } catch (error) {
            console.error("Gemini API Error:", error);
            reply = '⚠️ 오류 발생:<br><code style="background:#fee;padding:4px;border-radius:4px;font-size:12px;line-height:1.4;display:block;">' + error.message + '</code><br>위 오류 내용을 캡처해서 개발자에게 알려주세요!';
        }

        removeTyping(typingId);
        appendMessage('ai', reply);
    }, 600);
};

function scrollToBottom() {
    const aiBody = document.getElementById('aiChatBody');
    if(aiBody) aiBody.scrollTop = aiBody.scrollHeight;
}

function appendMessage(type, htmlContent) {
    const aiBody = document.getElementById('aiChatBody');
    if (!aiBody) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${type}-msg`;
    if (type === 'ai') {
        div.innerHTML = `<div class="msg-avatar">${aiAvatarSvg}</div><div class="msg-content">${htmlContent}</div>`;
    } else {
        div.innerHTML = `<div class="msg-content">${htmlContent}</div>`;
    }
    aiBody.appendChild(div);
    scrollToBottom();
}

function appendTyping(id) {
    const aiBody = document.getElementById('aiChatBody');
    if (!aiBody) return;
    const div = document.createElement('div');
    div.className = `chat-msg ai-msg`;
    div.id = id;
    div.innerHTML = `
        <div class="msg-avatar">${aiAvatarSvg}</div>
        <div class="msg-content" style="padding: 12px 16px;">
            <div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
        </div>
    `;
    aiBody.appendChild(div);
    scrollToBottom();
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
