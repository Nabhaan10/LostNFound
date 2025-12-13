@echo off
echo ========================================
echo  Starting Lost and Found System
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  Application Starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
