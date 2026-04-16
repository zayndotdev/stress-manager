const logger = require("../utils/logger");

const DEFAULT_MAX_HISTORY_MESSAGES = 24;
const configuredHistoryLimit = Number(process.env.MAX_HISTORY_MESSAGES);
const MAX_HISTORY_MESSAGES =
  Number.isFinite(configuredHistoryLimit) && configuredHistoryLimit > 0
    ? Math.floor(configuredHistoryLimit)
    : DEFAULT_MAX_HISTORY_MESSAGES;

let state = {
  messages: [],
  questionCount: 0,
  phase: "EXPLORE",
  distressDetected: false,
};

const DISTRESS_KEYWORDS = [
  "tension",
  "stress",
  "pareshan",
  "sad",
  "dukh",
  "mushkil",
  "masla",
  "kaam",
  "office",
  "boss",
  "pressure",
  "neend",
  "nind",
  "akela",
  "lonely",
  "dar",
  "khof",
  "tabiyat",
];

function detectDistress(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((word) => lowerText.includes(word));
}

function addMessage(role, content) {
  state.messages.push({ role, content });

  if (role === "user" && !state.distressDetected) {
    if (detectDistress(content)) {
      state.distressDetected = true;
      logger.info("[STATE] 🎯 Distress detected in user message.");
    }
  }

  // Keep prompt context bounded so long chats do not degrade quality or latency.
  if (state.messages.length > MAX_HISTORY_MESSAGES) {
    state.messages = state.messages.slice(-MAX_HISTORY_MESSAGES);
    logger.debug(
      `[STATE] History trimmed to last ${MAX_HISTORY_MESSAGES} messages`,
    );
  }

  logger.info(
    `[STATE] Added ${role} message. Total history: ${state.messages.length}`,
  );
}

function incrementQuestion() {
  state.questionCount += 1;
  logger.info(`[STATE] Question count incremented to ${state.questionCount}`);
}

function getPhase() {
  const qCount = state.questionCount;

  // Social Buffer: If no distress detected, stay in EXPLORE (Social) mode until Turn 6.
  // If distress IS detected, move to UNDERSTAND after Turn 3.
  if (state.distressDetected) {
    if (qCount <= 3) return "EXPLORE";
    if (qCount <= 6) return "UNDERSTAND";
    return "SUGGEST";
  } else {
    // No distress detected - keep it social longer.
    if (qCount <= 6) return "EXPLORE";
    return "SUGGEST"; // Even if just chatting, after turn 6 we move to a light suggest (Phase 3)
  }
}

function updatePhase() {
  const oldPhase = state.phase;
  state.phase = getPhase();
  if (oldPhase !== state.phase) {
    logger.info(`[STATE] 🔔 Phase Transition: ${oldPhase} -> ${state.phase}`);
  }
}

function getHistory(limit = null) {
  if (typeof limit === "number" && limit > 0) {
    return state.messages.slice(-Math.floor(limit));
  }

  return state.messages;
}

function getQuestionCount() {
  return state.questionCount;
}

function resetState() {
  state = {
    messages: [],
    questionCount: 0,
    phase: "EXPLORE",
    distressDetected: false,
  };
  logger.info(`[STATE] Conversation state has been reset to defaults`);
}

module.exports = {
  addMessage,
  incrementQuestion,
  getPhase,
  updatePhase,
  getHistory,
  getQuestionCount,
  resetState,
};
