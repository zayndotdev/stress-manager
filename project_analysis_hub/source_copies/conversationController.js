const { v4: uuidv4 } = require("uuid");
const { stmts } = require("../database/db");
const { buildPrompt } = require("../utils/promptBuilder");
const { callChat, callChatStream, transliterateText } = require("../services/llmCaller");
const { validateResponse } = require("../utils/responseValidator");
const { cleanResponse } = require("../utils/responseCleaner");
const { analyzeResponse } = require("../utils/responseAnalyzer");
const logger = require("../utils/logger");

// ─── Distress / Confusion detection ──
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
// CHAT (non-streaming — kept as fallback)
// ──────────────────────────────────────────────────────────────

const chat = async (req, res) => {
  try {
    const { id } = req.params;
    const { userMessage } = req.body;

    const conversation = stmts.getConversation.get(id);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

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

    // 4. Build structured messages for /api/chat
    const allMessages = stmts.getMessages.all(id);
    logger.info(`[DB] Fetched ${allMessages.length} total messages for conversation history.`);
    
    const historyLimit = Number(process.env.MAX_HISTORY_MESSAGES) || 12;
    const history = allMessages.slice(-historyLimit).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    logger.info(`[STATE] Context length: ${history.length} messages.`);
    
    const chatMessages = buildPrompt(history, currentPhase, distressDetected);
    logger.info(`[LLM] Prompt payload prepared.`);

    // 5. Call LLM
    logger.info("[LLM] Calling Ollama chat API...");
    let rawBotResponse = await callChat(chatMessages);
    let cleanedResponse = cleanResponse(rawBotResponse);

    // 6. English check — log only (NO RETRY, NO FALLBACK OVERWRITE)
    const analysis = analyzeResponse(cleanedResponse);
    if (analysis.isEnglish) {
      logger.warn(`[SHIELD] English detected (Score: ${analysis.score}). Log only, keeping original response.`);
    }

    // 7. Validate (log only)
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

    // 10. Auto-title
    if (conversation.title === "New Chat" && allMessages.length >= 1) {
      const title = generateTitle([...allMessages, { role: "user", content: userMessage }]);
      stmts.updateConversation.run(title, null, null, null, null, null, id);
    }

    logger.info(`[API] === CHAT COMPLETE ===`);
    logger.info(`[API] Phase: ${currentPhase} -> ${nextPhase} | Valid: ${validationResult.valid}`);

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
// CHAT STREAM (SSE — real-time token streaming)
// ──────────────────────────────────────────────────────────────

const chatStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { userMessage } = req.body;

    const conversation = stmts.getConversation.get(id);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    if (!userMessage || userMessage.trim().length === 0) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`data: ${JSON.stringify({ token: "Main sun raha hoon. Kya aap kuch batana chahte hain?", done: false })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, phase: conversation.phase, questionCount: conversation.question_count })}\n\n`);
      return res.end();
    }

    logger.info(`\n==================================================`);
    logger.info(`💬 CHAT REQUEST: "${userMessage}"`);
    logger.info(`--------------------------------------------------`);

    // 1. Save user message
    stmts.addMessage.run(id, "user", userMessage, conversation.phase);

    // 2. Check distress
    let distressDetected = !!conversation.distress_detected;
    if (!distressDetected && detectDistress(userMessage)) {
      distressDetected = true;
    }

    // 3. Compute phase
    const qCount = conversation.question_count + 1;
    const currentPhase = computePhase(qCount, distressDetected, userMessage);

    // 4. Build structured messages
    const allMessages = stmts.getMessages.all(id);
    const historyLimit = Number(process.env.MAX_HISTORY_MESSAGES) || 12;
    const history = allMessages.slice(-historyLimit).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const chatMessages = buildPrompt(history, currentPhase, distressDetected);

    // 5. Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // 6. Stream from Ollama
    const stream = await callChatStream(chatMessages);
    let fullResponse = "";

    let stopStream = false;
    stream.on("data", (chunk) => {
      if (stopStream) return;

      const lines = chunk.toString().split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.content) {
            const token = parsed.message.content;
            
            // EMERGENCY STOP: If model starts explaining itself
            const lookahead = (fullResponse + token).toLowerCase();
            if (lookahead.includes("explanation") || lookahead.includes("note:") || lookahead.includes("**explanation")) {
                logger.warn(`[STREAM] Detected commentary token "${token}". Stopping stream early.`);
                stopStream = true;
                res.write(`data: ${JSON.stringify({ done: true, fullResponse: cleanResponse(fullResponse), phase: currentPhase, questionCount: qCount })}\n\n`);
                res.end();
                return;
            }

            fullResponse += token;
            if (fullResponse.length === token.length) {
                logger.info("[STREAM] First token received.");
            }
            res.write(`data: ${JSON.stringify({ token, done: false })}\n\n`);
          }
        } catch (e) {
          logger.error(`[STREAM] JSON Parse Error: ${e.message}`);
        }
      }
    });

    stream.on("end", () => {
      // Clean the full response
      let cleanedResponse = cleanResponse(fullResponse);

      // English check — log only
      const analysis = analyzeResponse(cleanedResponse);
      if (analysis.isEnglish) {
        logger.warn(`[SHIELD] English detected in stream. Log only.`);
      }

      // Save bot message
      stmts.addMessage.run(id, "bot", cleanedResponse, currentPhase);

      // Update conversation state
      const nextPhase = computePhase(qCount + 1, distressDetected, userMessage);
      stmts.updateConversation.run(
        null, currentPhase, qCount, distressDetected ? 1 : 0,
        null, null, id
      );

      // Auto-title
      if (conversation.title === "New Chat" && allMessages.length >= 1) {
        const title = generateTitle([...allMessages, { role: "user", content: userMessage }]);
        stmts.updateConversation.run(title, null, null, null, null, null, id);
      }

      // Send final event with metadata
      res.write(`data: ${JSON.stringify({
        done: true,
        fullResponse: cleanedResponse,
        phase: currentPhase,
        nextPhase,
        questionCount: qCount,
      })}\n\n`);
      res.end();
    });

    stream.on("error", (err) => {
      logger.error(`[STREAM] Error: ${err.message}`);
      const fallback = "Maaf kijiye, thoda masla aa gaya. Dobara koshish karein?";
      stmts.addMessage.run(id, "bot", fallback, currentPhase);
      res.write(`data: ${JSON.stringify({ token: fallback, done: false })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, phase: currentPhase, questionCount: qCount })}\n\n`);
      res.end();
    });

  } catch (error) {
    logger.error(`[ERROR] Stream Chat Error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.end();
    }
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

// Legacy reset
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
    const romanUrdu = await transliterateText(text);
    res.json({ transliterated: romanUrdu });
  } catch (error) {
    logger.error(`[ERROR] Transliteration failed: ${error.message}`);
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
  chatStream,
  searchMessages,
  recordMood,
  getMoodHistory,
  resetLegacy,
  transliterate,
};
