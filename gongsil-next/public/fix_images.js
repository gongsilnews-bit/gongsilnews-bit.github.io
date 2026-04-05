const fs = require('fs');
const files = [
  'news_all.html',
  'news_etc.html',
  'news_finance.html',
  'news_law.html',
  'news_life.html',
  'news_politics.html',
  'board.html'
];
const oldStr = 'const imgHtml = news.image_url ? `<img src="${news.image_url}" class="an-img" onerror="this.src=\\\'https://via.placeholder.com/160x100?text=News\\\'">` : `<div class="an-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:12px;">NO IMAGE</div>`;';

const replacer = `
            let extractUrl = news.image_url;
            if(!extractUrl && news.content) {
                const imgMatch = news.content.match(/<img[^>]+src=["']([^"']+)["']/i);
                if(imgMatch) extractUrl = imgMatch[1];
            }
            const imgHtml = extractUrl ? \\\`<img src="\\\${extractUrl}" class="an-img" onerror="this.src='https://via.placeholder.com/160x100?text=News'">\\\` : \\\`<div class="an-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:12px;background:#f4f6fa;">NO IMAGE</div>\\\`;
`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/const\s+imgHtml\s*=\s*news\.image_url\s*\?\s*`<img\s+src="\$\{\s*news\.image_url\s*\}"[^>]*>`\s*:\s*`<div[^>]*>NO IMAGE<\/div>`;/, replacer.trim());
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log(f + ' updated');
  } else {
    console.log(f + ' not matched');
  }
});
