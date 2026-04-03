import glob

files = ["board.html", "news_all.html", "news_etc.html", "news_finance.html", "news_law.html", "news_life.html", "news_politics.html"]

for f in files:
    with open(f, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    start_str = "let extractUrl = (news.article_media && news.article_media.url)"
    
    # We find the exact line containing `let extractUrl`
    idx = content.find(start_str)
    if idx == -1: 
        continue
        
    # Find the end of the broken imgHtml line.
    end_idx = content.find("imgHtml = `\`div class=\"an-img\"", idx)
    if end_idx != -1:
        end_idx = content.find(";/div\\``;", end_idx) # wait, what did the broken line end in?
    
    # Actually, let's just find the exact text in the file:
    end_str_1 = "imgHtml = `\\`div class=\"an-img\" style=\"position:relative; flex-shrink:0;\"\\`\\${imgHtml}\\${playOverlay}\\`/div\\``;" # Python represented
    end_idx = content.find("imgHtml = ")
    
    # Safer way: find up to the next known good line.
    next_line = 'const categoryBadge ='
    end_idx = content.find(next_line, idx)
    
    if end_idx != -1:
        replacement = """let extractUrl = (news.article_media && news.article_media.url) ? news.article_media.url : news.image_url;
            let isVideo = false;
            
            if (extractUrl && extractUrl.includes('youtube.com/embed/')) {
                isVideo = true;
                const parts = extractUrl.split('youtube.com/embed/');
                if (parts.length > 1) {
                    const vId = parts[1].split('?')[0].split('"')[0];
                    extractUrl = `https://img.youtube.com/vi/${vId}/mqdefault.jpg`;
                }
            }

            if(!extractUrl && news.content) {
                const ytIframeMatch = news.content.match(/<iframe[^>]+src=["']([^"']*youtube\\.com\\/embed\\/[^"']+)["']/i);
                if (ytIframeMatch) {
                    isVideo = true;
                    const parts = ytIframeMatch[1].split('youtube.com/embed/');
                    if (parts.length > 1) {
                        const vId = parts[1].split('?')[0].split('"')[0];
                        extractUrl = `https://img.youtube.com/vi/${vId}/mqdefault.jpg`;
                    }
                } else {
                    const imgMatch = news.content.match(/<img[^>]+src=["']([^"']+)["']/i);
                    if(imgMatch) extractUrl = imgMatch[1];
                }
            }
            
            const playOverlay = isVideo ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:44px; height:44px; background:rgba(0,0,0,0.4); border-radius:50%; border: 2.5px solid white; display:flex; align-items:center; justify-content:center; z-index:5;"><svg viewBox="0 0 24 24" width="24" height="24" fill="white" style="margin-left:4px;"><path d="M8 5v14l11-7z"/></svg></div>` : ``;

            let imgHtml = '';
            if (extractUrl) {
                imgHtml = `<img src="${extractUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/160x100?text=News'">`;
                imgHtml = `<div class="an-img" style="position:relative; flex-shrink:0;">${imgHtml}${playOverlay}</div>`;
            }
            
            """
        
        new_content = content[:idx] + replacement + content[end_idx:]
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
