const { v4: uuidv4 } = require("uuid");
const { stmts } = require("../database/db");
const { buildPrompt } = require("../utils/promptBuilder");
const { callMistral } = require("../services/llmCaller");
const { validateResponse } = require("../utils/responseValidator");
const { cleanResponse } = require("../utils/responseCleaner");
const { analyzeResponse } = require("../utils/responseAnalyzer");
const logger = require("../utils/logger");

// ─── Distress / Confusion detection (ported from conversationManager) ──
const DISTRESS_KEYWORDS = [
  "tension", "stress", "pareshan", "sad", "dukh", "mushkil", "masla",
  "kaam", "office", "boss", "pressure", "neend", "nind", "akela",
  "lonely", "dar", "khof", "tabiyat", "preshan",
];
const CONFUSION_KEYWORDS = [
  "pata nahi", "nhi pta", "nahi pta", "nhi pata",
  "maloom nahi", "confused", "samajh nahi",
];

function detectDistress(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((w) => lower.includes(w));
}

function detectConfusion(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CONFUSION_KEYWORDS.some((w) => lower.includes(w));
}

function computePhase(questionCount, distressDetected, lastUserMsg) {
  if (detectConfusion(lastUserMsg) && questionCount <= 8) return "EXPLORE";
  if (distressDetected) {
    if (questionCount <= 3) return "EXPLORE";
    if (questionCount <= 6) return "UNDERSTAND";
    return "SUGGEST";
  }
  if (questionCount <= 6) return "EXPLORE";
  return "SUGGEST";
}

function generateTitle(messages) {
  const userMsgs = messages.filter((m) => m.role === "user").slice(0, 3);
  if (userMsgs.length === 0) return "New Chat";
  const first = userMsgs[0].content;
  if (first.length <= 40) return first;
  return first.substring(0, 37) + "...";
}

// ──────────────────────────────────────────────────────────────
// CONVERSATION CRUD
// ──────────────────────────────────────────────────────────────

const listConversations = (req, res) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(400).json({ error: "Missing x-session-id header" });

  const conversations = stmts.listConversations.all(sessionId);
  res.json({ conversations });
};

const createConversation = (req, res) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(400).json({ error: "Missing x-session-id header" });

  const id = uuidv4();
  const title = req.body.title || "New Chat";
  stmts.createConversation.run(id, sessionId, title);
  const conversation = stmts.getConversation.get(id);

  logger.info(`[API] Created conversation ${id} for session ${sessionId}`);
  res.status(201).json({ conversation });
};

const getConversation = (req, res) => {
  const { id } = req.params;
  const conversation = stmts.getConversation.get(id);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });

  const messages = stmts.getMessages.all(id);
  res.json({ conversation, messages });
};

const deleteConversation = (req, res) => {
  const { id } = req.params;
  stmts.softDeleteConversation.run(id);
  logger.info(`[API] Soft-deleted conversation ${id}`);
  res.json({ message: "Conversation deleted" });
};

const updateConversation = (req, res) => {
  const { id } = req.params;
  const { title, mood_rating, is_pinned } = req.body;
  stmts.updateConversation.run(
    title || null, null, null, null,
    mood_rating ?? null, is_pinned ?? null, id
  );
  const conversation = stmts.getConversation.get(id);
  res.json({ conversation });
};

// ──────────────────────────────────────────────────────────────
// CHAT (per-conversation, persisted)
// ──────────────────────────────────────────────────────────────

