#!/bin/bash
set -e

# RiseHer Unified Startup Script
# AI-Powered Women Entrepreneurship Intelligence Platform

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
export PYTHONPATH="."

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=================================================================="
echo "          🌟 Welcome to RiseHer Platform 🌟"
echo "  AI-Powered Women Entrepreneurship Intelligence & Empowerment"
echo "=================================================================="

# Check Python environment
if [ -f ".venv/bin/python" ]; then
    PYTHON_EXEC=".venv/bin/python"
else
    PYTHON_EXEC="python3"
fi

echo ">> Checking database and initializing tables..."
$PYTHON_EXEC -c "from backend.main import app; print('✓ Database ready and seeded.')"

echo ""
echo ">> Starting RiseHer Backend (FastAPI + Uvicorn) on http://127.0.0.1:8001 ..."
$PYTHON_EXEC -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload &
BACKEND_PID=$!

# Trap Ctrl+C to cleanly kill background processes
trap "echo '>> Shutting down RiseHer...'; kill $BACKEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

echo ">> Starting RiseHer Frontend (Vite) on http://localhost:5173 ..."
if [ -d "frontend" ]; then
    cd frontend
    if [ -f "node_modules/.bin/vite" ]; then
        ./node_modules/.bin/vite --port 5173 --host &
        FRONTEND_PID=$!
        trap "echo '>> Shutting down RiseHer...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
    fi
    cd ..
fi

echo ""
echo "=================================================================="
echo "  🎉 RiseHer Platform is LIVE and READY!"
echo "  🌐 Web App:         http://localhost:5173"
echo "  ⚙️  Full-Stack App:   http://127.0.0.1:8001"
echo "  📖 API Swagger Docs: http://127.0.0.1:8001/docs"
echo ""
echo "  Demo Accounts (Password: password123 for all):"
echo "    - Scenario 1 (Online Boutique): priya@riseher.org"
echo "    - Scenario 2 (Bakery Expansion): ananya@riseher.org"
echo "    - Scenario 3 (Rural Agro):       sunita@riseher.org"
echo "    - Verified Mentor:               kavita.mentor@riseher.org"
echo "    - Administrator:                 admin@riseher.org"
echo "=================================================================="
echo "Press Ctrl+C to stop both servers."

wait
