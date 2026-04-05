import os
import re

# 1. 원본 index.html 읽기
html_path = "c:/Users/user/Desktop/test/index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# 2. 전역 CSS 스타일 추출 후 globals.css에 추가
css_match = re.search(r'<style>(.*?)</style>', html_content, re.DOTALL)
css_match2 = re.search(r'<style>\s*\.icon-tooltip-wrap(.*?)<\/style>', html_content, re.DOTALL)

app_dir = "c:/Users/user/Desktop/test/gongsil-next/src/app"
comp_dir = "c:/Users/user/Desktop/test/gongsil-next/src/components"
os.makedirs(comp_dir, exist_ok=True)

globals_css_path = os.path.join(app_dir, "globals.css")
with open(globals_css_path, "a", encoding="utf-8") as f:
    if css_match:
        f.write("\n/* Extracted from index.html */\n")
        f.write(css_match.group(1))
    if css_match2:
        f.write("\n.icon-tooltip-wrap" + css_match2.group(1))

# 3. Header 컴포넌트 생성 (React JSX 문법으로 자동 치환)
header_jsx = """'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div className="top-bar">
          <div className="top-bar-left">
              <Link href="/" className="top-logo text-white">공실뉴스</Link>
              <div className="top-desc">11만 부동산을 위한 무료 정보 채널</div>
          </div>
          <div className="top-bar-right">
              <div className={`top-search-wrap ${isSearchActive ? 'active' : ''}`} id="topSearchWrap">
                  <input type="text" className="top-search-input text-black" id="topSearchInput" placeholder="검색어를 입력하세요" />
                  <div className="icon-tooltip-wrap" data-tooltip="검색">
                      <svg onClick={() => setIsSearchActive(!isSearchActive)} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="검색">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                  </div>
              </div>
              <div className="headerLoginBtn" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div className="icon-tooltip-wrap" data-tooltip="회원가입">
                      <svg style={{ cursor: 'pointer' }} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="회원가입">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                  </div>
                  <div className="icon-tooltip-wrap" data-tooltip="로그인">
                      <svg style={{ cursor: 'pointer' }} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="로그인">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                  </div>
              </div>
          </div>
      </div>

      <header className="header">
          <div className="container px-20">
              <div className="header-top">
                  <div className="ht-left"></div>
                  <div className="ht-center">
                      <Link href="/">
                          <img src="/logo.png" className="ht-logo" alt="부동산 정보채널 공실뉴스" />
                      </Link>
                  </div>
                  <div className="ht-right">
                      {/* Banner omitted for simplicity */}
                  </div>
              </div>
              <div className="header-bottom">
                  <nav className="gnb-new">
                      <Link href="/news-all">전체뉴스</Link>
                      <Link href="/news">우리동네뉴스</Link>
                      <Link href="/finance">부동산·주식·재테크</Link>
                      <Link href="/politics">정치·경제·사회</Link>
                      <Link href="/law">세무·법률</Link>
                      <Link href="/life">여행·건강·생활</Link>
                      <Link href="/etc">기타</Link>
                      <span className="divider"></span>
                      <Link href="/gongsil">공실열람</Link>
                      
                      <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                          <Link href="/board" style={{ padding: '10px 0', color: isHovered ? '#508bf5' : 'inherit' }}>자료실</Link>
                          {isHovered && (
                              <div className="gnb-dropdown" style={{ display: 'block', position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', width: '140px', background: '#fff', border: '1px solid #333', zIndex: 999999 }}>
                                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, textAlign: 'center' }}>
                                      <li style={{ borderBottom: '1px solid #eee' }}><Link href="/board?id=drone" style={{ display: 'block', padding: '12px 0', fontSize: '14px', color: '#222' }}>드론영상</Link></li>
                                      <li style={{ borderBottom: '1px solid #eee' }}><Link href="/board?id=doc" style={{ display: 'block', padding: '12px 0', fontSize: '14px', color: '#222' }}>계약서/양식</Link></li>
                                  </ul>
                              </div>
                          )}
                      </div>
                      <Link href="/lecture">부동산특강</Link>
                      <Link href="/register">중개업소무료가입</Link>
                  </nav>
              </div>
          </div>
      </header>
    </>
  );
}
"""
with open(os.path.join(comp_dir, "Header.js"), "w", encoding="utf-8") as f:
    f.write(header_jsx)

# 4. 레이아웃에 Header 씌우기
layout_js = """import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: '공실뉴스 Next.js',
  description: '부동산 중개망의 스마트한 변화',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
"""
with open(os.path.join(app_dir, "layout.js"), "w", encoding="utf-8") as f:
    f.write(layout_js)

print("Header migration completed")
