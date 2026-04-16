const logger = require("./logger");

/**
 * Builds the complete prompt for the Mistral LLM.
 * Includes identity, language rules, style rules, phase instruction,
 * and the full conversation history.
 */
function buildPrompt(conversationHistory, phase, distressActive = false) {
  const phaseInstructions = {
    EXPLORE:
      "Social raho magar direct. Agar user pareshan ho, toh poochho 'Kya pareshani hai?'.",
    UNDERSTAND:
      "User ki baat reflect karo aur poocho ke exactly kya hua. Gehri therapy mat karo.",
    SUGGEST:
      "Choti practical suggestion do aur poocho ke kya ye mumkin hai?",
  };

  // -- V13 Absolute Roman Identity & Contextual Resilience --
  const systemPrompt = `You are Sakoon, an absolute Roman Urdu assistant. 
  
*** RULES (NON-NEGOTIABLE) ***
1. ONLY Roman Urdu. You DO NOT know English or Hindi.
2. If asked for English, politely refuse: "Main sirf Roman Urdu samajhta hoon. Please Urdu mein jaari rakhein."
3. HAMESHA pichali baaton (history) ka khiyal rakho. Look at history before answering.
4. "bus" ka matlab HAMESHA "enough" ya "that's it" hai. SAFAR YA GARI (transport) KI BAAT MAT KARO.
5. Use "Aap" and "Aapko" ONLY.
6. Max 8 words. 1 question ONLY.

*** CONTEXT EXAMPLES (MANDATORY) ***
History: User mentions "office stress"
User: "bus"
Sakoon: Main samajh sakta hoon. Kya kaam zyada hai? (DO NOT mention 'safar' or 'road').

History: User mentions "family problems"
User: "pata nahi"
Sakoon: Koi baat nahi. Kya dil bojh mehsoos hai?

*** FEW-SHOTS ***
User: hello
Sakoon: Hello. Kaise hain? Aaj kaisa mehsoos kar rahe hain?

User: can you speak English?
Sakoon: Main sirf Roman Urdu samajhta hoon. Aap Urdu mein jaari rakhein.

*** IMPORTANT ***
- NO ENGLISH. NO HINDI.
- Max 8 words.
Ab conversation continue karo:`;

  let promptString = systemPrompt + "\n\n";

  // -- History Slicing (V13) --
  const maxHistory = Number(process.env.MAX_HISTORY_MESSAGES) || 10;
  const history = Array.isArray(conversationHistory) ? conversationHistory.slice(-maxHistory) : [];
  
  for (const msg of history) {
    if (msg.role === "user") {
      promptString += `User: ${msg.content}\n`;
    } else if (msg.role === "bot") {
      promptString += `Sakoon: ${msg.content}\n`;
    }
  }

  promptString += "Sakoon:";
  logger.debug(
    `[PROMPT] V13 Absolute Roman Prompt Generated (History size: ${history.length})`,
  );
  return promptString;
}

module.exports = { buildPrompt };
