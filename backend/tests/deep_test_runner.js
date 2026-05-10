const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const SESSION_ID = 'deep-test-' + Date.now();
const REPORT_FILE = path.join(__dirname, `../logs/deep_test_report_${Date.now()}.txt`);

async function runScenario(name, turns) {
    console.log(`\n--- SCENARIO: ${name} ---`);
    const convRes = await axios.post(`${BASE_URL}/api/conversations`, { title: name }, { headers: { 'x-session-id': SESSION_ID } });
    const convId = convRes.data.conversation.id;
    console.log(`Conversation ID: ${convId}`);

    const results = [];

    for (let i = 0; i < turns.length; i++) {
        const turn = turns[i];
        console.log(`\nTurn ${i + 1}: "${turn.input}"`);
        const start = Date.now();
        
        try {
            // Using /chat instead of /chat-stream for easier script handling, but logic is same
            const res = await axios.post(`${BASE_URL}/api/conversations/${convId}/chat`, { userMessage: turn.input }, { headers: { 'x-session-id': SESSION_ID }, timeout: 300000 });
            const elapsed = Date.now() - start;
            const response = res.data.botResponse;
            const phase = res.data.phase;

            console.log(`Response (${elapsed}ms, phase=${phase}): "${response}"`);
            results.push({ turn: i + 1, input: turn.input, response, phase, elapsed });
        } catch (err) {
            console.error(`Error in turn ${i + 1}: ${err.message}`);
            results.push({ turn: i + 1, input: turn.input, error: err.message });
        }
    }
    return results;
}

const scenarios = [
    {
        name: "ESCALATING WORK STRESS",
        turns: [
            { input: "Salam, main aapke saath baat karna chahta tha" },
            { input: "Aaj office mein bohat kuch hua. Main thoda disturbed hoon" },
            { input: "Boss ne saare log ke saamne mujhe embarrass kiya. Bohat bura laga" },
            { input: "Yeh pehli baar nahi hua. Woh aksar aisa karta hai. Main thak gaya hoon iss situation se" },
            { input: "Main samajh nahi paa raha ke main kya karun. Job chhod dun ya rehne dun?" },
            { input: "Ghar pe bhi tension hai. Walid sahab chahtey hain ke main yeh job rakhun" },
            { input: "Main bohat akela feel kar raha hoon is mein" }
        ]
    },
    {
        name: "ANXIETY AND SLEEP PROBLEMS",
        turns: [
            { input: "Main kaafi dino se theek nahi feel kar raha" },
            { input: "Neend nahi aati raat ko. Ghanton letay rehta hoon par aankhein band nahi hoti" },
            { input: "Subah uthta hoon toh sar dard hota hai aur thakaan bhi" },
            { input: "Koi doctor ke paas bhi nahi gaya. Paise ki bhi dikkat hai" },
            { input: "Kya lagta hai aap ko — yeh anxiety hai ya kuch aur?" },
            { input: "Main ghar pe kuch kar sakta hoon is ke liye? Koi chhoti si cheez?" }
        ]
    },
    {
        name: "EMOTIONAL RESILIENCE",
        turns: [
            { input: "Aaj ka din bohat acha tha! Mera presentation office mein bohat acchi gayi" },
            { input: "Sab ne taareef ki. Manager ne bhi kaha ke yeh best presentation thi is quarter ki" },
            { input: "Lekin... main nervous tha shuru mein. Haath kaamp rahe the" },
            { input: "Aur actually... main kaafi dino se is presentation ki wajah se so nahi pa raha tha" },
            { input: "Main jaanta hoon ke presentation ho gayi lekin mujhe anxiety kaafi time se ho rahi hai" },
            { input: "Kaafi baar toh main bahana bana ke events se door rehta hoon" }
        ]
    }
];

async function runAll() {
    console.log("Starting Deep Test Suite...");
    const allResults = [];
    for (const scenario of scenarios) {
        const result = await runScenario(scenario.name, scenario.turns);
        allResults.push({ name: scenario.name, results: result });
    }

    // Generate Final Report (simplified version for the script output)
    let report = `SAKOON DEEP TEST REPORT\nDate: ${new Date().toISOString()}\n\n`;
    allResults.forEach(s => {
        report += `SCENARIO: ${s.name}\n`;
        s.results.forEach(r => {
            report += `Turn ${r.turn} (${r.elapsed}ms): "${r.response}" [Phase: ${r.phase}]\n`;
        });
        report += `\n`;
    });

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`\nReport saved to: ${REPORT_FILE}`);
}

runAll().catch(err => console.error("Test runner crashed:", err));
