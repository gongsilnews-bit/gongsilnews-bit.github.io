const K = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8";
async function t(m) {
  const u = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${K}`;
  const r = await fetch(u, {
    method:'POST', 
    body:JSON.stringify({contents:[{parts:[{text:"hi"}]}]}), 
    headers:{'Content-Type':'application/json'}
  });
  console.log(m, r.status, await r.text());
}
['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001', 'gemini-1.5-flash-8b'].forEach(t);
