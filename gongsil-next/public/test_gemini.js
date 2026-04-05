// Node 18+ built-in fetch

async function testGemini() {
    const GEMINI_API_KEY = "AIzaSyCkB_55N7V9w1267m3ozCdC-091byCo13A"; 
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + GEMINI_API_KEY;
    
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
