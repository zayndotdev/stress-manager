const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOGS_DIR, 'chat.log');

// Ensure log directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function formatDate() {
    return new Date().toISOString();
}

function appendToFile(level, message) {
    const logEntry = `[${formatDate()}] [${level}] ${message}\n`;
    fs.appendFile(LOG_FILE, logEntry, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

const logger = {
    info: (msg) => {
        console.log(msg);
        appendToFile('INFO', msg);
    },
    warn: (msg) => {
        console.warn(`\x1b[33m%s\x1b[0m`, msg); // Yellow terminal output
        appendToFile('WARN', msg);
    },
    error: (msg) => {
        console.error(`\x1b[31m%s\x1b[0m`, msg); // Red terminal output
        appendToFile('ERROR', msg);
    },
    debug: (msg) => {
        console.log(`\x1b[36m%s\x1b[0m`, msg); // Cyan terminal output
        appendToFile('DEBUG', msg);
    }
};

module.exports = logger;
