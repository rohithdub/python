# Root entrypoint for Render and cloud Python deployment
import os
import sys
import importlib.util

# 1. Add backend-python directory to module path so internal imports (database, models, schemas) resolve cleanly
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend-python")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 2. Dynamically load backend-python/main.py under a distinct namespace ('backend_app_module')
# to eliminate circular import collision with this root 'main' module
backend_main_path = os.path.join(backend_dir, "main.py")
spec = importlib.util.spec_from_file_location("backend_app_module", backend_main_path)
backend_app_module = importlib.util.module_from_spec(spec)
sys.modules["backend_app_module"] = backend_app_module
spec.loader.exec_module(backend_app_module)

# 3. Expose the FastAPI application object for Uvicorn ('main:app')
app = backend_app_module.app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
