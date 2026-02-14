@echo off
echo Building RunCor Agent GUI for Windows...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Build the executable
echo.
echo Building executable with PyInstaller...
pyinstaller --onefile --windowed --name "RunCor-Agent-GUI" --icon=NONE runcor_agent_gui.py

if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo BUILD SUCCESSFUL!
echo ============================================
echo.
echo Output: dist\RunCor-Agent-GUI.exe
echo.
echo You can now:
echo 1. Copy dist\RunCor-Agent-GUI.exe to your website's public\downloads folder
echo 2. Users can download and run it directly
echo.
pause
