/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/news_all.html', destination: '/news/all', permanent: true },
      { source: '/news_finance.html', destination: '/news/finance', permanent: true },
      { source: '/news_politics.html', destination: '/news/politics', permanent: true },
      { source: '/news_law.html', destination: '/news/law', permanent: true },
      { source: '/news_life.html', destination: '/news/life', permanent: true },
      { source: '/news_etc.html', destination: '/news/etc', permanent: true },
      { source: '/news.html', destination: '/news/all', permanent: true }
    ]
  }
};

export default nextConfig;
