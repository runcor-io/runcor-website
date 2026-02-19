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
    // Try to get username from localStorage (legacy) or use default
    // In production, this would use the session
    const userStr = localStorage.getItem("runcor_current_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username || user);
      } catch {
        setUsername(userStr);
      }
    }
    // Also check for next-auth session cookie (simplified check)
    const hasSession = document.cookie.includes("next-auth");
    if (hasSession && username === "") {
      // Will be handled by session context in future updates
    }

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
    // Download the actual PowerShell script from the server
    const a = document.createElement("a");
    a.href = "/downloads/runcor-register.ps1";
    a.download = "runcor-register.ps1";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Option 1: Standalone Windows App */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/30 flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">Windows App</h3>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">Best</span>
                      </div>
                      <p className="text-sm text-gray-400">Professional GUI app, no setup</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Double-click to run</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Beautiful dark UI</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>No Python required</span>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-400">
                      <strong>Standalone:</strong> Just download and run!
                    </p>
                  </div>

                  <a
                    href="/downloads/runcor-agent-v19.exe"
                    download
                    className="w-full btn-pill bg-cyan-500 hover:bg-cyan-400 text-black border-none justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download Agent (.exe)
                  </a>

                  <p className="text-xs text-gray-500 mt-3">
                    ~12 MB • Windows 10/11 • No installation needed
                  </p>
                </div>

                {/* Option 2: Easy Installer (Python Required) */}
                <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">Easy Installer</h3>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">Alt</span>
                      </div>
                      <p className="text-sm text-gray-400">Quick setup for HP Omen & Windows PCs</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>One-click download & run</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Auto-detects hardware specs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Built-in username login</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-400">
                      <strong>Requires:</strong> Python 3.8+
                    </p>
                  </div>

                  <a
                    href="/downloads/install-runcor.bat"
                    download
                    className="w-full btn-pill bg-white/10 hover:bg-white/20 text-white border border-white/20 justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download (.bat)
                  </a>

                  <p className="text-xs text-gray-500 mt-3">
                    Double-click to run installer script.
                  </p>
                </div>

                {/* Option 3: Standalone Python Script */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <Server className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Standalone Python</h3>
                      <p className="text-sm text-gray-400">No dependencies, works anywhere</p>
                    </div>
                  </div>

                  <ol className="text-sm text-gray-400 space-y-2 mb-4 list-decimal list-inside">
                    <li>Download the Python script</li>
                    <li>Open Command Prompt or Terminal</li>
                    <li>Navigate to Downloads folder</li>
                    <li>Run: <code className="text-cyan-400">python runcor-agent-windows.py</code></li>
                  </ol>

                  <div className="bg-black rounded-lg p-3 font-mono text-xs mb-4">
                    <code className="text-gray-300">
                      cd Downloads<br/>
                      python runcor-agent-windows.py
                    </code>
                  </div>

                  <a
                    href="/downloads/runcor-agent-windows.py"
                    download
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Download Python Script
                    <Download className="w-3 h-3" />
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
                  The PowerShell script has been downloaded. Run it to detect your HP Omen specs 
                  and automatically register with the dashboard.
                </p>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8 text-left max-w-lg mx-auto">
                  <h3 className="font-medium mb-3">Next steps:</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    <strong>Option A (Easiest):</strong> Run the .bat file
                  </p>
                  <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside mb-4">
                    <li>Open your Downloads folder</li>
                    <li>Double-click <strong>install-runcor.bat</strong></li>
                    <li>Follow the prompts to enter your username</li>
                    <li>Your HP Omen specs will appear in the dashboard!</li>
                  </ol>
                  
                  <p className="text-sm text-gray-400 mb-3">
                    <strong>Option B:</strong> Run Python directly
                  </p>
                  <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                    <li>Open Command Prompt</li>
                    <li><code className="text-cyan-400">cd Downloads</code></li>
                    <li><code className="text-cyan-400">python runcor-agent-windows.py</code></li>
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
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Test with Browser Data"}
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
