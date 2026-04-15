const logger = require('../utils/logger');

let state = {
    messages: [],
    questionCount: 0,
    phase: 'EXPLORE'
};

function addMessage(role, content) {
    state.messages.push({ role, content });
    logger.info(`[STATE] Added ${role} message. Total history: ${state.messages.length}`);
}

function incrementQuestion() {
    state.questionCount += 1;
    logger.info(`[STATE] Question count incremented to ${state.questionCount}`);
}

function getPhase() {
    const qCount = state.questionCount;
    if (qCount <= 3) {
        return 'EXPLORE';
    } else if (qCount <= 6) {
        return 'UNDERSTAND';
    } else {
        return 'SUGGEST';
    }
}

function updatePhase() {
    const oldPhase = state.phase;
    state.phase = getPhase();
    if (oldPhase !== state.phase) {
        logger.info(`[STATE] 🔔 Phase Transition: ${oldPhase} -> ${state.phase}`);
    }
}

function getHistory() {
    return state.messages;
}

function getQuestionCount() {
    return state.questionCount;
}

function resetState() {
    state = {
        messages: [],
        questionCount: 0,
        phase: 'EXPLORE'
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
    resetState
};
