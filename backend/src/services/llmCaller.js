const logger = require('../utils/logger');

async function callMistral(fullPrompt, conversationHistory = null) {
    const startTime = Date.now();
    try {
        logger.info(`[OLLAMA] Sending request to Mistral...`);
        const response = await axios.post('http://127.0.0.1:11434/api/generate', {
            model: 'mistral',
            prompt: fullPrompt,
            stream: false
        });
        const duration = Date.now() - startTime;
        logger.info(`[OLLAMA] Response received in ${duration}ms`);
        return response.data.response ? response.data.response.trim() : "";
    } catch (error) {
        logger.error(`[OLLAMA] ERROR: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            logger.error("[OLLAMA] Is Ollama running? Could not connect to port 11434.");
        }
        return "Sorry yaar, abhi thoda background issue chal raha hai. Kya tum thoda aur bata sakte ho is baare mein?";
    }
}

module.exports = { callMistral };
