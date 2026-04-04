import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('}, 1500);\n    }\n\n    function applyAiChatToEditor(btn) {', '    }\n\n    function applyAiChatToEditor(btn) {')

with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS ORPHAN FIXED")
