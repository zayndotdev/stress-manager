const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = 'http://localhost:5000';
const SESSION_ID = uuidv4();
const CONV_ID = uuidv4();

async function runTest() {
    console.log(`Starting Final Perfection Test... Session: ${SESSION_ID}\n`);
    
    // Create conversation first to avoid 404
    let convId;
    try {
        const createRes = await axios.post(`${BASE_URL}/api/conversations`, {}, { headers: { 'x-session-id': SESSION_ID } });
        convId = createRes.data.conversation.id;
        console.log(`Created Conversation: ${convId}\n`);
    } catch (e) {
        console.error(`Failed to create conversation: ${e.message}`);
        return;
    }

    const queries = [
        "hello",
        "stress ho raha hai",
        "job ki tension hai",
        "job nahi mil rahi"
    ];

    const report = [];

    for (const q of queries) {
        console.log(`User: "${q}"`);
        const start = Date.now();
        try {
            const res = await axios.post(`${BASE_URL}/api/conversations/${convId}/chat`, 
                { userMessage: q }, 
                { headers: { 'x-session-id': SESSION_ID }, timeout: 180000 }
            );
            const elapsed = Date.now() - start;
            const response = res.data.botResponse;
            const phase = res.data.phase;
            
            console.log(`Sakoon (${elapsed}ms, ${phase}): "${response}"\n`);
            report.push({ query: q, response, elapsed, phase });
        } catch (e) {
            console.error(`Error on query "${q}": ${e.message}\n`);
        }
    }

    console.log("--- FINAL TEST REPORT ---");
    console.table(report);
}

runTest();
