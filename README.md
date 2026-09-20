# 🐍 Python Academy — Full-Stack Learning Platform

Python Academy is a complete personal Python learning environment that runs in **dual-mode**:
1. **Full-Stack Mode**: Powered by a high-speed backend server with native SQLite database, JWT authentication, cloud progress sync across devices, remote Python sandbox execution, and community leaderboard.
2. **Static / Offline Mode**: 100% compatible with GitHub Pages and offline PWAs, storing progress locally in `localStorage` and executing Python instantly in-browser via bundled Skulpt (with zero external CDN dependencies).

---

## 🚀 Quick Start (Instant Run on Windows / Mac / Linux)

### Option A: One-Click Windows Launcher
Double-click `run_server.bat` in the root folder. It will start the backend server and automatically open your browser at `http://localhost:5000`.

### Option B: Node.js (Zero-dependency out-of-the-box)
```bash
npm start
# or: node server/server.js
```
Open **http://localhost:5000** in your browser.

### Option C: Python FastAPI Backend
```bash
cd backend-python
pip install -r requirements.txt
python main.py
```

### Option D: Docker & Docker Compose
```bash
docker-compose up --build
```

---

## 🌟 What's Included

### 1. Curriculum Roadmap (11 Levels, 88 Lessons)
- **Level 0**: Programming Foundations
- **Level 1**: Python Fundamentals
- **Level 2**: Control Flow
- **Level 3**: Data Structures
- **Level 4**: Functions
- **Level 5**: Problem Solving & Algorithms
- **Level 6**: Intermediate Python
- **Level 7**: Object-Oriented Python
- **Level 8**: Advanced Python
- **Level 9**: Real-World Python
- **Level 10**: Professional Projects & Capstone Portfolio

### 2. Dual-Mode Python Code Execution
- **⚡ Backend Server Sandbox**: Executes code natively on the server host with timeout isolation (3-second watchdog) and stdin piping.
- **🐍 In-Browser Engine (Skulpt)**: Runs completely inside the browser with zero external server requirements. Pre-cached for full offline PWA execution on GitHub Pages.

### 3. Cloud Accounts & Auto-Sync
- **User Authentication**: Secure user registration and login with PBKDF2 password hashing and JWT authorization.
- **Real-Time Synchronization**: All XP, daily streaks, completed lessons, notes, bookmarks, and challenge solutions sync to your cloud account when online, with graceful offline fallback to `localStorage`.
- **Global Leaderboard**: Track your learning rank and study streak.

### 4. Perfect Responsive Design
- **Desktop & Widescreen**: High-efficiency two-column navigation layout.
- **Tablets (768px – 1080px)**: Fluid single-column lesson flow with zero horizontal clipping.
- **Smartphones (320px – 560px)**: Touch-optimized bottom navigation bar, safe-area inset padding for notched devices, adaptive cards, and iOS-friendly inputs (`font-size: 16px` to prevent auto-zoom).

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and database connectivity |
| `POST` | `/api/auth/register` | Create user account (`username`, `email`, `password`) |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token (`identifier`, `password`) |
| `GET` | `/api/auth/me` | Fetch authenticated user details and profile |
| `GET` | `/api/progress` | Retrieve user's cloud-saved progress |
| `POST` | `/api/progress` | Synchronize user's full progress state |
| `POST` | `/api/execute` | Execute Python script in sandbox (`code`, `stdin`, `timeoutMs`) |
| `GET` | `/api/curriculum` | List all 11 curriculum levels and lessons |
| `GET` | `/api/challenges` | List coding challenges and test cases |
| `GET` | `/api/leaderboard` | View top learners by XP and streak |

---

## 🌐 Deploying to GitHub Pages

1. Push the contents of the `python-academy-complete/` folder to your GitHub repository.
2. In GitHub, go to **Settings → Pages → Deploy from a branch** and select `main` (or your default branch) and `/ (root)`.
3. Your app will run 100% statically on GitHub Pages with bundled client-side Python and browser storage!
4. If you also run your backend server (e.g. on Render, Fly.io, Railway, or VPS), users can click **Cloud Sync** and connect their account to sync across devices.
