const logger = require("./logger");

function cleanResponse(text) {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;

  // 1. Remove Arabic script
  cleaned = cleaned.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, "").trim();

  // 2. Hallucination Guard
  const replacements = [
    { bad: /aamad/gi, good: "pareshani" },
    { bad: /dafa/gi, good: "baat" },
    { bad: /thak karke/gi, good: "thaka kar" },
    { bad: /rahia tha/gi, good: "raha tha" },
    { bad: /rahia thi/gi, good: "rahi thi" },
    { bad: /dimaag daba رہا/gi, good: "bojh mehsoos ho raha" },
    { bad: /chinta/gi, good: "pareshani" }
  ];
  for (const r of replacements) {
    cleaned = cleaned.replace(r.bad, r.good);
  }

  // 3. Remove common meta-commentary
  const meta = [/Note:.*/si, /Explanation:.*/si, /\(Note.*/si, /---/g];
  for (const m of meta) {
    cleaned = cleaned.replace(m, "");
  }

  // 4. Robust Sentence Splitter (Doesn't lose the "tail")
  // We split by punctuation but we keep the delimiters
  const segments = cleaned.split(/([.!?]+)/g);
  let pieces = [];
  for (let i = 0; i < segments.length; i += 2) {
    let s = segments[i] || "";
    let p = segments[i+1] || "";
    if (s.trim()) pieces.push(s + p);
  }

  // 5. Limit to 4 sentences max (Safe for Greetings)
  if (pieces.length > 4) {
    cleaned = pieces.slice(0, 4).join(" ");
  } else {
    cleaned = pieces.join(" ");
  }

  return cleaned.trim();
}

module.exports = { cleanResponse };
