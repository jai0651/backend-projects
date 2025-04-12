// Simulate data processing task (e.g., Fibonacci computation)
console.log('Data Processor started with PID:', process.pid);

function computeFibonacci(n) {
  if (n < 2) return n;
  return computeFibonacci(n - 1) + computeFibonacci(n - 2);
}

function processData() {
  const n = Math.floor(Math.random() * 30) + 1;
  const result = computeFibonacci(n);
  console.log(`Data Processor: Fibonacci(${n}) = ${result}`);

  // Notify parent process if result exceeds threshold
  if (result > 5000) {
    process.send({ alert: `Fibonacci(${n}) = ${result} exceeds threshold!` });
  }
}

setInterval(processData, 1000); // Process every 10 seconds

process.on('message', (msg) => {
  if (msg.cmd === 'shutdown') {
    console.log('Data Processor shutting down gracefully...');
    process.exit(0);
  }
});
