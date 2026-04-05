'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminMembers() {
    const [searchEmail, setSearchEmail] = useState('');
    const [searchMsg, setSearchMsg] = useState({ text: '', color: '' });
    const [userData, setUserData] = useState(null);

    const [role, setRole] = useState('general');
    const [membership, setMembership] = useState('free');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSearch = async () => {
        if (!searchEmail.trim()) {
            alert("이메일을 입력하세요.");
            return;
        }

        setSearchMsg({ text: "검색중 입니다...", color: "blue" });
        setUserData(null);

        try {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .eq('email', searchEmail.trim())
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    setSearchMsg({ text: "해당 이메일로 가입된 회원을 찾을 수 없습니다.", color: "red" });
                } else {
                    throw error;
                }
                return;
            }

            setUserData(data);
            setRole(data.role || 'general');
            setMembership(data.membership || 'free');

            if (data.membership === 'paid') {
                setStartDate(data.membership_start_at ? data.membership_start_at.split('T')[0] : "");
                setEndDate(data.expired_at ? data.expired_at.split('T')[0] : "");
            } else {
                setStartDate("");
                setEndDate("");
            }

            setSearchMsg({ text: "", color: "" });

        } catch (error) {
            console.error(error);
            setSearchMsg({ text: "검색 중 알 수 없는 에러가 발생했습니다.", color: "red" });
        }
    };

    const handleUpdate = async () => {
        if (!userData) return;

        if (membership === 'paid') {
            if (!startDate || !endDate) {
                return alert("유료 회원의 시작일과 만료일을 모두 선택해주세요!");
            }
        }

        try {
            const { error } = await supabase
                .from('members')
                .update({
                    role: role,
                    membership: membership,
                    membership_start_at: membership === 'paid' ? startDate : null,
                    expired_at: membership === 'paid' ? endDate : null
                })
                .eq('id', userData.id);

            if (error) throw error;
            
            alert("성공적으로 회원 정보가 저장되었습니다!");
            setUserData(null);
            setSearchEmail('');
            
        } catch (error) {
            console.error("업데이트 실패:", error);
            alert("업데이트 중 에러 발생: " + error.message);
        }
    };

    return (
        <div className="admin-members-wrapper">
            <style jsx>{`
                .admin-members-wrapper { font-family: 'Pretendard', sans-serif; background-color: #f8f9fa; padding: 20px; max-width: 800px; margin: 0 auto; color: #333; }
                h1 { color: #333; border-bottom: 2px solid #ff9f1c; padding-bottom: 10px; margin-top:0; }
                .card { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
                input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-family:inherit; }
                button { background-color: #ff9f1c; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; }
                button:hover { background-color: #e88d15; }
                input[type="email"] { flex: 1; min-width: 250px; }
                .search-area { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
                #searchResult { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #ddd; }
            `}</style>
            
            <h1>👥 회원 권한 관리 (관리자)</h1>
            
            <div className="card">
                <h3>1. 회원 검색</h3>
                <p style={{fontSize: '13px', color: '#666', marginBottom: '15px'}}>등급을 변경할 회원의 <b>가입 이메일 주소(구글)</b>를 정확히 입력해주세요.</p>
                <div className="search-area form-group">
                    <input 
                        type="email" 
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="user@gmail.com" 
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>회원 찾기</button>
                </div>
                {searchMsg.text && (
                    <div style={{color: searchMsg.color, fontSize: '14px', marginTop: '5px'}}>
                        {searchMsg.text}
                    </div>
                )}
            </div>

            {userData && (
                <div className="card" id="searchResult">
                    <h3 style={{marginTop: 0}}>2. 회원 정보 수정</h3>
                    <p>선택된 회원: <strong style={{color: '#007bff', fontSize: '18px'}}>{userData.email}</strong></p>
                    
                    <div className="form-group" style={{marginTop: '20px'}}>
                        <label>회원 역할 설정</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="admin">최고관리자</option>
                            <option value="realtor">부동산회원</option>
                            <option value="general">일반회원</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>결제 등급 설정</label>
                        <select value={membership} onChange={(e) => setMembership(e.target.value)}>
                            <option value="free">무료회원</option>
                            <option value="paid">유료회원</option>
                        </select>
                    </div>

                    {membership === 'paid' && (
                        <div className="form-group" id="dateGroup">
                            <label>유료 회원 기간 설정</label>
                            <p style={{fontSize: '12px', color: '#888', marginBottom: '5px'}}>시작일 ~ 종료일 범위를 설정하세요.</p>
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="시작일" />
                                <span>~</span>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="종료일" />
                            </div>
                        </div>
                    )}

                    <button onClick={handleUpdate} style={{width: '100%', background: '#28a745', marginTop: '10px', fontSize: '16px'}}>
                        저장 및 권한 변경하기
                    </button>
                </div>
            )}
        </div>
    );
}