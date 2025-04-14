const axios = require('axios');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const BASE_URL = 'http://localhost:3000';
const NUM_USERS = 10;
const REQUESTS_PER_USER = 11;

async function makeRequest(userId) {
    try {
        const response = await axios.get(`${BASE_URL}/api/protected`, {
            headers: { 'x-user-id': `user${userId}` }
        });
        return { success: true, status: response.status };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status,
            message: error.response?.data?.message
        };
    }
}

async function simulateUser(userId) {
    
    const promises = [];
    for (let i = 0; i < REQUESTS_PER_USER; i++) {
        promises.push(makeRequest(userId));
    }
    
    const requestResults = await Promise.all(promises);
    return requestResults;
}

if (isMainThread) {
    console.log('Starting load test...');
    const startTime = Date.now();

    const workers = [];
    for (let i = 0; i < NUM_USERS; i++) {
        const worker = new Worker(__filename, {
            workerData: { userId: i }
        });
        workers.push(worker);
    }

    let totalRequests = 0;
    let successfulRequests = 0;
    let rateLimitedRequests = 0;

    workers.forEach(worker => {
        worker.on('message', results => {
            results.forEach(result => {
                totalRequests++;
                if (result.success) {
                    successfulRequests++;
                } else if (result.status === 429) {
                    rateLimitedRequests++;
                }
            });
        });
    });

    Promise.all(workers.map(worker => new Promise(resolve => worker.on('exit', resolve))))
        .then(() => {
            const duration = (Date.now() - startTime) / 1000;
            console.log('\nLoad Test Results:');
            console.log('-----------------');
            console.log(`Total Requests: ${totalRequests}`);
            console.log(`Successful Requests: ${successfulRequests}`);
            console.log(`Rate Limited Requests: ${rateLimitedRequests}`);
            console.log(`Duration: ${duration.toFixed(2)} seconds`);
            console.log(`Requests per second: ${(totalRequests / duration).toFixed(2)}`);
        });
} else {
    simulateUser(workerData.userId).then(results => {
        parentPort.postMessage(results);
    });
} 