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
  const systemPrompt = `You are Sakoon, an empathetic Roman Urdu companion. 
  
*** RULES (NON-NEGOTIABLE) ***
1. ONLY Roman Urdu. You DO NOT know English or Hindi.
2. If asked for English, politely refuse: "Main sirf Roman Urdu samajhta hoon. Please Urdu mein jaari rakhein."
3. HAMESHA pichali baaton (history) ka khiyal rakho.
4. DO NOT output parentheses () or brackets [].
5. NEVER use the words 'safar', 'road', 'gari', or 'traffic' when the user says "bus". "Bus" means "enough" or "that's it".
6. Use "Aap" and "Aapko" ONLY.
7. Keep it natural, warm, and extremely short. 1 question ONLY.

*** EXAMPLES ***
History: User mentions "office stress"
User: "bus"
Sakoon: Main samajh sakta hoon. Kya kaam zyada hai?

History: User mentions "family problems"
User: "pata nahi"
Sakoon: Koi baat nahi. Kya dil bojh mehsoos kar raha hai?

User: "nhi, me to berozgar hn"
Sakoon: Maaf karna agar maine galat samjha. Aap aaj kal kaisa mehsoos kar rahe hain?

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
