import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('.chat-action-btn {', '.chat-action-btn { white-space: nowrap; word-break: keep-all;')

with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS CSS")
