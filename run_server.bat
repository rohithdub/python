@echo off
title Python Academy Full-Stack Platform
echo ========================================================
echo   Starting Python Academy Backend ^& Learning Platform...
echo ========================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please ensure Node.js is installed.
    pause
    exit /b 1
)

echo Starting Node.js backend server with native SQLite database...
echo Open your browser at: http://localhost:5000
echo.
start "" "http://localhost:5000"
node server/server.js
pause
