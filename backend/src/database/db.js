const Database = require("better-sqlite3");
const path = require("path");
const logger = require("../utils/logger");

const DB_PATH = path.join(__dirname, "../../data/sakoon.db");

// Ensure data directory exists
const fs = require("fs");
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema Migration ─────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    title TEXT DEFAULT 'New Chat',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    phase TEXT DEFAULT 'EXPLORE',
    question_count INTEGER DEFAULT 0,
    distress_detected INTEGER DEFAULT 0,
    mood_rating INTEGER,
    is_pinned INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'bot', 'system')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    phase_at_time TEXT,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS mood_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT,
    session_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_mood_session ON mood_entries(session_id);
`);

logger.info(`[DB] SQLite database initialized at ${DB_PATH}`);

// ─── Prepared Statements ───────────────────────────────────

const stmts = {
  // Conversations
  createConversation: db.prepare(
    `INSERT INTO conversations (id, session_id, title) VALUES (?, ?, ?)`
  ),
  getConversation: db.prepare(
    `SELECT * FROM conversations WHERE id = ? AND is_deleted = 0`
  ),
  listConversations: db.prepare(
    `SELECT * FROM conversations WHERE session_id = ? AND is_deleted = 0 ORDER BY is_pinned DESC, updated_at DESC`
  ),
  updateConversation: db.prepare(
    `UPDATE conversations SET title = COALESCE(?, title), phase = COALESCE(?, phase), question_count = COALESCE(?, question_count), distress_detected = COALESCE(?, distress_detected), mood_rating = COALESCE(?, mood_rating), is_pinned = COALESCE(?, is_pinned), updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ),
  softDeleteConversation: db.prepare(
    `UPDATE conversations SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ),

  // Messages
  addMessage: db.prepare(
    `INSERT INTO messages (conversation_id, role, content, phase_at_time) VALUES (?, ?, ?, ?)`
  ),
  getMessages: db.prepare(
    `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`
  ),
  getRecentMessages: db.prepare(
    `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?`
  ),
  searchMessages: db.prepare(
    `SELECT m.*, c.title as conversation_title FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.session_id = ? AND c.is_deleted = 0 AND m.content LIKE ? ORDER BY m.created_at DESC LIMIT 50`
  ),

  // Mood
  addMoodEntry: db.prepare(
    `INSERT INTO mood_entries (conversation_id, session_id, rating, note) VALUES (?, ?, ?, ?)`
  ),
  getMoodHistory: db.prepare(
    `SELECT * FROM mood_entries WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`
  ),
};

module.exports = { db, stmts };
