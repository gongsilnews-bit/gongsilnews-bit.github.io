// 공실챗봇 (AI 비서) 공통 모듈 v3.0 대공사 완료

function initGongsilChatbot() {
    if (document.getElementById('ai-companion-container')) return;

    const chatbotHtml = `
    <!-- AI 도우미 챗봇 -->
    <div id="ai-companion-container">
        <div id="aiBotBtn" class="ai-bot-btn" title="AI 비서 열기" onclick="toggleAIChat()">
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

        <!-- 채팅창 본체 (리사이즈 가능) -->
        <div id="aiChatWindow" class="ai-chat-window">
            <!-- 4면 리사이즈 핸들 -->
            <div class="resize-handle n"></div>
            <div class="resize-handle e"></div>
            <div class="resize-handle s"></div>
            <div class="resize-handle w"></div>
            <div class="resize-handle nw"></div>
            <div class="resize-handle ne"></div>
            <div class="resize-handle sw"></div>
            <div class="resize-handle se"></div>
            <div class="chat-header">
                <div class="chat-title">
                    <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <path d="M38 25 L25 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                      <circle cx="25" cy="5" r="5" fill="#38bdf8" />
                      <path d="M62 25 L75 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                      <circle cx="75" cy="5" r="5" fill="#38bdf8" />
                      <path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" />
                      <circle cx="50" cy="50" r="34" fill="#ffffff" />
                      <rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" />
                      <rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                      <rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                    </svg>
                    공실챗봇
                </div>
                <!-- 윈도우 스타일 컨트롤 박스 -->
                <div class="win-controls">
                    <button class="win-btn win-min" title="최소화" onclick="toggleAIChat()">−</button>
                    <button id="chatMaxBtn" class="win-btn win-max" title="전체보기/되돌리기" onclick="toggleAiFullscreen()">□</button>
                    <button class="win-btn win-close" title="닫기" onclick="toggleAIChat()">×</button>
                </div>
            </div>
            
            <div class="chat-body" id="aiChatBody" onclick="closeAllSlideMenus()">
                <div class="chat-msg ai-msg">
                    <div class="msg-avatar">
                        <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" />
                          <circle cx="50" cy="50" r="34" fill="#ffffff" />
                          <rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" />
                          <rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                          <rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" />
                        </svg>
                    </div>
                    <div class="msg-content">
                        안녕하세요! 💙 무엇을 도와드릴까요?<br>공실 검색, 시세 분석은 물론 매물 및 뉴스 등록 팁도 물어보세요!
                    </div>
                </div>
                <div class="chat-chips">
                    <span class="chip" onclick="sendQuickMsg('🔍 특정 지역과 조건(예산, 평수)에 맞는 전/월세 공실을 찾아주거나 검색하는 팁을 알려줘')">🔍 조건별 매물 검색</span>
                    <span class="chip" onclick="sendQuickMsg('📊 요즘 특정 지역의 전세/월세 시세 동향과 시장 분위기를 분석해줘')">📊 주변 시세 분석</span>
                    <span class="chip" onclick="sendQuickMsg('💡 클릭률이 높아지고 상단에 노출되도록 사람을 이끄는 매력적인 공실(매물) 소개글 작성 꿀팁 알려줘')">💡 상위노출 공실 등록법</span>
                </div>
            </div>
            
            <!-- 첨부파일 미리보기 구역 -->
            <div id="aiImgPreviewContainer" style="display:none; padding:10px 16px; background:#f8fafc; border-top:1px solid #e0f2fe; position:relative; z-index:20;">
                <img id="aiImgPreview" src="" alt="첨부 이미지" style="height:60px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); border:1px solid #cbd5e1; object-fit:cover;">
                <button onclick="removeAiChatImage()" style="position:absolute; top:4px; left:60px; background:#ef4444; color:white; border:none; width:22px; height:22px; border-radius:50%; font-size:12px; font-weight:bold; cursor:pointer;">×</button>
            </div>
            
            <!-- 슬라이드 메뉴: 파일 첨부 (+) -->
            <div class="chat-slide-menu" id="attachMenu">
                <div class="menu-grid">
                    <label class="menu-item">
                        <div class="menu-icon" style="color:#0ea5e9;">📸</div>
                        <span>카메라 촬영</span>
                        <input type="file" accept="image/*" capture="environment" style="display:none;" id="aiCameraInput" onchange="handleAiChatFileUpload(event)">
                    </label>
                    <label class="menu-item">
                        <div class="menu-icon" style="color:#8b5cf6;">🖼️</div>
                        <span>사진/갤러리</span>
                        <input type="file" accept="image/*" style="display:none;" id="aiGalleryInput" onchange="handleAiChatFileUpload(event)">
                    </label>
                    <div class="menu-item" onclick="alert('파일 첨부 기능은 준비 중입니다.')">
                        <div class="menu-icon" style="color:#f59e0b;">📎</div>
                        <span>파일 문서</span>
                    </div>
                    <div class="menu-item" onclick="alert('노트북 열기 기능은 준비 중입니다.')">
                        <div class="menu-icon" style="color:#10b981;">📓</div>
                        <span>노트북</span>
                    </div>
                </div>
            </div>

            <!-- 슬라이드 메뉴: 빠른 메뉴보기 (☰) -->
            <div class="chat-slide-menu" id="quickMenu">
                <div class="menu-grid">
                    <div class="menu-item" onclick="window.location.href='https://gongsilnews-bit.github.io/gongsil/GongsilChatbot_Setup.exe'" style="grid-column: span 4; background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:12px; margin-bottom:5px; flex-direction:row; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                         <div class="menu-icon" style="width:36px; height:36px; font-size:18px; background:#fff; border-color:#0284c7; color:#0284c7;">🖥️</div>
                         <div style="text-align:left; line-height:1.4;">
                            <strong style="font-size:14px; color:#0284c7; display:block;">PC버전 직접 설치 (.exe)</strong>
                            <span style="font-size:11px; color:#64748b;">엑셀, 카톡 중에도 안가려져요!</span>
                         </div>
                    </div>
                    <div class="menu-item" onclick="window.location.href='gongsil'">
                        <div class="menu-icon" style="background:#e0f2fe; color:#0284c7;">🔍</div>
                        <span style="font-weight:700;">공실열람</span>
                    </div>
                    <div class="menu-item" onclick="window.location.href='user_admin.html?page=register'">
                        <div class="menu-icon" style="background:#dcfce7; color:#16a34a;">✍️</div>
                        <span style="font-weight:700;">공실등록</span>
                    </div>
                    <div class="menu-item" onclick="window.location.href='./'">
                        <div class="menu-icon" style="background:#f3e8ff; color:#9333ea;">📰</div>
                        <span style="font-weight:700;">기사열람</span>
                    </div>
                    <div class="menu-item" onclick="window.location.href='user_admin.html?page=news_write'">
                        <div class="menu-icon" style="background:#ffedd5; color:#ea580c;">🖋️</div>
                        <span style="font-weight:700;">기사등록</span>
                    </div>
                    <div class="menu-item" onclick="window.location.href='customer_admin.html'">
                        <div class="menu-icon" style="background:#ffe4e6; color:#e11d48;">👥</div>
                        <span style="font-weight:700;">고객관리</span>
                    </div>
                    <!-- 추후 대표님이 주실 추가 링크를 위해 비워둡니다 -->
                    <div class="menu-item" onclick="alert('딥 리서치 모드는 준비 중입니다.')">
                        <div class="menu-icon" style="background:#f1f5f9; color:#475569;">🚀</div>
                        <span style="font-weight:700;">Deep Research</span>
                    </div>
                </div>
            </div>

            <!-- 하단 푸터 (버튼 및 입력창) -->
            <div class="chat-footer">
                <button class="chat-action-btn attach-btn" title="첨부 메뉴" onclick="toggleMenu('attachMenu')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button class="chat-action-btn apps-btn" title="빠른 이동 메뉴" onclick="toggleMenu('quickMenu')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
                </button>
                
                <div class="input-wrapper">
                    <input type="text" id="aiChatInput" title="메시지 입력란" placeholder="메시지를 입력하세요..." autocomplete="off" onkeypress="if(event.key==='Enter') sendAIMsg()" onfocus="closeAllSlideMenus()">
                    <!-- STT 마이크 버튼 -->
                    <button id="sttBtn" class="chat-mic-btn" onclick="toggleAiStt()" title="음성으로 입력하기">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"></path><path d="M19 10v2a7 7 0 01-14 0v-2m14 0h-2m-12 0H3m9 9v3m-3 0h6"></path></svg>
                    </button>
                </div>

                <button class="chat-send" title="전송" onclick="sendAIMsg()">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                </button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', chatbotHtml);

    const style = document.createElement('style');
    style.textContent = `
    /* AI Chatbot Styles - v3.0 */
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
        background: #ef4444; color: white; border-radius: 50%; width: 22px; height: 22px;
        display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid #fff;
    }
    .bot-tooltip {
        position: absolute; right: 85px; top: 16px;
        background: #ffffff; padding: 12px 18px; border-radius: 12px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.1); border: 2px solid #e0f2fe;
        font-size: 13.5px; font-weight: 800; color: #0284c7; white-space: nowrap;
        animation: floatTooltip 3s infinite ease-in-out;
    }

    @keyframes gentleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes floatTooltip { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }

    /* 크기 조절 가능한 챗봇 창 설정 */
    .ai-chat-window {
        position: absolute; top: 80px; right: 0;
        width: 400px; height: 650px;
        min-width: 320px; min-height: 450px;
        max-width: 90vw; max-height: 90vh;
        background: #ffffff; border-radius: 20px;
        box-shadow: 0 12px 50px rgba(15, 23, 42, 0.15);
        display: none; flex-direction: column; overflow: hidden;
        animation: popInSmooth 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        border: 1px solid #e0f2fe;
    }
    
    /* 4면 리사이즈 핸들 스타일 */
    .resize-handle { position: absolute; z-index: 10000; }
    .resize-handle.n { top: 0; left: 0; right: 0; height: 6px; cursor: n-resize; }
    .resize-handle.s { bottom: 0; left: 0; right: 0; height: 6px; cursor: s-resize; }
    .resize-handle.e { top: 0; bottom: 0; right: 0; width: 6px; cursor: e-resize; }
    .resize-handle.w { top: 0; bottom: 0; left: 0; width: 6px; cursor: w-resize; }
    .resize-handle.nw { top: 0; left: 0; width: 14px; height: 14px; cursor: nw-resize; }
    .resize-handle.ne { top: 0; right: 0; width: 14px; height: 14px; cursor: ne-resize; }
    .resize-handle.sw { bottom: 0; left: 0; width: 14px; height: 14px; cursor: sw-resize; }
    .resize-handle.se { bottom: 0; right: 0; width: 14px; height: 14px; cursor: se-resize; }

    /* 전체화면 모드 클래스 */
    .ai-chat-window.fullscreen {
        position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        width: 100vw !important; height: 100vh !important; max-width: none !important; max-height: none !important;
        border-radius: 0 !important; resize: none !important; border: none !important; z-index: 10000;
    }

    @keyframes popInSmooth { from { opacity: 0; transform: scale(0.95); margin-top:20px; } to { opacity: 1; transform: scale(1); margin-top:0;} }

    .chat-header {
        background: linear-gradient(135deg, #0ea5e9, #0284c7);
        padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
        flex-shrink: 0; user-select: none;
    }
    .chat-title { font-weight: 800; color: #fff; display:flex; gap:10px; align-items:center; font-size:16px;}
    
    /* 윈도우 스타일 컨트롤 박스 */
    .win-controls { display: flex; gap: 8px; align-items: center; }
    .win-btn {
        width: 24px; height: 24px; border-radius: 6px; border: none; background: rgba(255,255,255,0.15);
        color: #fff; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: 0.2s; padding: 0;
    }
    .win-btn:hover { background: rgba(255,255,255,0.3); }
    .win-close:hover { background: #ef4444; }

    .chat-body {
        flex: 1; padding: 20px; overflow-y: auto; background: #f0f9ff;
        display: flex; flex-direction: column; gap: 18px; position: relative;
    }
    .chat-msg { display: flex; gap: 10px; max-width: 90%; }
    .ai-msg { align-self: flex-start; }
    .my-msg { align-self: flex-end; flex-direction: row-reverse; }

    .msg-avatar { 
        width: 40px; height: 40px; background: #bae6fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
        flex-shrink: 0; margin-top:2px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 2px solid #fff;
    }
    .my-msg .msg-avatar { display: none; }

    .msg-content {
        background: #fff; border: 1px solid #e0f2fe; padding: 14px 16px; border-radius: 4px 16px 16px 16px; font-size: 14px; color: #334155; line-height: 1.5; box-shadow: 0 2px 8px rgba(0,0,0,0.02); font-weight: 500; word-break: break-all;
    }
    .my-msg .msg-content { background: #0ea5e9; color: #fff; border: none; border-radius: 16px 4px 16px 16px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2); }

    .chat-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px; }
    .chip { border: 1px solid #bae6fd; color: #0284c7; background: #fff; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .chip:hover { background: #0284c7; color: #fff; border-color:#0284c7; transform: translateY(-1px); }

    /* 슬라이드 메뉴 공통 */
    .chat-slide-menu {
        position: absolute; bottom: 74px; /* 푸터 높이 근접 */ left: 0; width: 100%; height: 0; overflow: hidden;
        background: #ffffff; border-radius: 20px 20px 0 0; box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 100; border-top: 1px solid #e2e8f0;
    }
    .chat-slide-menu.show { height: 280px; }
    
    .menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px 5px; padding: 25px 10px; }
    .menu-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: #475569; }
    .menu-icon { width: 50px; height: 50px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: 0.2s; color: #333; }
    .menu-item:hover .menu-icon { transform: scale(1.08); box-shadow: 0 6px 14px rgba(0,0,0,0.06); background: #f1f5f9; }

    /* Footer Styles */
    .chat-footer {
        padding: 14px 16px; border-top: 1px solid #e0f2fe; background: #fff;
        display: flex; gap: 10px; align-items: center; position: relative; z-index: 110; flex-shrink: 0;
    }
    .chat-action-btn { 
        background: none; border: none; cursor: pointer; border-radius: 10px; width: 38px; height: 38px; 
        display: flex; align-items: center; justify-content: center; color: #64748b; transition: 0.2s; flex-shrink:0;
    }
    .attach-btn { background: #f1f5f9; color: #0284c7; }
    .attach-btn:hover { background: #e2e8f0; color: #0369a1; }
    .apps-btn { }
    .apps-btn:hover { background: #f1f5f9; color:#0f172a; }

    .input-wrapper { flex: 1; position: relative; display: flex; align-items: center; }
    .input-wrapper input {
        width: 100%; border: 1px solid #cbd5e1; background: #f8fafc; padding: 14px 45px 14px 20px;
        border-radius: 20px; outline: none; font-size: 14.5px; font-family: inherit; transition: 0.2s; font-weight:500;
    }
    .input-wrapper input:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
    
    /* STT 마이크 버튼 */
    .chat-mic-btn {
        position: absolute; right: 5px; background: none; border: none; width: 34px; height: 34px;
        border-radius: 50%; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .chat-mic-btn:hover { color: #0ea5e9; background: #e0f2fe; }
    /* 녹음 중 스타일 효과 */
    .chat-mic-btn.recording { color: #ef4444; background: #fee2e2; animation: pulseRed 1.5s infinite; }
    @keyframes pulseRed { 0% {box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);} 70% {box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);} 100% {box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);} }

    .chat-send { 
        background: #0ea5e9; border: none; color: white; width: 44px; height: 44px; 
        border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition:0.2s; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.2);
    }
    .chat-send:hover { background: #0284c7; transform: scale(1.05); }

    .typing-dots { display: flex; gap: 4px; padding: 6px 4px; align-items:center; }
    .dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: bounceDot 1.4s infinite ease-in-out both; }
    .dot:nth-child(1) { animation-delay: -0.32s; } .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounceDot { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    `;
    document.head.appendChild(style);

    restoreChatState();
    
    // 드래그 및 4면 리사이즈 기능 초기화
    setTimeout(() => {
        if(window.initAiChatDrag) window.initAiChatDrag();
        if(window.initAiChatResize) window.initAiChatResize();
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGongsilChatbot);
} else {
    initGongsilChatbot();
}

// -----------------------------------------
// 상태 관리 (SessionStorage)
// -----------------------------------------
window.saveChatState = function() {
    const aiWindow = document.getElementById('aiChatWindow');
    const aiBody = document.getElementById('aiChatBody');
    if (aiWindow && aiBody) {
        sessionStorage.setItem('aiChatOpen', aiWindow.style.display === 'flex' ? 'true' : 'false');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = aiBody.innerHTML;
        const typingEls = tempDiv.querySelectorAll('[id^="typing-"]');
        typingEls.forEach(el => el.remove());
        sessionStorage.setItem('aiChatHistory', tempDiv.innerHTML);
    }
};

window.restoreChatState = function() {
    const aiWindow = document.getElementById('aiChatWindow');
    const aiBody = document.getElementById('aiChatBody');
    const tooltip = document.querySelector('.bot-tooltip');
    
    const savedHistory = sessionStorage.getItem('aiChatHistory');
    const isOpen = sessionStorage.getItem('aiChatOpen') === 'true';
    
    if (savedHistory && aiBody) aiBody.innerHTML = savedHistory;
    
    if (isOpen && aiWindow) {
        aiWindow.style.display = 'flex';
        if (tooltip) tooltip.style.display = 'none';
        scrollToBottom();
    }
};

window.clearChatHistory = function() {
    if (!confirm('대화 내역을 모두 지우시겠습니까?')) return;
    const aiBody = document.getElementById('aiChatBody');
    if (aiBody) {
        aiBody.innerHTML = `
            <div class="chat-msg ai-msg">
                <div class="msg-avatar"><svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" /><circle cx="50" cy="50" r="34" fill="#ffffff" /><rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" /><rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" /><rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" /></svg></div>
                <div class="msg-content">안녕하세요! 💙 대화 기록이 지워졌습니다. 무엇을 도와드릴까요?</div>
            </div>`;
        saveChatState();
    }
};

// -----------------------------------------
// UI 제어 (윈도우, 슬라이드 메뉴, 전체화면)
// -----------------------------------------
window.toggleAIChat = function() {
    const aiWindow = document.getElementById('aiChatWindow');
    const aiInput = document.getElementById('aiChatInput');
    const tooltip = document.querySelector('.bot-tooltip');
    
    if (aiWindow.style.display === 'flex') {
        aiWindow.style.display = 'none';
        aiWindow.classList.remove('fullscreen'); // 닫을 때 전체화면 해제
        closeAllSlideMenus();
        saveChatState();
    } else {
        aiWindow.style.display = 'flex';
        if (tooltip) tooltip.style.display = 'none';
        saveChatState();
        setTimeout(() => aiInput.focus(), 100);
        scrollToBottom();
    }
};

window.toggleAiFullscreen = function() {
    const aiWindow = document.getElementById('aiChatWindow');
    const maxBtn = document.getElementById('chatMaxBtn');
    aiWindow.classList.toggle('fullscreen');
    
    if (aiWindow.classList.contains('fullscreen')) {
        maxBtn.innerText = '❐';
        maxBtn.title = '창 크기 복원';
    } else {
        maxBtn.innerText = '□';
        maxBtn.title = '전체화면보기';
    }
    scrollToBottom();
};

window.toggleMenu = function(menuId) {
    const menuList = ['attachMenu', 'quickMenu'];
    menuList.forEach(id => {
        const el = document.getElementById(id);
        if (id === menuId) {
            el.classList.toggle('show');
        } else {
            el.classList.remove('show');
        }
    });
};

window.closeAllSlideMenus = function() {
    document.getElementById('attachMenu')?.classList.remove('show');
    document.getElementById('quickMenu')?.classList.remove('show');
};

// -----------------------------------------
// 드래그 기능
// -----------------------------------------
window.initAiChatDrag = function() {
    const chatWindow = document.getElementById('aiChatWindow');
    const header = chatWindow.querySelector('.chat-header');
    if(!chatWindow || !header) return;
    
    let isDragging = false;
    let offsetX, offsetY;
    
    header.style.cursor = 'grab';
    
    header.addEventListener('mousedown', (e) => {
        // 컨트롤 버튼이나 리사이즈 핸들 클릭 시 드래그 방지
        if (e.target.closest('.win-controls') || e.target.closest('.resize-handle')) return;
        
        isDragging = true;
        header.style.cursor = 'grabbing';
        
        const rect = chatWindow.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // 브라우저 화면 기준 고정 위치로 변경
        chatWindow.style.position = 'fixed';
        chatWindow.style.margin = '0';
        chatWindow.style.transform = 'none';
        chatWindow.style.animation = 'none';
        // z-index를 높여 맨 위로
        chatWindow.style.zIndex = 100000;
        
        // 초기 고정 기준점을 right, top으로 설정
        // 리사이즈 앵커(우측 상단 고정 효과)를 위해 오른쪽 여백 기준 계산
        chatWindow.style.top = rect.top + 'px';
        chatWindow.style.right = (window.innerWidth - rect.right) + 'px';
        chatWindow.style.left = 'auto';
        chatWindow.style.bottom = 'auto';
        
        // 드래그 중 텍스트 선택 방지
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // 새 left 값을 구한 뒤, 이를 바탕으로 right 값 도출 (사이즈 조절 시 우측이 기준이 됨)
        const newLeft = e.clientX - offsetX;
        const newRight = window.innerWidth - (newLeft + chatWindow.offsetWidth);
        
        chatWindow.style.right = newRight + 'px';
        chatWindow.style.top = (e.clientY - offsetY) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
            document.body.style.userSelect = '';
        }
    });
};

// -----------------------------------------
// 4면 리사이즈 기능
// -----------------------------------------
window.initAiChatResize = function() {
    const chatWindow = document.getElementById('aiChatWindow');
    if(!chatWindow) return;
    
    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    const handles = chatWindow.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation(); // 중복 이벤트 방지
            
            isResizing = true;
            currentHandle = handle.className.replace('resize-handle', '').trim();
            
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = chatWindow.getBoundingClientRect();
            startWidth = rect.width;
            startHeight = rect.height;
            startLeft = rect.left;
            startTop = rect.top;
            
            chatWindow.style.position = 'fixed';
            chatWindow.style.margin = '0';
            chatWindow.style.transform = 'none';
            chatWindow.style.animation = 'none';
            chatWindow.style.left = startLeft + 'px';
            chatWindow.style.top = startTop + 'px';
            chatWindow.style.right = 'auto';
            chatWindow.style.bottom = 'auto';
            
            document.body.style.userSelect = 'none';
        });
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing || !currentHandle) return;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (currentHandle.includes('e')) {
            newWidth = startWidth + dx;
        } else if (currentHandle.includes('w')) {
            newWidth = startWidth - dx;
            newLeft = startLeft + dx;
        }

        if (currentHandle.includes('s')) {
            newHeight = startHeight + dy;
        } else if (currentHandle.includes('n')) {
            newHeight = startHeight - dy;
            newTop = startTop + dy;
        }

        const minW = parseInt(window.getComputedStyle(chatWindow).minWidth) || 320;
        const minH = parseInt(window.getComputedStyle(chatWindow).minHeight) || 450;

        if (newWidth < minW) {
            if (currentHandle.includes('w')) newLeft -= (minW - newWidth);
            newWidth = minW;
        }
        if (newHeight < minH) {
            if (currentHandle.includes('n')) newTop -= (minH - newHeight);
            newHeight = minH;
        }

        chatWindow.style.width = newWidth + 'px';
        chatWindow.style.height = newHeight + 'px';
        chatWindow.style.left = newLeft + 'px';
        chatWindow.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            currentHandle = null;
            document.body.style.userSelect = '';
        }
    });
};

// -----------------------------------------
// STT (음성 인식) 기능
// -----------------------------------------
let recognition = null;
let isRecording = false;

window.toggleAiStt = function() {
    const sttBtn = document.getElementById('sttBtn');
    const inputField = document.getElementById('aiChatInput');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("이 브라우저에서는 음성 인식을 지원하지 않습니다. (크롬, 엣지를 권장합니다)");
        return;
    }

    if (isRecording) {
        // 녹음 종료
        recognition.stop();
        return;
    }

    // 초기화 및 시작
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
        isRecording = true;
        sttBtn.classList.add('recording');
        inputField.placeholder = "듣고 있습니다... 말씀해주세요!";
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const currentVal = inputField.value;
        inputField.value = currentVal ? currentVal + " " + transcript : transcript;
    };

    recognition.onerror = function(event) {
        console.error("STT Error:", event.error);
        alert("음성 인식 오류: " + event.error);
    };

    recognition.onend = function() {
        isRecording = false;
        sttBtn.classList.remove('recording');
        inputField.placeholder = "메시지를 입력하세요...";
        inputField.focus(); // 텍스트 입력 후 자연스럽게 포커스
    };

    recognition.start();
};

// -----------------------------------------
// 기타 기존 채팅 발송/복원 로직
// -----------------------------------------
window.sendQuickMsg = function(text) {
    document.getElementById('aiChatInput').value = text;
    window.sendAIMsg();
};

window.currentAiImageB64 = null;
window.currentAiMimeType = null;

window.handleAiChatFileUpload = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    closeAllSlideMenus(); // 파일 첨부 시 메뉴 자동 닫기

    const reader = new FileReader();
    reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        window.currentAiImageB64 = dataUrl.split(',')[1];
        window.currentAiMimeType = file.type;
        document.getElementById('aiImgPreview').src = dataUrl;
        document.getElementById('aiImgPreviewContainer').style.display = 'block';
        setTimeout(scrollToBottom, 100);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
};

window.removeAiChatImage = function() {
    window.currentAiImageB64 = null;
    window.currentAiMimeType = null;
    document.getElementById('aiImgPreviewContainer').style.display = 'none';
    document.getElementById('aiImgPreview').src = '';
};

const aiAvatarSvg = `<svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M25 60 Q20 95 50 95 Q80 95 75 60 Z" fill="#e0f2fe" /><circle cx="50" cy="50" r="34" fill="#ffffff" /><rect x="22" y="36" width="56" height="26" rx="13" fill="#0f172a" /><rect x="34" y="43" width="8" height="12" rx="4" fill="#22d3ee" /><rect x="58" y="43" width="8" height="12" rx="4" fill="#22d3ee" /></svg>`;

function scrollToBottom(smooth = false) {
    const aiBody = document.getElementById('aiChatBody');
    if(aiBody) {
        if (smooth) {
            aiBody.style.scrollBehavior = 'smooth';
            aiBody.scrollTo({ top: aiBody.scrollHeight, behavior: 'smooth' });
        } else {
            aiBody.style.scrollBehavior = 'auto';
            aiBody.scrollTop = aiBody.scrollHeight;
            requestAnimationFrame(() => aiBody.scrollTop = aiBody.scrollHeight);
        }
    }
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
    scrollToBottom(true);
    saveChatState();
}

function appendTyping(id) {
    const aiBody = document.getElementById('aiChatBody');
    if (!aiBody) return;
    const div = document.createElement('div');
    div.className = `chat-msg ai-msg`;
    div.id = id;
    div.innerHTML = `<div class="msg-avatar">${aiAvatarSvg}</div><div class="msg-content" style="padding: 12px 16px;"><div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
    aiBody.appendChild(div);
    scrollToBottom(true);
}

function removeTyping(id) { const el = document.getElementById(id); if (el) el.remove(); }

window.sendAIMsg = function() {
    closeAllSlideMenus(); // 입력 시 슬라이드 창 닫기
    const aiInput = document.getElementById('aiChatInput');
    const text = aiInput.value.trim();
    if (!text && !window.currentAiImageB64) return;
    
    let userText = text;
    if (!userText && window.currentAiImageB64) {
        userText = "이 사진을 바탕으로 부동산 관점에서 파악할 수 있는 특징을 자세하고 친절하게 설명해줘.";
    }
    
    let myMsgHtml = text;
    if (window.currentAiImageB64) {
        myMsgHtml += `<br><img src="data:${window.currentAiMimeType};base64,${window.currentAiImageB64}" style="max-height:150px; border-radius:8px; margin-top:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">`;
    }
    if (!text && window.currentAiImageB64) {
        myMsgHtml = `<img src="data:${window.currentAiMimeType};base64,${window.currentAiImageB64}" style="max-height:150px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">`;
    }
    
    appendMessage('my', myMsgHtml);
    aiInput.value = '';
    
    const imgB64 = window.currentAiImageB64;
    const imgMime = window.currentAiMimeType;
    window.removeAiChatImage();
    
    const typingId = 'typing-' + Date.now();
    appendTyping(typingId);
    
    setTimeout(async () => {
        let reply = '';
        
        // --- 엣지 함수 연동 (gemini-flash-lite) --- 
        const systemKnowledge = `
        [공실열람 챗봇 안내 매뉴얼]
        당신은 밝고 친절한 부동산 AI 공실이입니다. 파란색 하트(💙)를 사용해 구어체로 답변하세요.
        다음 메뉴의 퀵링크를 적절히 활용하세요:
        - [공실열람 매물찾기 바로가기](gongsil.html)
        - [뉴스기사 바로가기](index.html)
        - [공실등록/유저관리자 바로가기](user_admin.html)
        - [고객관리 바로가기](customer_admin.html)
        `;

        const parts = [{ text: systemKnowledge + "\n\n사용자질문: " + userText }];
        if (imgB64) parts.push({ inlineData: { mimeType: imgMime, data: imgB64 } });

        try {
            if(!window.gongsiClient || !window.gongsiClient.functions) {
                throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
            }
            const { data, error: functionError } = await window.gongsiClient.functions.invoke('chat', {
                body: { contents: [{ parts: parts }], userQuery: userText }
            });

            if (functionError) throw new Error(functionError.message);
            if (data.error) throw new Error(data.error.message || data.error);
            
            reply = data.candidates[0].content.parts[0].text;
            reply = reply.replace(/\n/g, '<br>');
            reply = reply.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="display:inline-block; margin-top:8px; padding:8px 16px; background:#eff6ff; color:#2563eb; border-radius:20px; font-size:14px; font-weight:800; text-decoration:none; border:1px solid #bfdbfe;">🚀 $1</a>');
        } catch (error) {
            console.error(error);
            reply = '⚠️ 네트워킹 오류가 발생했습니다.<br>잠시 후 다시 시도해주세요.<br><span style="font-size:11px;color:#ef4444;">' + error.message + '</span>';
        }

        removeTyping(typingId);
        appendMessage('ai', reply);
    }, 600);
};
