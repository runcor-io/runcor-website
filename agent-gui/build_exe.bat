@echo off
echo ============================================
echo   RUNCOR AGENT - Windows Executable Builder
echo ============================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo [OK] Python found

:: Install required packages if not present
echo.
echo Installing required packages...
pip install pyinstaller psutil pillow -q
if errorlevel 1 (
    echo ERROR: Failed to install packages
    pause
    exit /b 1
)

echo [OK] Packages installed

:: Create the executable
echo.
echo Building RunCor Agent executable...
echo This may take a few minutes...
echo.

pyinstaller --onefile --windowed ^
  --name "RunCor-Agent" ^
  --icon "../public/runcor-logo-512px.png" ^
  --clean ^
  --noconfirm ^
  runcor-agent-gui.py

if errorlevel 1 (
    echo.
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo   BUILD SUCCESSFUL!
echo ============================================
echo.
echo Output: dist\RunCor-Agent.exe
echo.
echo You can now:
echo 1. Copy dist\RunCor-Agent.exe to distribute
echo 2. Run it to connect devices to RunCor
echo.
pause
