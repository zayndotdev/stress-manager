const DEFAULT_MAX_RESPONSE_CHARS = 220;
const configuredMaxChars = Number(process.env.MAX_RESPONSE_CHARS);
const MAX_RESPONSE_CHARS =
  Number.isFinite(configuredMaxChars) && configuredMaxChars >= 120
    ? Math.floor(configuredMaxChars)
    : DEFAULT_MAX_RESPONSE_CHARS;

function validateResponse(text) {
  if (!text || typeof text !== "string") {
    return { valid: false, issues: ["Response is empty or not string"] };
  }

  const issues = [];
  const trimmedText = text.trim();

  // Check 1: No Urdu script (\u0600-\u06FF)
  const urduRegex = /[\u0600-\u06FF]/;
  if (urduRegex.test(text)) {
    issues.push("Contains Urdu script");
  }

  // Check 2: Must end with question mark
  if (!trimmedText.endsWith("?")) {
    issues.push("Does not end with a question mark");
  }

  // Check 3: Length check
  if (trimmedText.length > MAX_RESPONSE_CHARS) {
    issues.push(`Length exceeds ${MAX_RESPONSE_CHARS} characters`);
  }

  // Check 4: Not full English
  // Basic heuristic: checking for common pure English words that rarely appear in Roman Urdu
  const purelyEnglishWords = [
    "the",
    "is",
    "are",
    "was",
    "were",
    "they",
    "their",
    "there",
    "having",
    "could",
    "would",
    "that",
    "this",
    "and",
    "normal",
    "completely",
    "because",
    "about",
    "should",
    "please",
  ];
  const romanUrduMarkers = [
    "hai",
    "ho",
    "hun",
    "kya",
    "nahi",
    "main",
    "mera",
    "mujhe",
    "tum",
    "aap",
    "yaar",
    "bohot",
    "thoda",
    "kaise",
    "kyun",
    "raha",
    "rahi",
    "lag",
    "acha",
    "theek",
  ];
  const words = trimmedText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let englishCount = 0;
  words.forEach((word) => {
    if (purelyEnglishWords.includes(word)) {
      englishCount++;
    }
  });

  const hasRomanUrduSignal = words.some((word) =>
    romanUrduMarkers.includes(word),
  );

  // Flag likely full-English outputs while allowing natural mixed Roman Urdu.
  const ratio = words.length > 0 ? englishCount / words.length : 0;
  if (
    (ratio > 0.35 && words.length >= 6) ||
    (!hasRomanUrduSignal && ratio > 0.2 && words.length >= 5)
  ) {
    issues.push("Might contain too much English");
  }

  const isValid = issues.length === 0;

  return {
    valid: isValid,
    issues: issues,
  };
}

module.exports = { validateResponse };
