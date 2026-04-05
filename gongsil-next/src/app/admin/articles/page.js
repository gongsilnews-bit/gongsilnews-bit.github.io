'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PAGE_SIZE = 10;

export default function ArticleAdmin() {
    const [articles, setArticles] = useState([]);
    const [memberMap, setMemberMap] = useState({});
    const [counts, setCounts] = useState({ approve: 0, pending: 0, draft: 0, reject: 0 });
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [statusFilter, setStatusFilter] = useState('all');
    const [primarySection, setPrimarySection] = useState('all');
    const [secondarySection, setSecondarySection] = useState('all');
    const [keyword, setKeyword] = useState('');
    
    // For tracking which items are selected exactly
    const [selectedIds, setSelectedIds] = useState(new Set());
    
    const [loading, setLoading] = useState(true);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const secondaryOptions = {
        '우리동네부동산': ['아파트·오피스텔', '빌라·주택', '원룸·투룸', '상가·업무·공장·토지', '분양'],
        '뉴스칼럼': ['부동산·주식·재테크', '정치·경제·사회', '세무·법률', '여행·맛집', '건강·헬스', 'IT·가전·가구', '스포츠·연예·Car', '인물·미션·기타']
    };

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setCurrentUser(session.user);
                const { data } = await supabase.from('members').select('role').eq('id', session.user.id).single();
                if (data && (data.role === 'admin' || data.role === 'super_admin')) {
                    setIsAdminUser(true);
                }
            }
            loadCounts();
            loadArticles(1, 'all', 'all', '');
        };
        init();
    }, []);

    const loadCounts = async () => {
        const pairs = [
            ['published', 'approve'],
            ['pending', 'pending'],
            ['draft', 'draft'],
            ['hidden', 'reject']
        ];
        let newCounts = { ...counts };
        for (const [statusStr, keyStr] of pairs) {
            const { count } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', statusStr);
            newCounts[keyStr] = count || 0;
        }
        setCounts(newCounts);
    };

    const loadArticles = async (pageToLoad, fStatus, fSection, fKeyword) => {
        setLoading(true);
        const from = (pageToLoad - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let q = supabase
            .from('articles')
            .select('id, status, article_type, title, section1, section2, reporter_name, author_id, created_at, updated_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (fStatus !== 'all') q = q.eq('status', fStatus);
        if (fSection !== 'all') q = q.eq('section1', fSection);
        if (fKeyword) q = q.ilike('title', `%${fKeyword}%`);
        
        // If not admin, only show own articles
        // (Wait, we should wait for currentUser state or do it in the effect...)

        const { data, count, error } = await q;

        if (!error && data) {
            setArticles(data);
            setTotalCount(count || 0);
            
            const authorIds = [...new Set(data.map(a => a.author_id).filter(id => id))];
            if (authorIds.length > 0) {
                const { data: membersObj } = await supabase.from('members').select('id, role, name, phone, cell_num, company_name').in('id', authorIds);
                if (membersObj) {
                    const newMap = {};
                    membersObj.forEach(m => newMap[m.id] = m);
                    setMemberMap(newMap);
                }
            }
        }
        setLoading(false);
    };

    const applyFilter = () => {
        setCurrentPage(1);
        loadArticles(1, statusFilter, primarySection, keyword);
    };

    const resetFilter = () => {
        setStatusFilter('all');
        setPrimarySection('all');
        setSecondarySection('all');
        setKeyword('');
        setCurrentPage(1);
        loadArticles(1, 'all', 'all', '');
    };

    const changePage = (p) => {
        const totalParams = Math.ceil(totalCount / PAGE_SIZE);
        if (p < 1 || p > totalParams) return;
        setCurrentPage(p);
        loadArticles(p, statusFilter, primarySection, keyword);
    };

    const formatDateStr = (dt) => {
        if (!dt) return '-';
        const d = new Date(dt);
        const pad = (n) => n < 10 ? '0' + n : n;
        return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate());
    };

    const getStatusInfo = (s) => {
        const map = {
            published: { cls: 'status-approve', label: '승인' },
            pending: { cls: 'status-pending', label: '승인신청' },
            draft: { cls: 'status-draft', label: '작성중' },
            hidden: { cls: 'status-reject', label: '반려중' }
        };
        return map[s] || { cls: 'status-draft', label: s };
    };

    const handleApprove = async (id) => {
        if (!confirm("정말로 승인처리 하시겠습니까?")) return;
        const { error } = await supabase.from('articles').update({ status: 'published', updated_at: new Date() }).eq('id', id);
        if (error) alert('승인 실패: ' + error.message);
        else {
            alert('승인되었습니다.');
            loadCounts();
            loadArticles(currentPage, statusFilter, primarySection, keyword);
        }
    };

    const handleEndAd = async (id) => {
        if (!confirm("정말로 광고를 종료하시겠습니까? (상태: 광고종료)")) return;
        const { error } = await supabase.from('articles').update({ status: 'ended', updated_at: new Date() }).eq('id', id);
        if (error) alert('종료 실패: ' + error.message);
        else {
            alert('광고가 종료되었습니다.');
            loadCounts();
            loadArticles(currentPage, statusFilter, primarySection, keyword);
        }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`[❌ 삭제 확인]\n\n"${title}"\n\n기사를 영구적으로 삭제합니다.\n정말 삭제하시겠습니까?`)) return;
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (!error) {
            loadCounts();
            loadArticles(currentPage, statusFilter, primarySection, keyword);
        }
    };

    const handleDeleteSelected = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return alert('삭제할 기사를 선택하세요.');
        if (!confirm(ids.length + '건의 기사를 삭제합니다. 계속하시겠습니까?')) return;
        const { error } = await supabase.from('articles').delete().in('id', ids);
        if (!error) {
            setSelectedIds(new Set());
            loadCounts();
            loadArticles(currentPage, statusFilter, primarySection, keyword);
        }
    };

    const toggleAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(articles.map(a => a.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    return (
        <div className="admin-card-wrapper" style={{background: 'var(--bg-body)', padding: '24px', minHeight: '100vh'}}>
            <style jsx>{`
                :root {
                    --primary-color: #ff9f1c; --bg-body: #f4f5f7; --bg-card: #ffffff; --border-color: #e1e4e8;
                    --text-main: #333333; --text-sub: #666666; --blue-filter-bg: #f0f4fc; --dark-btn-bg: #4b5563;
                }
                .admin-card { background-color: #ffffff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); padding: 32px; min-height: 800px; color: #333333; font-family: 'Pretendard', sans-serif;}
                .card-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; }
                .card-header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #111; }
                .card-header .count-info { font-size: 13px; color: #666; display: flex; gap: 6px; }
                .card-header .count-info span.bold { font-weight: 700; }
                .count-approve { color: #16a34a; } .count-pending { color: #0284c7; } .count-draft { color: #d97706; } .count-reject { color: #e11d48; }
                .filter-container { background-color: #f0f4fc; border-radius: 6px; padding: 18px 20px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
                .filter-group { display: flex; align-items: center; gap: 6px; }
                .filter-label { font-size: 13px; font-weight: 600; color: #555; white-space: nowrap; }
                .filter-input { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; background-color: #fff; outline: none; }
                .btn-search { background-color: #4b5563; color: white; border: none; padding: 7px 14px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; }
                .btn-reset { background-color: #fff; color: #666; border: 1px solid #d1d5db; padding: 7px 14px; border-radius: 4px; font-size: 13px; cursor: pointer; }
                .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .left-actions { display: flex; gap: 6px; align-items: center; }
                .btn { padding: 6px 12px; font-size: 13px; font-weight: 500; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; color: #333; }
                .btn-write { background-color: #f59e0b; color: white; border: none; padding: 8px 18px; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 4px; border-radius: 4px; text-decoration: none;}
                .table-container { width: 100%; overflow-x: auto; border-top: 2px solid #333; }
                table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 900px; }
                th { background-color: #fafafa; border-bottom: 1px solid #e5e7eb; padding: 12px 10px; font-weight: 700; color: #333; text-align: center; white-space: nowrap; }
                td { padding: 14px 10px; border-bottom: 1px solid #f1f3f5; text-align: center; vertical-align: middle; color: #444; }
                tr:hover td { background-color: #fafcff; }
                .cell-title { text-align: left; font-weight: 600; color: #111; cursor: pointer; }
                .cell-title:hover { text-decoration: underline; }
                .pagination { display: flex; justify-content: center; margin-top: 32px; gap: 4px; }
                .page-link { width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; color: #666; text-decoration: none; background: #fff; cursor: pointer; }
                .page-link.active { background-color: #4b5563; color: #fff; border-color: #4b5563; }
                .btn-edit { padding: 5px 10px; font-size: 11px; border-radius: 4px; border: 1px solid #4b5563; background: #4b5563; cursor: pointer; color: #fff; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex-shrink: 0; }
                .btn-delete { padding: 5px 10px; font-size: 11px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; color: #374151; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex-shrink: 0; }
            `}</style>
            <div className="admin-card">
                <div className="card-header">
                    <h2>기사관리</h2>
                    <div className="count-info">
                        ( <span className="count-approve">승인 <span className="bold">{counts.approve}</span>건</span> / 
                        <span className="count-pending">승인신청 <span className="bold">{counts.pending}</span>건</span> / 
                        <span className="count-draft">작성중 <span className="bold">{counts.draft}</span>건</span> / 
                        <span className="count-reject">반려 <span className="bold">{counts.reject}</span>건</span> )
                    </div>
                </div>

                <div className="filter-container">
                    <div className="filter-group">
                        <span className="filter-label">진행상황</span>
                        <select className="filter-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">전체</option>
                            <option value="published">승인</option>
                            <option value="pending">승인신청</option>
                            <option value="draft">작성중</option>
                            <option value="hidden">반려중</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <span className="filter-label">1차섹션</span>
                        <select className="filter-input" value={primarySection} onChange={e => setPrimarySection(e.target.value)}>
                            <option value="all">전체</option>
                            <option value="우리동네부동산">우리동네부동산</option>
                            <option value="뉴스칼럼">뉴스칼럼</option>
                        </select>
                    </div>

                    <div className="filter-group" style={{flex:1}}>
                        <input type="text" className="filter-input" placeholder="검색어를 입력하세요." value={keyword} onChange={e => setKeyword(e.target.value)} style={{width: '100%', maxWidth: '250px'}} />
                    </div>

                    <button className="btn-search" onClick={applyFilter}>🔍 검색</button>
                    <button className="btn-reset" onClick={resetFilter}>초기화</button>
                </div>

                <div className="action-bar">
                    <div className="left-actions">
                        <a href="/admin/write" className="btn-write" style={{cursor:'pointer'}}>+ 기사쓰기</a>
                        <button className="btn" onClick={handleDeleteSelected}>🗑️ 선택삭제</button>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '40px'}}><input type="checkbox" onChange={toggleAll} checked={selectedIds.size > 0 && selectedIds.size === articles.length} /></th>
                                <th style={{width: '80px'}}>기사번호</th>
                                <th style={{width: '100px'}}>진행상황</th>
                                <th>기사명</th>
                                <th style={{width: '140px'}}>1차섹션</th>
                                <th style={{width: '160px'}}>2차섹션</th>
                                <th style={{width: '150px'}}>승인일자</th>
                                <th style={{width: '140px'}}>작성자 / 연락처</th>
                                <th style={{width: '150px'}}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" style={{textAlign:'center', color:'#aaa', padding:'40px'}}>로딩 중...</td></tr>
                            ) : articles.length === 0 ? (
                                <tr><td colSpan="9" style={{textAlign:'center', color:'#aaa', padding:'40px'}}>등록된 기사가 없습니다.</td></tr>
                            ) : articles.map(a => {
                                const m = memberMap[a.author_id] || {};
                                const mName = m.company_name || m.name || a.reporter_name || '알수없음';
                                const mPhone = m.cell_num || m.phone || '-';
                                let mRoleTxt = '일반'; let mRoleCls = 'color:#4b5563; background:#f3f4f6; padding:2px 4px; border-radius:3px; font-weight:700;';
                                if(m.role === 'realtor') { mRoleTxt = '부동산'; mRoleCls = 'color:#3b82f6; background:#eff6ff; padding:2px 4px; border-radius:3px; font-weight:700;'; }
                                else if(m.role === 'admin') { mRoleTxt = '관리자'; mRoleCls = 'color:#e11d48; background:#fff1f2; padding:2px 4px; border-radius:3px; font-weight:700;'; }

                                const dStr = formatDateStr(a.updated_at || a.created_at);

                                return (
                                    <tr key={a.id}>
                                        <td><input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                                        <td style={{color:'#888', fontWeight:600}}>{a.id}</td>
                                        <td>
                                            {a.status === 'pending' ? (
                                                isAdminUser ? 
                                                <button onClick={() => handleApprove(a.id)} style={{background:'#0ea5e9', color:'#fff', border:'none', padding:'5px 0', borderRadius:'4px', cursor:'pointer', width:'64px', margin:'0 auto', display:'flex', flexDirection:'column'}}><span style={{fontSize:'11px', fontWeight:700}}>승인신청</span></button> 
                                                : <div style={{background:'#f3f4f6', color:'#9ca3af', border:'1px solid #d1d5db', padding:'5px 0', width:'64px', margin:'0 auto', borderRadius:'4px', display:'flex', flexDirection:'column'}}><span style={{fontSize:'11px', fontWeight:700}}>승인신청중</span></div>
                                            ) : a.status === 'published' ? (
                                                isAdminUser ? 
                                                <button onClick={() => handleEndAd(a.id)} style={{background:'#2563eb', color:'#fff', border:'none', padding:'5px 0', borderRadius:'4px', cursor:'pointer', width:'64px', margin:'0 auto', display:'flex', flexDirection:'column'}}><span style={{fontSize:'11px', fontWeight:700}}>광고중</span></button> 
                                                : <div style={{background:'#f3f4f6', color:'#9ca3af', border:'1px solid #d1d5db', padding:'5px 0', width:'64px', margin:'0 auto', borderRadius:'4px', display:'flex', flexDirection:'column'}}><span style={{fontSize:'11px', fontWeight:700}}>광고중</span></div>
                                            ) : a.status === 'hidden' ? (
                                                <div style={{background:'#ef4444', color:'#fff', padding:'5px 0', width:'64px', margin:'0 auto', borderRadius:'4px', display:'flex', flexDirection:'column'}}><span style={{fontSize:'11px', fontWeight:700}}>반려중</span></div>
                                            ) : a.status === 'ended' ? (
                                                <div style={{background:'#9ca3af', color:'#fff', padding:'5px 0', width:'64px', margin:'0 auto', borderRadius:'4px', display:'flex', flexDirection:'column'}}><span style={{fontSize:'11px', fontWeight:700}}>광고종료</span></div>
                                            ) : (
                                                <div style={{background:'#f3f4f6', color:'#4b5563', padding:'5px 0', width:'64px', margin:'0 auto', borderRadius:'4px', border:'1px solid #e5e7eb', display:'flex', flexDirection:'column'}}><span style={{fontSize:'11px', fontWeight:700}}>{getStatusInfo(a.status).label}</span></div>
                                            )}
                                        </td>
                                        <td className="cell-title" onClick={() => window.location.href=`/article/${a.id}`}>{a.title || '(제목없음)'} {a.article_type !== 'normal' && '🖼️'}</td>
                                        <td style={{fontWeight:600, color:'#333'}}>{a.section1 || '-'}</td>
                                        <td style={{fontSize:'13px', color:'#666'}}>{a.section2 || '-'}</td>
                                        <td>{dStr}</td>
                                        <td>
                                            <div style={{display:'flex', flexDirection:'column', gap:'4px', alignItems:'center'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                                    <span style={{fontSize:'10px', padding:'2px 4px', borderRadius:'3px', fontWeight:700, ...(m.role==='realtor'?{color:'#3b82f6', background:'#eff6ff'}:m.role==='admin'?{color:'#e11d48', background:'#fff1f2'}:{color:'#4b5563', background:'#f3f4f6'})}}>{mRoleTxt}</span>
                                                    <span style={{fontWeight:700, fontSize:'12px'}}>{mName}</span>
                                                </div>
                                                <span style={{fontSize:'11px', color:'#888'}}>{mPhone}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{display:'flex', gap:'4px', justifyContent:'center'}}>
                                                <button className="btn-edit" onClick={() => window.location.href=`/admin/write?editId=${a.id}`}>수정</button>
                                                <button className="btn-delete" onClick={() => handleDelete(a.id, a.title)}>삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button className="page-link" onClick={() => changePage(currentPage - 1)}>&lt;</button>
                    {Array.from({ length: Math.ceil(totalCount / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
                        <button key={p} className={`page-link ${p === currentPage ? 'active' : ''}`} onClick={() => changePage(p)}>
                            {p}
                        </button>
                    ))}
                    <button className="page-link" onClick={() => changePage(currentPage + 1)}>&gt;</button>
                </div>
            </div>
        </div>
    );
}
