@echo off
title RunCor - Quick Start
color 0B
cls

echo.
echo ================================================================
echo                    RunCor - Quick Start
echo ================================================================
echo.

REM Quick check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please run START_HERE.bat first for full setup.
    echo Or install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Quick check for npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not found!
    echo Please reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies (first time setup)...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo [INFO] Starting development server...
echo.
echo ================================================================
echo Application will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo ================================================================
echo.

call npm run dev

