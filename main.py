# Root entrypoint for Render and cloud Python deployment
import os
import sys

# Add backend-python directory to module path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend-python")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
