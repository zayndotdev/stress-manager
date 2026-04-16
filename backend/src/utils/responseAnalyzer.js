const logger = require("./logger");

/**
 * Common English stopwords and connectors that signify an English response.
 */
const ENGLISH_STOPWORDS = new Set([
  "the", "is", "are", "you", "your", "should", "will", "would", "could",
  "that", "this", "these", "those", "have", "has", "had", "been", "being",
  "with", "from", "about", "above", "below", "into", "onto", "under",
  "some", "any", "all", "each", "every", "both", "either", "neither",
  "great", "hear", "well", "far", "been", "day", "night", "feel", "feeling",
  "good", "better", "best", "very", "much", "many", "more", "most",
  "help", "helpful", "talk", "tell", "say", "said", "thought", "think"
]);

/**
 * Essential Roman Urdu anchors that verify it's Urdu. 
 * Even if it's "broken", it should have these tokens.
 */
const URDU_ANCHORS = new Set([
  "hai", "hain", "h", "hn", "mein", "me", "ka", "ki", "ko", "se", "aur",
  "aj", "abhi", "kya", "kia", "kyun", "q", "lekin", "magar", "bilkul", 
  "preshan", "masla", "baat", "karo", "ji", "hun", "ho", "hoon"
]);

/**
 * Analyzes a response to determine its primary language.
 * Returns { isEnglish, isUrdu, confidence }
 */
function analyzeResponse(text) {
  if (!text) return { isEnglish: false, isUrdu: false, score: 0 };

  const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ""));
  
  let engCount = 0;
  let urduCount = 0;

  words.forEach(word => {
    if (ENGLISH_STOPWORDS.has(word)) engCount++;
    if (URDU_ANCHORS.has(word)) urduCount++;
  });

  const engScore = engCount / words.length;
  const urduScore = urduCount / words.length;

  // VERDICT LOGIC:
  // 1. If English density > 30%, it's likely a English clinical hallucination.
  // 2. If Urdu anchors are 0, it's definitely NOT Urdu.
  const isEnglish = engScore > 0.3 || (engScore > 0.1 && urduScore === 0);
  const isUrdu = urduScore > 0;

  logger.info(`[ANALYZER] Scores - Eng: ${engScore.toFixed(2)}, Urdu: ${urduScore.toFixed(2)} | Verdict: ${isEnglish ? "ENGLISH" : "URDU/MIXED"}`);

  return { isEnglish, isUrdu, score: engScore };
}

module.exports = { analyzeResponse };
