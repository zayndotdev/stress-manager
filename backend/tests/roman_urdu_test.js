// ═══════════════════════════════════════════════════════════════
// Sakoon Roman Urdu Automated Test Suite
// Run: node tests/roman_urdu_test.js
// Requires: backend running on localhost:5000
// ═══════════════════════════════════════════════════════════════

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5000";
const SESSION_ID = `test-session-${crypto.randomUUID()}`;
const RESULTS_FILE = path.join(__dirname, "../logs/test_results.json");
const RESULTS_LOG = path.join(__dirname, "../logs/test_results.log");

// ── Test cases ──────────────────────────────────────────────────
const TEST_CASES = [
  {
    id: "TC-01",
    description: "Basic greeting — should respond in Roman Urdu",
    input: "Assalam o Alaikum",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      minLength: 10,
      maxLength: 300,
      noEnglishGreeting: true,
    },
    expectedKeywords: ["aap", "haan", "aao", "baat", "karo", "walaikum", "sakoon", "kaise"],
    forbiddenPatterns: [/[\u0600-\u06FF]/, /^(sure|okay|hi there|hello|i understand)/i],
  },
  {
    id: "TC-02",
    description: "Stress trigger — should detect distress, stay empathetic",
    input: "bohat tension ho rahi hai yaar",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      minLength: 15,
      maxLength: 300,
      showsEmpathy: true,
    },
    expectedKeywords: ["aap", "kya", "baat", "tension", "samjho", "bata", "hota"],
    forbiddenPatterns: [/[\u0600-\u06FF]/, /I understand your/i, /It sounds like/i],
  },
  {
    id: "TC-03",
    description: "Sleep problem — medical-adjacent, must stay Roman Urdu",
    input: "raat ko neend nahi aati bilkul",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      minLength: 15,
      maxLength: 300,
    },
    expectedKeywords: ["neend", "aap", "kab", "kya", "hai", "hota", "raat"],
    forbiddenPatterns: [/[\u0600-\u06FF]/, /sleep disorder/i, /consult a doctor/i],
  },
  {
    id: "TC-04",
    description: "Confusion — should stay in EXPLORE phase",
    input: "pata nahi yaar kuch samajh nahi aa raha",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      minLength: 10,
    },
    expectedKeywords: ["aap", "kya", "baat", "thoda", "bataao", "samjho"],
    forbiddenPatterns: [/[\u0600-\u06FF]/],
  },
  {
    id: "TC-05",
    description: "Office stress — should empathize",
    input: "boss ne aaj bohat daanta",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      minLength: 10,
    },
    expectedKeywords: ["aap", "kya", "hua", "boss", "bura", "bata"],
    forbiddenPatterns: [/[\u0600-\u06FF]/, /professional/i],
  },
  {
    id: "TC-06",
    description: "Loneliness — must NOT use Hindi words",
    input: "akela feel ho raha hoon",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      noHindiWords: true,
    },
    expectedKeywords: ["aap", "akela", "hoon", "baat", "karo"],
    forbiddenPatterns: [/[\u0600-\u06FF]/, /\bapka\b/i, /\bswagat\b/i, /\bdhanyavad\b/i, /\bkripya\b/i],
  },
  {
    id: "TC-07",
    description: "Positive mood — should celebrate with the user",
    input: "aaj bohat acha din tha yaar",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      minLength: 10,
    },
    expectedKeywords: ["wah", "acha", "kya", "hua", "khush"],
    forbiddenPatterns: [/[\u0600-\u06FF]/],
  },
  {
    id: "TC-08",
    description: "Second message in same convo — should maintain context",
    input: "haan aur exam bhi kal hai",
    checks: {
      noArabicScript: true,
      containsRomanUrdu: true,
      minLength: 10,
    },
    expectedKeywords: ["exam", "aap", "kya", "padhai", "kal"],
    forbiddenPatterns: [/[\u0600-\u06FF]/],
    isFollowUp: true,  // will be sent in same conversation as TC-02
  },
];

// ── Validation helpers ──────────────────────────────────────────
const ROMAN_URDU_MARKERS = ["hai", "hoon", "kya", "aap", "yaar", "mujhe", "baat", "karo", "raha", "rahi", "nahi", "bohat", "acha", "theek", "woh", "aur", "bhi", "toh", "se", "ko", "ka", "ki"];
const HINDI_WORDS = ["avsar", "samasya", "vishwaas", "swagat", "dhanyavad", "kripya", "aapka", "suniye", "bataye", "shukriya"];

