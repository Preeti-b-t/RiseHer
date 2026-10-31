import os
import sys
import types
from pathlib import Path

# Set VERCEL environment variable flag
os.environ["VERCEL"] = "1"

# Resolve paths
CURRENT_FILE = Path(__file__).resolve()
API_DIR = CURRENT_FILE.parent
ROOT_DIR = API_DIR.parent
BACKEND_DIR = ROOT_DIR / "backend"

# Candidate directories where 'backend' package might be located
candidate_dirs = [
    ROOT_DIR,
    BACKEND_DIR,
    API_DIR,
    Path("/var/task"),
    Path("/var/task/backend"),
]

for d in candidate_dirs:
    if d.exists() and str(d) not in sys.path:
        sys.path.insert(0, str(d))

# Ensure 'backend' module is resolvable in sys.modules
if "backend" not in sys.modules:
    try:
        import backend
    except ImportError:
        target_backend = BACKEND_DIR if BACKEND_DIR.exists() else Path("/var/task")
        backend_pkg = types.ModuleType("backend")
        backend_pkg.__path__ = [str(target_backend)]
        backend_pkg.__file__ = str(target_backend / "__init__.py")
        sys.modules["backend"] = backend_pkg

# Import the FastAPI application
from backend.main import app

# Expose both 'app' and 'handler' for Vercel's ASGI serverless runtime
handler = app
