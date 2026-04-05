import os

code = """'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminBoards() {
    const [boards, setBoards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        boardId: '', boardName: '', subtitle: '', skin: 'default_bbs',
        categories: '', galleryColumns: '3', authList: '1', authRead: '5', authWrite: '9'
    });

    useEffect(() => {
        loadBoards();
    }, []);

    const loadBoards = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('boards').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setBoards(data);
        }
        setLoading(false);
    };

    const openModal = (isEdit = false, boardData = null) => {
        setIsEditMode(isEdit);
        if (!isEdit) {
            setForm({
                boardId: '', boardName: '', subtitle: '', skin: 'default_bbs',
                categories: '', galleryColumns: '3', authList: '1', authRead: '5', authWrite: '9'
            });
        } else if (boardData) {
            setForm({
                boardId: boardData.board_id,
                boardName: boardData.board_name,
                subtitle: boardData.subtitle || '',
                skin: boardData.skin_type || 'default_bbs',
                categories: boardData.categories || '',
                galleryColumns: String(boardData.gallery_columns || 3),
                authList: String(boardData.auth_list || 1),
                authRead: String(boardData.auth_read || 5),
                authWrite: String(boardData.auth_write || 9)
            });
        }
        setIsModalOpen(true);
    };

    const saveBoard = async () => {
        if (!form.boardId || !form.boardName) return alert('게시판 고유 ID와 게시판명은 필수 입력 항목입니다.');
        
        const boardData = {
            board_id: form.boardId,
            board_name: form.boardName,
            subtitle: form.subtitle,
            skin_type: form.skin,
            categories: form.categories,
            gallery_columns: parseInt(form.galleryColumns) || 3,
            auth_list: parseInt(form.authList) || 1,
            auth_read: parseInt(form.authRead) || 1,
            auth_write: parseInt(form.authWrite) || 9
        };

        const { error } = await supabase.from('boards').upsert([boardData]);
        if (error) {
            alert('게시판 저장 실패: ' + error.message);
        } else {
            alert('게시판이 성공적으로 저장되었습니다!');
            setIsModalOpen(false);
            loadBoards();
        }
    };

    const deleteBoard = async (bid) => {
        if(!confirm(`정말 '${bid}' 게시판을 삭제하시겠습니까?\\n내부의 모든 게시물이 함께 삭제될 수 있습니다.`)) return;
        const { error } = await supabase.from('boards').delete().eq('board_id', bid);
        if(error) alert('삭제 실패: ' + error.message);
        else loadBoards();
    };

    return (
        <div className="admin-boards-wrapper">
            <style jsx>{`
                :root { --bg: #ffffff; --text-main: #111827; --text-muted: #6b7280; --border: #e5e7eb; --hover: #f9fafb; --primary: #374151; --primary-hover: #1f2937; }
                .admin-boards-wrapper { font-family: 'Pretendard Variable', -apple-system, sans-serif; margin: 0; padding: 32px; background: #fff; color: #111827; min-height: 100vh; }
                .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
                h2 { margin: 0; font-size: 20px; font-weight: 700; color: #111; }
                .btn { padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 4px; cursor: pointer; transition: all 0.2s; border: none; font-family:inherit;}
                .btn-primary { background: #374151; color: #fff; }
                .btn-primary:hover { background: #1f2937; }
                .btn-outline { background: #fff; border: 1px solid #e5e7eb; color: #111827; }
                .btn-outline:hover { background: #f9fafb; }
                table { width: 100%; border-collapse: collapse; text-align: left; }
                th { padding: 12px 16px; font-size: 13px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
                td { padding: 16px; font-size: 14px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
                tr:hover td { background: #f9fafb; }
                .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
                .modal { background: #fff; width: 540px; border-radius: 8px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .modal-header h3 { margin: 0; font-size: 17px; font-weight: 700; color: #111; }
                .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; line-height: 1; padding:0;}
                .close-btn:hover { color: #111; }
                .form-group { margin-bottom: 18px; }
                .form-group label { display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px; }
                .form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 14px; box-sizing: border-box; background: #fff; font-family: inherit; color: #111; }
                .form-group input:focus, .form-group select:focus { outline: none; border-color: #374151; box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.1); }
                .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 28px; }
                .skin-icon { font-size: 16px; margin-right: 6px; vertical-align: middle; color: #6b7280; }
                .description-text { font-size: 12px; color: #9ca3af; margin-top: 4px; display: block; }
                
                .btn-edit { padding: 5px 10px; font-size: 11px; border-radius: 4px; border: 1px solid #4b5563; background: #4b5563; cursor: pointer; color: #fff; font-family: inherit; font-weight: 600; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
                .btn-edit:hover { background: #374151; border-color: #374151; }
                .btn-preview { padding: 5px 10px; font-size: 11px; border-radius: 4px; border: 1px solid #6b7280; background: #6b7280; cursor: pointer; color: #fff; font-family: inherit; font-weight: 600; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
                .btn-preview:hover { background: #4b5563; border-color: #4b5563; }
                .btn-delete { padding: 5px 10px; font-size: 11px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; color: #374151; font-family: inherit; font-weight: 500; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
                .btn-delete:hover { background: #f9fafb; border-color: #fecaca; color: #dc2626; }
            `}</style>

            <div className="header-top">
                <h2>게시판 리스트 및 설정</h2>
                <button className="btn btn-primary" onClick={() => openModal(false)}>+ 새 게시판 생성</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>고유 ID</th>
                        <th>게시판명</th>
                        <th>스킨 테마 설정</th>
                        <th>권한 설정 (목록/읽기/쓰기)</th>
                        <th>관리 액션</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" style={{textAlign:'center', color:'#666', padding:'30px'}}>로딩 중...</td></tr>
                    ) : boards.length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign:'center', color:'#666', padding:'30px'}}>생성된 게시판이 없습니다. 새 게시판을 만들어주세요.</td></tr>
                    ) : (
                        boards.map(b => {
                            let skinIcon = '📝'; let skinLabel = '일반 리스트형';
                            if (b.skin_type === 'video_album') { skinIcon = '▶'; skinLabel = '동영상 앨범형'; }
                            else if (b.skin_type === 'file_album') { skinIcon = '📄'; skinLabel = '자료실 썸네일형'; }
                            else if (b.skin_type === 'faq_album') { skinIcon = '💡'; skinLabel = 'FAQ 아코디언형'; }
                            else if (b.skin_type === 'qna_1on1') { skinIcon = '🔒'; skinLabel = '1:1 비밀 문의형'; }

                            return (
                                <tr key={b.board_id}>
                                    <td style={{fontFamily: 'monospace', color: '#6b7280', fontSize: '13px'}}>{b.board_id}</td>
                                    <td style={{fontWeight: 700, cursor: 'pointer'}} onClick={() => openModal(true, b)}>
                                        <span style={{color: '#111827', fontWeight: 800}}>{b.board_name}</span>
                                        <span style={{fontSize:'12px', color:'#9ca3af', fontWeight:400, marginLeft:'6px'}}>({b.subtitle || ''})</span>
                                    </td>
                                    <td><span className="badge"><span className="skin-icon">{skinIcon}</span> {skinLabel}</span></td>
                                    <td style={{fontSize: '13px', color: '#6b7280'}}>{b.auth_list} / {b.auth_read} / {b.auth_write}</td>
                                    <td>
                                        <div style={{display:'flex', gap:'4px'}}>
                                            <button className="btn-edit" onClick={() => openModal(true, b)}>설정</button>
                                            <button className="btn-preview" onClick={() => window.location.href=`/board/${b.board_id}`}>미리보기</button>
                                            <button className="btn-delete" onClick={() => deleteBoard(b.board_id)}>삭제</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{isEditMode ? '게시판 설정(수정)' : '게시판 생성'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        
                        <div className="form-group">
                            <label>게시판 고유 ID <span style={{color:'#ef4444'}}>*</span></label>
                            <input type="text" value={form.boardId} onChange={e => setForm({...form, boardId: e.target.value})} disabled={isEditMode} placeholder="예: bbs_notice" />
                            <span className="description-text">URL 주소로 사용될 고유 이름입니다.</span>
                        </div>
                        
                        <div style={{display:'flex', gap:'16px'}}>
                            <div className="form-group" style={{flex:1}}>
                                <label>게시판 이름 <span style={{color:'#ef4444'}}>*</span></label>
                                <input type="text" value={form.boardName} onChange={e => setForm({...form, boardName: e.target.value})} placeholder="예: 공지사항" />
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label>보조 타이틀</label>
                                <input type="text" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} placeholder="예: 자료실" />
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'16px'}}>
                            <div className="form-group" style={{flex:2}}>
                                <label>스킨 / 테마 구조 선택 <span style={{color:'#ef4444'}}>*</span></label>
                                <select value={form.skin} onChange={e => setForm({...form, skin: e.target.value})}>
                                    <option value="default_bbs">📝 일반 리스트형 (자유게시판/공지사항)</option>
                                    <option value="video_album">▶ 동영상 앨범형 (유튜브 + 드라이브 다운로드 최적화)</option>
                                    <option value="file_album">📄 파일 자료실형 (디자인 썸네일 + 다운로드 버튼)</option>
                                    <option value="faq_album">💡 자주묻는질문 (FAQ 아코디언형)</option>
                                    <option value="qna_1on1">🔒 1:1 문의 (작성자/관리자 전용 비밀글)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label>가로 갯수 (앨범형)</label>
                                <select value={form.galleryColumns} onChange={e => setForm({...form, galleryColumns: e.target.value})}>
                                    <option value="2">2개씩 보기</option>
                                    <option value="3">3개씩 보기</option>
                                    <option value="4">4개씩 보기</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>세부 카테고리 (분류)</label>
                            <input type="text" value={form.categories} onChange={e => setForm({...form, categories: e.target.value})} placeholder="쉼표(,)로 구분 예: 드론, 아파트" />
                        </div>

                        <div style={{display:'flex', gap:'16px'}}>
                            <div className="form-group" style={{flex:1}}>
                                <label>목록 열람 권한</label>
                                <select value={form.authList} onChange={e => setForm({...form, authList: e.target.value})}>
                                    <option value="0">비회원 + 전체</option>
                                    <option value="1">1레벨 (일반회원)</option>
                                    <option value="5">5레벨 (기자/제휴)</option>
                                    <option value="9">9레벨 (관리자 전용)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label>내용 읽기/다운로드 권한</label>
                                <select value={form.authRead} onChange={e => setForm({...form, authRead: e.target.value})}>
                                    <option value="0">비회원 + 전체</option>
                                    <option value="1">1레벨 (일반회원)</option>
                                    <option value="5">5레벨 (기자/제휴)</option>
                                    <option value="9">9레벨 (관리자 전용)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label>글쓰기 권한</label>
                                <select value={form.authWrite} onChange={e => setForm({...form, authWrite: e.target.value})}>
                                    <option value="1">1레벨 (일반회원)</option>
                                    <option value="5">5레벨 (기자/제휴)</option>
                                    <option value="9">9레벨 (관리자 전용)</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                            <button className="btn btn-primary" onClick={saveBoard}>설정 저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
"""

with open('c:/Users/user/Desktop/test/gongsil-next/src/app/admin/boards/page.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
