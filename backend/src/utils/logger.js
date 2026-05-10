const fs = require("fs");
const path = require("path");

const LOGS_DIR = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOGS_DIR, "chat.log");
const LLM_LOG_FILE = path.join(LOGS_DIR, "llm_responses.log");

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function ts() {
  return new Date().toISOString();
}

function appendToFile(file, level, message) {
  const entry = `[${ts()}] [${level}] ${message}\n`;
  fs.appendFile(file, entry, (err) => {
    if (err) console.error("Log write failed:", err);
  });
}

const logger = {
  info: (msg) => {
    console.log(`\x1b[37m[${ts()}] INFO\x1b[0m ${msg}`);
    appendToFile(LOG_FILE, "INFO", msg);
    if (msg.includes("[LLM]") || msg.includes("[STREAM]") || msg.includes("[PROMPT]") || msg.includes("[CLEANER]") || msg.includes("[ANALYZER]")) {
      appendToFile(LLM_LOG_FILE, "INFO", msg);
    }
  },
  warn: (msg) => {
    console.warn(`\x1b[33m[${ts()}] WARN\x1b[0m ${msg}`);
    appendToFile(LOG_FILE, "WARN", msg);
    appendToFile(LLM_LOG_FILE, "WARN", msg);
  },
  error: (msg) => {
    console.error(`\x1b[31m[${ts()}] ERROR\x1b[0m ${msg}`);
    appendToFile(LOG_FILE, "ERROR", msg);
  },
  debug: (msg) => {
    console.log(`\x1b[36m[${ts()}] DEBUG\x1b[0m ${msg}`);
    appendToFile(LOG_FILE, "DEBUG", msg);
  },
  llm: (prompt, response) => {
    const entry = `\n${"=".repeat(60)}\n[${ts()}] LLM EXCHANGE\nPROMPT_TAIL: ${JSON.stringify(prompt.slice(-2))}\nRESPONSE: ${response}\n${"=".repeat(60)}\n`;
    fs.appendFile(LLM_LOG_FILE, entry, () => {});
    console.log(`\x1b[35m[LLM-EXCHANGE]\x1b[0m Response: "${response.substring(0, 100)}"`);
  },
};

module.exports = logger;
