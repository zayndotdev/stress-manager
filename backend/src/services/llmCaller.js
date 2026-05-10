const axios = require("axios");
const logger = require("../utils/logger");

function readNumberEnv(key, fallback) {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:latest";
const OLLAMA_TIMEOUT_MS = readNumberEnv("OLLAMA_TIMEOUT_MS", 180000); 

const OLLAMA_OPTIONS = {
  temperature: 0.3,  // STABLE - No weird poetry
  top_p: 0.5,        // FOCUSED - No linguistic drift
  top_k: 40,
  repeat_penalty: 1.2,
  num_predict: 150,  // LENGTH - Finish the thought
  num_ctx: 1024,
};

async function callChat(messages) {
  try {
    const response = await axios.post(
      `${OLLAMA_BASE}/api/chat`,
      { 
        model: OLLAMA_MODEL, 
        messages, 
        stream: false, 
        options: OLLAMA_OPTIONS,
        keep_alive: "60m" 
      },
      { timeout: OLLAMA_TIMEOUT_MS }
    );
    return response.data?.message?.content?.trim() || "";
  } catch (error) {
    return "Maaf kijiye, system mein masla hai.";
  }
}

async function callChatStream(messages) {
  const response = await axios.post(
    `${OLLAMA_BASE}/api/chat`,
    { 
        model: OLLAMA_MODEL, 
        messages, 
        stream: true, 
        options: OLLAMA_OPTIONS,
        keep_alive: "60m" 
    },
    { responseType: "stream", timeout: OLLAMA_TIMEOUT_MS }
  );
  return response.data;
}

async function warmUpModel() {
  try {
    logger.info(`[OLLAMA] Stability-warming ${OLLAMA_MODEL}...`);
    await axios.post(`${OLLAMA_BASE}/api/chat`, {
        model: OLLAMA_MODEL,
        messages: [
            { role: "system", content: "You are Sakoon. Roman Urdu only. Stay professional." },
            { role: "user", content: "hello" }
        ],
        stream: false,
        options: { num_predict: 1 },
        keep_alive: "60m"
      }, { timeout: 120000 });
    logger.info(`[OLLAMA] ✅ System ready for stable chat.`);
  } catch (e) {}
}

module.exports = { callChat, callChatStream, warmUpModel, OLLAMA_MODEL };
