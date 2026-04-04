import glob

old_html = """
            <div id="headerLoginBtn" class="headerLoginBtn" style="display: flex; align-items: center; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 4px; cursor: pointer;" onclick="window.handleLoginClick && window.handleLoginClick(event, 'signup')">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span style="font-size: 13px; font-weight: 700; color: #111; line-height: 1;">회원가입</span>
                </div>
                <span style="color: #ccc; font-size: 11px;">|</span>
                <span id="headerLoginOnlyBtn" style="font-size: 13px; font-weight: 700; color: #111; cursor: pointer; line-height: 1;" onclick="window.handleLoginClick && window.handleLoginClick(event, 'login')">로그인</span>
            </div>
""".strip()

new_html = """
            <!-- Login/User -->
            <div id="headerLoginBtn" class="headerLoginBtn" style="display: flex; align-items: center; gap: 16px;">
                <svg style="cursor: pointer;" onclick="window.handleLoginClick && window.handleLoginClick(event, 'signup')" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="회원가입"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <svg style="cursor: pointer;" onclick="window.handleLoginClick && window.handleLoginClick(event, 'login')" id="headerLoginOnlyBtn" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="로그인"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            </div>
""".strip()

for file_path in glob.glob("*.html"):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="utf-16") as f:
            content = f.read()

    original_len = len(content)
    content = content.replace(old_html, new_html)

    if len(content) != original_len:
        print(f"Patched {file_path}")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
        except:
            with open(file_path, "w", encoding="utf-16") as f:
                f.write(content)