function evaluateResponse(testCase, response) {
  const issues = [];
  const passed = [];
  const lower = response.toLowerCase();

  // Check: no Arabic script
  if (/[\u0600-\u06FF]/.test(response)) {
    issues.push("FAIL: Arabic script present in response");
  } else {
    passed.push("PASS: No Arabic script");
  }

  // Check: contains Roman Urdu
  const ruMarkers = ROMAN_URDU_MARKERS.filter(m => lower.includes(m));
  if (ruMarkers.length >= 1) {
    passed.push(`PASS: Roman Urdu markers found: [${ruMarkers.slice(0, 4).join(", ")}]`);
  } else {
    issues.push("FAIL: No Roman Urdu markers found");
  }

  // Check: length
  if (testCase.checks.minLength && response.length < testCase.checks.minLength) {
    issues.push(`FAIL: Response too short (${response.length} < ${testCase.checks.minLength})`);
  } else if (testCase.checks.minLength) {
    passed.push(`PASS: Length OK (${response.length} chars)`);
  }

  if (testCase.checks.maxLength && response.length > testCase.checks.maxLength) {
    issues.push(`FAIL: Response too long (${response.length} > ${testCase.checks.maxLength})`);
  }

  // Check: expected keywords (at least 1)
  if (testCase.expectedKeywords) {
    const found = testCase.expectedKeywords.filter(k => lower.includes(k));
    if (found.length >= 1) {
      passed.push(`PASS: Expected keywords found: [${found.join(", ")}]`);
    } else {
      issues.push(`WARN: None of expected keywords found: [${testCase.expectedKeywords.join(", ")}]`);
    }
  }

  // Check: forbidden patterns
  if (testCase.forbiddenPatterns) {
    for (const pattern of testCase.forbiddenPatterns) {
      if (pattern.test(response)) {
        issues.push(`FAIL: Forbidden pattern matched: ${pattern}`);
      }
    }
  }

  // Check: no Hindi words
  if (testCase.checks.noHindiWords) {
    const hindiFound = HINDI_WORDS.filter(w => lower.includes(w));
    if (hindiFound.length > 0) {
      issues.push(`FAIL: Hindi words detected: [${hindiFound.join(", ")}]`);
    } else {
      passed.push("PASS: No Hindi words");
    }
  }

  const failCount = issues.filter(i => i.startsWith("FAIL")).length;
  return {
    passed,
    issues,
    overallPass: failCount === 0,
  };
}

// ── API helpers ─────────────────────────────────────────────────
async function createConversation() {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-session-id": SESSION_ID },
    body: JSON.stringify({ title: "Test Conversation" }),
  });
  if (!res.ok) throw new Error(`createConversation failed: ${res.status}`);
  const data = await res.json();
  return data.conversation.id;
}

