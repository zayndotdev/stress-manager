const logger = require('./logger');

/**
 * Cleans the raw LLM response to enforce Roman Urdu constraints.
 * Strips translations in parentheses, trims excess lines, and
 * ensures the response ends with a question mark.
 */
function cleanResponse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        return "Kya tum mujhe thoda aur bata sakte ho?";
    }

    let text = rawText.trim();

    // Remove any "Sakoon:" prefix the model might echo
    text = text.replace(/^Sakoon:\s*/i, '');

    // Remove English translations in parentheses: (like this)
    text = text.replace(/\s*\([^)]*[a-zA-Z]{3,}[^)]*\)/g, '');

    // Remove any line that is purely English (heuristic: >80% English words)
    const lines = text.split('\n').filter(line => {
        const words = line.trim().split(/\s+/);
        const englishWords = ['the', 'is', 'are', 'was', 'were', 'this', 'that', 'would', 'could', 'should', 'have', 'has', 'been', 'being', 'from', 'with', 'your', 'you', 'for', 'not', 'but', 'and', 'can', 'will'];
        let engCount = 0;
        words.forEach(w => {
            if (englishWords.includes(w.toLowerCase().replace(/[^a-z]/g, ''))) {
                engCount++;
            }
        });
        return words.length === 0 || (engCount / words.length) < 0.6;
    });

    // Take only first 2 non-empty lines
    const cleanLines = lines.filter(l => l.trim().length > 0).slice(0, 2);
    text = cleanLines.join(' ').trim();

    // Truncate if over 200 chars (find last sentence end)
    if (text.length > 200) {
        const truncated = text.substring(0, 200);
        const lastQuestion = truncated.lastIndexOf('?');
        if (lastQuestion > 50) {
            text = truncated.substring(0, lastQuestion + 1);
        } else {
            text = truncated.trim();
        }
    }

    // Ensure ends with question mark
    if (!text.endsWith('?')) {
        // Try to find and keep up to the last question mark
        const lastQ = text.lastIndexOf('?');
        if (lastQ > 20) {
            text = text.substring(0, lastQ + 1);
        } else {
            // Append a generic follow-up question
            text = text.replace(/[.!,;:\s]+$/, '');
            text += ". Tum kya sochte ho?";
        }
    }

    logger.info(`[CLEAN] Applied cleaning rules. Result length: ${text.length} chars.`);
    return text;
}

module.exports = { cleanResponse };
