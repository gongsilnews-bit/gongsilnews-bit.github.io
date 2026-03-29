const fs = require('fs');
async function run() {
    const GEMINI_API_KEY = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8"; 
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + GEMINI_API_KEY;
    const res = await fetch(url);
    const data = await res.json();
    if(data.models) {
        fs.writeFileSync('valid_models.json', JSON.stringify(data.models.map(m => m.name), null, 2));
    } else {
        console.log(data);
    }
}
run();
