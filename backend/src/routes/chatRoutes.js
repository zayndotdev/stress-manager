const express = require("express");
const router = express.Router();
const conv = require("../controllers/conversationController");
const legacyChat = require("../controllers/chatController");

// ─── Conversation CRUD ─────────────────────────────────────
router.get("/conversations", conv.listConversations);
router.post("/conversations", conv.createConversation);
router.get("/conversations/:id", conv.getConversation);
router.delete("/conversations/:id", conv.deleteConversation);
router.patch("/conversations/:id", conv.updateConversation);

// ─── Per-Conversation Chat ─────────────────────────────────
router.post("/conversations/:id/chat", conv.chat);

// ─── Search ────────────────────────────────────────────────
router.get("/search", conv.searchMessages);

// ─── Mood ──────────────────────────────────────────────────
router.post("/mood", conv.recordMood);
router.get("/mood/history", conv.getMoodHistory);

// ─── Legacy endpoints (backward compatibility) ─────────────
router.post("/chat", legacyChat.chat);
router.get("/reset", conv.resetLegacy);

// ─── Voice ─────────────────────────────────────────────────
router.post("/voice/transliterate", conv.transliterate);

module.exports = router;
