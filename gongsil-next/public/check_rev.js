const fs = require('fs');
const content = fs.readFileSync('c:/Users/user/Desktop/test/supabase_gongsi_config.js', 'utf8');
const urlMatch = content.match(/const\s+GONGSI_SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = content.match(/const\s+GONGSI_SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);
if(urlMatch && keyMatch) {
    const url = urlMatch[1] + '/rest/v1/study_reviews?select=*&limit=1';
    fetch(url, { headers: { 'apikey': keyMatch[1], 'Authorization': 'Bearer ' + keyMatch[1] } })
    .then(r => r.text())
    .then(console.log);
}
