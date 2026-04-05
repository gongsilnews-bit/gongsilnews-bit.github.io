import re

with open('article_admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

css_target = """        /* ── 관리 버튼 ── */
        .btn-edit {
            padding: 3px 6px; font-size: 11px; border-radius: 3px;
            border: 1px solid #d1d5db; background: #fff; cursor: pointer;
            color: #333; font-family: inherit; font-weight: 500; transition: background 0.1s;
            white-space: nowrap; margin-right: 4px;
        }
        .btn-edit:hover { background: #f3f4f6; }
        .btn-delete {
            padding: 3px 6px; font-size: 11px; border-radius: 3px;
            border: 1px solid #fecaca; background: #fff; cursor: pointer;
            color: #dc2626; font-family: inherit; font-weight: 500; transition: background 0.1s;
            white-space: nowrap;
        }
        .btn-delete:hover { background: #fef2f2; }"""

css_replace = """        /* ── 관리 버튼 ── */
        .cell-actions { display: flex; gap: 4px; justify-content: center; flex-wrap: nowrap; }
        
        .btn-edit {
            padding: 5px 10px; font-size: 11px; border-radius: 4px;
            border: 1px solid #4b5563; background: #4b5563; cursor: pointer;
            color: #fff; font-family: inherit; font-weight: 600; transition: all 0.15s;
            display: inline-flex; align-items: center; justify-content: center; gap: 4px;
        }
        .btn-edit:hover { background: #374151; border-color: #374151; }
        
        .btn-delete {
            padding: 5px 10px; font-size: 11px; border-radius: 4px;
            border: 1px solid #d1d5db; background: #fff; cursor: pointer;
            color: #374151; font-family: inherit; font-weight: 500; transition: all 0.15s;
            display: inline-flex; align-items: center; justify-content: center; gap: 4px;
        }
        .btn-delete:hover { background: #f9fafb; border-color: #fecaca; color: #dc2626; }
        .btn-delete:hover svg { stroke: #dc2626; }"""

html = html.replace(css_target, css_replace)

html = html.replace('<th style="width: 90px;">관리</th>', '<th style="width: 135px;">관리</th>')

button_target = """              +'<td style="white-space:nowrap;">'
              +  '<button class="btn-edit" onclick="goEdit('+a.id+')">수정</button>'
              +  '<button class="btn-delete" onclick="deleteArticle('+a.id+',\\''+escHtml(a.title||'')+'\\')">삭제</button>'
              +'</td>'"""

button_replace = """              +'<td>'
              +  '<div class="cell-actions">'
              +    '<button class="btn-edit" onclick="goEdit('+a.id+')">'
              +      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>'
              +      '수정'
              +    '</button>'
              +    '<button class="btn-delete" onclick="deleteArticle('+a.id+',\\''+escHtml(a.title||'')+'\\')">'
              +      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;stroke:#9ca3af;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'
              +      '삭제'
              +    '</button>'
              +  '</div>'
              +'</td>'"""

html = html.replace(button_target, button_replace)

if css_replace in html and button_replace in html and '<th style="width: 135px;">관리</th>' in html:
    print("Replace successful!")
else:
    print("Replace failed!")

with open('article_admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
