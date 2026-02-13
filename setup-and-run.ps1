# RunCor Next.js Setup and Run Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RunCor Next.js Setup and Run Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Attempting to install Node.js automatically..." -ForegroundColor Yellow
    
    # Try winget first
    $wingetInstalled = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetInstalled) {
        Write-Host "[INFO] Installing Node.js via winget..." -ForegroundColor Yellow
        winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Node.js installed successfully!" -ForegroundColor Green
            Write-Host "[INFO] Please restart PowerShell and run this script again." -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit
        }
    }
    
    # Try Chocolatey if available
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    if ($chocoInstalled) {
        Write-Host "[INFO] Installing Node.js via Chocolatey..." -ForegroundColor Yellow
        choco install nodejs-lts -y
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Node.js installed successfully!" -ForegroundColor Green
            Write-Host "[INFO] Refreshing environment..." -ForegroundColor Yellow
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            Write-Host "[INFO] Please restart PowerShell and run this script again." -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit
        }
    }
    
    Write-Host "[ERROR] Could not install Node.js automatically." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js manually:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Download the LTS version" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host "4. Restart PowerShell and run this script again" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
$npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmInstalled) {
    Write-Host "[ERROR] npm is not found!" -ForegroundColor Red
    Write-Host "Please ensure Node.js is properly installed." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Node.js and npm are installed" -ForegroundColor Green
Write-Host ""
Write-Host "Node.js version: $(node --version)" -ForegroundColor Cyan
Write-Host "npm version: $(npm --version)" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
    Write-Host "[OK] Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[INFO] Dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The app will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev


