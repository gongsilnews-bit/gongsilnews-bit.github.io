import os

# fix news_read.html
fix_read = "c:/Users/user/Desktop/test/news_read.html"
with open(fix_read, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Add .then(() => {}) to actually execute the update query
html = html.replace(
    "sb.from('articles').update({ view_count: (news.view_count || 0) + 1 }).eq('id', articleId);",
    "sb.from('articles').update({ view_count: (news.view_count || 0) + 1 }).eq('id', articleId).then(() => {});"
)

# 2. Add +1 to the UI view as well so the user gets immediate feedback of their own view
html = html.replace(
    "document.getElementById('detailViews').innerText = '조회수 ' + (news.view_count || 1);",
    "document.getElementById('detailViews').innerText = '조회수 ' + ((news.view_count || 0) + 1);"
)

with open(fix_read, "w", encoding="utf-8") as f:
    f.write(html)
print("Fixed news_read.html")


# fix script.js
fix_script = "c:/Users/user/Desktop/test/script.js"
with open(fix_script, "r", encoding="utf-8") as f:
    js = f.read()

# 1. Add .then(() => {}) to actually execute the update query
js = js.replace(
    "sb.from('articles').update({ view_count: (news.view_count || 0) + 1 }).eq('id', news.id);",
    "sb.from('articles').update({ view_count: (news.view_count || 0) + 1 }).eq('id', news.id).then(() => {});"
)

# 2. We should also update the view UI in script.js if it's there
js = js.replace(
    "document.getElementById('portalArticleViews').innerText = '조회수 : ' + (news.view_count || 0);",
    "document.getElementById('portalArticleViews').innerText = '조회수 : ' + ((news.view_count || 0) + 1);"
)

with open(fix_script, "w", encoding="utf-8") as f:
    f.write(js)
print("Fixed script.js")
