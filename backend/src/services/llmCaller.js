const axios = require("axios");
const logger = require("../utils/logger");

function readNumberEnv(key, fallback) {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const OLLAMA_TIMEOUT_MS = readNumberEnv("OLLAMA_TIMEOUT_MS", 180000);
const OLLAMA_OPTIONS = {
  temperature: readNumberEnv("OLLAMA_TEMPERATURE", 0.4),
  top_p: readNumberEnv("OLLAMA_TOP_P", 0.8),
  repeat_penalty: readNumberEnv("OLLAMA_REPEAT_PENALTY", 1.18),
  num_predict: Math.round(readNumberEnv("OLLAMA_NUM_PREDICT", 120)),
};

async function callMistral(fullPrompt) {
  const startTime = Date.now();

  if (!fullPrompt || typeof fullPrompt !== "string") {
    logger.warn(
      "[OLLAMA] Empty prompt received. Returning safe fallback response.",
    );
    return "Kya tum mujhe thoda aur context de sakte ho?";
  }

  try {
    logger.info(`[OLLAMA] Sending request to ${OLLAMA_MODEL}...`);
    const response = await axios.post(
      OLLAMA_URL,
      {
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: OLLAMA_OPTIONS,
      },
      {
        timeout: OLLAMA_TIMEOUT_MS,
      },
    );

    const duration = Date.now() - startTime;
    logger.info(`[OLLAMA] Response received in ${duration}ms`);
    return response.data.response ? response.data.response.trim() : "";
  } catch (error) {
    logger.error(`[OLLAMA] ERROR: ${error.message}`);

    if (error.code === "ECONNABORTED") {
      logger.error(`[OLLAMA] Request timed out after ${OLLAMA_TIMEOUT_MS}ms.`);
    }

    if (error.code === "ECONNREFUSED") {
      logger.error(
        "[OLLAMA] Is Ollama running? Could not connect to port 11434.",
      );
    }

    if (error.response) {
      logger.error(
        `[OLLAMA] HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`,
      );
    }

    return "Maaf kijiye ga, abhi system mein kuch takniki masail hain. Kya aap apni baat dobara bata sakte hain?";
  }
}

module.exports = { callMistral };
