const axios = require('axios');

async function testLLM() {
    console.log('Testing LLM connectivity...');
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'mistral',
            prompt: 'Hello, are you working?',
            stream: false
        });
        console.log('LLM Response:');
        console.log(response.data.response);
    } catch (error) {
        console.error('Error connecting to LLM:', error.message);
    }
}

testLLM();
