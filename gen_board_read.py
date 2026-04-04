import re

with open('board.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Split around <div class="news-list-area">
part1 = html.split('<div class="news-list-area">')[0] + '<div class="news-list-area">\n'
part2 = html.split('<!-- 우측 사이드바 -->')[1]

custom_css = """
        <style>
            .b-read-wrapper { background: #fff; padding: 40px; border: 1px solid #e5e5e5; border-top: 2px solid #111; border-radius: 8px; margin-bottom: 20px;}
            .b-read-head { padding-bottom: 20px; border-bottom: 1px solid #111; margin-bottom: 30px; }
            .b-read-cat { font-size: 14px; font-weight: 700; color: var(--brand-blue); margin-bottom: 10px; }
            .b-read-title { font-size: 26px; font-weight: 800; color: #111; line-height: 1.4; margin-bottom: 15px; }
            .b-read-meta { display: flex; justify-content: space-between; font-size: 13px; color: #777; align-items: center; }
            .b-read-author { color: #333; font-weight: 700; margin-right: 15px; }
            .b-read-body { font-size: 16px; line-height: 1.7; color: #333; min-height: 300px; margin-bottom: 40px; overflow-wrap: break-word; }

            /* 비디오 영역 */
            .b-video-box { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px; margin-bottom: 30px; }
            .b-video-box iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }

            /* 첨부파일 다운로드 */
            .b-read-file { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .b-read-file .f-tit { font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
            .b-read-file .f-sub { font-size: 13px; color: #64748b; }
            .btn-dl { background: var(--brand-blue); color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none;}

            /* 이전글 / 다음글 */
            .b-prev-next { border-top: 2px solid #111; border-bottom: 1px solid #eee; margin-bottom: 30px; border-radius: 4px; overflow: hidden; background: #fff;}
            .b-pn-item { display: flex; border-bottom: 1px solid #eee; }
            .b-pn-item:last-child { border-bottom: none; }
            .b-pn-label { width: 100px; background: #fcfcfc; color: #555; padding: 15px; font-size: 14px; font-weight: bold; text-align: center; border-right: 1px solid #eee; display: flex; align-items: center; justify-content: center; }
            .b-pn-title { flex: 1; padding: 15px 20px; font-size: 14px; color: #333; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
            .b-pn-title:hover { font-weight: bold; color: var(--brand-blue); text-decoration: underline; }

            /* 하단 버튼들 */
            .b-action-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;}
            .b-btn-group { display: flex; gap: 10px; }
            .btn-sub { border: 1px solid #ccc; background: #fff; padding: 10px 20px; border-radius: 4px; font-size: 14px; color: #555; font-weight: bold; cursor: pointer; }
            .btn-sub:hover { background: #f9f9f9; color: #111; border-color: #bbb; }
            .btn-danger { border: 1px solid #ffcdcd; background: #fffafb; padding: 10px 20px; border-radius: 4px; font-size: 14px; color: #c82333; font-weight: bold; cursor: pointer; }
            .btn-danger:hover { background: #fbebed; border-color: #ffb8b8; }
            .btn-primary { background: var(--brand-navy); color: #fff; border: none; padding: 10px 24px; border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer; }
            .btn-primary:hover { background: #16407b; }

            /* 댓글 영역 CSS */
            .comments-section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; background: #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .cmt-item { border-top: 1px solid #f3f4f6; padding: 16px 0; }
            .cmt-item:first-child { border-top: none; }
            .cmt-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;}
            .cmt-author { font-weight: 700; color: #374151; }
            .cmt-date { color: #9ca3af; }
            .cmt-body { font-size: 15px; color: #4b5563; line-height: 1.5; white-space: pre-wrap; }
        </style>
"""

custom_html = """
                <div class="b-read-wrapper" id="vWrapper" style="display:none;">
                    <div class="b-read-head">
                        <div class="b-read-cat" id="vCategory">[분류]</div>
                        <div class="b-read-title" id="vTitle">게시물을 불러오고 있습니다...</div>
                        <div class="b-read-meta">
                            <div>
                                <span class="b-read-author" id="vAuthor">작성자</span>
                                <span id="vDate">-</span>
                            </div>
                            <div>
                                조회수 <strong style="color:#111" id="vViews">0</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div id="vVideoArea" style="display:none; margin-bottom: 30px;"></div>
                    
                    <div class="b-read-file" id="vDownloadArea" style="display:none;">
                        <div>
                            <div class="f-tit">첨부파일 다운로드</div>
                            <div class="f-sub">이 게시물에 첨부된 자료(원본영상 등)를 다운로드 받습니다.</div>
                        </div>
                        <a href="#" target="_blank" class="btn-dl" id="vDriveBtn">다운로드 받기</a>
                    </div>
                
                    <div class="b-read-body" id="vContent"></div>
                </div>

                <!-- 이전글 다음글 -->
                <div class="b-prev-next">
                    <div class="b-pn-item">
                        <div class="b-pn-label">이전글 ∧</div>
                        <div class="b-pn-title" id="vPrevTitle" onclick="">이전 게시글이 없습니다.</div>
                    </div>
                    <div class="b-pn-item">
                        <div class="b-pn-label">다음글 ∨</div>
                        <div class="b-pn-title" id="vNextTitle" onclick="">다음 게시글이 없습니다.</div>
                    </div>
                </div>
                
                <!-- 버튼 그룹 -->
                <div class="b-action-row">
                    <div class="b-btn-group">
                        <button class="btn-danger" onclick="alert('신고가 접수되었습니다.')">신고</button>
                        <button class="btn-danger" onclick="alert('해당 게시물이 차단되었습니다.')">차단</button>
                    </div>
                    <div class="b-btn-group">
                        <button class="btn-sub" id="btnGoList" onclick="location.href='board.html?id=' + currentBoardId">목록</button>
                        <button class="btn-primary" id="btnGoWrite" onclick="location.href='board_write.html?board_id=' + currentBoardId">글쓰기</button>
                    </div>
                </div>
                
                <div class="comments-section">
                    <div style="font-size:20px; font-weight:800; margin-bottom:15px;" id="portalCommentCount">0개의 댓글</div>
                    
                    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:15px; margin-bottom:24px;">
                        <div style="font-weight:bold; margin-bottom:8px; color:#333; font-size:14px;" id="commentUserName">비로그인 상태입니다 (게스트)</div>
                        <textarea id="commentInput" placeholder="게시물에 대한 의견을 남겨보세요. 바르고 고운 말을 사용해주세요." style="width:100%; height:80px; border:none; resize:none; font-family:inherit; font-size:15px; outline:none; background:transparent;"></textarea>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                            <span style="font-size:12px; color:#9ca3af;"><span id="commentLength">0</span> / 400</span>
                            <button style="background:#111; color:#fff; border:none; border-radius:6px; padding:8px 24px; font-weight:bold; cursor:pointer; font-size:14px;" onclick="submitBoardComment()">댓글 등록</button>
                        </div>
                    </div>
                    
                    <div id="portalCommentList">
                        <div style="text-align:center; padding:40px 20px; color:#999; font-size:14px;">등록된 댓글이 없습니다. 첫 댓글을 남겨주세요!</div>
                    </div>
                </div>

"""

final_html = part1 + custom_css + custom_html + '            </div>\n            <!-- 우측 사이드바 -->' + part2

# Modify JS
final_html = final_html.replace('await loadBoardPosts();', 'const urlP = new URLSearchParams(window.location.search); window.currentPostId = urlP.get(\'post_id\'); await fetchPostData(); await loadBoardComments();')
final_html = final_html.replace('<title>공실뉴스 - 자료실 게시판</title>', '<title>게시글 보기 - 공실뉴스</title>')

js_insert = """
    async function fetchPostData() {
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;

        if (!window.currentPostId) {
            alert('잘못된 접근입니다.');
            location.href = 'board.html?id=' + currentBoardId;
            return;
        }

        const { data, error } = await sb.from('board_posts').select('*').eq('id', window.currentPostId).single();
        if (error || !data) {
            alert('게시글을 불러올 수 없거나 삭제되었습니다.');
            location.href = 'board.html?id=' + currentBoardId;
            return;
        }
        
        let currentPost = data;

        // 조회수 1 증가 (조회 꼼수 방지는 나중에 보완)
        await sb.from('board_posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', window.currentPostId);

        renderPostDetails(data);
        await loadPrevNext(data);
    }

    async function loadPrevNext(post) {
        const sb = window.gongsiClient || window.supabaseClient;
        // 이전글: 나보다 created_at이 작은(과거) 글 중 가장 최신
        const { data: prevData } = await sb.from('board_posts').select('id, title').eq('board_id', currentBoardId).lt('created_at', post.created_at).order('created_at', {ascending: false}).limit(1);
        // 다음글: 나보다 created_at이 큰(미래) 글 중 가장 오래된
        const { data: nextData } = await sb.from('board_posts').select('id, title').eq('board_id', currentBoardId).gt('created_at', post.created_at).order('created_at', {ascending: true}).limit(1);
        
        const vPrevTitle = document.getElementById('vPrevTitle');
        const vNextTitle = document.getElementById('vNextTitle');

        if(prevData && prevData.length > 0) {
            vPrevTitle.innerText = prevData[0].title;
            vPrevTitle.style.cursor = 'pointer';
            vPrevTitle.onclick = () => location.href = `board_read.html?post_id=${prevData[0].id}&board_id=${currentBoardId}`;
        }

        if(nextData && nextData.length > 0) {
            vNextTitle.innerText = nextData[0].title;
            vNextTitle.style.cursor = 'pointer';
            vNextTitle.onclick = () => location.href = `board_read.html?post_id=${nextData[0].id}&board_id=${currentBoardId}`;
        }
    }

    function renderPostDetails(info) {
        document.getElementById('vWrapper').style.display = 'block';
        document.getElementById('vCategory').innerText = `[${info.category || '전체'}]`;
        document.getElementById('vTitle').innerText = info.title;
        document.getElementById('vAuthor').innerText = info.author_name || '익명';
        document.getElementById('vViews').innerText = (info.view_count || 0).toLocaleString();
        
        const dateStr = new Date(info.created_at).toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
        document.getElementById('vDate').innerText = dateStr;

        // 유튜브 URL 파싱
        if (info.youtube_url) {
            const vidArea = document.getElementById('vVideoArea');
            let embedUrl = info.youtube_url;
            if(embedUrl.includes('youtu.be/')) embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
            if(embedUrl.includes('watch?v=')) embedUrl = embedUrl.replace('watch?v=', 'embed/');
            if(embedUrl.includes('?si=')) embedUrl = embedUrl.split('?si=')[0]; // 클린 URL
            
            vidArea.style.display = 'block';
            vidArea.innerHTML = `<div class="b-video-box"><iframe src="${embedUrl}" allowfullscreen></iframe></div>`;
        }

        // 구글드라이브 URL 파싱
        if (info.drive_url) {
            document.getElementById('vDownloadArea').style.display = 'flex';
            document.getElementById('vDriveBtn').href = info.drive_url;
        }

        document.getElementById('vContent').innerHTML = info.content || '';
    }

    /* --- 댓글 시스템 이식부 --- */
    async function loadBoardComments() {
        const sb = window.gongsiClient || window.supabaseClient;
        if(!sb) return;
        const { data: { user } } = await sb.auth.getUser();
        if(user) {
            const { data: ud } = await sb.from('users_profile').select('name').eq('id', user.id).single();
            document.getElementById('commentUserName').innerText = (ud?.name || user.email.split('@')[0]) + '님';
        }
    }

    function submitBoardComment() {
        const val = document.getElementById('commentInput').value;
        if(!val) return alert('댓글 내용을 입력하세요.');
        
        const userName = document.getElementById('commentUserName').innerText;
        const safeName = userName.includes('비로그인') ? '게스트' : userName;

        document.getElementById('portalCommentList').innerHTML = `
            <div class="cmt-item">
                <div class="cmt-header">
                    <span class="cmt-author">${safeName}</span>
                    <span class="cmt-date">방금 전</span>
                </div>
                <div class="cmt-body">${val}</div>
            </div>
        ` + document.getElementById('portalCommentList').innerHTML.replace(/등록된 댓글이 없습니다.*/, '');
        
        document.getElementById('commentInput').value = '';
        document.getElementById('portalCommentCount').innerText = '1개의 댓글';
        alert('댓글이 성공적으로 등록되었습니다.');
    }
"""

final_html = final_html.replace('function showError(msg)', js_insert + '\n    function showError(msg)')

with open('board_read.html', 'w', encoding='utf-8') as f:
    f.write(final_html)

print("Generated board_read.html perfectly!")
