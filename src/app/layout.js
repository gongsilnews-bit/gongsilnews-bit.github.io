import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "공실뉴스 - 부동산 중개망의 스마트한 변화",
  description: "11만 부동산을 위한 무료 정보 채널",
  manifest: "/manifest.json",
  themeColor: "#102c57",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "공실뉴스",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <Script src="/supabase_gongsi_config.js" strategy="beforeInteractive" />
        <Script src="/supabase_auth.js" strategy="beforeInteractive" />
        <Script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=9a03bbbfd98d2eff101bc3ccbc5f89eb&libraries=services,clusterer" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
