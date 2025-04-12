const {fork} = require('child_process');
const path = require('path');
const fs = require('fs');

const tasks = [
    { name: 'API Poller', path: './tasks/apiPoller.js' },
  { name: 'Logger', path: './tasks/logger.js' },
  { name: 'Data Processor', path: './tasks/processor.js' },
  { name: 'Notifier', path: './tasks/notifier.js' }
];


const children = new Map();

function spawnTask(task) {
    const child = fork(task.path);
    console.log(`Spawned ${task.name} with PID: ${child.pid}`);
    children.set(child.pid, { process: child, taskName: task.name });
  
    // Listen for exit events
    child.on('exit', (code, signal) => {
      console.log(`${task.name} (PID: ${child.pid}) exited with code ${code} signal ${signal}`);
      children.delete(child.pid);
      // Restart on unexpected exit
      if (code !== 0) {
        console.log(`Restarting ${task.name}...`);
        spawnTask(task);
      }
    });
  
     // Listen for messages from child processes
     child.on('message', (msg) => {
        console.log(`Message from ${task.name} (PID: ${child.pid}):`, msg);

        // Forward data from API Poller to Logger
        if (task.name === 'API Poller' && msg.data) {
            const logger = [...children.values()].find(child => child.taskName === 'Logger');
            if (logger) {
                logger.process.send({ log: msg.data }); // Forward the data to Logger
            }
        }

        if (task.name === 'Data Processor' && msg.alert) {
            const notifier = [...children.values()].find(child => child.taskName === 'Notifier');
            if (notifier) {
                notifier.process.send({ alert: msg.alert }); // Forward the alert to Notifier
            }
        }
    });
  }


  tasks.forEach(task => {spawnTask(task);});

  function shutdown() {
    console.log('Received shutdown signal. Terminating child processes...');
    children.forEach(({ process: child, taskName }) => {
      console.log(`Sending termination signal to ${taskName} (PID: ${child.pid})`);
      // Optionally: child.send({ cmd: 'shutdown' });
      child.kill('SIGTERM');
    });
    process.exit(0);
  }


process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

