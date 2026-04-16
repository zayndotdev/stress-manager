const logger = require("./logger");

const DEFAULT_MAX_RESPONSE_CHARS = 220;
const configuredMaxChars = Number(process.env.MAX_RESPONSE_CHARS);
const MAX_RESPONSE_CHARS =
  Number.isFinite(configuredMaxChars) && configuredMaxChars >= 120
    ? Math.floor(configuredMaxChars)
    : DEFAULT_MAX_RESPONSE_CHARS;

/**
 * Cleans the raw LLM response to enforce Roman Urdu constraints.
 * Strips translations in parentheses, trims excess lines, and
 * ensures the response ends with a question mark.
 */
function cleanResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return "Kya tum mujhe thoda aur bata sakte ho?";
  }

  let text = rawText.trim();

  // Remove any "Sakoon:" prefix the model might echo
  text = text.replace(/^Sakoon:\s*/i, "");

  // Remove English translations in parentheses: (like this)
  text = text.replace(/\s*\([^)]*[a-zA-Z]{3,}[^)]*\)/g, "");

  // Remove any line that is purely English (heuristic: >80% English words)
  const lines = text.split("\n").filter((line) => {
    const words = line.trim().split(/\s+/);
    const englishWords = [
      "the",
      "is",
      "are",
      "was",
      "were",
      "this",
      "that",
      "would",
      "could",
      "should",
      "have",
      "has",
      "been",
      "being",
      "from",
      "with",
      "your",
      "you",
      "for",
      "not",
      "but",
      "and",
      "can",
      "will",
    ];
    let engCount = 0;
    words.forEach((w) => {
      if (englishWords.includes(w.toLowerCase().replace(/[^a-z]/g, ""))) {
        engCount++;
      }
    });
    return words.length === 0 || engCount / words.length < 0.6;
  });

  // Take only first 2 non-empty lines
  const cleanLines = lines.filter((l) => l.trim().length > 0).slice(0, 2);
  text = cleanLines.join(" ").trim();

  // Normalize whitespace artifacts from model output.
  text = text.replace(/\s{2,}/g, " ").trim();

  if (!text) {
    return "Kya tum mujhe thoda aur bata sakte ho?";
  }

  // Truncate on sentence boundary when over limit.
  if (text.length > MAX_RESPONSE_CHARS) {
    const truncated = text.substring(0, MAX_RESPONSE_CHARS);
    // Find last strong punctuation
    const lastBoundary = Math.max(
      truncated.lastIndexOf("?"),
      truncated.lastIndexOf("!"),
      truncated.lastIndexOf("."),
    );

    // If we found a boundary at a reasonable spot, keep it.
    if (lastBoundary > 40) {
      text = truncated.substring(0, lastBoundary + 1).trim();
    } else {
      // No punctuation found, just trim. 
      text = truncated.trim();
    }
  }

  // Ensure ends with question mark
  if (!text.endsWith("?")) {
    // If it ends with . or !, just replace it with ? to keep it short.
    if (text.endsWith(".") || text.endsWith("!")) {
      text = text.slice(0, -1) + "?";
    } else {
      text = text.replace(/[.!,;:\s]+$/, "") + "?";
    }
  }

  // Final length safety check
  if (text.length > MAX_RESPONSE_CHARS) {
    text = text.substring(0, MAX_RESPONSE_CHARS - 1).trim() + "?";
  }

  // --- Precision Guards (V9.0) ---
  
  // 1. The "Sentence Axe": Discard everything after the FIRST question mark.
  // This guarantees brevity regardless of model rambling.
  const questionIndex = text.indexOf("?");
  if (questionIndex !== -1) {
    text = text.substring(0, questionIndex + 1).trim();
  }

  // 2. Pronoun & Hindi Blacklist (V11.0)
  const pronounSwaps = [
    { regex: /\btumhe\b/gi, replacement: "aapko" },
    { regex: /\btujhe\b/gi, replacement: "aapko" },
    { regex: /\btum\b/gi, replacement: "aap" },
    { regex: /\btu\b/gi, replacement: "aap" },
    { regex: /\btera\b/gi, replacement: "aapka" },
    { regex: /\bteri\b/gi, replacement: "aapki" },
    { regex: /\bswagat\b/gi, replacement: "Khush Amdeed" },
    { regex: /\bvishwaas\b/gi, replacement: "yaqeen" },
    { regex: /\bvishwas\b/gi, replacement: "yaqeen" },
    { regex: /\bsahyog\b/gi, replacement: "madad" },
    { regex: /\bkriya\b/gi, replacement: "kaam" },
    { regex: /\bshubh\b/gi, replacement: "achha" },
    { regex: /\bdhanyawad\b/gi, replacement: "shukria" },
    { regex: /\bnamaste\b/gi, replacement: "hello" },
    { regex: /\bshukrana\b/gi, replacement: "" },
    { regex: /\bitma'nan\b/gi, replacement: "" },
    { regex: /\bitmanan\b/gi, replacement: "" },
  ];
  
  pronounSwaps.forEach((rule) => {
    text = text.replace(rule.regex, rule.replacement);
  });

  // Final Cleanup
  text = text.replace(/\s+/g, " ").trim();
  
  // Capitalize first letter
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Ensure ends with ?
  if (!text.endsWith("?")) {
    text = text.replace(/[.!,;:\s]+$/, "") + "?";
  }

  logger.info(
    `[CLEAN] V10 Precision Clean complete. Result: "${text}"`,
  );
  return text;
}

/**
 * Heuristic to detect if a response is primarily English.
 */
function isEnglishContent(text) {
  if (!text) return false;
  const englishTriggerWords = [
    "the", "is", "are", "you", "your", "should", "advice", "trust", 
    "confide", "stress", "causing", "helpful", "talk", "about"
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  const engCount = words.filter(w => englishTriggerWords.includes(w.replace(/[^a-z]/g, ""))).length;
  
  // If > 20% of words are English trigger words, it's likely English clinical hallucination.
  return (engCount / words.length) > 0.2;
}

module.exports = { cleanResponse, isEnglishContent };
