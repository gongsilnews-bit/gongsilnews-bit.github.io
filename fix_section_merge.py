import re

# ── news.html 수정 ──────────────────────────────────────────
with open('news.html', encoding='utf-8') as f:
    html = f.read()

# 1) 1차섹션 드롭다운: 뉴스, 칼럼 → 뉴스/칼럼
html = html.replace(
    '            <option value="뉴스">뉴스</option>\n            <option value="칼럼">칼럼</option>',
    '            <option value="뉴스/칼럼">뉴스/칼럼</option>'
)

# 2) SEC_FILTER_SUBS: 뉴스 + 칼럼 키 → 뉴스/칼럼 하나로
old_subs = (
    "                '뉴스': ['부동산\\u00b7주식\\u00b7재테크', '정치\\u00b7경제\\u00b7사회', '세무\\u00b7법률', '여행\\u00b7맛집', '건강\\u00b7헬스', 'IT\\u00b7가전\\u00b7가구', '스포츠\\u00b7연예\\u00b7Car', '인물\\u00b7미션\\u00b7기타'],\n"
    "                '칼럼': ['부동산\\u00b7주식\\u00b7재테크', '정치\\u00b7경제\\u00b7사회', '세무\\u00b7법률', '여행\\u00b7맛집', '건강\\u00b7헬스', 'IT\\u00b7가전\\u00b7가구', '스포츠\\u00b7연예\\u00b7Car', '인물\\u00b7미션\\u00b7기타']"
)
new_subs = (
    "                '뉴스/칼럼': ['부동산\u00b7주식\u00b7재테크', '정치\u00b7경제\u00b7사회', '세무\u00b7법률', '여행\u00b7맛집', '건강\u00b7헬스', 'IT\u00b7가전\u00b7가구', '스포츠\u00b7연예\u00b7Car', '인물\u00b7미션\u00b7기타']"
)
html = html.replace(old_subs, new_subs)

with open('news.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("news.html 완료")

# ── script.js 수정 ─────────────────────────────────────────
with open('script.js', encoding='utf-8') as f:
    js = f.read()

# 뉴스, 칼럼 개별 처리 → 뉴스/칼럼 하나로
old_mapping = (
    "            } else if (category === '뉴스') {\n"
    "                // 뉴스: section1 = '뉴스' 또는 '뉴스/칼럼' (하위 호환)\n"
    "                dbCategory = '뉴스,뉴스/칼럼';\n"
    "            } else if (category === '칼럼') {\n"
    "                // 칼럼: section1 = '칼럼' 또는 '뉴스/칼럼' (하위 호환)\n"
    "                dbCategory = '칼럼,뉴스/칼럼';\n"
    "            }\n"
    "            // COLUMN_SUBS (2차섹션)는 dbCategory를 그대로 유지 → section2 필터로 처리됨"
)
new_mapping = (
    "            } else if (category === '뉴스/칼럼') {\n"
    "                dbCategory = '뉴스/칼럼';\n"
    "            }\n"
    "            // COLUMN_SUBS (2차섹션)는 dbCategory를 그대로 유지 → section2 필터로 처리됨"
)
js = js.replace(old_mapping, new_mapping)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("script.js 완료")
print("모든 수정 완료!")
