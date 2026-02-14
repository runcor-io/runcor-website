@echo off
title RunCor Agent Installer
color 0A

echo.
echo ============================================
echo   RUNCOR AGENT INSTALLER FOR WINDOWS
echo ============================================
echo.
echo This will detect your HP Omen specs and
echo register them with your RunCor dashboard.
echo.
pause
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed!
    echo.
    echo Please install Python from:
    echo https://python.org/downloads
    echo.
    echo During install, CHECK "Add Python to PATH"
    echo.
    start https://python.org/downloads
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Download the script
echo Downloading RunCor Agent...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3000/downloads/runcor-agent-windows.py' -OutFile '%TEMP%\runcor-agent.py' -TimeoutSec 30"

if errorlevel 1 (
    echo Failed to download. Make sure the website is running.
    pause
    exit /b 1
)

echo [OK] Download complete
echo.

REM Run the script
echo Starting RunCor Agent...
echo ============================================
echo.
python "%TEMP%\runcor-agent.py"

REM Clean up
del "%TEMP%\runcor-agent.py" 2>nul

echo.
echo ============================================
pause
