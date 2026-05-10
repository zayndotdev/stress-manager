const logger = require("./logger");

/**
 * Builds a structured messages array for the Ollama /api/chat endpoint.
 * Returns: [{ role: "system"|"user"|"assistant", content: "..." }, ...]
 */
function buildPrompt(conversationHistory, phase, distressActive = false) {
  const phaseHints = {
    EXPLORE:
      "You are trying to understand the user. Ask them gently about what is going on.",
    UNDERSTAND:
      "You are beginning to understand. Reflect their feelings and ask them to share more.",
    SUGGEST:
      "Offer a very small, practical suggestion or a comforting thought.",
  };

  // ──────────────────────────────────────────────────────────
  // System prompt — English instructions + Roman Urdu examples
  // ──────────────────────────────────────────────────────────
  const systemContent = `You are Sakoon, an Urdu-speaking friend. 

SPELLING GUIDE (STRICT):
- Use "kya" (NOT kia).
- Use "hoon" (NOT hu/hn).
- Use "rehta" (NOT rata).
- Use "pareshani" (NOT preshani).
- Use "hai" (NOT h/ay).

IRONCLAD RULES:
1. Speak ONLY in Roman Urdu (Latin script).
2. OUTPUT ONLY ONE SENTENCE. 
3. DO NOT EXPLAIN. DO NOT TRANSLATE. DO NOT ADD NOTES.
4. NO HINDI WORDS (avsar, samasya, vishwaas).
5. Use natural, colloquial Roman Urdu.

FAILURE TO FOLLOW THESE RULES IS UNACCEPTABLE.
Output ONLY the response.`;

  const messages = [{ role: "system", content: systemContent }];

  // ── Conversation history ──
  const maxHistory = Number(process.env.MAX_HISTORY_MESSAGES) || 12;
  const history = Array.isArray(conversationHistory)
    ? conversationHistory.slice(-maxHistory)
    : [];

  for (const msg of history) {
    if (msg.role === "user") {
      messages.push({ role: "user", content: msg.content });
    } else if (msg.role === "bot") {
      messages.push({ role: "assistant", content: msg.content });
    }
  }

  const logHistory = history.map(m => `[${m.role}] ${m.content.substring(0, 30)}...`).join(' | ');
  logger.info(`[PROMPT] === NEW PROMPT BUILD ===`);
  logger.info(`[PROMPT] Phase: ${phase} | Distress: ${distressActive}`);
  logger.info(`[PROMPT] System Prompt Preview: ${systemContent.substring(0, 100)}...`);
  logger.info(`[PROMPT] History Context: ${logHistory}`);
  logger.info(`[PROMPT] Total messages in payload: ${messages.length}`);
  return messages;
}

module.exports = { buildPrompt };
