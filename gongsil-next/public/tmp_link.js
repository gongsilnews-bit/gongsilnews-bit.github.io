const fs = require('fs');
let content = fs.readFileSync('materials.html', 'utf8');

// 일반 카드
content = content.replace(/<div class="m-card">/g, '<div class="m-card" style="cursor:pointer;" onclick="location.href=\'material_detail.html\'">');

// Top10 카드
content = content.replace(/<div class="m-card card-top10">/g, '<div class="m-card card-top10" style="cursor:pointer;" onclick="location.href=\'material_detail.html\'">');

fs.writeFileSync('materials.html', content, 'utf8');
console.log('Successfully added onclick links to materials.html!');
