// Simulate API polling task
console.log('API Poller started with PID:', process.pid);

async function fetchData() {
  // Simulate API fetching logic
  console.log('API Poller: Fetching data...');
  let data= await fetch('https://dummyjson.com/products')
      data = await data.json();
      const products = data.products;
      const firstProduct = products[Math.floor(Math.random() * products.length)];
      process.send({ data:firstProduct });
}

setInterval(fetchData, 10000); // Poll every 5 seconds

// Handle shutdown message via IPC (optional)
process.on('message', (msg) => {
  if (msg.cmd === 'shutdown') {
    console.log('API Poller shutting down gracefully...');
    process.exit(0);
  }
});
