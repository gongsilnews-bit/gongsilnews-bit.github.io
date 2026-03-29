async function test() {
    const GEMINI_API_KEY = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8"; 
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;
    const res = await fetch(url, { method: "POST", body: JSON.stringify({contents:[{parts:[{text:"test"}]}]}), headers:{"Content-Type":"application/json"} });
    console.log(await res.text());
}
test();
