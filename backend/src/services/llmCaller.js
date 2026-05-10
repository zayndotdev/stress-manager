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
  temperature: 0.7,  // Natural flow
  top_p: 0.9,        // High quality
  top_k: 40,         // Broad vocabulary
  repeat_penalty: 1.1,
  num_predict: 60,   // Fast and concise
  num_ctx: 1024,     // Reduced memory usage for speed
};

async function callChat(messages) {
  try {
    const response = await axios.post(
      `${OLLAMA_BASE}/api/chat`,
      { model: OLLAMA_MODEL, messages, stream: false, options: OLLAMA_OPTIONS },
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
    { model: OLLAMA_MODEL, messages, stream: true, options: OLLAMA_OPTIONS },
    { responseType: "stream", timeout: OLLAMA_TIMEOUT_MS }
  );
  return response.data;
}

async function warmUpModel() {
  try {
    await axios.post(`${OLLAMA_BASE}/api/chat`, {
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: "hi" }],
        stream: false,
        options: { num_predict: 5 },
      }, { timeout: 60000 });
  } catch (e) {}
}

module.exports = { callChat, callChatStream, warmUpModel, OLLAMA_MODEL };
