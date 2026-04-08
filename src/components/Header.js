"use client";

export default function Header() {
  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="top-logo" onClick={() => window.location.href='/'}>공실뉴스</div>
          <div className="top-desc">11만 부동산을 위한 무료 정보 채널</div>
        </div>
        <div className="top-bar-right" style={{display: 'flex', gap: '28px', alignItems: 'center'}}>
           <div style={{color: '#fff', fontSize: '13px'}}>상단메뉴 SSR 준비중</div>
        </div>
      </div>

      <header className="header">
        <div className="container px-20">
          <div className="header-top">
            <div className="ht-left"></div>
            <div className="ht-center">
              <img src="/logo.png" className="ht-logo" alt="공실뉴스" onClick={() => window.location.href='/'} />
            </div>
            <div className="ht-right"></div>
          </div>
          <div className="header-bottom">
            <nav className="gnb-new">
              <a href="/news/all">전체뉴스</a>
              <a href="/news/local">우리동네뉴스</a>
              <a href="/news/finance">부동산·주식·재테크</a>
              <a href="/news/politics">정치·경제·사회</a>
              <a href="/news/law">세무·법률</a>
              <a href="/news/life">여행·건강·생활</a>
              <span className="divider"></span>
              <a href="/gongsil/index.html">공실열람</a>
              <a href="/board.html">자료실</a>
              <a href="/#special">부동산특강</a>
              <a href="#">중개업소무료가입</a>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
