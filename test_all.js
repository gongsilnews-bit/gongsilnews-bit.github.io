const K = "AIzaSyCkB_55N7V9w1267m3ozCdC-091byCo13A";
const fs = require('fs');
async function t(m) {
  const u = `https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${K}`;
  const r = await fetch(u, {
    method:'POST', 
    body:JSON.stringify({contents:[{parts:[{text:"hi"}]}]}), 
    headers:{'Content-Type':'application/json'}
  });
  console.log(m, r.status);
}
const models = fs.readFileSync('available_models.txt', 'utf8').split('\n').filter(Boolean);
(async () => {
    for(const m of models) {
        await t(m);
    }
})();
