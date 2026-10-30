import os
import sys
from pathlib import Path

# Add repository root to Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Ensure VERCEL environment flag is set
os.environ["VERCEL"] = "1"

# Import FastAPI app from backend.main
from backend.main import app

# Vercel's Python runtime natively runs the ASGI app object
handler = app
