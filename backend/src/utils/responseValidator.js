function validateResponse(text) {
    if (!text || typeof text !== 'string') {
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
    if (!trimmedText.endsWith('?')) {
        issues.push("Does not end with a question mark");
    }

    // Check 3: Length check < 200 chars
    if (trimmedText.length >= 200) {
        issues.push("Length exceeds 200 characters");
    }

    // Check 4: Not full English
    // Basic heuristic: checking for common pure English words that rarely appear in Roman Urdu
    const purelyEnglishWords = ['the', 'is', 'are', 'was', 'were', 'they', 'their', 'there', 'having', 'could', 'would'];
    const words = trimmedText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    
    let englishCount = 0;
    words.forEach(word => {
        if (purelyEnglishWords.includes(word)) {
            englishCount++;
        }
    });

    // If more than 20% of words are purely English specific, flag it
    const ratio = words.length > 0 ? englishCount / words.length : 0;
    if (ratio > 0.20) {
        issues.push("Might contain too much English");
    }

    const isValid = issues.length === 0;

    return {
        valid: isValid,
        issues: issues
    };
}

module.exports = { validateResponse };