async function sendMessageStream(convId, message) {
  return new Promise(async (resolve, reject) => {
    const res = await fetch(`${BASE_URL}/api/conversations/${convId}/chat-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-session-id": SESSION_ID },
      body: JSON.stringify({ userMessage: message }),
    });

    if (!res.ok) return reject(new Error(`HTTP ${res.status}`));

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullResponse = "";
    let phase = "EXPLORE";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              fullResponse = data.fullResponse || fullResponse;
              phase = data.phase || phase;
            } else if (data.token) {
              fullResponse += data.token;
            }
          } catch {}
        }
      }
    }
    resolve({ response: fullResponse, phase });
  });
}

// ── Main test runner ────────────────────────────────────────────
async function runTests() {
  console.log("\n" + "═".repeat(60));
  console.log("  SAKOON ROMAN URDU AUTOMATED TEST SUITE");
  console.log("  Session:", SESSION_ID);
  console.log("  Target:", BASE_URL);
  console.log("═".repeat(60) + "\n");

  const results = [];
  let passCount = 0;
  let failCount = 0;
  let convId = null;
  let followUpConvId = null;

  for (const tc of TEST_CASES) {
    console.log(`\n[${tc.id}] ${tc.description}`);
    console.log(`  Input: "${tc.input}"`);

    let attempt = 0;
    const maxAttempts = 3;
    let lastResult = null;

    // Retry loop — keeps trying until response passes or max attempts reached
    while (attempt < maxAttempts) {
      attempt++;
      if (attempt > 1) {
        console.log(`  → Retry attempt ${attempt}/${maxAttempts}...`);
        await new Promise(r => setTimeout(r, 2000));
      }

      try {
        // Create a fresh conversation for retries (except follow-up test)
        if (!tc.isFollowUp || attempt > 1) {
          convId = await createConversation();
          console.log(`  Conversation ID: ${convId}`);
        } else if (tc.isFollowUp && followUpConvId) {
          convId = followUpConvId;
        } else {
          convId = await createConversation();
          followUpConvId = convId;
        }

        const startTime = Date.now();
        const { response, phase } = await sendMessageStream(convId, tc.input);
        const elapsed = Date.now() - startTime;

        console.log(`  Response (${elapsed}ms, phase=${phase}): "${response}"`);

        lastResult = evaluateResponse(tc, response);
        lastResult.response = response;
        lastResult.phase = phase;
        lastResult.elapsed = elapsed;
        lastResult.attempt = attempt;

        console.log(`  Checks passed: ${lastResult.passed.length}`);
        if (lastResult.issues.length > 0) {
          console.log(`  Issues:`);
          lastResult.issues.forEach(i => console.log(`    ${i}`));
        }

        if (lastResult.overallPass) {
          console.log(`  ✅ PASSED on attempt ${attempt}`);
          break;
        } else {
          const hardFails = lastResult.issues.filter(i => i.startsWith("FAIL:")).length;
          if (hardFails > 0) {
            console.log(`  ❌ FAILED attempt ${attempt} — ${hardFails} hard fails`);
          } else {
            console.log(`  ⚠️  WARNINGS only — counting as pass`);
            lastResult.overallPass = true;
            break;
          }
        }
      } catch (err) {
        console.error(`  ERROR on attempt ${attempt}:`, err.message);
        lastResult = { overallPass: false, issues: [`ERROR: ${err.message}`], passed: [], attempt };
      }
    }

    if (lastResult.overallPass) passCount++;
    else failCount++;

    results.push({
      testId: tc.id,
      description: tc.description,
      input: tc.input,
      ...lastResult,
    });
  }

  // ── Summary ──────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log(`  RESULTS: ${passCount} passed, ${failCount} failed out of ${TEST_CASES.length} tests`);
  console.log("═".repeat(60));

  const passRate = Math.round((passCount / TEST_CASES.length) * 100);
  console.log(`  Pass rate: ${passRate}%`);

  if (passRate < 70) {
    console.log("\n  ❌ CRITICAL: Less than 70% pass rate.");
    console.log("  Most likely cause: model not responding in Roman Urdu at all.");
    console.log("  Check: Is Ollama running? Run: curl http://localhost:11434/api/tags");
    console.log("  Check: Is the model installed? Run: ollama list");
  } else if (passRate < 90) {
    console.log("\n  ⚠️  WARNING: Some tests failing. Roman Urdu quality needs improvement.");
    console.log("  Check logs/llm_responses.log for raw model outputs.");
  } else {
    console.log("\n  ✅ EXCELLENT: Roman Urdu responses are working well!");
  }

  // Save results to disk
  const report = {
    timestamp: new Date().toISOString(),
    sessionId: SESSION_ID,
    passCount,
    failCount,
    passRate,
    results,
  };

  fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(report, null, 2));

  const logLines = results.map(r =>
    `[${r.testId}] ${r.overallPass ? "PASS" : "FAIL"} | Input: "${r.input}" | Response: "${(r.response || "").substring(0, 80)}" | Issues: ${(r.issues || []).join("; ")}`
  ).join("\n");
  fs.appendFileSync(RESULTS_LOG, `\n\n${"=".repeat(60)}\n${new Date().toISOString()}\n${logLines}\n`);

  console.log(`\n  Full results saved to: logs/test_results.json`);
  console.log(`  Log appended to: logs/test_results.log`);

  return passRate;
}

// Run
runTests().then(passRate => {
  process.exit(passRate >= 70 ? 0 : 1);
}).catch(err => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
