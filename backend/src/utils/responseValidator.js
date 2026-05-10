const logger = require("./logger");

function validateResponse(text) {
  if (!text || text.trim().length === 0) {
    return { valid: false, issues: ["EMPTY_RESPONSE"] };
  }

  const issues = [];

  if (/[\u0600-\u06FF]/.test(text)) issues.push("CONTAINS_ARABIC_SCRIPT");
  if (text.length < 10) issues.push("RESPONSE_TOO_SHORT");
  if (text.length > 500) issues.push("RESPONSE_TOO_LONG");
  if (/^(sure|okay|yes|i understand|of course)/i.test(text)) issues.push("STARTS_WITH_ENGLISH");

  const valid = issues.length === 0;

  console.log(`[VALIDATOR] Valid: ${valid} | Issues: ${issues.join(", ") || "none"} | Length: ${text.length}`);
  logger.info(`[VALIDATOR] Valid: ${valid} | Issues: [${issues.join(", ")}]`);

  return { valid, issues };
}

module.exports = { validateResponse };
