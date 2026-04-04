import re
import os

with open('news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract Photodb modal HTML
modal_start = text.find('<!-- 포토DB 모달 -->')
modal_end = text.find('<!-- 포토DB 실제 동작 스크립트 -->')
modal_html = text[modal_start:modal_end]

# Extract Photodb JS
js_start = text.find('window._pdbTab = \'all\';')
js_end = text.find('// ─── 포토DB 간편 아이콘 클릭 ───')
js_code = text[js_start:js_end] if js_start != -1 else ""

print("Modal HTML len:", len(modal_html))
print("JS Code len:", len(js_code))

with open('photodb_logic_dump.txt', 'w', encoding='utf-8') as f:
    f.write(modal_html + "\n\n<script>\n" + js_code + "\n</script>")
