const {
  addMessage,
  incrementQuestion,
  getPhase,
  updatePhase,
  getHistory,
  getQuestionCount,
  resetState,
  isDistressDetected,
} = require("../services/conversationManager");
const { buildPrompt } = require("../utils/promptBuilder");
const { callMistral } = require("../services/llmCaller");
const { validateResponse } = require("../utils/responseValidator");
const { cleanResponse } = require("../utils/responseCleaner");
const logger = require("../utils/logger");

const chat = async (req, res) => {
  const userMessage =
    typeof req.body?.userMessage === "string"
      ? req.body.userMessage.trim()
      : "";

  if (!userMessage) {
    return res.status(400).json({ error: "userMessage is required" });
  }

  try {
    logger.info(`\n[API] POST /api/chat - Incoming: "${userMessage}"`);
    addMessage("user", userMessage);

    updatePhase();
    const currentPhase = getPhase();
    const qCount = getQuestionCount();
    logger.info(`[STATE] Phase: ${currentPhase} | Questions: ${qCount}`);

    const history = getHistory();
    logger.info(
      `[PROMPT] Building prompt with history of ${history.length} messages...`,
    );
    const distressActive = isDistressDetected();
    const fullPrompt = buildPrompt(history, currentPhase, distressActive);

    const { analyzeResponse } = require("../utils/responseAnalyzer");

    logger.info(`[LLM] Calling Mistral...`);
    let rawBotResponse = await callMistral(fullPrompt);
    let cleanedResponse = cleanResponse(rawBotResponse);

    // --- Zero-Tolerance Global Shield (V11.0) ---
    const analysis = analyzeResponse(cleanedResponse);
    if (analysis.isEnglish) {
      logger.warn(`[SHIELD] English detected (Score: ${analysis.score}). Triggering silent retry...`);
      const retryPrompt = `${fullPrompt}\n\nERROR: Aapne English mein jawab diya. Is response ko foran ROMAN URDU mein translate karo:\n"${cleanedResponse}"\n\nSakoon:`;
      rawBotResponse = await callMistral(retryPrompt);
      cleanedResponse = cleanResponse(rawBotResponse);

      // Final Check after retry
      const postRetryAnalysis = analyzeResponse(cleanedResponse);
      if (postRetryAnalysis.isEnglish) {
        logger.error("[SHIELD] Retry failed. Using sentiment-ware fallback.");
        // Simple Sentiment Logic: If user was positive, say khushi hui. Else say samajh raha hoon.
        const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.content.toLowerCase() || "";
        if (lastUserMsg.includes("thk") || lastUserMsg.includes("acha") || lastUserMsg.includes("good")) {
          cleanedResponse = "Sun kar khushi hui. Aur batayein, aaj ka din kaisa guzra?";
        } else {
          cleanedResponse = "Main samajh sakta hoon ke ye mushkil hai. Kya aap batana chahenge ke dil mein kaisa mehsoos ho raha hai?";
        }
      }
    }

    const validationResult = validateResponse(cleanedResponse);
    if (!validationResult.valid) {
      logger.warn(
        `[VALIDATOR] Issues found: ${JSON.stringify(validationResult.issues)}`,
      );
    } else {
      logger.info("[VALIDATOR] Response is valid ✅");
    }

    const responsePhase = currentPhase;
    incrementQuestion();
    updatePhase();
    const nextPhase = getPhase();

    addMessage("bot", cleanedResponse);

    res.json({
      botResponse: cleanedResponse,
      phase: responsePhase,
      nextPhase,
      questionCount: getQuestionCount(),
      validationResult,
    });
  } catch (error) {
    logger.error(`[ERROR] Chat Error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

const reset = (req, res) => {
  logger.info(`\n[API] GET /api/reset - Clearing conversation state`);
  resetState();
  res.json({
    message: "Conversation reset",
    phase: getPhase(),
    questionCount: getQuestionCount(),
  });
};

module.exports = {
  chat,
  reset,
};
