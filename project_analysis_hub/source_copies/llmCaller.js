const axios = require("axios");
const logger = require("../utils/logger");

function readNumberEnv(key, fallback) {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const OLLAMA_TIMEOUT_MS = readNumberEnv("OLLAMA_TIMEOUT_MS", 90000); // 8B needs more time
const OLLAMA_OPTIONS = {
  temperature: readNumberEnv("OLLAMA_TEMPERATURE", 0.6),
  top_p: readNumberEnv("OLLAMA_TOP_P", 0.9),
  presence_penalty: 1.1,
  frequency_penalty: 1.1,
  repeat_penalty: readNumberEnv("OLLAMA_REPEAT_PENALTY", 1.15),
  num_predict: Math.round(readNumberEnv("OLLAMA_NUM_PREDICT", 100)),
  num_ctx: 2048,
};

// ──────────────────────────────────────────────────────────────
// CHAT API — Proper structured messages (system/user/assistant)
// ──────────────────────────────────────────────────────────────

/**
 * Non-streaming chat call. Returns the full response string.
 */
async function callChat(messages) {
  const startTime = Date.now();

  if (!Array.isArray(messages) || messages.length === 0) {
    logger.warn("[OLLAMA] Empty messages array. Returning fallback.");
    return "Kya aap mujhe thoda aur bata sakte hain?";
  }

  try {
    logger.info(`[OLLAMA] Calling chat API...`);
    logger.info(`[OLLAMA] Model: ${OLLAMA_MODEL} | Options: ${JSON.stringify(OLLAMA_OPTIONS)}`);
    
    const response = await axios.post(
      `${OLLAMA_BASE}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: OLLAMA_OPTIONS,
      },
      {
        timeout: OLLAMA_TIMEOUT_MS,
      }
    );

    const duration = Date.now() - startTime;
    const content = response.data?.message?.content?.trim() || "";
    logger.info(`[OLLAMA] === RESPONSE SUCCESS ===`);
    logger.info(`[OLLAMA] Time taken: ${duration}ms`);
    logger.info(`[OLLAMA] Raw Content: "${content}"`);
    return content;
  } catch (error) {
    logger.error(`[OLLAMA] ERROR: ${error.message}`);
    if (error.code === "ECONNABORTED") {
      logger.error(`[OLLAMA] Request timed out after ${OLLAMA_TIMEOUT_MS}ms.`);
    }
    if (error.code === "ECONNREFUSED") {
      logger.error("[OLLAMA] Is Ollama running? Could not connect.");
    }
    return "Maaf kijiye, abhi system mein thoda masla hai. Dobara koshish karein?";
  }
}

/**
 * Streaming chat call. Returns an axios response stream.
 * Each chunk is a JSON object: { message: { content: "token" }, done: false }
 */
async function callChatStream(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Empty messages array.");
  }

  logger.info(`[OLLAMA] Sending streaming chat request to ${OLLAMA_MODEL}...`);
  const response = await axios.post(
    `${OLLAMA_BASE}/api/chat`,
    {
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      options: OLLAMA_OPTIONS,
    },
    {
      responseType: "stream",
      timeout: OLLAMA_TIMEOUT_MS,
    }
  );

  return response.data;
}

/**
 * Transliterate Arabic-script Urdu → Roman Urdu using the LLM.
 */
async function transliterateText(urduText) {
  const messages = [
    {
      role: "system",
      content: "Aap ek transliteration machine hain. Aapka SIRF ek kaam hai: Urdu (Arabic script) ko Roman Urdu (Latin script) mein convert karna. Matlab English mein translate mat karo. Sirf script badlo. Koi greeting ya explanation mat do. SIRF transliterated text output karo."
    },
    {
      role: "user",
      content: urduText
    }
  ];

  const originalTemp = OLLAMA_OPTIONS.temperature;
  OLLAMA_OPTIONS.temperature = 0.1;
  const result = await callChat(messages);
  OLLAMA_OPTIONS.temperature = originalTemp;

  return result.trim();
}

/**
 * Warm up the model by sending a tiny request so it pre-loads into memory.
 */
async function warmUpModel() {
  try {
    logger.info(`[OLLAMA] Warming up model: ${OLLAMA_MODEL}...`);
    const start = Date.now();
    await axios.post(
      `${OLLAMA_BASE}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: "salam" }],
        stream: false,
        options: { num_predict: 5 },
      },
      { timeout: 60000 }
    );
    logger.info(`[OLLAMA] ✅ Model warmed up in ${Date.now() - start}ms`);
  } catch (e) {
    logger.warn(`[OLLAMA] ⚠️ Warm-up skipped: ${OLLAMA_MODEL} not ready yet (${e.message}). Server will start anyway.`);
  }
}

module.exports = { callChat, callChatStream, transliterateText, warmUpModel, OLLAMA_MODEL };
