@echo off
chcp 65001 >nul
title RunCor Agent Registration - HP Omen
color 0A

setlocal EnableDelayedExpansion

REM Create log file
set "LOGFILE=%TEMP%\runcor-install.log"
echo RunCor Agent Registration Started: %DATE% %TIME% > "%LOGFILE%"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           RUNCOR AGENT - WINDOWS REGISTRATION                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Log file: %LOGFILE%
echo.

REM Get Username
echo [1/4] Getting username...
set /p USERNAME="Enter your RunCor username: "
if "!USERNAME!"=="" (
    echo ERROR: Username is required >> "%LOGFILE%"
    echo ERROR: Username is required
    pause
    exit /b 1
)
echo Username: %USERNAME% >> "%LOGFILE%"

echo.
echo ═══════════════════════════════════════════════════════════════
echo   DETECTING HARDWARE SPECIFICATIONS...
echo ═══════════════════════════════════════════════════════════════
echo.

REM Detect CPU
echo [2/4] Detecting CPU...
set "CPU=Unknown"
set "CORES=0"
set "FREQ=0"

for /f "skip=1 tokens=*" %%a in ('wmic cpu get Name /value 2^>nul') do (
    if "!CPU!"=="Unknown" (
        for /f "tokens=2 delims==" %%b in ("%%a") do (
            set "CPU=%%b"
            set "CPU=!CPU:~0,-1!"
        )
    )
)

for /f "skip=1 tokens=*" %%a in ('wmic cpu get NumberOfCores /value 2^>nul') do (
    if "!CORES!"=="0" (
        for /f "tokens=2 delims==" %%b in ("%%a") do (
            set "CORES=%%b"
            set "CORES=!CORES:~0,-1!"
        )
    )
)

for /f "skip=1 tokens=*" %%a in ('wmic cpu get MaxClockSpeed /value 2^>nul') do (
    if "!FREQ!"=="0" (
        for /f "tokens=2 delims==" %%b in ("%%a") do (
            set "FREQ=%%b"
            set "FREQ=!FREQ:~0,-1!"
        )
    )
)

if "!CPU!"=="Unknown" set "CPU=AMD/Intel Processor"
if "!CORES!"=="0" set "CORES=4"
if "!FREQ!"=="0" set "FREQ=2500"

echo CPU: !CPU! >> "%LOGFILE%"
echo Cores: !CORES! >> "%LOGFILE%"

REM Detect RAM
echo [3/4] Detecting RAM...
set "RAM_GB=8"

for /f "skip=1 tokens=*" %%a in ('wmic computersystem get TotalPhysicalMemory /value 2^>nul') do (
    for /f "tokens=2 delims==" %%b in ("%%a") do (
        set "RAM_BYTES=%%b"
        set "RAM_BYTES=!RAM_BYTES:~0,-1!"
        if defined RAM_BYTES (
            if !RAM_BYTES! GTR 0 (
                set /a RAM_MB=!RAM_BYTES:~0,-6!
                if !RAM_MB! GTR 0 (
                    set /a RAM_GB=!RAM_MB! / 1024
                )
            )
        )
    )
)

if !RAM_GB! LSS 1 set "RAM_GB=8"
echo RAM: !RAM_GB! GB >> "%LOGFILE%"

REM Detect OS
echo [4/4] Detecting OS...
set "OS_VER=Windows"

for /f "skip=1 tokens=*" %%a in ('wmic os get Caption /value 2^>nul') do (
    for /f "tokens=2 delims==" %%b in ("%%a") do (
        set "OS_VER=%%b"
        set "OS_VER=!OS_VER:~0,-1!"
    )
)

echo OS: !OS_VER! >> "%LOGFILE%"

REM Generate Device ID
echo Generating device ID...
set "DEVICE_ID="
for /f "skip=1 tokens=*" %%a in ('wmic csproduct get UUID /value 2^>nul') do (
    if "!DEVICE_ID!"=="" (
        for /f "tokens=2 delims==" %%b in ("%%a") do (
            set "UUID=%%b"
            set "UUID=!UUID:~0,-1!"
            set "UUID=!UUID:-=!"
            set "DEVICE_ID=0x!UUID:~0,16!"
        )
    )
)

if "!DEVICE_ID!"=="" set "DEVICE_ID=0x%RANDOM%%RANDOM%%RANDOM%%RANDOM%"
echo Device ID: !DEVICE_ID! >> "%LOGFILE%"

REM Display results
echo.
echo ═══════════════════════════════════════════════════════════════
echo   DETECTION RESULTS:
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✓ CPU: !CPU!
echo ✓ Cores: !CORES!
echo ✓ Frequency: !FREQ! MHz
echo ✓ RAM: !RAM_GB! GB
echo ✓ OS: !OS_VER!
echo ✓ Device ID: !DEVICE_ID!
echo.

REM Confirm
echo ═══════════════════════════════════════════════════════════════
echo   REGISTER WITH RUNCOR?
echo ═══════════════════════════════════════════════════════════════
echo.
echo This will send your hardware specs to:
echo http://localhost:3000/api/devices
echo.
set /p CONFIRM="Register this device? (Y/N): "
if /I not "!CONFIRM!"=="Y" (
    echo Cancelled by user >> "%LOGFILE%"
    echo.
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo   SENDING REGISTRATION...
echo ═══════════════════════════════════════════════════════════════
echo.

REM Create JSON (simplified for Windows batch)
set "JSON={\"deviceId\":\"!DEVICE_ID!\",\"username\":\"!USERNAME!\","
set "JSON=!JSON!\"specs\":{\"architecture\":\"amd64\",\"cpu\":\"!CPU!\","
set "JSON=!JSON!\"cpuCores\":!CORES!,\"cpuFrequencyMHz\":!FREQ!,"
set "JSON=!JSON!\"ramGB\":!RAM_GB!,\"os\":\"windows\","
set "JSON=!JSON!\"osVersion\":\"!OS_VER!\",\"capabilities\":[\"cpu_compute\",\"windows\"],"
set "JSON=!JSON!\"maxJobRAM\":\"2gb\"},"
set "JSON=!JSON!\"status\":{\"cpuLoadPercent\":0,\"ramUsedPercent\":0,\"jobStatus\":\"idle\",\"uptimeSeconds\":0}}"

echo JSON Payload: !JSON! >> "%LOGFILE%"

REM Send using PowerShell with error handling
echo Sending data to server...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; try { $body='%JSON%'; $response=Invoke-RestMethod -Uri 'http://localhost:3000/api/devices' -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 10; Write-Host 'SUCCESS: Device registered!' -ForegroundColor Green; Write-Host ''; Write-Host 'Device ID:' -NoNewline; Write-Host ' !DEVICE_ID!' -ForegroundColor Cyan; Write-Host 'View at:' -NoNewline; Write-Host ' http://localhost:3000/dashboard/device' -ForegroundColor Cyan; exit 0 } catch { Write-Host 'ERROR: Registration failed' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Yellow; exit 1 }"

set "PS_EXIT=%ERRORLEVEL%"
if !PS_EXIT! NEQ 0 (
    echo.
    echo ERROR: PowerShell registration failed >> "%LOGFILE%"
    echo.
    echo Troubleshooting:
    echo 1. Make sure the website is running: npm run dev
    echo 2. Check that localhost:3000 is accessible
    echo 3. Check the log file: %LOGFILE%
    echo.
    type "%LOGFILE%"
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo   REGISTRATION COMPLETE!
echo ═══════════════════════════════════════════════════════════════
echo.
echo Your HP Omen is now connected to RunCor.
echo.
echo Log file saved to: %LOGFILE%
echo.
pause
