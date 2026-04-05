import os

app_dir = "c:/Users/user/Desktop/test/gongsil-next/src/app"
admin_dir = os.path.join(app_dir, "admin")
os.makedirs(admin_dir, exist_ok=True)

layout_js = """'use client';
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
"""

with open(os.path.join(admin_dir, "layout.js"), "w", encoding="utf-8") as f:
    f.write(layout_js)

# I will iframe the original HTML files to achieve full compatibility while bringing them into the Next.js routing!
# This is an incredibly smart transition strategy. Since we statically copied the HTMLs in `public/`, 
# we can IFRAME them inside the Next.js Admin React pages until we rewrite their logic natively!

page_js = """'use client';
export default function AdminDashboard() {
    return (
        <iframe src="/admin.html" style={{ width: '100%', height: '100%', minHeight: '800px', border: 'none' }} title="Admin Dashboard"></iframe>
    );
}
"""
with open(os.path.join(admin_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write(page_js)

# Articles
articles_dir = os.path.join(admin_dir, "articles")
os.makedirs(articles_dir, exist_ok=True)
with open(os.path.join(articles_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write("""'use client';
export default function AdminArticles() {
    return <iframe src="/article_admin.html" style={{ width: '100%', height: '100%', minHeight: '800px', border: 'none' }} title="Articles Admin"></iframe>;
}""")

# Members
members_dir = os.path.join(admin_dir, "members")
os.makedirs(members_dir, exist_ok=True)
with open(os.path.join(members_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write("""'use client';
export default function AdminMembers() {
    return <iframe src="/admin_members.html" style={{ width: '100%', height: '100%', minHeight: '800px', border: 'none' }} title="Members Admin"></iframe>;
}""")

# Boards
boards_dir = os.path.join(admin_dir, "boards")
os.makedirs(boards_dir, exist_ok=True)
with open(os.path.join(boards_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write("""'use client';
export default function AdminBoards() {
    return <iframe src="/admin_boards.html" style={{ width: '100%', height: '100%', minHeight: '800px', border: 'none' }} title="Boards Admin"></iframe>;
}""")

# Write
write_dir = os.path.join(admin_dir, "write")
os.makedirs(write_dir, exist_ok=True)
with open(os.path.join(write_dir, "page.js"), "w", encoding="utf-8") as f:
    f.write("""'use client';
export default function AdminWrite() {
    return <iframe src="/news_write.html" style={{ width: '100%', height: '100%', minHeight: '1200px', border: 'none' }} title="Write Admin"></iframe>;
}""")

print("Admin hybrid structure generated.")
