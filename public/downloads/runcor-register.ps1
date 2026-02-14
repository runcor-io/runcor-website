# RunCor Agent Registration Script for Windows
# This script detects hardware and registers with the RunCor dashboard

param(
    [string]$Username = "",
    [string]$ApiUrl = "http://localhost:3000",
    [switch]$Silent
)

$ErrorActionPreference = "Stop"

# Colors
$Green = "`e[32m"
$Cyan = "`e[36m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Reset = "`e[0m"

function Write-Header {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║           RUNCOR AGENT - WINDOWS REGISTRATION                ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Get-Username {
    if ($Username) { return $Username }
    
    Write-Host "Enter your RunCor username: " -NoNewline -ForegroundColor Yellow
    $input = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($input)) {
        Write-Host "ERROR: Username is required" -ForegroundColor Red
        exit 1
    }
    
    return $input
}

function Get-CPUInfo {
    Write-Host "[1/4] Detecting CPU..." -NoNewline
    
    try {
        $cpu = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
        $info = @{
            Name = $cpu.Name.Trim()
            Cores = $cpu.NumberOfCores
            Threads = $cpu.NumberOfLogicalProcessors
            Frequency = [math]::Round($cpu.MaxClockSpeed)
        }
        Write-Host " OK" -ForegroundColor Green
        return $info
    }
    catch {
        Write-Host " Using defaults" -ForegroundColor Yellow
        return @{
            Name = "Intel/AMD Processor"
            Cores = 4
            Threads = 8
            Frequency = 2500
        }
    }
}

function Get-RAMInfo {
    Write-Host "[2/4] Detecting RAM..." -NoNewline
    
    try {
        $computer = Get-CimInstance -ClassName Win32_ComputerSystem
        $totalGB = [math]::Round($computer.TotalPhysicalMemory / 1GB)
        Write-Host " OK" -ForegroundColor Green
        return $totalGB
    }
    catch {
        Write-Host " Using defaults" -ForegroundColor Yellow
        return 16
    }
}

function Get-OSInfo {
    Write-Host "[3/4] Detecting OS..." -NoNewline
    
    try {
        $os = Get-CimInstance -ClassName Win32_OperatingSystem
        $info = "$($os.Caption.Trim()) $($os.Version)"
        Write-Host " OK" -ForegroundColor Green
        return $info
    }
    catch {
        Write-Host " Using defaults" -ForegroundColor Yellow
        return "Windows 11"
    }
}

function Get-GPUInfo {
    Write-Host "[4/4] Detecting GPU..." -NoNewline
    
    try {
        $gpu = Get-CimInstance -ClassName Win32_VideoController | Select-Object -First 1
        $name = $gpu.Name.Trim()
        Write-Host " OK" -ForegroundColor Green
        return $name
    }
    catch {
        Write-Host " None detected" -ForegroundColor Yellow
        return "None detected"
    }
}

function Get-DeviceID {
    try {
        $uuid = (Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID
        $clean = $uuid -replace "-", ""
        return "0x$($clean.Substring(0, 16))"
    }
    catch {
        $random = Get-Random -Minimum 10000000 -Maximum 99999999
        return "0x$random$random"
    }
}

function Register-Device {
    param(
        [string]$User,
        [hashtable]$Specs,
        [string]$DeviceId
    )
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   SENDING REGISTRATION TO RUN COR..." -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $payload = @{
        deviceId = $DeviceId
        username = $User
        specs = @{
            architecture = "amd64"
            cpu = $Specs.CPU.Name
            cpuCores = $Specs.CPU.Cores
            cpuFrequencyMHz = $Specs.CPU.Frequency
            ramGB = $Specs.RAM
            gpu = $null
            os = "windows"
            osVersion = $Specs.OS
            capabilities = @("cpu_compute", "windows")
            maxJobRAM = "$($Specs.RAM - 4)gb"
        }
        status = @{
            cpuLoadPercent = 0
            ramUsedPercent = 0
            jobStatus = "idle"
            uptimeSeconds = 0
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $uri = "$ApiUrl/api/devices"
        Write-Host "Sending to: $uri"
        
        $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "application/json" -Body $payload -TimeoutSec 10
        
        Write-Host ""
        Write-Host "SUCCESS: Device registered!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Device ID: " -NoNewline
        Write-Host $DeviceId -ForegroundColor Cyan
        Write-Host "View at: " -NoNewline
        Write-Host "$ApiUrl/dashboard/device" -ForegroundColor Cyan
        Write-Host ""
        
        return $true
    }
    catch {
        Write-Host ""
        Write-Host "ERROR: Registration failed" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "1. Make sure the website is running: npm run dev"
        Write-Host "2. Check that $ApiUrl is accessible"
        Write-Host "3. Check Windows Firewall settings"
        Write-Host ""
        return $false
    }
}

# Main execution
Write-Header

# Get username
$user = Get-Username

# Detect hardware
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   DETECTING HARDWARE SPECIFICATIONS..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$cpuInfo = Get-CPUInfo
$ramGB = Get-RAMInfo
$osInfo = Get-OSInfo
$gpuInfo = Get-GPUInfo
$deviceId = Get-DeviceID

# Display results
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   DETECTION RESULTS:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ CPU: $($cpuInfo.Name)"
Write-Host "✓ Cores: $($cpuInfo.Cores) physical / $($cpuInfo.Threads) logical"
Write-Host "✓ Frequency: $($cpuInfo.Frequency) MHz"
Write-Host "✓ RAM: $ramGB GB"
Write-Host "✓ OS: $osInfo"
Write-Host "✓ GPU: $gpuInfo"
Write-Host "✓ Device ID: $deviceId"
Write-Host ""

# Confirm
if (-not $Silent) {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   REGISTER WITH RUNCOR?" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This will send your hardware specs to:"
    Write-Host "$ApiUrl/api/devices"
    Write-Host ""
    
    $confirm = Read-Host "Register this device? (Y/N)"
    
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host ""
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Register
$specs = @{
    CPU = $cpuInfo
    RAM = $ramGB
    OS = $osInfo
}

$success = Register-Device -User $user -Specs $specs -DeviceId $deviceId

if (-not $Silent) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   PRESS ANY KEY TO EXIT" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

exit ($success ? 0 : 1)
