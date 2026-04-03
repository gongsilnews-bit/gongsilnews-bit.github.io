import glob

files = ["board.html", "news_all.html", "news_etc.html", "news_finance.html", "news_law.html", "news_life.html", "news_politics.html"]

for f in files:
    with open(f, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    start_str = "let imgHtml = extractUrl ? `\<img src=\"\\${extractUrl}\""
    end_str = "imgHtml = `\<div class=\"an-img\" style=\"position:relative; flex-shrink:0;\"\>\\${imgHtml}\\${playOverlay}\</div\>`;"
    
    # We replace the imgHtml logic inside the HTML files to conditionally render the wrapper wrapper.
    target = """let imgHtml = extractUrl ? `\<img src="${extractUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/160x100?text=News'"\>` : `\<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:12px;background:#f4f6fa;border-radius:6px;"\>NO IMAGE\</div\>`;
            imgHtml = `\<div class="an-img" style="position:relative; flex-shrink:0;"\>\${imgHtml}\${playOverlay}\</div\>`;"""
    target = target.replace(r"\<", "`").replace(r"\>", "`")

    replacement = """let imgHtml = '';
            if (extractUrl) {
                imgHtml = `<img src="${extractUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/160x100?text=News'">`;
                imgHtml = `<div class="an-img" style="position:relative; flex-shrink:0;">${imgHtml}${playOverlay}</div>`;
            }"""

    if target in content:
        new_content = content.replace(target, replacement)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
    else:
        print(f"Target not found in {f}")
