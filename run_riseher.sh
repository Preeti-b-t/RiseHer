#!/bin/bash
set -e

# ==============================================================================
# RiseHer Unified Setup & Startup Script
# AI-Powered Women Entrepreneurship Intelligence & Empowerment Platform
# ==============================================================================

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
export PYTHONPATH="."

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=================================================================="
echo "          🌟 Welcome to RiseHer Platform 🌟"
echo "  AI-Powered Women Entrepreneurship Intelligence & Empowerment"
echo "=================================================================="

# 1. Environment file check
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo ">> [Setup] Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Python Virtual Environment Setup
if [ ! -d ".venv" ]; then
    echo ">> [Setup] Creating Python virtual environment in .venv..."
    python3 -m venv .venv
    echo ">> [Setup] Installing backend Python dependencies..."
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r requirements.txt
    PYTHON_EXEC=".venv/bin/python"
else
    PYTHON_EXEC=".venv/bin/python"
fi

# 3. Frontend Dependencies Setup
if [ -d "frontend" ]; then
    if [ ! -d "frontend/node_modules" ]; then
        echo ">> [Setup] Installing frontend dependencies (npm install)..."
        cd frontend
        npm install
        cd ..
    fi
fi

# 4. Initialize Database and Seed Data
echo ">> Checking database schema and initializing seed data..."
$PYTHON_EXEC -c "from backend.main import app; print('✓ Database tables verified and seeded successfully.')"

echo ""
echo ">> Starting RiseHer Backend (FastAPI + Uvicorn) on http://127.0.0.1:8001 ..."
$PYTHON_EXEC -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload &
BACKEND_PID=$!

# Trap Ctrl+C and exit signals to cleanly terminate background services
trap "echo ''; echo '>> Shutting down RiseHer servers...'; kill $BACKEND_PID 2>/dev/null; if [ -n \"$FRONTEND_PID\" ]; then kill $FRONTEND_PID 2>/dev/null; fi; exit 0" SIGINT SIGTERM EXIT

# 5. Start Frontend
if [ -d "frontend" ]; then
    cd frontend
    if [ -f "node_modules/.bin/vite" ]; then
        echo ">> Starting RiseHer Frontend (Vite) on http://localhost:5173 ..."
        ./node_modules/.bin/vite --port 5173 --host 127.0.0.1 &
        FRONTEND_PID=$!
    else
        echo ">> Starting Vite using global npx..."
        npx vite --port 5173 --host 127.0.0.1 &
        FRONTEND_PID=$!
    fi
    cd ..
fi

echo ""
echo "=================================================================="
echo "  🎉 RiseHer Platform is LIVE and READY!"
echo "  🌐 Web Application:   http://localhost:5173"
echo "  ⚙️  Backend API:       http://127.0.0.1:8001"
echo "  📖 Swagger Docs:      http://127.0.0.1:8001/docs"
echo ""
echo "  Pre-configured Demo Accounts (Password: password123):"
echo "    - Fashion / E-commerce:  priya@riseher.org"
echo "    - Food & Bakery:         ananya@riseher.org"
echo "    - Rural Agriculture:     sunita@riseher.org"
echo "    - Verified Mentor:       kavita.mentor@riseher.org"
echo "    - Administrator:         admin@riseher.org"
echo "=================================================================="
echo "Press Ctrl+C to stop both servers."

wait
