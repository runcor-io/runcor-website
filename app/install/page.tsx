"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cpu,
  Download,
  Check,
  Copy,
  Terminal,
  RefreshCw,
  Monitor,
  HardDrive,
  Globe,
  ArrowRight,
  ChevronLeft,
  Server,
  Activity,
} from "lucide-react";

interface SystemInfo {
  platform: string;
  cores: number;
  ram: number;
  userAgent: string;
  language: string;
  screen: string;
}

export default function InstallAgent() {
  const [step, setStep] = useState<"detect" | "download" | "register">("detect");
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [username, setUsername] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get current user
    const user = localStorage.getItem("runcor_current_user");
    if (user) setUsername(user);

    // Detect system info
    detectSystem();
  }, []);

  const detectSystem = () => {
    const info: SystemInfo = {
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency || 0,
      ram: (navigator as any).deviceMemory || 0,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
    };
    setSystemInfo(info);
    
    // Generate a device ID based on browser fingerprint
    const fingerprint = btoa(info.userAgent + info.platform).substring(0, 16);
    setDeviceId(`0x${fingerprint}`);
  };

  const downloadAgent = () => {
    // Create a PowerShell script for Windows
    const psScript = `@echo off
echo ==========================================
echo   RUNCOR AGENT INSTALLER
echo ==========================================
echo.
echo Detecting system specs...
echo.

REM Get CPU Info
for /f "tokens=2 delims==" %%a in ('wmic cpu get Name /value ^| find "="') do set CPU=%%a
for /f "tokens=2 delims==" %%a in ('wmic cpu get NumberOfCores /value ^| find "="') do set CORES=%%a

REM Get RAM Info
for /f "tokens=2 delims==" %%a in ('wmic computersystem get TotalPhysicalMemory /value ^| find "="') do set RAM_BYTES=%%a
set /a RAM_GB=%RAM_BYTES:~0,-9%

REM Get OS Info
for /f "tokens=2 delims==" %%a in ('wmic os get Caption /value ^| find "="') do set OS=%%a

echo CPU: %CPU%
echo Cores: %CORES%
echo RAM: %RAM_GB% GB
echo OS: %OS%
echo.
echo Device ID: ${deviceId}
echo.
echo Registering with RunCor...
echo.

REM Send to API
powershell -Command "
\$specs = @{ 
    deviceId='${deviceId}'; 
    username='${username || 'unknown'}'; 
    specs=@{ 
        architecture='amd64'; 
        cpu='\$env:CPU'.Trim(); 
        cpuCores=[int]'\$env:CORES'; 
        ramGB=[int]'\$env:RAM_GB'; 
        os='windows'; 
        osVersion='\$env:OS'.Trim();
        capabilities=@('cpu_compute', 'windows', 'browser_registered');
        maxJobRAM='2gb'
    }; 
    status=@{ 
        cpuLoadPercent=0; 
        ramUsedPercent=0; 
        jobStatus='idle'; 
        uptimeSeconds=0 
    }
} | ConvertTo-Json -Depth 10 |
Invoke-RestMethod -Uri 'http://localhost:3000/api/devices' -Method POST -ContentType 'application/json' -Body \$_
"

echo.
echo ==========================================
echo   REGISTRATION COMPLETE!
echo ==========================================
echo.
echo Your device has been registered.
echo View it at: http://localhost:3000/dashboard/device
echo.
pause
`;

    const blob = new Blob([psScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "runcor-register.bat";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStep("register");
  };

  const registerViaAPI = async () => {
    setLoading(true);
    try {
      // For demo: register with browser-detected info
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          username: username || "web-user",
          specs: {
            architecture: "amd64",
            cpu: systemInfo?.platform || "Unknown",
            cpuCores: systemInfo?.cores || 4,
            cpuFrequencyMHz: 2500,
            ramGB: systemInfo?.ram || 16,
            os: "windows",
            osVersion: "Web Browser",
            capabilities: ["cpu_compute", "windows", "web_detected"],
            maxJobRAM: "2gb",
          },
          status: {
            cpuLoadPercent: 0,
            ramUsedPercent: 0,
            jobStatus: "idle",
            uptimeSeconds: 0,
          },
        }),
      });

      if (response.ok) {
        setRegistered(true);
        setTimeout(() => {
          router.push("/dashboard/device");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 machine-visual">
        <div className="machine-grid" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono text-cyan-400 mb-4">
            <Download className="w-3 h-3" />
            SOFTWARE AGENT INSTALLER
          </div>
          <h1 className="text-4xl font-bold mb-4">Install RunCor Agent</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Connect your computer to the RunCor network and start earning. 
            The agent runs in the background and automatically accepts jobs matching your hardware.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[
            { id: "detect", label: "System Detect", icon: Activity },
            { id: "download", label: "Download", icon: Download },
            { id: "register", label: "Register", icon: Check },
          ].map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id || (s.id === "detect" && step !== "detect") || (s.id === "download" && step === "register");
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex flex-col items-center ${isActive ? "text-cyan-400" : "text-gray-600"}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isActive ? "border-cyan-400 bg-cyan-500/10" : "border-gray-700 bg-gray-900"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 font-medium">{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-24 h-0.5 mx-2 ${isActive ? "bg-cyan-500/50" : "bg-gray-800"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: System Detection */}
        {step === "detect" && systemInfo && (
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cyan-400" />
              System Detection Results
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 uppercase mb-1">Platform</p>
                <p className="font-medium">{systemInfo.platform}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 uppercase mb-1">CPU Cores</p>
                <p className="font-medium">{systemInfo.cores}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 uppercase mb-1">RAM (Est.)</p>
                <p className="font-medium">{systemInfo.ram > 0 ? `${systemInfo.ram} GB` : "Unknown"}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 uppercase mb-1">Screen</p>
                <p className="font-medium">{systemInfo.screen}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-8">
              <p className="text-sm text-amber-400">
                <strong>Note:</strong> Browser detection provides limited information. 
                For full hardware detection (GPU, exact CPU model, temperature), 
                download and run the native agent below.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("download")}
                className="flex-1 btn-pill justify-center"
              >
                Continue to Download
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={registerViaAPI}
                disabled={loading}
                className="btn-pill-secondary"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Quick Web Register"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Download */}
        {step === "download" && (
          <div className="space-y-6">
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-6">Download Software Agent</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Windows Download */}
                <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Server className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Windows Installer</h3>
                      <p className="text-sm text-gray-400">Full hardware detection</p>
                    </div>
                  </div>

                  <div className="bg-black rounded-lg p-3 font-mono text-xs mb-4 overflow-x-auto">
                    <code className="text-gray-300">
                      curl -fsSL https://runcor.io/install.sh | bash
                    </code>
                  </div>

                  <button
                    onClick={downloadAgent}
                    className="w-full btn-pill bg-cyan-500 hover:bg-cyan-400 text-black border-none justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download for Windows
                  </button>

                  <p className="text-xs text-gray-500 mt-3">
                    Or run the one-liner in PowerShell
                  </p>
                </div>

                {/* Manual Setup */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Manual Setup</h3>
                      <p className="text-sm text-gray-400">Build from source</p>
                    </div>
                  </div>

                  <ol className="text-sm text-gray-400 space-y-2 mb-4 list-decimal list-inside">
                    <li>Install Go 1.21+</li>
                    <li>Clone: <code className="text-cyan-400">git clone https://github.com/runcor/runcor-agent</code></li>
                    <li>Build: <code className="text-cyan-400">go build ./cmd/agent</code></li>
                    <li>Run: <code className="text-cyan-400">./agent --register</code></li>
                  </ol>

                  <a
                    href="https://github.com/runcor/runcor-agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View on GitHub
                    <Globe className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5">
                <h4 className="font-medium mb-2">What the agent does:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Detects full hardware specs (CPU, GPU, RAM)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Registers your device with your account
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Runs in background, accepts matching jobs automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Sends heartbeat every 30 seconds
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Register */}
        {step === "register" && (
          <div className="card p-8 text-center">
            {!registered ? (
              <>
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                  <Download className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Download Complete!</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  The installer has been downloaded. Run the <code className="text-cyan-400">runcor-register.bat</code> file 
                  to complete registration and send your specs to the dashboard.
                </p>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8 text-left max-w-lg mx-auto">
                  <h3 className="font-medium mb-3">Next steps:</h3>
                  <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                    <li>Open your Downloads folder</li>
                    <li>Double-click <strong>runcor-register.bat</strong></li>
                    <li>Wait for the script to detect your hardware</li>
                    <li>Your device will appear in the dashboard automatically!</li>
                  </ol>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push("/dashboard/device")}
                    className="btn-pill"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={registerViaAPI}
                    disabled={loading}
                    className="btn-pill-secondary"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Simulate Registration"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Registration Complete!</h2>
                <p className="text-gray-400 mb-8">
                  Your device <code className="text-cyan-400">{deviceId}</code> has been registered.
                </p>
                <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
