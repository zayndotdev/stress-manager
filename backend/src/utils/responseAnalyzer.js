const logger = require("./logger");

const ARABIC_REGEX = /[\u0600-\u06FF]/;
const ENGLISH_WORDS = ["i am", "i'm", "you are", "you're", "hello", "hi there", "sure", "okay", "yes", "no problem", "of course", "thank you", "please", "understand", "feeling", "sorry to hear", "sounds like", "it seems"];
const ROMAN_URDU_MARKERS = ["hai", "hoon", "kya", "aap", "yaar", "mujhe", "tumhe", "baat", "karo", "raha", "rahi", "nahi", "bohat", "acha", "theek"];

function analyzeResponse(text) {
  if (!text) return { isEnglish: false, hasArabic: false, hasRomanUrdu: false, score: 0, issues: [] };

  const lower = text.toLowerCase();
  const issues = [];

  const hasArabic = ARABIC_REGEX.test(text);
  if (hasArabic) issues.push("ARABIC_SCRIPT_DETECTED");

  const englishWordCount = ENGLISH_WORDS.filter(w => lower.includes(w)).length;
  const isEnglish = englishWordCount >= 2;
  if (isEnglish) issues.push(`ENGLISH_WORDS_DETECTED: ${englishWordCount}`);

  const romanUrduCount = ROMAN_URDU_MARKERS.filter(w => lower.includes(w)).length;
  const hasRomanUrdu = romanUrduCount >= 1;
  if (!hasRomanUrdu) issues.push("NO_ROMAN_URDU_MARKERS");

  const score = englishWordCount * 10 - romanUrduCount * 5;

  const result = { isEnglish, hasArabic, hasRomanUrdu, score, issues };

  console.log(`[ANALYZER] Arabic: ${hasArabic} | English score: ${englishWordCount} | Roman Urdu markers: ${romanUrduCount}`);
  console.log(`[ANALYZER] Issues: ${issues.length > 0 ? issues.join(", ") : "none"}`);
  logger.info(`[ANALYZER] ${JSON.stringify(result)}`);

  return result;
}

module.exports = { analyzeResponse };
