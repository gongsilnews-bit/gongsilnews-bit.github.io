import re

with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace .ai-chat-widget CSS
old_widget_css = '''    .ai-chat-widget {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 380px;
        height: 600px;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: none;
        flex-direction: column;
        z-index: 10000;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
    }'''

new_widget_css = '''    .ai-chat-widget {
        position: fixed;
        top: calc(50% - 350px);
        left: calc(50% - 300px);
        width: 600px;
        height: 700px;
        min-width: 400px;
        min-height: 500px;
        max-width: 90vw;
        max-height: 90vh;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.25);
        display: none;
        flex-direction: column;
        z-index: 10000;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
        resize: both;
    }'''
text = text.replace(old_widget_css, new_widget_css)

with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS")
