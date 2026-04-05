import os

file_path = "c:/Users/user/Desktop/test/index.html"
with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Make it use articles_light, but wait! The user hasn't created the view yet.
# If I change it to articles_light, the UI will crash until they create it.
# To make it seamless, I can do a try-catch, or just fetch 'id, title, subtitle, created_at, section1, section2, status, content' from articles using `.select('id, title, subtitle, created_at, section1, section2, status, content')`. Wait, the whole point was to use SUBSTRING via View.
# But wait! I CAN use PostgreSQL RPC if they define it, or I can just tell them the correct View code and update index.html to point to it.

new_query_part = "let query = newsDb.from('articles_light').select('*')"
orig_query_part = "let query = newsDb.from('articles').select('*')"

if orig_query_part in html:
    html = html.replace(orig_query_part, new_query_part)

new_content_part = """                    let thumbUrl = null;
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

orig_content_part = """                    let thumbUrl = item.image_url;
                    
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
                    }"""

if orig_content_part in html:
    html = html.replace(orig_content_part, new_content_part)

# Also update fetchAndRenderVideoNews to use articles_light
orig_video_part = """const {data, error} = await newsDb.from('articles')"""
new_video_part = """const {data, error} = await newsDb.from('articles_light')"""
if orig_video_part in html:
    html = html.replace(orig_video_part, new_video_part)

orig_vid_content = """if (item.content) {
                            const ytMatch = item.content.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);"""
new_vid_content = """const checkContent = item.content_preview || item.content;
                        if (checkContent) {
                            const ytMatch = checkContent.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);"""
if orig_vid_content in html:
    html = html.replace(orig_vid_content, new_vid_content)


orig_desc_part = """if(!desc && item.content) {
                        desc = item.content.replace(/<[^>]+>/g, '').substring(0, 100);
                    }"""
new_desc_part = """const contentRaw = item.content_preview || item.content;
                    if(!desc && contentRaw) {
                        desc = contentRaw.replace(/<[^>]+>/g, '').substring(0, 100);
                    }"""
if orig_desc_part in html:
    html = html.replace(orig_desc_part, new_desc_part)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(html)
print("Updated index.html to use articles_light view")
