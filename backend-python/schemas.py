from pydantic import BaseModel, EmailStr
from typing import Optional, Any, Dict, List
from datetime import datetime

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    identifier: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None
    isAdmin: Optional[bool] = False

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    message: str
    user: UserOut
    token: str
    progress: Optional[Dict[str, Any]] = None

class ProgressPayload(BaseModel):
    version: Optional[int] = 1
    xp: Optional[int] = 0
    streak: Optional[int] = 0
    completedLessons: Optional[List[str]] = []
    lessonPractice: Optional[Dict[str, Any]] = {}
    practiceAwarded: Optional[Dict[str, Any]] = {}
    practiceCode: Optional[Dict[str, Any]] = {}
    practiceInput: Optional[Dict[str, Any]] = {}
    quizResults: Optional[Dict[str, Any]] = {}
    quizXpAwarded: Optional[Dict[str, Any]] = {}
    completedChallenges: Optional[List[str]] = []
    notes: Optional[Dict[str, Any]] = {}
    bookmarks: Optional[List[str]] = []
    recentLessons: Optional[List[str]] = []
    labCode: Optional[str] = 'print("Hello, Python!")'
    labInput: Optional[str] = ''

class ExecuteRequest(BaseModel):
    code: str
    stdin: Optional[str] = ''
    timeoutMs: Optional[int] = 3000

class ExecuteResponse(BaseModel):
    ok: bool
    stdout: str
    stderr: str
    executionTimeMs: int

class LeaderboardItem(BaseModel):
    username: str
    xp: int
    streak: int
    completed_count: int
    updated_at: Optional[datetime] = None

class AwardXpPayload(BaseModel):
    xp: int
