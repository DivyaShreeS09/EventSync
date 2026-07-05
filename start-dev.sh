#!/bin/bash
echo ""
echo "  ⚡ Starting EventSync in development mode..."
echo ""
echo "  Backend  → http://localhost:5000"
echo "  Frontend → http://localhost:3000"
echo ""
echo "  Demo accounts:"
echo "    admin@eventsync.com   / admin123   (Admin)"
echo "    meena@eventsync.com   / org123     (Organizer)"
echo "    ramesh@eventsync.com  / org123     (Organizer)"
echo "    arjun@eventsync.com   / student123 (Student)"
echo "    priya@eventsync.com   / student123 (Student)"
echo ""

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start backend
echo "  🚀 Starting backend..."
cd "$ROOT/server"
node index.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Start frontend
echo "  🎨 Starting frontend..."
cd "$ROOT/client"
npx vite &
FRONTEND_PID=$!

echo "  ✅ Both servers running. Press Ctrl+C to stop."

# Cleanup on exit
cleanup() {
  echo ""
  echo "  🛑 Shutting down..."
  kill $BACKEND_PID  2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM
wait
