import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: '공실뉴스 Next.js',
  description: '부동산 중개망의 스마트한 변화',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
