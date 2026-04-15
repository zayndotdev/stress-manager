const axios = require('axios');
const { validateResponse } = require('./src/utils/responseValidator');

const API = 'http://localhost:5000/api';

// ─── HELPERS ──────────────────────────────────────────────
function checkRomanUrdu(text) {
    const urduRegex = /[\u0600-\u06FF]/;
    return !urduRegex.test(text);
}

function checkEndsWithQuestion(text) {
    return text.trim().endsWith('?');
}

function checkLength(text) {
    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    return lines.length <= 3 && text.length < 300;
}

function checkNatural(text) {
    // Heuristic: natural if it has varied punctuation, not all caps, not too formal
    const formalWords = ['Therefore', 'Furthermore', 'However', 'Moreover', 'Additionally'];
    const hasFormal = formalWords.some(w => text.includes(w));
    return !hasFormal && text.length > 10;
}

function rateTone(text) {
    let score = 3; // baseline
    // Friendly markers
    if (/yaar|bhai|dost|beta/i.test(text)) score += 1;
    // Question at end shows engagement
    if (text.trim().endsWith('?')) score += 0.5;
    // Short = conversational
    if (text.length < 150) score += 0.5;
    // Preachy markers
    if (/must|should always|you need to|important that you/i.test(text)) score -= 1;
    return Math.min(5, Math.max(1, Math.round(score)));
}

// ─── TEST 1: ROMAN URDU LANGUAGE TEST ─────────────────────
async function test1_RomanUrdu() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 1: ROMAN URDU LANGUAGE TEST');
    console.log('='.repeat(60));

    await axios.get(`${API}/reset`);

    const messages = [
        "main bohot stressed hoon aaj kal",
        "kaam ka bohot pressure hai",
        "neend nahi aa rahi raton ko",
        "ghar mein tension hai",
        "koi samajhta nahi mujhe"
    ];

    const results = [];

    for (let i = 0; i < messages.length; i++) {
        console.log(`\n--- Message ${i + 1}: "${messages[i]}" ---`);
        const res = await axios.post(`${API}/chat`, { userMessage: messages[i] });
        const bot = res.data.botResponse;
        console.log(`Bot: ${bot}`);

        const checks = {
            romanUrdu: checkRomanUrdu(bot),
            endsWithQ: checkEndsWithQuestion(bot),
            shortLength: checkLength(bot),
            natural: checkNatural(bot)
        };

        console.log(`  Roman Urdu: ${checks.romanUrdu ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`  Ends with ?: ${checks.endsWithQ ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`  Short (1-3 lines): ${checks.shortLength ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`  Natural tone: ${checks.natural ? 'PASS ✅' : 'FAIL ❌'}`);

        const allPass = Object.values(checks).every(v => v);
        console.log(`  OVERALL: ${allPass ? 'PASS ✅' : 'FAIL ❌'}`);
        results.push({ message: messages[i], response: bot, checks, allPass });
    }

    const passCount = results.filter(r => r.allPass).length;
    console.log(`\nTEST 1 RESULT: ${passCount}/5 passed`);
    return results;
}

// ─── TEST 2: PHASE TRANSITION TEST ───────────────────────
async function test2_PhaseTransition() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: PHASE TRANSITION TEST');
    console.log('='.repeat(60));

    await axios.get(`${API}/reset`);

    const messages = [
        "Mujhe bohot tension ho rahi hai",
        "Kaam ki wajah se stress hai",
        "Boss bohot pressure deta hai",
        "Ghar mein bhi sab pareshan hain",
        "Mujhe lagta hai koi nahi samajhta",
        "Kabhi kabhi bohot akela feel hota hai",
        "Main sochta hoon sab theek ho jayega",
        "Lekin phir bhi dar lagta hai"
    ];

    const results = [];
    const adviceWords = ['karo', 'try karo', 'ek kaam karo', 'advice', 'suggestion', 'walk', 'exercise', 'deep breath', 'meditation'];

    for (let i = 0; i < messages.length; i++) {
        console.log(`\n--- Message ${i + 1}: "${messages[i]}" ---`);
        const res = await axios.post(`${API}/chat`, { userMessage: messages[i] });
        const { botResponse, phase, questionCount } = res.data;

        const hasAdvice = adviceWords.some(w => botResponse.toLowerCase().includes(w));

        console.log(`  Bot: ${botResponse}`);
        console.log(`  Phase: ${phase} | QuestionCount: ${questionCount}`);
        console.log(`  Contains advice: ${hasAdvice ? 'YES' : 'NO'}`);

        let expectedPhase;
        if (questionCount <= 3) expectedPhase = 'EXPLORE';
        else if (questionCount <= 6) expectedPhase = 'UNDERSTAND';
        else expectedPhase = 'SUGGEST';

        const phaseCorrect = phase === expectedPhase;
        const noEarlyAdvice = (questionCount <= 3) ? !hasAdvice : true;

        console.log(`  Phase correct: ${phaseCorrect ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`  No early advice: ${noEarlyAdvice ? 'PASS ✅' : 'FAIL ❌'}`);

        results.push({ msg: i + 1, botResponse, phase, questionCount, phaseCorrect, noEarlyAdvice });
    }

    const allCorrect = results.every(r => r.phaseCorrect);
    console.log(`\nTEST 2 RESULT: Phase transitions ${allCorrect ? 'PASS ✅' : 'FAIL ❌'}`);
    return results;
}

// ─── TEST 3: TONE CHECK ──────────────────────────────────
async function test3_ToneCheck() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: TONE CHECK');
    console.log('='.repeat(60));

    await axios.get(`${API}/reset`);

    const messages = [
        "Meri tabiyat theek nahi lag rahi",
        "Kuch samajh nahi aata kya karun",
        "Bohot thaka hua hoon",
        "Kisi se baat karne ka mann nahi karta",
        "Bas sab khatam ho jaye"
    ];

    const scores = [];

    for (let i = 0; i < messages.length; i++) {
        const res = await axios.post(`${API}/chat`, { userMessage: messages[i] });
        const bot = res.data.botResponse;
        const score = rateTone(bot);
        scores.push(score);
        console.log(`\n  Message ${i + 1}: "${messages[i]}"`);
        console.log(`  Bot: ${bot}`);
        console.log(`  Tone Score: ${score}/5`);
    }

    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    console.log(`\nTEST 3 RESULT: Average Tone Score = ${avg}/5`);
    return { scores, average: avg };
}

