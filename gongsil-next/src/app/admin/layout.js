'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { name: '대시보드 (매물관리)', path: '/admin' },
        { name: '뉴스 관리', path: '/admin/articles' },
        { name: '회원 관리', path: '/admin/members' },
        { name: '자료실 관리', path: '/admin/boards' },
        { name: '뉴스/특강 쓰기', path: '/admin/write' }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f5f7', fontFamily: 'sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', background: '#111827', color: '#fff', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #374151', color: '#60a5fa' }}>
                    공실뉴스 Admin
                </div>
                <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {menuItems.map(item => (
                        <Link key={item.path} href={item.path} style={{
                            padding: '12px 20px',
                            background: pathname === item.path ? '#374151' : 'transparent',
                            color: pathname === item.path ? '#60a5fa' : '#d1d5db',
                            textDecoration: 'none',
                            fontWeight: pathname === item.path ? 'bold' : 'normal',
                            display: 'block'
                        }}>
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div style={{ marginTop: 'auto', padding: '20px' }}>
                    <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>← 메인 사이트로 돌아가기</Link>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <div style={{ background: '#fff', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '800px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
