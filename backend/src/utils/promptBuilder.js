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

  // -- V9 Precision Identity (Respectful Protocol) --
  // We use a "Command Mode" prompt to force respect and brevity.
  const systemPrompt = `You are Sakoon, a respectful listener. 
  
*** PROTOCOLS (MANDATORY) ***
1. Use ONLY "Aap" and "Aapko". NEVER use "Tum" or "Tujhe".
2. Stay ultra-minimalist. Max 8 words. 1 question ONLY.
3. EK LAFZ BHI ENGLISH YA HINDI (swagat, vishwas) istemal mat karo.

Few-shot examples:
User: hello
Sakoon: Hello. Kaise hain? Aaj kaisa mehsoos kar rahe hain?

User: thora preshan hn aj
Sakoon: Main samajh sakta hoon. Kya pareshani hui?

User: pta nhi
Sakoon: Koi baat nahi. Kya aap confuse mehsoos kar rahe hain?

User: boss se behas ho gai
Sakoon: Behas tension deti hai. Kis baat par behas hui thi?

*** REMINDER ***
- NO ENGLISH. NO HINDI.
- ONLY "Aap".
- Max 8 words.
Ab conversation continue karo:`;

  let promptString = systemPrompt + "\n\n";

  const history = Array.isArray(conversationHistory) ? conversationHistory : [];
  for (const msg of history) {
    if (msg.role === "user") {
      promptString += `User: ${msg.content}\n`;
    } else if (msg.role === "bot") {
      promptString += `Sakoon: ${msg.content}\n`;
    }
  }

  promptString += "Sakoon:";
  logger.debug(
    `[PROMPT] V8 Dynamic Prompt Generated (Distress: ${distressActive})`,
  );
  return promptString;
}

module.exports = { buildPrompt };
