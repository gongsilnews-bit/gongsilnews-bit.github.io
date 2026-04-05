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
t('models/gemini-2.0-flash');
t('models/gemini-1.5-flash');
t('models/gemini-2.0-flash-lite');
