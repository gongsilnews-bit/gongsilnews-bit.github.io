import re

with open('admin_boards.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add CSS for .btn-edit, .btn-preview, .btn-delete
css_to_add = """
        .cell-actions { display: flex; gap: 4px; justify-content: flex-start; flex-wrap: nowrap; }
        
        .btn-edit {
            padding: 5px 10px; font-size: 11px; border-radius: 4px;
            border: 1px solid #4b5563; background: #4b5563; cursor: pointer;
            color: #fff; font-family: inherit; font-weight: 600; transition: all 0.15s;
            display: inline-flex; align-items: center; justify-content: center; gap: 4px;
        }
        .btn-edit:hover { background: #374151; border-color: #374151; }
        
        .btn-preview {
            padding: 5px 10px; font-size: 11px; border-radius: 4px;
            border: 1px solid #6b7280; background: #6b7280; cursor: pointer;
            color: #fff; font-family: inherit; font-weight: 600; transition: all 0.15s;
            display: inline-flex; align-items: center; justify-content: center; gap: 4px;
        }
        .btn-preview:hover { background: #4b5563; border-color: #4b5563; }

        .btn-delete {
            padding: 5px 10px; font-size: 11px; border-radius: 4px;
            border: 1px solid #d1d5db; background: #fff; cursor: pointer;
            color: #374151; font-family: inherit; font-weight: 500; transition: all 0.15s;
            display: inline-flex; align-items: center; justify-content: center; gap: 4px;
        }
        .btn-delete:hover { background: #f9fafb; border-color: #fecaca; color: #dc2626; }
        .btn-delete:hover svg { stroke: #dc2626; }
"""

if '.btn-edit {' not in html:
    html = html.replace('.description-text { font-size: 12px; color: #9ca3af; margin-top: 4px; display: block; }',
                        '.description-text { font-size: 12px; color: #9ca3af; margin-top: 4px; display: block; }' + css_to_add)

# Change title color to black (var(--text-main))
html = html.replace("<span style=\"color: #2563eb; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s;\" onmouseover=\"this.style.borderBottom='1px solid #2563eb'\" onmouseout=\"this.style.borderBottom='transparent'\">${b.board_name}</span>",
                    "<span style=\"color: var(--text-main); font-weight: 800; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s;\" onmouseover=\"this.style.borderBottom='1px solid var(--text-main)'\" onmouseout=\"this.style.borderBottom='transparent'\">${b.board_name}</span>")


# Update JS generated buttons
btn_old = """                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px; border-color:#d1d5db;" onclick="editBoard('${b.board_id}')">설정</button>
                            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="location.href='../board.html?id=${b.board_id}'">미리보기</button>
                            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px; color:#dc2626; border-color: #fecaca; background: #fef2f2;" onclick="deleteBoard('${b.board_id}')">삭제</button>
                        </div>"""

btn_new = """                        <div class="cell-actions">
                            <button class="btn-edit" onclick="editBoard('${b.board_id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                                설정
                            </button>
                            <button class="btn-preview" onclick="location.href='../board.html?id=${b.board_id}'">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                미리보기
                            </button>
                            <button class="btn-delete" onclick="deleteBoard('${b.board_id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;stroke:#9ca3af;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                삭제
                            </button>
                        </div>"""

html = html.replace(btn_old, btn_new)

with open('admin_boards.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("success")
