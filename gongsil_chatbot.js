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
            <div class="chat-footer">
                <input type="text" id="aiChatInput" title="메시지 입력란" placeholder="나만의 똑똑한 비서에게 물어보세요..." autocomplete="off" onkeypress="if(event.key==='Enter') sendAIMsg()">
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

window.sendAIMsg = function() {
    const aiInput = document.getElementById('aiChatInput');
    const text = aiInput.value.trim();
    if (!text) return;
    
    appendMessage('my', text);
    aiInput.value = '';
    
    const typingId = 'typing-' + Date.now();
    appendTyping(typingId);
    
    setTimeout(() => {
        removeTyping(typingId);
        let reply = '';
        
        // ========= 무료 모드 (키워드 매칭 규칙 기반) =========
        if (text.includes('가입') || text.includes('등록') || text.includes('시작')) {
            reply = '<b>[회원가입 안내]</b> 👤<br>공실열람 회원가입은 아주 간단합니다!<br>우측 상단의 <b>[프로필 아이콘]</b>을 클릭하신 후, <b>[회원가입]</b> 메뉴를 통해 원하시는 계정으로 1분 만에 가입하실 수 있습니다.<br><br>👉 <a href="register.html" style="color:#0284c7;text-decoration:underline;font-weight:bold;">회원가입 페이지로 바로 이동하기</a>';
        } 
        else if (text.includes('요금') || text.includes('결제') || text.includes('무료') || text.includes('가격')) {
            reply = '<b>[요금제 안내]</b> 💳<br>부동산 중개사님들을 위한 요금제는 다음과 같습니다:<br><br>✅ <b>기본 플랜:</b> 월 30,000원<br>(공실 열람 무제한, AI 비서 일 100회 무료 제공)<br>✅ <b>무료 플랜:</b> 기본적인 메뉴 탐색과 제한된 검색 기능 지원<br><br>가입 후 마이페이지에서 상세 요금제 가입이 가능합니다!';
        }
        else if (text.includes('비밀번호') || text.includes('비번') || text.includes('찾기')) {
            reply = '<b>[비밀번호 찾기]</b> 🔐<br>비밀번호를 잊으셨나요? 로그인 페이지 하단의 <b>"비밀번호 찾기"</b> 버튼을 클릭하여 가입하신 이메일로 비밀번호 재설정 링크를 받으실 수 있습니다.';
        }
        else if (text.includes('사용법') || text.includes('이용방법')) {
            reply = '<b>[공실열람 이용방법]</b> 📚<br>상단의 탭을 통해 원하시는 메뉴(공실, 지도, 뉴스 기사, 관리자)로 이동해 보세요. 궁금한 점이 생기면 언제든 저 공실챗봇을 불러주세요!';
        }
        // ========= 유료 모드 (시뮬레이션: API 호출이 필요한 복잡한 명령) =========
        else if (text.includes('투룸')) {
            reply = '<b>[투룸]</b> 조건으로 필터를 최적화했습니다. ✨<br>지도 뷰를 우측상동으로 이동 중입니다. 멋진 매물이 많네요! (실제 앱에서는 여기서 필터 API가 동작합니다)';
        } 
        else if (text.includes('시세')) {
            reply = '현재 화면에 노출된 <b>매물 12건의 평균 시세 데이터</b>를 분석한 결과입니다. 📊<br><br>👉 <b>원룸 평균:</b> 월 80~120만 원<br>👉 <b>투룸 평균:</b> 월 150~200만 원<br>✅ 평균 보증금은 3,000만 원 선으로 분석되었습니다.';
        } 
        else if (text.includes('브리핑')) {
            reply = '고객 브리핑용 초안을 작성했습니다. 자유롭게 복사하여 카톡으로 전송해 보세요.<br><br><div style="background:#ffffff; padding:14px; border-radius:10px; font-size:13px; color:#334155; margin-bottom:10px; border:1px solid #e0f2fe;">✨ 고객님! 오늘 원하시는 조건에 딱 맞는 특급 매물 3곳을 엄선했습니다. 전면 통유리로 채광이 훌륭하고 지하철역 도보 3분 초역세권입니다...</div><button onclick="alert(\\\'클립보드에 텍스트가 복사되었습니다! 카카오톡에 붙여넣어 보세요.\\\')" style="background:#0ea5e9;font-family:inherit;font-weight:700;color:white;border:none;padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;transition:0.2s; box-shadow:0 3px 6px rgba(14,165,233,0.3);">📄 브리핑 복사</button>';
        } 
        else {
            reply = '앗! 아직 학습하지 못한 질문이에요. 🤔<br>["회원가입 방법", "요금제", "비밀번호 찾기"] 와 같은 질문은 바로답변이 가능하며, 매물 정보나 브리핑 멘트도 도와드릴 수 있어요!';
        }
        
        appendMessage('ai', reply);
    }, 600); // 무료/키워드 답변은 0.6초만에 빠르게 응답!
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
