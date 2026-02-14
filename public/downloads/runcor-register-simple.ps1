# RunCor Simple Device Registration
# Run this in PowerShell as Administrator

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  RUNCOR DEVICE REGISTRATION" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Get username
$username = Read-Host "Enter your RunCor username"
if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "Error: Username is required" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Detecting hardware..." -ForegroundColor Yellow
Write-Host ""

try {
    # Detect CPU
    $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
    $cpuName = $cpu.Name.Trim()
    $cpuCores = $cpu.NumberOfCores
    $cpuFreq = [int]$cpu.MaxClockSpeed
    
    Write-Host "✓ CPU: $cpuName" -ForegroundColor Green
    Write-Host "✓ Cores: $cpuCores" -ForegroundColor Green
}
catch {
    $cpuName = "Intel/AMD Processor"
    $cpuCores = 4
    $cpuFreq = 2500
    Write-Host "⚠ Using default CPU info" -ForegroundColor Yellow
}

try {
    # Detect RAM
    $computer = Get-WmiObject -Class Win32_ComputerSystem
    $ramGB = [math]::Round($computer.TotalPhysicalMemory / 1GB)
    Write-Host "✓ RAM: $ramGB GB" -ForegroundColor Green
}
catch {
    $ramGB = 16
    Write-Host "⚠ Using default RAM: 16 GB" -ForegroundColor Yellow
}

try {
    # Detect OS
    $os = Get-WmiObject -Class Win32_OperatingSystem
    $osName = $os.Caption.Trim()
    Write-Host "✓ OS: $osName" -ForegroundColor Green
}
catch {
    $osName = "Windows 11"
    Write-Host "⚠ Using default OS" -ForegroundColor Yellow
}

# Generate Device ID
try {
    $uuid = (Get-WmiObject -Class Win32_ComputerSystemProduct).UUID
    $cleanUuid = $uuid -replace "-", ""
    $deviceId = "0x" + $cleanUuid.Substring(0, 16)
}
catch {
    $randomId = Get-Random -Minimum 10000000 -Maximum 99999999
    $deviceId = "0x$randomId$randomId"
}

Write-Host "✓ Device ID: $deviceId" -ForegroundColor Green

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  SENDING TO DASHBOARD..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Create JSON payload
$body = @{
    deviceId = $deviceId
    username = $username
    specs = @{
        architecture = "amd64"
        cpu = $cpuName
        cpuCores = $cpuCores
        cpuFrequencyMHz = $cpuFreq
        ramGB = $ramGB
        os = "windows"
        osVersion = $osName
        capabilities = @("cpu_compute", "windows")
        maxJobRAM = "2gb"
    }
    status = @{
        cpuLoadPercent = 0
        ramUsedPercent = 0
        jobStatus = "idle"
        uptimeSeconds = 0
    }
} | ConvertTo-Json -Depth 3

Write-Host "API URL: http://localhost:3000/api/devices" -ForegroundColor Gray
Write-Host ""

# Send to API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/devices" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 15
    
    Write-Host "SUCCESS! Device registered." -ForegroundColor Green
    Write-Host ""
    Write-Host "Device ID: $deviceId" -ForegroundColor Cyan
    Write-Host "View at: http://localhost:3000/dashboard/device" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
catch {
    Write-Host "ERROR: Registration failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. Website is running: npm run dev" -ForegroundColor Yellow
    Write-Host "2. URL is correct: http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    pause
}
