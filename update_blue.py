import os, glob
import base64
import re

files = glob.glob('*.html') + ['script.js', 'style.css']
old_hex = '#1e56a0'
new_hex = '#508bf5'
old_hex_upper = '#1E56A0'
new_hex_upper = '#508BF5'
old_rgba = 'rgba(30, 86, 160,'
new_rgba = 'rgba(80, 139, 245,'

for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    # Replace standard hex color
    new_content = content.replace(old_hex, new_hex).replace(old_hex_upper, new_hex_upper)
    new_content = new_content.replace(old_rgba, new_rgba)
    
    # Fix the base64 SVG marker in script.js
    if f == 'script.js':
        matches = re.findall(r'data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)', new_content)
        if matches:
            for old_b64 in matches:
                try:
                    decoded = base64.b64decode(old_b64).decode('utf-8')
                    if old_hex in decoded or old_hex_upper in decoded:
                        new_decoded = decoded.replace(old_hex, new_hex).replace(old_hex_upper, new_hex_upper)
                        new_b64 = base64.b64encode(new_decoded.encode('utf-8')).decode('utf-8')
                        new_content = new_content.replace(old_b64, new_b64)
                        print('Replaced base64 string in script.js!')
                except Exception as e:
                    pass

    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
