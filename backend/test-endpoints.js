const axios = require('axios');

async function runTests() {
    console.log("Resetting conversation...");
    await axios.get('http://localhost:5000/api/reset');
    
    const messages = [
        "Mera bohot stress ho raha hai office ki wajah se.",
        "Haan boss ne ajeeb deadline de di hai.",
        "Mujhe samajh nahi aa raha kya karun.",
        "Bas thoda break chahiye shanti se.",
        "Haan yaar shayad chutti le lun."
    ];

    for (let i = 0; i < messages.length; i++) {
        console.log(`\n\n--- Message ${i + 1} ---`);
        console.log(`User: ${messages[i]}`);
        try {
            const res = await axios.post('http://localhost:5000/api/chat', {
                userMessage: messages[i]
            });
            console.log(`Bot Phase: ${res.data.phase}`);
            console.log(`Bot QuestionCount: ${res.data.questionCount}`);
            console.log(`Bot Response: ${res.data.botResponse}`);
            console.log(`Validator:`, res.data.validationResult);
        } catch (e) {
            console.error(e.message);
        }
    }
}

runTests();
