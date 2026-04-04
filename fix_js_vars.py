with open(r'c:\Users\user\Desktop\test\news_write.html', 'r', encoding='utf-8') as f: text = f.read();
text = text.replace('\${text}', '${text}')
text = text.replace('\${typingId}', '${typingId}')
text = text.replace('\${API_KEY}', '${API_KEY}')
text = text.replace('\${formattedReply', '${formattedReply')
text = text.replace('\${ showButton', '${ showButton')
text = text.replace('\${e.message}', '${e.message}')
with open(r'c:\Users\user\Desktop\test\news_write.html', 'w', encoding='utf-8') as f: f.write(text);
print("SUCCESS fixed JS escaping")
