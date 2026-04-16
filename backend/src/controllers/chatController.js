const {
  addMessage,
  incrementQuestion,
  getPhase,
  updatePhase,
  getHistory,
  getQuestionCount,
  resetState,
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
    const fullPrompt = buildPrompt(history, currentPhase);

    logger.info(`[LLM] Calling Mistral...`);
    const rawBotResponse = await callMistral(fullPrompt);

    // Clean response: strip translations, enforce length, guarantee question mark
    logger.info(
      `[CLEAN] Raw Response: "${rawBotResponse.substring(0, 50)}${rawBotResponse.length > 50 ? "..." : ""}"`,
    );
    const cleanedResponse = cleanResponse(rawBotResponse);
    logger.info(`[CLEAN] Cleaned Response: "${cleanedResponse}"`);

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