const chat = async (req, res) => {
  try {
    const { id } = req.params;
    const { userMessage } = req.body;

    const conversation = stmts.getConversation.get(id);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    // Safety valve: empty input
    if (!userMessage || userMessage.trim().length === 0) {
      return res.json({
        botResponse: "Main sun raha hoon. Kya aap kuch batana chahte hain?",
        phase: conversation.phase,
        questionCount: conversation.question_count,
      });
    }

    logger.info(`\n[API] POST /api/conversations/${id}/chat - "${userMessage}"`);

    // 1. Save user message
    stmts.addMessage.run(id, "user", userMessage, conversation.phase);

    // 2. Check distress
    let distressDetected = !!conversation.distress_detected;
    if (!distressDetected && detectDistress(userMessage)) {
      distressDetected = true;
      logger.info("[STATE] 🎯 Distress detected.");
    }

    // 3. Compute phase
    const qCount = conversation.question_count + 1;
    const currentPhase = computePhase(qCount, distressDetected, userMessage);
    logger.info(`[STATE] Phase: ${currentPhase} | Questions: ${qCount}`);

    // 4. Build prompt from DB history
    const allMessages = stmts.getMessages.all(id);
    const historyLimit = Number(process.env.MAX_HISTORY_MESSAGES) || 24;
    const history = allMessages.slice(-historyLimit).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const fullPrompt = buildPrompt(history, currentPhase, distressDetected);

    // 5. Call LLM
    logger.info("[LLM] Calling Mistral...");
    let rawBotResponse = await callMistral(fullPrompt);
    let cleanedResponse = cleanResponse(rawBotResponse);

    // 6. English Shield
    const analysis = analyzeResponse(cleanedResponse);
    if (analysis.isEnglish) {
      logger.warn(`[SHIELD] English detected (Score: ${analysis.score}). Retrying...`);
      const retryPrompt = `${fullPrompt}\n\nERROR: Aapne English mein jawab diya. Is response ko foran ROMAN URDU mein translate karo:\n"${cleanedResponse}"\n\nSakoon:`;
      rawBotResponse = await callMistral(retryPrompt);
      cleanedResponse = cleanResponse(rawBotResponse);

      const postRetry = analyzeResponse(cleanedResponse);
      if (postRetry.isEnglish) {
        logger.error("[SHIELD] Retry failed. Using fallback.");
        const lastUserLower = userMessage.toLowerCase();
        if (lastUserLower.includes("thk") || lastUserLower.includes("acha") || lastUserLower.includes("good")) {
          cleanedResponse = "Sun kar khushi hui. Aur batayein, aaj ka din kaisa guzra?";
        } else {
          cleanedResponse = "Main samajh sakta hoon ke ye mushkil hai. Kya aap batana chahenge ke dil mein kaisa mehsoos ho raha hai?";
        }
      }
    }

    // 7. Validate
    const validationResult = validateResponse(cleanedResponse);
    if (!validationResult.valid) {
      logger.warn(`[VALIDATOR] Issues: ${JSON.stringify(validationResult.issues)}`);
    }

    // 8. Save bot message
    stmts.addMessage.run(id, "bot", cleanedResponse, currentPhase);

    // 9. Update conversation state
    const nextPhase = computePhase(qCount + 1, distressDetected, userMessage);
    stmts.updateConversation.run(
      null, currentPhase, qCount, distressDetected ? 1 : 0,
      null, null, id
    );

    // 10. Auto-title after first 2 messages
    if (conversation.title === "New Chat" && allMessages.length >= 1) {
      const title = generateTitle([...allMessages, { role: "user", content: userMessage }]);
      stmts.updateConversation.run(title, null, null, null, null, null, id);
    }

    res.json({
      botResponse: cleanedResponse,
      phase: currentPhase,
      nextPhase,
      questionCount: qCount,
      validationResult,
    });
  } catch (error) {
    logger.error(`[ERROR] Chat Error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────
// SEARCH
// ──────────────────────────────────────────────────────────────
const searchMessages = (req, res) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(400).json({ error: "Missing x-session-id header" });

  const query = req.query.q;
  if (!query) return res.json({ results: [] });

  const results = stmts.searchMessages.all(sessionId, `%${query}%`);
  res.json({ results });
};

// ──────────────────────────────────────────────────────────────
// MOOD
// ──────────────────────────────────────────────────────────────
const recordMood = (req, res) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(400).json({ error: "Missing x-session-id header" });

  const { conversation_id, rating, note } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  stmts.addMoodEntry.run(conversation_id || null, sessionId, rating, note || null);
  res.status(201).json({ message: "Mood recorded" });
};

const getMoodHistory = (req, res) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) return res.status(400).json({ error: "Missing x-session-id header" });

  const limit = parseInt(req.query.limit) || 30;
  const entries = stmts.getMoodHistory.all(sessionId, limit);
  res.json({ entries });
};

// Legacy reset (clears nothing from DB, just returns fresh state)
const resetLegacy = (req, res) => {
  res.json({ message: "Use POST /api/conversations to start a new chat", phase: "EXPLORE", questionCount: 0 });
};

// ──────────────────────────────────────────────────────────────
// TRANSLITERATION
// ──────────────────────────────────────────────────────────────
const transliterate = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }
    const romanUrdu = await llmCaller.transliterateText(text);
    res.json({ transliterated: romanUrdu });
  } catch (error) {
    logger.error(`[ERROR] Transliteration failed: ${error.message}`);
    // If it fails, fallback to the original text
    res.json({ transliterated: req.body.text });
  }
};

module.exports = {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  updateConversation,
  chat,
  searchMessages,
  recordMood,
  getMoodHistory,
  resetLegacy,
  transliterate,
};
