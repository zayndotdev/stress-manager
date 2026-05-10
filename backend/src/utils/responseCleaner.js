const logger = require("./logger");

function cleanResponse(text) {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;

  // 1. Remove Arabic script
  cleaned = cleaned.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, "").trim();

  // 2. Fix specific linguistic hallucinations (Hallucination Catch)
  const replacements = [
    { bad: /aamad/gi, good: "pareshani" },
    { bad: /dafa/gi, good: "baat" },
    { bad: /thak karke/gi, good: "thaka kar" },
    { bad: /rahia tha/gi, good: "raha tha" },
    { bad: /rahia thi/gi, good: "rahi thi" },
    { bad: /muh batana/gi, good: "samajhna" }
  ];
  for (const r of replacements) {
    cleaned = cleaned.replace(r.bad, r.good);
  }

  // 3. Remove common meta-commentary
  const meta = [/Note:.*/si, /Explanation:.*/si, /\(Note.*/si, /---/g];
  for (const m of meta) {
    cleaned = cleaned.replace(m, "");
  }

  // 4. Sentence-level English strip
  let sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  sentences = sentences.filter(s => {
    const raw = s.trim().toLowerCase();
    const engWords = ["the", "is", "of", "to", "and", "it", "that", "this", "be", "was", "with"];
    const words = raw.split(/\s+/);
    const engCount = words.filter(w => engWords.includes(w)).length;
    return (engCount / words.length) < 0.3;
  });

  cleaned = sentences.join(" ").trim();

  // 5. Final limit to 2 sentences
  const finalSentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  if (finalSentences.length > 2) {
    cleaned = finalSentences.slice(0, 2).join(" ");
  }

  return cleaned.trim();
}

module.exports = { cleanResponse };
