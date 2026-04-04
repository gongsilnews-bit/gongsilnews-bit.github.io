import glob
import re

new_html = """
            <div id="headerLoginBtn" class="headerLoginBtn" style="display: flex; align-items: center; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 4px; cursor: pointer;" onclick="window.handleLoginClick && window.handleLoginClick(event, 'signup')">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span style="font-size: 13px; font-weight: 700; color: #111; line-height: 1;">회원가입</span>
                </div>
                <span style="color: #ccc; font-size: 11px;">|</span>
                <span id="headerLoginOnlyBtn" style="font-size: 13px; font-weight: 700; color: #111; cursor: pointer; line-height: 1;" onclick="window.handleLoginClick && window.handleLoginClick(event, 'login')">로그인</span>
            </div>
""".strip()

html_files = glob.glob("*.html")
pattern1 = r'<svg\s+id="headerLoginBtn"\s+style="cursor:\s*pointer;"\s*onclick="[^"]*"\s*viewBox="0\s+0\s+24\s+24"\s*fill="none"\s*stroke-width="2"\s*stroke-linecap="round"\s*stroke-linejoin="round">\s*<path\s+d="M20\s+21v-2a4\s+4\s+0\s+0\s+0-4-4H8a4\s+4\s+0\s+0\s+0-4\s+4v2"></path>\s*<circle\s+cx="12"\s+cy="7"\s+r="4"></circle>\s*<\/svg>'
pattern2 = r'<svg\s+id="headerLoginBtn"\s+style="cursor:\s*pointer;"\s*viewBox="0\s+0\s+24\s+24"\s*fill="none"\s*stroke-width="2"\s*stroke-linecap="round"\s*stroke-linejoin="round">\s*<path\s+d="M20\s+21v-2a4\s+4\s+0\s+0\s+0-4-4H8a4\s+4\s+0\s+0\s+0-4\s+4v2"></path>\s*<circle\s+cx="12"\s+cy="7"\s+r="4"></circle>\s*<\/svg>'

for file_path in html_files:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="utf-16") as f:
            content = f.read()
    
    original_len = len(content)
    content = re.sub(pattern1, new_html, content)
    content = re.sub(pattern2, new_html, content)
    
    if len(content) != original_len:
        print(f"Patched {file_path}")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
        except Exception as e:
            with open(file_path, "w", encoding="utf-16") as f:
                f.write(content)
