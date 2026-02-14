@echo off
cd /d "%~dp0"
echo Starting RunCor development server...
echo.
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting server at http://localhost:3000
echo Press Ctrl+C to stop
echo.
call npm run dev
pause


