const fs = require('fs');

async function checkModels() {
    const GEMINI_API_KEY = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8"; 
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + GEMINI_API_KEY;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(await response.text());
            return;
        }
        const data = await response.json();
        const flashModels = data.models.filter(m => m.name.includes("flash"));
        const out = flashModels.map(m => m.name + " => " + JSON.stringify(m.supportedGenerationMethods)).join('\n');
        fs.writeFileSync('models_output_utf8.txt', out, 'utf8');
    } catch (error) {
        console.error("error", error);
    }
}
checkModels();