// ─── TEST 4: RESPONSE VALIDATOR TEST ─────────────────────
function test4_Validator() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: RESPONSE VALIDATOR TEST');
    console.log('='.repeat(60));

    const cases = [
        { input: "Theek hai, aap bata sakte ho?", expectValid: true, name: "Valid Roman Urdu" },
        { input: "آپ کیسے ہیں؟", expectValid: false, name: "Urdu Script" },
        { input: "That is completely fine and normal.", expectValid: false, name: "Full English" },
        { input: "Bohot mushkil lagta hai. Kya koi iske baare mein baat kari hai?", expectValid: true, name: "Valid mixed" }
    ];

    const results = [];

    for (const tc of cases) {
        const result = validateResponse(tc.input);
        const pass = result.valid === tc.expectValid;
        console.log(`\n  "${tc.input}"`);
        console.log(`  Expected valid: ${tc.expectValid} | Got: ${result.valid} | Issues: [${result.issues.join(', ')}]`);
        console.log(`  ${pass ? 'PASS ✅' : 'FAIL ❌'}`);
        results.push({ name: tc.name, input: tc.input, expected: tc.expectValid, actual: result.valid, issues: result.issues, pass });
    }

    const passCount = results.filter(r => r.pass).length;
    console.log(`\nTEST 4 RESULT: ${passCount}/4 passed`);
    return results;
}

// ─── RUN ALL ─────────────────────────────────────────────
async function runAll() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   SAKOON — PHASE 4 TESTING SUITE          ║');
    console.log('╚════════════════════════════════════════════╝');

    const t1 = await test1_RomanUrdu();
    const t2 = await test2_PhaseTransition();
    const t3 = await test3_ToneCheck();
    const t4 = test4_Validator();

    console.log('\n\n' + '═'.repeat(60));
    console.log('FINAL SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Test 1 (Roman Urdu): ${t1.filter(r => r.allPass).length}/5 passed`);
    console.log(`Test 2 (Phase Transition): ${t2.every(r => r.phaseCorrect) ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`Test 3 (Tone Average): ${t3.average}/5`);
    console.log(`Test 4 (Validator): ${t4.filter(r => r.pass).length}/4 passed`);
}

runAll().catch(console.error);
