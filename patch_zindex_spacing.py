import glob

for file_path in glob.glob('*.html'):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(file_path, 'r', encoding='utf-16') as f:
            content = f.read()
            
    original_len = len(content)
    
    # 1. Add z-index to .top-bar
    old_top_bar = """.top-bar {
            background-color: var(--brand-navy);
            height: 60px;
            color: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 50px;
            min-width: 1200px;
        }"""
    
    new_top_bar = """.top-bar {
            position: relative;
            z-index: 10000000;
            background-color: var(--brand-navy);
            height: 60px;
            color: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 50px;
            min-width: 1200px;
        }"""
        
    old_top_bar_right = """.top-bar-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }"""
        
    new_top_bar_right = """.top-bar-right {
            display: flex;
            align-items: center;
            gap: 28px;
        }"""
        
    old_login_btn = """<div id="headerLoginBtn" class="headerLoginBtn" style="display: flex; align-items: center; gap: 16px;">"""
    new_login_btn = """<div id="headerLoginBtn" class="headerLoginBtn" style="display: flex; align-items: center; gap: 24px;">"""

    # Do the replacements
    content = content.replace(old_top_bar.replace('\\n', '\\r\\n'), new_top_bar)
    content = content.replace(old_top_bar, new_top_bar)
    
    content = content.replace(old_top_bar_right.replace('\\n', '\\r\\n'), new_top_bar_right)
    content = content.replace(old_top_bar_right, new_top_bar_right)
    
    content = content.replace(old_login_btn, new_login_btn)

    if len(content) != original_len:
        print(f"Patched z-index and spacing in {file_path}")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception:
            with open(file_path, 'w', encoding='utf-16') as f:
                f.write(content)
