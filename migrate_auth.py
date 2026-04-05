import os

app_dir = "c:/Users/user/Desktop/test/gongsil-next/src/app"

# 1. 로그인 페이지 (/login/page.js)
login_dir = os.path.join(app_dir, "login")
os.makedirs(login_dir, exist_ok=True)

login_page_js = """'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js'

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert('로그인 실패: ' + error.message);
        } else {
            alert('환영합니다!');
            window.location.href = '/';
        }
    };

    return (
        <main className="container px-20 relative mt-50 mb-50" style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '400px', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#102c57', textAlign: 'center', marginBottom: '30px' }}>공실뉴스 로그인</h1>
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>이메일</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="이메일을 입력하세요" />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>비밀번호</label>
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="비밀번호를 입력하세요" />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '14px', background: '#102c57', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                        로그인
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    계정이 없으신가요? <a href="/register" style={{ color: '#508bf5', fontWeight: 'bold', marginLeft: '5px' }}>회원가입</a>
                </div>
            </div>
        </main>
    );
}
"""
with open(os.path.join(login_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(login_page_js)

# 2. 회원가입 페이지 (/register/page.js)
register_dir = os.path.join(app_dir, "register")
os.makedirs(register_dir, exist_ok=True)

register_page_js = """'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js'

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name,
                    role: 'user'
                }
            }
        });

        if (error) {
            alert('회원가입 실패: ' + error.message);
        } else {
            alert('회원가입이 완료되었습니다!');
            window.location.href = '/login';
        }
    };

    return (
        <main className="container px-20 relative mt-50 mb-50" style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '400px', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#102c57', textAlign: 'center', marginBottom: '30px' }}>공실뉴스 회원가입</h1>
                
                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>이름</label>
                        <input type="text" value={name} onChange={e=>setName(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="이름을 입력하세요" />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>이메일</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="이메일을 입력하세요" />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>비밀번호 (6자 이상)</label>
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="비밀번호를 입력하세요" />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '14px', background: '#508bf5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                        가입 완료
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    이미 계정이 있으신가요? <a href="/login" style={{ color: '#102c57', fontWeight: 'bold', marginLeft: '5px' }}>로그인</a>
                </div>
            </div>
        </main>
    );
}
"""
with open(os.path.join(register_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(register_page_js)

print("Auth pages created.")
