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

  logger.info(
    `[CLEAN] Applied cleaning rules. Result length: ${text.length} chars (max ${MAX_RESPONSE_CHARS}).`,
  );
  return text;
}

module.exports = { cleanResponse };
