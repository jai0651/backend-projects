// Simulate notifier task
console.log('Notifier started with PID:', process.pid);

process.on('message', (msg) => {
  if (msg.alert) {
    console.log(`Notifier: Received alert - ${msg.alert}`);
   
  }
});

process.on('message', (msg) => {
  if (msg.cmd === 'shutdown') {
    console.log('Notifier shutting down gracefully...');
    process.exit(0);
  }
});
