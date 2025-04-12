const fs = require('fs');
const path = require('path');

// Log file path
const logFilePath = path.join(__dirname, 'log.txt');

console.log('Logger started with PID:', process.pid);

// Listen for messages from the parent process
process.on('message', (msg) => {
    if (msg.log) {
        const logEntry = `Logged Data: ${JSON.stringify(msg.log)}\n`;

        // Append the log entry to the file
        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error('Logger: Error writing to file:', err);
            }
        });
    }
});

// Handle shutdown message via IPC (optional)
process.on('message', (msg) => {
    if (msg.cmd === 'shutdown') {
        console.log('Logger shutting down gracefully...');
        process.exit(0);
    }
});
