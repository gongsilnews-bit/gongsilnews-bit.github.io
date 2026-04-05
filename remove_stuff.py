import os

file_path = "c:/Users/user/Desktop/test/admin.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the Excel mass upload button
content = content.replace('<button class="btn btn-register" style="background-color:#10b981;" onclick="document.getElementById(\'excelModal\').style.display=\'flex\'">📄 엑셀 대량등록</button>', '')

# Remove the Chatbot script
content = content.replace('<script src="gongsil_chatbot.js?v=20250329"></script>', '')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("done")
