const fs = require('fs');
const path = require('path');

//logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const smsLogFile = path.join(logsDir, 'sms-messages.log');

function logSMSMessage(to, message, status = 'WOULD_SEND') {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        to,
        status,
        message,
        separator: '---END MESSAGE---\n'
    };

    const logString = `
=== SMS LOG ENTRY ===
Timestamp: ${logEntry.timestamp}
To: ${logEntry.to}
Status: ${logEntry.status}
Message:
${logEntry.message}
${logEntry.separator}`;

    //append to log file
    fs.appendFileSync(smsLogFile, logString);
    
    //also log to console with nice formatting
    console.log('\n📱 SMS Message Log:');
    console.log(`   To: ${to}`);
    console.log(`   Status: ${status}`);
    console.log(`   Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    console.log(`   Full log saved to: ${smsLogFile}`);
}

function clearSMSLog() {
    if (fs.existsSync(smsLogFile)) {
        fs.unlinkSync(smsLogFile);
        console.log('SMS log file cleared');
    }
}

function readSMSLog() {
    if (fs.existsSync(smsLogFile)) {
        return fs.readFileSync(smsLogFile, 'utf-8');
    }
    return 'No SMS log file found';
}

module.exports = {
    logSMSMessage,
    clearSMSLog,
    readSMSLog
};