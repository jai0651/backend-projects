#!/bin/bash
echo "Stopping any running server..."
pkill -f "node src/index.js" || true
echo "Starting server..."
node src/index.js 