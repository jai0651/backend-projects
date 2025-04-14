# Scalable Rate Limiter for API Gateway

A production-ready rate limiter implementation using Node.js and Redis, designed for API gateways handling millions of requests.

## Features

- Global and per-user rate limiting
- Redis-based distributed rate limiting
- Configurable rate limits and time windows
- Load testing capabilities
- Production-ready error handling
- Health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- Redis server
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rate-limiter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
GLOBAL_RATE_LIMIT=1000
GLOBAL_WINDOW=60
USER_RATE_LIMIT=10
USER_WINDOW=1
NODE_ENV=development
```

## Running the Service

1. Start Redis server:
```bash
redis-server
```

2. Start the rate limiter service:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/protected` - Example protected endpoint

## Rate Limiting Headers

The service adds the following headers to responses:
- `X-RateLimit-Global-Limit`
- `X-RateLimit-Global-Remaining`
- `X-RateLimit-User-Limit`
- `X-RateLimit-User-Remaining`
- `Retry-After` (when rate limited)

## Load Testing

Run the load test script:
```bash
node src/tests/loadTest.js
```

This will simulate multiple concurrent users making requests to test the rate limiter.

## Architecture

The rate limiter uses:
- Redis for distributed state management
- Token bucket algorithm for rate limiting
- Express middleware for request handling
- Worker threads for load testing

## Production Deployment

For production deployment:
1. Set appropriate environment variables
2. Use a process manager like PM2
3. Configure Redis for high availability
4. Set up monitoring and alerting
5. Use container orchestration (e.g., Kubernetes) for scaling

## License

MIT 