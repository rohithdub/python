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
from sqlalchemy import func
from sqlalchemy.orm import Session
import hashlib
import hmac
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

SECRET_KEY = os.getenv("SECRET_KEY", "python-academy-secret-key-super-safe-9821!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"pbkdf2_sha256${salt}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            salt = parts[1]
            dk_hex = parts[2]
            check = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
            return hmac.compare_digest(check, dk_hex)
        try:
            import bcrypt
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            pass
        return False
    except Exception:
        return False

def is_admin_user(user: Optional[models.User]) -> bool:
    if not user:
        return False
    uname = (user.username or "").strip().lower()
    umail = (user.email or "").strip().lower()
    return uname in ["admin", "rohithdub"] or umail in ["rohithkumar55666@gmail.com", "admin@pythonacademy.com"]

def seed_primary_admin(db: Session):
    admin_user = db.query(models.User).filter(
        (models.User.username == "rohithdub") | (models.User.email == "rohithkumar55666@gmail.com")
    ).first()
    
    hashed = hash_password("king 55666")
    if not admin_user:
        admin_user = models.User(
            username="rohithdub",
            email="rohithkumar55666@gmail.com",
            password_hash=hashed
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    else:
        # Ensure password is valid
        if not verify_password("king 55666", admin_user.password_hash):
            admin_user.password_hash = hashed
            db.commit()

    if not admin_user.progress:
        admin_prog = models.UserProgress(
            user_id=admin_user.id,
            state_json=json.dumps({"xp": 2500, "streak": 7, "completedLessons": [], "completedChallenges": []}),
            xp=2500,
            streak=7,
            completed_count=0,
            updated_at=datetime.utcnow()
        )
        db.add(admin_prog)
        db.commit()

@app.on_event("startup")
def on_startup():
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_primary_admin(db)
    except Exception as e:
        print("Startup seed error:", e)
    finally:
        db.close()

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
    uname = payload.username.strip()
    raw_email = (payload.email or "").strip()
    if not raw_email or "@" not in raw_email:
        clean_email = f"{uname.lower().replace(' ', '_')}@student.pythonacademy.com"
    else:
        clean_email = raw_email.lower()

    existing = db.query(models.User).filter(
        (func.lower(models.User.username) == uname.lower()) | (func.lower(models.User.email) == clean_email)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A student account with this username or email already exists. Try signing in!")

    hashed_pw = hash_password(payload.password)
    user = models.User(username=uname, email=clean_email, password_hash=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)

    is_admin = is_admin_user(user)
    setattr(user, "isAdmin", is_admin)
    token = create_access_token({"userId": user.id, "username": user.username, "isAdmin": is_admin})
    return {
        "message": "Account created successfully",
        "user": user,
        "token": token,
        "progress": None
    }

@app.post("/api/auth/login", response_model=schemas.AuthResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    raw_ident = payload.identifier.strip()
    ident_lower = raw_ident.lower()
    user = db.query(models.User).filter(
        (func.lower(models.User.username) == ident_lower) | 
        (func.lower(models.User.email) == ident_lower)
    ).first()

    # Allow 'admin' to log in as primary admin 'rohithdub'
    if not user and ident_lower in ["admin", "administrator"]:
        user = db.query(models.User).filter(models.User.username == "rohithdub").first()

    created_new = False
    if not user:
        # If trying to access admin account with wrong details, reject
        if ident_lower in ["admin", "administrator", "rohithdub"]:
            raise HTTPException(status_code=401, detail="Invalid administrator credentials")

        if len(payload.password) < 4:
            raise HTTPException(status_code=400, detail="Password must be at least 4 characters")

        # Smart Student Enrollment: Automatically create student account on first sign-in!
        if "@" in raw_ident:
            email_val = raw_ident.lower()
            username_val = raw_ident.split("@")[0].strip()
        else:
            username_val = raw_ident
            email_val = f"{ident_lower.replace(' ', '_')}@student.pythonacademy.com"

        # Check if username exists under different case/email
        existing_u = db.query(models.User).filter(func.lower(models.User.username) == username_val.lower()).first()
        if existing_u:
            raise HTTPException(status_code=401, detail="Incorrect password for this student account. Please enter your existing password.")

        new_user = models.User(
            username=username_val,
            email=email_val,
            password_hash=hash_password(payload.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
        created_new = True
    else:
        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect password for this student account. Please check and try again.")

    is_admin = is_admin_user(user)
    setattr(user, "isAdmin", is_admin)
    token = create_access_token({"userId": user.id, "username": user.username, "isAdmin": is_admin})
    progress_data = None
    if user.progress and user.progress.state_json:
        try:
            progress_data = json.loads(user.progress.state_json)
        except Exception:
            pass

    return {
        "message": f"🎉 Welcome {user.username}! Student account created & synced." if created_new else "Logged in successfully",
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
            "created_at": current_user.created_at,
            "isAdmin": is_admin_user(current_user)
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
            completed_count=count,
            updated_at=datetime.utcnow()
        )
        db.add(prog)
    else:
        current_user.progress.state_json = json.dumps(payload)
        current_user.progress.xp = xp
        current_user.progress.streak = streak
        current_user.progress.completed_count = count
        current_user.progress.updated_at = datetime.utcnow()

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

# --- Admin Dashboard Routes ---
def verify_admin_access(
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> bool:
    configured_key = os.getenv("ADMIN_KEY", "king 55666").lower()
    valid_keys = [configured_key, "king 55666", "king55666"]
    admin_key = (x_admin_key or key or "").strip().lower()

    if admin_key in valid_keys or admin_key.replace(" ", "") in [k.replace(" ", "") for k in valid_keys]:
        return True

    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("userId")
            if user_id:
                u = db.query(models.User).filter(models.User.id == user_id).first()
                if u and is_admin_user(u):
                    return True
        except:
            pass

    raise HTTPException(status_code=403, detail="Unauthorized: Primary administrator privileges required")

@app.get("/api/admin/users")
def get_admin_users(
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    verify_admin_access(key, x_admin_key, authorization, db)

    users_query = db.query(models.User, models.UserProgress).outerjoin(
        models.UserProgress, models.User.id == models.UserProgress.user_id
    ).order_by(models.User.created_at.desc()).all()

    user_list = []
    total_xp = 0
    total_completed = 0

    for u, up in users_query:
        xp = up.xp if up else 0
        streak = up.streak if up else 0
        completed_count = up.completed_count if up else 0
        total_xp += xp
        total_completed += completed_count

        state_data = {}
        if up and up.state_json:
            try:
                state_data = json.loads(up.state_json)
            except:
                pass

        user_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
            "xp": xp,
            "streak": streak,
            "completedCount": completed_count,
            "updatedAt": up.updated_at.isoformat() if up and up.updated_at else None,
            "completedLessons": state_data.get("completedLessons", []),
            "completedChallenges": state_data.get("completedChallenges", []),
            "quizResults": state_data.get("quizResults", {}),
            "notes": state_data.get("notes", {}),
            "notesCount": len(state_data.get("notes", {})),
            "challengesCount": len(state_data.get("completedChallenges", [])),
            "lessonPractice": state_data.get("lessonPractice", {}),
            "isAdmin": is_admin_user(u)
        })

    stats = {
        "totalUsers": len(user_list),
        "totalXp": total_xp,
        "totalLessonsCompleted": total_completed,
        "totalCodeRuns": db.query(models.CodeRun).count()
    }

    return {"ok": True, "stats": stats, "users": user_list}

@app.post("/api/admin/users/{user_id}/award-xp")
def admin_award_xp(
    user_id: int, 
    payload: schemas.AwardXpPayload, 
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    verify_admin_access(key, x_admin_key, authorization, db)
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not target.progress:
        prog = models.UserProgress(
            user_id=target.id,
            state_json=json.dumps({"xp": payload.xp}),
            xp=payload.xp,
            streak=1,
            completed_count=0,
            updated_at=datetime.utcnow()
        )
        db.add(prog)
    else:
        target.progress.xp = max(0, target.progress.xp + payload.xp)
        target.progress.updated_at = datetime.utcnow()
        try:
            data = json.loads(target.progress.state_json) if target.progress.state_json else {}
            data["xp"] = target.progress.xp
            target.progress.state_json = json.dumps(data)
        except:
            pass
    db.commit()
    return {"ok": True, "message": f"Awarded {payload.xp} XP to {target.username}", "newXp": target.progress.xp}

@app.post("/api/admin/users/{user_id}/reset")
def admin_reset_user_progress(
    user_id: int, 
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    verify_admin_access(key, x_admin_key, authorization, db)
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target.progress:
        target.progress.xp = 0
        target.progress.streak = 0
        target.progress.completed_count = 0
        target.progress.state_json = json.dumps({
            "xp": 0, "streak": 0, "completedLessons": [], 
            "completedChallenges": [], "notes": {}, "quizResults": {}
        })
        target.progress.updated_at = datetime.utcnow()
        db.commit()
    return {"ok": True, "message": f"Reset progress for {target.username}"}

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(
    user_id: int, 
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    verify_admin_access(key, x_admin_key, authorization, db)
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    if is_admin_user(target):
        raise HTTPException(status_code=400, detail="Cannot delete the primary administrator account")

    if target.progress:
        db.delete(target.progress)
    db.query(models.CodeRun).filter(models.CodeRun.user_id == target.id).delete()
    db.delete(target)
    db.commit()
    return {"ok": True, "message": f"Successfully deleted user account: {target.username}"}

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
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
