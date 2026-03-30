const K = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8";
async function t(m) {
  const u = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${K}`;
  const r = await fetch(u, {
    method:'POST', 
    body:JSON.stringify({contents:[{parts:[{text:"hi"}]}]}), 
    headers:{'Content-Type':'application/json'}
  });
  const text = await r.text();
  require('fs').appendFileSync('flash_results_2.txt', `${m} ${r.status} ${text}\n`, 'utf8');
}
(async () => {
  await t('gemini-2.0-flash');
  await t('gemini-1.5-flash');
})();
