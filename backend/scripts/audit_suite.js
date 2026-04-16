const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';
const SCENARIOS_PATH = path.join(__dirname, '../../test_scenarios.json');
const LOG_PATH = path.join(__dirname, '../../docs/AUDIT_LOG_V12.md');

async function runAudit() {
  const scenarios = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf8'));
  console.log(`🚀 Starting Centurion Audit: ${scenarios.length} scenarios...`);

  // Initialize Markdown Log
  let markdown = `# Centurion Audit Log (V12.0)\n\n| # | Category | Prompt | Response | Latency (ms) | Status |\n|---|---|\n`;
  fs.writeFileSync(LOG_PATH, markdown);

  for (let i = 0; i < scenarios.length; i++) {
    const { category, prompt } = scenarios[i];
    
    // Reset state before every prompt to test "Universal Entrance" reliability
    await axios.get(`${API_BASE}/reset`).catch(() => {});

    const startTime = Date.now();
    let responseText = "";
    let status = "✅";

    try {
      const res = await axios.post(`${API_BASE}/chat`, { userMessage: prompt }, { timeout: 180000 });
      responseText = res.data.botResponse;
      const duration = Date.now() - startTime;

      // Basic Protocol Checks for the Log
      const hasEnglish = /[a-zA-Z]{5,}/.test(responseText.replace(/(Sakoon|Hello|Aap)/gi, ""));
      if (hasEnglish) status = "⚠️ (Possible English)";
      if (responseText.length > 200) status = "📏 (Too Long)";

      const logLine = `| ${i + 1} | ${category} | ${prompt || "(empty)"} | ${responseText} | ${duration} | ${status} |\n`;
      fs.appendFileSync(LOG_PATH, logLine);
      console.log(`[${i + 1}/${scenarios.length}] ${category}: ${prompt.substring(0, 20)}... -> ${responseText.substring(0, 20)}... (${duration}ms)`);
      
    } catch (error) {
      status = "❌ (Error)";
      responseText = error.message;
      const duration = Date.now() - startTime;
      const logLine = `| ${i + 1} | ${category} | ${prompt} | ERROR: ${responseText} | ${duration} | ${status} |\n`;
      fs.appendFileSync(LOG_PATH, logLine);
      console.error(`❌ Error on prompt ${i + 1}: ${error.message}`);
    }
    
    // Tiny delay to breathe
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ Audit Complete! Results saved to docs/AUDIT_LOG_V12.md`);
}

runAudit();
