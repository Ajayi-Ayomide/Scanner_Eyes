#!/bin/bash

echo "🚀 Starting Scanner Eyes Services..."

# Start backend
echo "📡 Starting Backend Server..."
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server..."
cd ../frontend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev &
FRONTEND_PID=$!

echo "✅ Services started!"
echo "📡 Backend: http://localhost:8001"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait

# Cleanup on exit
echo "🛑 Stopping services..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ Services stopped"

