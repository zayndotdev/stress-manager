// Mock logger
const logger = { info: console.log, debug: console.log, error: console.log };

// Copy the cleaning logic directly for debug
function cleanResponse(rawText) {
  if (!rawText) return "";
  let text = rawText.trim();
  const MAX_RESPONSE_CHARS = 220;

  const hallucinatoryPhrases = [
    /Aur agar aapko kisi baat poochna chahte ho.*/gi,
    /Main apne best shukrana dekh sakta hun.*/gi,
    /Kya aap mujhe mazeed tafseelat bata sakte hain.*/gi,
  ];
  hallucinatoryPhrases.forEach((regex) => {
    text = text.replace(regex, "").trim();
  });

  const blacklist = [
    /shukrana/gi,
    /itma'nan/gi,
    /itmanan/gi,
    /itminan/gi,
    /vishwas/gi,
    /vishvash/gi,
    /baat-e-/gi,
    /shukria/gi,
    /achhi baat/gi,
    /achi baat/gi,
  ];
  
  blacklist.forEach((regex) => {
    text = text.replace(regex, "");
  });

  text = text.replace(/\s+/g, " ");
  text = text.replace(/^\s*[.,!?;:]+\s*/, "");
  text = text.replace(/\s*[.,!?;:]+\s*/g, " ");
  text = text.trim();

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (!text.endsWith("?")) {
    text = text.replace(/[.!,;:\s]+$/, "") + "?";
  }

  return text;
}

const testCases = [
  "Yeh sun kar itma'nan hua. Kaise hain?",
  "Aur agar aapko kisi baat poochna chahte ho, toh main apne best shukrana dekh sakta hun?",
  "Yeh sun kar itmanan hua. Kya boss ne aaj kuch keh diya?",
  "Shukrana dekh sakta hun. Kya pareshani hai?"
];

testCases.forEach(input => {
  console.log(`INPUT: ${input}`);
  console.log(`CLEANED: ${cleanResponse(input)}`);
  console.log("-" . repeat(20));
});
