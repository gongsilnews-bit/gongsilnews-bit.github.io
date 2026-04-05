import os

file_path = "c:/Users/user/Desktop/test/index.html"
with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Revert to articles table
html = html.replace(
    "let query = newsDb.from('articles_light').select('*')",
    "let query = newsDb.from('articles').select('id, title, subtitle, created_at, section1, section2, status, content')"
)
html = html.replace(
    "const {data, error} = await newsDb.from('articles_light')",
    "const {data, error} = await newsDb.from('articles')" # for video news
)

# Revert content parsing to use item.content directly
orig_content_part = """                    let thumbUrl = null;
                    const contentStr = item.content_preview || item.content;
                    
                    if (contentStr) {
                        const ytMatch = contentStr.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
                        if (ytMatch) {
                            thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
                            isVideo = true;
                        } else {
                            const embedMatch = contentStr.match(/youtube\\.com\\/embed\\/([A-Za-z0-9_-]{11})/);
                            if (embedMatch) {
                                thumbUrl = `https://img.youtube.com/vi/${embedMatch[1]}/mqdefault.jpg`;
                                isVideo = true;
                            } else {
                                const imgMatch = contentStr.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                                if (imgMatch) thumbUrl = imgMatch[1];
                            }
                        }
                    }"""

new_content_part = """                    let thumbUrl = null;
                    let isVideo = false;
                    const contentStr = item.content;
                    
                    if (contentStr) {
                        const ytMatch = contentStr.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
                        if (ytMatch) {
                            thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
                            isVideo = true;
                        } else {
                            const embedMatch = contentStr.match(/youtube\\.com\\/embed\\/([A-Za-z0-9_-]{11})/);
                            if (embedMatch) {
                                thumbUrl = `https://img.youtube.com/vi/${embedMatch[1]}/mqdefault.jpg`;
                                isVideo = true;
                            } else {
                                const imgMatch = contentStr.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                                if (imgMatch) thumbUrl = imgMatch[1];
                            }
                        }
                    }"""

if orig_content_part in html:
    html = html.replace(orig_content_part, new_content_part)


orig_vid_content = """const checkContent = item.content_preview || item.content;
                        if (checkContent) {
                            const ytMatch = checkContent.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);"""
new_vid_content = """if (item.content) {
                            const ytMatch = item.content.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);"""
if orig_vid_content in html:
    html = html.replace(orig_vid_content, new_vid_content)

orig_desc_part = """const contentRaw = item.content_preview || item.content;
                    if(!desc && contentRaw) {
                        desc = contentRaw.replace(/<[^>]+>/g, '').substring(0, 100);
                    }"""
new_desc_part = """if(!desc && item.content) {
                        desc = item.content.replace(/<[^>]+>/g, '').substring(0, 100);
                    }"""
if orig_desc_part in html:
    html = html.replace(orig_desc_part, new_desc_part)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(html)
print("Reverted index.html to fetch full content from articles table")
