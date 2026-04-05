const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log("Navigating...");
  await page.goto('https://gongsilnews-bit.github.io/news.html', {waitUntil: 'networkidle2'});
  console.log("Done navigating.");
  
  await browser.close();
})();
