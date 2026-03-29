// Node 18+ built-in fetch

async function testGemini() {
    const GEMINI_API_KEY = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8"; 
    const url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY;
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "안녕" }] }]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("API Error Response:", response.status, errBody);
        } else {
            const data = await response.json();
            console.log("SUCCESS:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

testGemini();
