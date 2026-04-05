async function testModel(modelName) {
    const GEMINI_API_KEY = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8"; 
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + GEMINI_API_KEY;
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "안녕" }] }]
            })
        });
        const err = await response.text();
        console.log(modelName, response.status, err);
    } catch (error) {
    }
}

async function run() {
    await testModel("gemini-2.0-flash");
    await testModel("gemini-pro");
}
run();
