import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the select field to prevent missing column error
html = html.replace('.select(\'id, title, subtitle, content, thumbnail, created_at, status\')', '.select(\'*\')')

# Also fix the image parsing logic
old_logic = "if(item.thumbnail) {"
new_logic = """const imgMatch = item.content ? item.content.match(/<img[^>]+src=['"]([^'"]+)['"]/) : null;
                    let thumbUrl = item.image_url || (imgMatch ? imgMatch[1] : null);
                    if(thumbUrl) {"""
                    
html = html.replace(old_logic, new_logic)
html = html.replace('${item.thumbnail}', '${thumbUrl}')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Fixed index.html select query and image extraction!')
