import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_logic = """                    let imgHtml = '';
                    const imgMatch = item.content ? item.content.match(/<img[^>]+src=['"]([^'"]+)['"]/) : null;
                    let thumbUrl = item.image_url || (imgMatch ? imgMatch[1] : null);
                    if(thumbUrl) {
                        imgHtml = `<div class="hi-img"><img src="${thumbUrl}" alt="" onerror="this.src='https://via.placeholder.com/140x100'"></div>`;
                    } else {
                        imgHtml = `<div class="hi-img"><img src="default_article.png" alt="" onerror="this.src='https://via.placeholder.com/140x100?text=No+Image'"></div>`;
                    }"""

new_logic = """                    let imgHtml = '';
                    let isVideo = false;
                    let thumbUrl = item.image_url;
                    
                    if (!thumbUrl && item.content) {
                        const ytMatch = item.content.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
                        if (ytMatch) {
                            thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
                            isVideo = true;
                        } else {
                            const embedMatch = item.content.match(/youtube\\.com\\/embed\\/([A-Za-z0-9_-]{11})/);
                            if (embedMatch) {
                                thumbUrl = `https://img.youtube.com/vi/${embedMatch[1]}/mqdefault.jpg`;
                                isVideo = true;
                            } else {
                                const imgMatch = item.content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                                if (imgMatch) thumbUrl = imgMatch[1];
                            }
                        }
                    }
                    
                    if (!thumbUrl) {
                        thumbUrl = 'default_article.png';
                    }
                    
                    let overlayHtml = isVideo ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:36px; height:36px; background:rgba(0,0,0,0.6); border-radius:50%; border:2px solid #fff; display:flex; justify-content:center; align-items:center;"><div style="width:0; height:0; border-top:6px solid transparent; border-bottom:6px solid transparent; border-left:10px solid #fff; margin-left:3px;"></div></div>` : '';
                    
                    imgHtml = `<div class="hi-img" style="position:relative;"><img src="${thumbUrl}" alt="" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/140x100?text=No+Image'">${overlayHtml}</div>`;"""

if old_logic in html:
    html = html.replace(old_logic, new_logic)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Successfully updated video thumbnail logic in index.html")
else:
    print("Error: Could not find the target string in index.html")
