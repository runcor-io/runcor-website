@echo off
echo ========================================
echo RunCor Next.js Setup and Run Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Visit: https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Run the installer
    echo 4. Restart this script
    echo.
    echo Alternatively, if you have winget installed, we can try to install it automatically...
    echo.
    REM Try to install Node.js automatically using winget (if available)
    where winget >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] winget detected. Attempting to install Node.js automatically...
        winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        if %ERRORLEVEL% EQU 0 (
            echo [OK] Node.js installed successfully!
            echo [INFO] Refreshing environment variables...
            call refreshenv >nul 2>&1
            echo [INFO] Please restart this script to continue.
            pause
            exit /b 0
        )
    )
    
    echo [INFO] Automatic installation not available or failed.
    echo.
    echo Please install Node.js manually:
    echo 1. Visit: https://nodejs.org/
    echo 2. Download the LTS version (recommended)
    echo 3. Run the installer with default settings
    echo 4. Restart your computer (or close and reopen this terminal)
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not found!
    echo Please ensure Node.js is properly installed.
    pause
    exit /b 1
)

echo [OK] Node.js and npm are installed
echo.

REM Display versions
echo Node.js version:
node --version
echo.
echo npm version:
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
    echo.
) else (
    echo [INFO] Dependencies already installed
    echo.
)

REM Check if .next exists (build folder)
if not exist ".next" (
    echo [INFO] Building project for first time...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Build had some issues, but continuing...
    )
    echo.
)

echo ========================================
echo Starting development server...
echo ========================================
echo.
echo The app will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

