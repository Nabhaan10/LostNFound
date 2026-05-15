@echo off
echo ========================================
echo  FIXING DATABASE - Restoring Items
echo ========================================
echo.
echo This will restore all resolved items to 'pending' status
echo so they appear in your reports again.
echo.
pause

mysql -u root -p lost_and_found < restore_items.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Items restored! Refresh your browser.
) else (
    echo.
    echo [ERROR] Failed to restore items.
    echo Check if MySQL is running and credentials are correct.
)

echo.
pause
