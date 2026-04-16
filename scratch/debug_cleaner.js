const { cleanResponse } = require("./backend/src/utils/responseCleaner");

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
