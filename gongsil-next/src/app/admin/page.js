'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    
    const [filters, setFilters] = useState({
        num: '', type: '', deal: '', keyword: ''
    });

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            // Usually global layout handles it, but just in case
            window.location.href = '/login';
            return;
        }

        const user = session.user;
        const { data: profile } = await supabase.from('members').select('role').eq('id', user.id).single();
        const role = profile?.role || 'realtor';

        let q = supabase.from('properties').select('*').order('created_at', { ascending: false });
        
        if (role !== 'admin' && role !== 'super_admin' && role !== 'superadmin') {
            q = q.eq('user_id', user.id);
        }

        const { data, error } = await q;

        if (!error && data) {
            setProperties(data);
            setFilteredProperties(data);
        } else {
            console.error(error);
        }
        setLoading(false);
    };

    const getDisplayId = (uuid) => {
        if (!uuid) return '';
        const hex = String(uuid).split('-')[0];
        return parseInt(hex, 16).toString();
    };

    const formatPrice = (val) => {
        val = Number(val);
        if (!val || val === 0) return '0';
        if (val >= 10000) {
            const uk = Math.floor(val / 10000);
            const man = val % 10000;
            return man > 0 ? `${uk}억 ${man}` : `${uk}억`;
        }
        return val.toLocaleString();
    };

    const handleSearch = () => {
        const { num, type, deal, keyword } = filters;
        const searchKw = keyword.toLowerCase();

        const filtered = properties.filter(p => {
            const matchNum = num ? getDisplayId(p.id).includes(num) : true;
            const matchType = type ? p.property_type === type : true;
            const matchDeal = deal ? p.trade_type === deal : true;
            const matchKeyword = searchKw ? (
                (p.building_name || '').toLowerCase().includes(searchKw) ||
                (p.dong || '').toLowerCase().includes(searchKw) ||
                (p.author_name || '').toLowerCase().includes(searchKw)
            ) : true;
            return matchNum && matchType && matchDeal && matchKeyword;
        });
        setFilteredProperties(filtered);
    };

    const handleReset = () => {
        setFilters({ num: '', type: '', deal: '', keyword: '' });
        setFilteredProperties(properties);
    };

    const toggleAdStatus = async (id, currentStatus) => {
        const nextStatus = (currentStatus === 'active' || currentStatus === 'pending') ? 'inactive' : 'active';
        const msg = nextStatus === 'active' ? "광고를 다시 시작할까요?" : "광고를 종료하시겠습니까?";
        if (!confirm(msg)) return;

        const { error } = await supabase.from('properties').update({ status: nextStatus }).eq('id', id);
        if (error) alert("오류: " + error.message);
        else loadProperties();
    };

    const deleteProperty = async (id) => {
        if (!confirm("삭제하시겠습니까?")) return;
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) alert("오류: " + error.message);
        else {
            alert("삭제완료");
            loadProperties();
        }
    };

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return alert('삭제할 매물을 선택하세요.');
        if (!confirm(selectedIds.size + "개의 매물을 삭제하시겠습니까?")) return;
        
        const ids = Array.from(selectedIds);
        const { error } = await supabase.from('properties').delete().in('id', ids);
        if (error) alert("오류: " + error.message);
        else {
            alert("삭제완료");
            setSelectedIds(new Set());
            loadProperties();
        }
    };

    const toggleAll = (e) => {
        if (e.target.checked) setSelectedIds(new Set(filteredProperties.map(p => p.id)));
        else setSelectedIds(new Set());
    };

    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const activeCount = filteredProperties.filter(p => p.status === 'active' || p.status === 'pending').length;

    return (
        <div style={{minHeight: '100vh'}}>
            <style jsx>{`
                :root {
                    --primary-color: #ff9f1c; --bg-body: #f4f5f7; --bg-card: #ffffff; --border-color: #e1e4e8;
                    --text-main: #333333; --text-sub: #666666; --blue-filter-bg: #f0f4fc; --dark-btn-bg: #4b5563;
                    --color-sale: #e53e3e; --color-jeonse: #2b6cb0; --color-monthly: #6b46c1; --color-short: #b7791f;
                    --color-realtor: #2b6cb0; --color-general: #276749; --color-admin: #c05621;
                }
                .admin-card { background-color: #ffffff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); padding: 32px; min-height: 800px; color: #333333; font-family: 'Pretendard Variable', sans-serif;}
                .card-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; }
                .card-header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #111; }
                .card-header .count-info { font-size: 13px; color: #666; }
                .card-header .count-info .ad-count { color: #ff9f1c; font-weight: 700; }
                .card-header .count-info .total-count { color: #333; font-weight: 700; }
                .filter-container { background-color: #f0f4fc; border-radius: 6px; padding: 18px 20px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
                .filter-group { display: flex; align-items: center; gap: 6px; }
                .filter-label { font-size: 13px; font-weight: 600; color: #555; white-space: nowrap; }
                .filter-input { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; background-color: #fff; outline: none; }
                .filter-divider { width: 1px; height: 24px; background-color: #d1d5db; margin: 0 4px; }
                .btn-search { background-color: #4b5563; color: white; border: none; padding: 7px 14px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
                .btn-reset { background-color: #fff; color: #666; border: 1px solid #d1d5db; padding: 7px 14px; border-radius: 4px; font-size: 13px; cursor: pointer; }
                .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .left-actions { display: flex; gap: 6px; }
                .btn { padding: 6px 12px; font-size: 13px; font-weight: 500; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; color: #333; }
                .btn-register { background-color: #4285f4; color: white; border: none; padding: 8px 18px; font-weight: 700; font-size: 13px; text-decoration:none}
                .table-container { width: 100%; overflow-x: auto; border-top: 2px solid #333; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 1050px; }
                th { background-color: #fafafa; border-bottom: 1px solid #e5e7eb; padding: 12px 8px; font-weight: 700; color: #333; text-align: center; white-space: nowrap; }
                td { padding: 14px 8px; border-bottom: 1px solid #f1f3f5; text-align: center; vertical-align: middle; color: #444; }
                tr:hover td { background-color: #fafcff; }
                .cell-num { font-size: 11px; color: #aaa; }
                .btn-ad-toggle { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; white-space: nowrap; }
                .btn-ad-toggle.state-on { background-color: #4285f4; color: #fff; }
                .btn-ad-toggle.state-off { background-color: #9ca3af; color: #fff; }
                .ad-date { font-size: 10px; color: #aaa; margin-top: 3px; }
                .cell-addr { text-align: left; min-width: 160px; }
                .addr-main { font-weight: 700; font-size: 13px; color: #111; margin-bottom: 3px; cursor: pointer;}
                .contact-row { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
                .contact-badge { font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 2px; white-space: nowrap; }
                .contact-landlord { background-color: #fef3c7; color: #92400e; }
                .contact-num { font-size: 11px; color: #666; letter-spacing: 0.02em; }
                .cell-price { text-align: left; min-width: 150px; }
                .price-line { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; cursor: pointer;}
                .badge-deal { display: inline-block; padding: 2px 7px; border-radius: 3px; font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; flex-shrink: 0; }
                .badge-sale { background-color: #e53e3e; } .badge-jeonse { background-color: #2b6cb0; } .badge-monthly { background-color: #6b46c1; } .badge-short { background-color: #b7791f; }
                .price-amount { font-size: 13px; font-weight: 700; white-space: nowrap; }
                .price-amount-sale { color: #e53e3e; } .price-amount-jeonse { color: #2b6cb0; } .price-amount-monthly { color: #6b46c1; } .price-amount-short { color: #b7791f; }
                .cell-spec { font-size: 12px; color: #555; white-space: nowrap; }
                .date-text { font-size: 12px; color: #888; }
                .cell-registrar { text-align: left; min-width: 130px; }
                .member-badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; margin-bottom: 3px; }
                .mbadge-realtor { background-color: #dbeafe; color: #2b6cb0; } .mbadge-general { background-color: #dcfce7; color: #166534; } .mbadge-admin { background-color: #ffedd5; color: #c05621; }
                .registrar-name { font-size: 12px; font-weight: 700; color: #222; margin-bottom: 2px; }
                .registrar-phone { font-size: 11px; color: #888; }
                .cell-actions { display: flex; gap: 4px; justify-content: center; flex-wrap: nowrap; }
                .btn-edit { padding: 5px 10px; font-size: 11px; border-radius: 4px; border: 1px solid #4b5563; background: #4b5563; cursor: pointer; color: #fff; font-weight: 600; }
                .btn-delete { padding: 5px 10px; font-size: 11px; border-radius: 4px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; color: #374151; font-weight: 500; }
                input[type="checkbox"] { width: 15px; height: 15px; accent-color: #4285f4; cursor: pointer; }
            `}</style>
            
            <div className="admin-card">
                <div className="card-header">
                    <h2>공실관리</h2>
                    <span className="count-info">
                        (<span className="ad-count">광고 {activeCount}건</span> / <span className="total-count">전체 {filteredProperties.length}건</span>)
                    </span>
                </div>

                <section className="filter-container">
                    <div className="filter-group">
                        <span className="filter-label">매물번호</span>
                        <input type="text" className="filter-input" value={filters.num} onChange={e => setFilters({...filters, num: e.target.value})} placeholder="매물번호 입력" style={{width:'130px'}} />
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-group">
                        <span className="filter-label">매물종류</span>
                        <select className="filter-input" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                            <option value="">전체</option>
                            <option>아파트</option>
                            <option>빌라/주택</option>
                            <option>오피스텔</option>
                            <option>상가/사무실</option>
                            <option>토지</option>
                        </select>
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-group">
                        <span className="filter-label">매물구분</span>
                        <select className="filter-input" value={filters.deal} onChange={e => setFilters({...filters, deal: e.target.value})}>
                            <option value="">전체</option>
                            <option>매매</option>
                            <option>전세</option>
                            <option>월세</option>
                            <option>단기</option>
                        </select>
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-group">
                        <input type="text" className="filter-input" value={filters.keyword} onChange={e => setFilters({...filters, keyword: e.target.value})} placeholder="검색어를 입력하세요." style={{width:'220px'}} />
                    </div>
                    <button className="btn-search" onClick={handleSearch}>🔍 검색</button>
                    <button className="btn-reset" onClick={handleReset}>초기화</button>
                </section>

                <div className="action-bar">
                    <div className="left-actions">
                        <a href="/register" className="btn btn-register" target="_blank">+ 공실등록</a>
                        <button className="btn" onClick={() => loadProperties()}>⬆ 광고순위갱신</button>
                        <button className="btn" onClick={deleteSelected}>🗑 선택삭제</button>
                    </div>
                    <div className="right-actions"></div>
                </div>

                <div className="table-container">
                    <table>
                        <colgroup>
                            <col style={{width:'44px'}}/>
                            <col style={{width:'80px'}}/>
                            <col style={{width:'110px'}}/>
                            <col style={{width:'90px'}}/>
                            <col style={{minWidth:'160px'}}/>
                            <col style={{width:'170px'}}/>
                            <col style={{width:'130px'}}/>
                            <col style={{width:'72px'}}/>
                            <col style={{width:'150px'}}/>
                            <col style={{width:'135px'}}/>
                        </colgroup>
                        <thead>
                            <tr>
                                <th><input type="checkbox" onChange={toggleAll} checked={selectedIds.size > 0 && selectedIds.size === filteredProperties.length} /></th>
                                <th>번호</th>
                                <th>광고설정</th>
                                <th>매물종류</th>
                                <th>주소 / 연락처</th>
                                <th>금액</th>
                                <th>방수/면적(m²)/층</th>
                                <th>최초등록</th>
                                <th>등록자/연락처</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" style={{padding: '100px', color: '#4285f4', fontWeight: 'bold'}}>데이터를 불러오는 중입니다... 🔄</td></tr>
                            ) : filteredProperties.length === 0 ? (
                                <tr><td colSpan="10" style={{padding: '100px', color: '#999'}}>등록된 매물이 없습니다.</td></tr>
                            ) : (
                                filteredProperties.map(p => {
                                    const isAdOn = (p.status === 'active' || p.status === 'pending');
                                    const dealBadgeMap = {
                                        '매매': <span className="badge-deal badge-sale">매매</span>,
                                        '전세': <span className="badge-deal badge-jeonse">전세</span>,
                                        '월세': <span className="badge-deal badge-monthly">월세</span>,
                                        '단기': <span className="badge-deal badge-short">단기</span>
                                    };
                                    
                                    const deposit = Number(p.deposit || 0);
                                    const rentNum = Number(p.monthly_rent || 0);
                                    let priceText = formatPrice(deposit);
                                    let priceCls = '';
                                    if(p.trade_type === '매매') priceCls = 'price-amount-sale';
                                    else if(p.trade_type === '전세') priceCls = 'price-amount-jeonse';
                                    else if(p.trade_type === '월세') { priceText = `${formatPrice(deposit)} / ${rentNum}`; priceCls = 'price-amount-monthly'; }
                                    else if(p.trade_type === '단기') { priceText = `${formatPrice(deposit)} / ${rentNum}`; priceCls = 'price-amount-short'; }
                                    
                                    const dateObj = new Date(p.created_at);
                                    const dateStr = dateObj.getTime() ? `${String(dateObj.getMonth()+1).padStart(2,'0')}.${String(dateObj.getDate()).padStart(2,'0')}` : '-';

                                    const roleBadgeCls = p.user_role === 'realtor' ? 'mbadge-realtor' : (p.user_role === 'admin' ? 'mbadge-admin' : 'mbadge-general');
                                    const roleText = p.user_role === 'realtor' ? '부동산' : (p.user_role === 'admin' ? '관리자' : '일반인');

                                    return (
                                        <tr key={p.id}>
                                            <td><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                                            <td><div className="cell-num">{getDisplayId(p.id)}</div></td>
                                            <td>
                                                <button className={`btn-ad-toggle ${isAdOn ? 'state-on' : 'state-off'}`} onClick={() => toggleAdStatus(p.id, p.status)}>
                                                    {isAdOn ? '광고중' : '광고종료'}
                                                </button>
                                                <div className="ad-date">{dateStr}</div>
                                            </td>
                                            <td>{p.property_type || '-'}</td>
                                            <td className="cell-addr">
                                                <div className="addr-main" onClick={() => window.open(`/gongsil/${p.id}`)}>{p.dong || ''} {p.building_name || ''}</div>
                                                <div className="contact-row">
                                                    <span className="contact-badge contact-landlord">임대인</span>
                                                    <span className="contact-num">{p.author_phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="cell-price">
                                                <div className="price-line" onClick={() => window.open(`/gongsil/${p.id}`)}>
                                                    {dealBadgeMap[p.trade_type] || null}
                                                    <span className={`price-amount ${priceCls}`}>{priceText}</span>
                                                </div>
                                            </td>
                                            <td className="cell-spec">{p.room_count || '-'} / {p.dedicated_area || p.area || '-'}㎡ / {p.current_floor ? p.current_floor + '층' : '-'}</td>
                                            <td className="date-text">{dateStr}</td>
                                            <td className="cell-registrar">
                                                <div><span className={`member-badge ${roleBadgeCls}`}>{roleText}</span></div>
                                                <div className="registrar-name">{p.author_name || '-'}</div>
                                                <div className="registrar-phone">{p.author_phone || '-'}</div>
                                            </td>
                                            <td>
                                                <div className="cell-actions">
                                                    <button className="btn-edit" onClick={() => window.open(`/register?id=${p.id}`)}>수정</button>
                                                    <button className="btn-delete" onClick={() => deleteProperty(p.id)}>삭제</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
