import glob, re

for file in glob.glob('news*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = r'\.article-body iframe\[src\*="youtube"\]\s*\{[^}]*aspect-ratio:\s*16/9;[^}]*\}'
    
    good_css = """.article-body iframe[src*="youtube"] {
            width: 100%;
            border-radius: 8px;
        }
        .article-body .yt-shorts-box iframe,
        .article-body .yt-block iframe,
        .article-body .yt-wrap iframe,
        .article-body .yt-ratio-box iframe {
            height: 100% !important;
        }"""
        
    new_content = re.sub(pattern, good_css, content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {file}')
