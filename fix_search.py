import re
import os

files = ['study.html', 'materials.html', 'community.html', 'study_detail.html']

search_toggle_btn = '''                <button class="btn-global-search" id="btnGlobalSearchToggle" style="background: none; border: none; cursor: pointer; padding: 0 4px; margin-left: auto; vertical-align: middle;" onclick="window.toggleGlobalSearchPanel()">
                    <svg id="iconSearchClosed" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <svg id="iconSearchOpened" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
'''

search_panel_html = '''    <!-- 글로벌 검색 패널 (2차 메뉴 하단에 띄움) -->
    <div id="globalSearchPanel" style="display: none; background-color: #0f141e; width: 100%; padding: 30px 0; text-align: center; position: absolute; top: 110px; left: 0; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
        <div style="position: relative; display: inline-block; width: 500px; max-width: 90%; vertical-align: middle;">
            <input type="text" id="globalKeywordInput" placeholder="검색어를 입력해주세요" style="width: 100%; padding: 16px 20px; padding-right: 50px; font-size: 16px; border: none; border-radius: 4px; outline: none; box-sizing: border-box;" onkeypress="if(event.key==='Enter') window.executeGlobalSearch()">
            <button onclick="window.executeGlobalSearch()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 5px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
        </div>
        <button onclick="window.toggleGlobalSearchPanel()" style="background: none; border: none; cursor: pointer; vertical-align: middle; margin-left: 15px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    </div>
'''

search_js = '''
    <script>
        window.toggleGlobalSearchPanel = function() {
            const panel = document.getElementById('globalSearchPanel');
            const iconClosed = document.getElementById('iconSearchClosed');
            const iconOpened = document.getElementById('iconSearchOpened');
            if (!panel) return;
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                if(iconClosed) iconClosed.style.display = 'none';
                if(iconOpened) iconOpened.style.display = 'inline-block';
                setTimeout(() => { const input = document.getElementById('globalKeywordInput'); if(input) input.focus(); }, 100);
            } else {
                panel.style.display = 'none';
                if(iconClosed) iconClosed.style.display = 'inline-block';
                if(iconOpened) iconOpened.style.display = 'none';
                let inp = document.getElementById('globalKeywordInput');
                if(inp) inp.value = '';
                if(window.executeGlobalSearch) window.executeGlobalSearch();
            }
        };
        window.executeGlobalSearch = function() {
            const keyword = document.getElementById('globalKeywordInput').value.trim();
            if(!keyword) { alert('검색어를 입력해주세요.'); return; }
            alert("[" + keyword + "] (을)를 전체 검색합니다.");
            window.toggleGlobalSearchPanel();
        };
    </script>
'''

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. 색상 고치기 (#FF7B00 -> var(--primary-color))
    content = content.replace("--primary: #FF7B00", "--primary: var(--primary-color)")
    content = content.replace("--accent-orange: #FF7B00", "--accent-orange: var(--primary-color)")

    # 2. 기존 nav의 돋보기 제거 (있는 경우에만)
    toggle_pattern = re.compile(r'<button class="btn-global-search" id="btnGlobalSearchToggle".*?</button>\s*', re.DOTALL)
    content = toggle_pattern.sub('', content)

    # 3. 2차 메뉴 영역(div style="display: flex; gap: 24px...") 안에 돋보기 추가 
    # study-tier1 뒤쪽에 내 스터디(위쪽 flex)가 있음
    content = re.sub(r'(<a href="#" class="study-tab-item"[^>]*>MY관심강의</a>)', 
                     r'\1\n' + search_toggle_btn, content)

    # 4. Search 패널 기존 것 지우기
    panel_pattern = re.compile(r'<div id="globalSearchPanel".*?</div>', re.DOTALL)
    content = panel_pattern.sub('', content)

    # 5. Search 패널 2차 메뉴(study-nav-bar) 바로 아래 추가
    content = re.sub(r'(</div>\s*<!-- study-nav-bar ends -->|</div>\s*</div>\s*<!-- 2차 메뉴 필터바|</div>\s*</div>\s*<!-- MAIN CONTENT|</div>\s*</div>\s*<main)', 
                     r'\1\n' + search_panel_html, content)

    # 만약 위 패턴 중 아무것도 매칭 안됐으면 <div class="study-nav-bar">...</div> 아래에 무조건 넣기 
    if search_panel_html not in content:
        content = re.sub(r'(</div>\s*</div>\s*</div>)', r'\1\n' + search_panel_html, content, count=1)
        
    # 6. JS 지우고 다시 스크립트 블럭 추가
    js_pattern = re.compile(r'window\.toggleGlobalSearchPanel = function\(\) \{.*?\}\;\s*', re.DOTALL)
    content = js_pattern.sub('', content)
    exec_pattern = re.compile(r'window\.executeGlobalSearch = function\(\) \{.*?\}\;\s*', re.DOTALL)
    content = exec_pattern.sub('', content)
    
    # 만약 toggleGlobalSearchPanel이 스크립트에 없다면 body 직전에 추가 (중복 방지)
    if 'window.toggleGlobalSearchPanel' not in content:
        content = content.replace('</body>', search_js + '\n</body>')

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('Success')
