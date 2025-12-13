@echo off
echo ========================================
echo  College Lost and Found System Setup
echo ========================================
echo.

echo Step 1: Setting up Backend...
cd backend
echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)
echo Backend setup complete!
echo.

echo Step 2: Setting up Frontend...
cd ..\frontend
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)
echo Frontend setup complete!
echo.

cd ..

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MySQL is running
echo 2. Import schema.sql into MySQL
echo 3. Update backend/.env with your database credentials
echo 4. Run start.bat to start the application
echo.
pause
