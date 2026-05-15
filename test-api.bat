@echo off
echo Testing Backend Connection...
echo.

curl -s http://localhost:5000/api/health
echo.
echo.
echo Testing Database Stats...
curl -s http://localhost:5000/api/stats
echo.
echo.
echo Testing Items...
curl -s http://localhost:5000/api/items/all
echo.
pause
