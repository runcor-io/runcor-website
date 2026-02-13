@echo off
title RunCor - Automated Setup and Run
color 0A
cls

echo.
echo ================================================================
echo           RunCor - Universal Device Autonomy Network
echo           Automated Setup and Launch Script
echo ================================================================
echo.
echo This script will:
echo   1. Check for Node.js installation
echo   2. Install Node.js automatically if needed
echo   3. Install all project dependencies
echo   4. Start the development server
echo.
echo ================================================================
echo.

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    goto :check_npm
)

REM Node.js not found - try to install
echo [STEP 1/4] Checking Node.js installation...
echo [WARNING] Node.js is not installed!
echo.

REM Try winget first (Windows 10/11)
where winget >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Detected winget. Attempting automatic Node.js installation...
    echo [INFO] This may take a few minutes. Please wait...
    echo.
    winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Node.js installed successfully!
        echo [INFO] Refreshing PATH environment...
        
        REM Try to refresh PATH (may not work in all cases)
        for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SYSTEM_PATH=%%b"
        set "PATH=%SYSTEM_PATH%;%USERPROFILE%\AppData\Roaming\npm"
        
        echo [INFO] Please wait 10 seconds for PATH to update, then checking again...
        timeout /t 10 /nobreak >nul
        
        REM Check again
        where node >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            goto :check_npm
        ) else (
            echo [WARNING] Node.js installed but PATH not updated yet.
            echo [INFO] Please close this window and run the script again.
            echo [INFO] Or restart your computer for PATH to take effect.
            pause
            exit /b 0
        )
    )
)

REM Try Chocolatey if available
where choco >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Detected Chocolatey. Attempting Node.js installation...
    choco install nodejs-lts -y
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Node.js installed via Chocolatey!
        echo [INFO] Refreshing environment...
        call refreshenv >nul 2>&1
        timeout /t 5 /nobreak >nul
        where node >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            goto :check_npm
        )
    )
)

REM Manual installation required
echo [ERROR] Could not install Node.js automatically.
echo.
echo ================================================================
echo MANUAL INSTALLATION REQUIRED
echo ================================================================
echo.
echo Please install Node.js manually:
echo.
echo 1. Open your web browser
echo 2. Go to: https://nodejs.org/
echo 3. Download the LTS version (recommended)
echo 4. Run the installer with default settings
echo 5. Restart your computer (or close all terminal windows)
echo 6. Run this script again
echo.
echo ================================================================
echo.
pause
exit /b 1

:check_npm
echo [STEP 1/4] Node.js found!
node --version
echo.

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found. Node.js installation may be incomplete.
    echo Please reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [STEP 2/4] Checking npm...
npm --version
echo.

:install_dependencies
echo [STEP 3/4] Checking dependencies...
if exist "node_modules" (
    echo [INFO] Dependencies already installed. Skipping...
    echo.
) else (
    echo [INFO] Installing dependencies...
    echo [INFO] This may take 2-5 minutes on first run. Please wait...
    echo.
    
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        echo.
        echo Troubleshooting:
        echo - Check your internet connection
        echo - Try running as Administrator
        echo - Delete node_modules folder and try again
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully!
    echo.
)

:start_server
echo [STEP 4/4] Starting development server...
echo.
echo ================================================================
echo                    SERVER STARTING
echo ================================================================
echo.
echo The application will be available at:
echo.
echo    http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ================================================================
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    echo Troubleshooting:
    echo - Make sure port 3000 is not in use
    echo - Check if all dependencies installed correctly
    echo - Try deleting .next folder and run again
    echo.
    pause
    exit /b 1
)


