import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
import time
import subprocess
import tempfile
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import engine, get_db, Base
import models
import schemas

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Python Academy API", version="1.0.0")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "python-academy-secret-key-super-safe-9821!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("userId")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

# --- Health Route ---
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "Python Academy FastAPI Backend",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }

# --- Auth Routes ---
@app.post("/api/auth/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username or email already exists")

    hashed_pw = pwd_context.hash(payload.password)
    user = models.User(username=payload.username, email=payload.email, password_hash=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"userId": user.id, "username": user.username})
    return {
        "message": "Account created successfully",
        "user": user,
        "token": token,
        "progress": None
    }

@app.post("/api/auth/login", response_model=schemas.AuthResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        (models.User.username == payload.identifier) | (models.User.email == payload.identifier)
    ).first()
    if not user or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"userId": user.id, "username": user.username})
    progress_data = None
    if user.progress and user.progress.state_json:
        try:
            progress_data = json.loads(user.progress.state_json)
        except Exception:
            pass

    return {
        "message": "Logged in successfully",
        "user": user,
        "token": token,
        "progress": progress_data
    }

@app.get("/api/auth/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    progress_data = None
    if current_user.progress and current_user.progress.state_json:
        try:
            progress_data = json.loads(current_user.progress.state_json)
        except Exception:
            pass
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "created_at": current_user.created_at
        },
        "progress": progress_data
    }

# --- Progress Routes ---
@app.get("/api/progress")
def get_progress(current_user: models.User = Depends(get_current_user)):
    if not current_user.progress:
        return {"progress": None}
    try:
        data = json.loads(current_user.progress.state_json)
        data["xp"] = current_user.progress.xp
        data["streak"] = current_user.progress.streak
        return {"progress": data}
    except Exception:
        return {"progress": None}

@app.post("/api/progress")
def save_progress(payload: dict, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    xp = int(payload.get("xp", 0))
    streak = int(payload.get("streak", 0))
    completed_lessons = payload.get("completedLessons", [])
    count = len(completed_lessons) if isinstance(completed_lessons, list) else 0

    if not current_user.progress:
        prog = models.UserProgress(
            user_id=current_user.id,
            state_json=json.dumps(payload),
            xp=xp,
            streak=streak,
            completed_count=count
        )
        db.add(prog)
    else:
        current_user.progress.state_json = json.dumps(payload)
        current_user.progress.xp = xp
        current_user.progress.streak = streak
        current_user.progress.completed_count = count

    db.commit()
    return {"message": "Progress saved successfully", "result": {"success": True, "xp": xp, "streak": streak}}

# --- Leaderboard Route ---
@app.get("/api/leaderboard")
def get_leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    limit = min(limit, 100)
    records = db.query(
        models.User.username,
        models.UserProgress.xp,
        models.UserProgress.streak,
        models.UserProgress.completed_count,
        models.UserProgress.updated_at
    ).join(models.UserProgress, models.User.id == models.UserProgress.user_id)\
     .order_by(models.UserProgress.xp.desc(), models.UserProgress.completed_count.desc())\
     .limit(limit).all()

    leaderboard = [
        {
            "username": r[0],
            "xp": r[1],
            "streak": r[2],
            "completed_count": r[3],
            "updated_at": r[4]
        }
        for r in records
    ]
    return {"leaderboard": leaderboard}

# --- Code Execution Route ---
@app.post("/api/execute", response_model=schemas.ExecuteResponse)
def execute_code(payload: schemas.ExecuteRequest):
    start = time.time()
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(payload.code)
        temp_file = f.name

    try:
        proc = subprocess.run(
            ["python", "-u", temp_file],
            input=payload.stdin or "",
            capture_output=True,
            text=True,
            timeout=min(payload.timeoutMs / 1000.0, 5.0)
        )
        duration_ms = int((time.time() - start) * 1000)
        return {
            "ok": proc.returncode == 0,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "executionTimeMs": duration_ms
        }
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "stdout": "",
            "stderr": "Execution stopped: Time limit exceeded (3 seconds).",
            "executionTimeMs": 3000
        }
    except Exception as e:
        return {
            "ok": False,
            "stdout": "",
            "stderr": f"Server execution error: {str(e)}",
            "executionTimeMs": 0
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

# --- Static Frontend Mount ---
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python-academy-complete"))
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
