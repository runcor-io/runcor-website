"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Download,
  Check,
  Copy,
  Terminal,
  Monitor,
  ChevronLeft,
  Server,
  ArrowRight,
} from "lucide-react";

const platforms = [
  {
    id: "windows",
    name: "Windows",
    icon: Monitor,
    description: "Windows 10/11 Desktop App",
    filename: "runcor-agent-v32.exe",
    size: "~11 MB",
    features: ["Double-click to run", "System tray icon", "Auto-start on boot"],
  },
  {
    id: "linux-amd64",
    name: "Linux x86_64",
    icon: Server,
    description: "Intel/AMD servers and desktops",
    filename: "runcor-agent-linux-amd64",
    size: "~12 MB",
    features: ["Single binary", "Systemd service", "Docker ready"],
  },
  {
    id: "linux-riscv64",
    name: "Linux RISC-V",
    icon: Cpu,
    description: "Milk-V, StarFive boards",
    filename: "runcor-agent-linux-riscv64",
    size: "~14 MB",
    features: ["Embedded ready", "Low power", "Edge computing"],
  },
  {
    id: "linux-arm64",
    name: "Linux ARM64",
    icon: Server,
    description: "Raspberry Pi, ARM servers",
    filename: "runcor-agent-linux-arm64",
    size: "~12 MB",
    features: ["Pi optimized", "ARM servers", "IoT devices"],
  },
];

export default function InstallAgent() {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("windows");

  const installCommand = "curl -fsSL https://runcor.io/install.sh | bash";
  const windowsCommand = `wget https://runcor.io/downloads/${platforms.find(p => p.id === selectedPlatform)?.filename} -OutFile runcor-agent.exe
.\runcor-agent.exe`;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platform = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen py-12 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 machine-visual">
        <div className="machine-grid" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
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
            MANUAL INSTALLATION
          </div>
          <h1 className="text-4xl font-bold mb-4">Install RunCor Agent</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Download the agent for your platform. Run it to register your device and start earning RUN tokens.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Selection */}
          <div className="card p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              Select Platform
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPlatform === p.id
                        ? "border-cyan-500/50 bg-cyan-500/10"
                        : "border-gray-800 bg-white/5 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-5 h-5 text-cyan-400" />
                      {selectedPlatform === p.id && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.description}</p>
                    <p className="text-xs text-gray-600 mt-1">{p.size}</p>
                  </button>
                );
              })}
            </div>

            <a
              href={`/downloads/${platform?.filename}`}
              download
              className="btn-pill w-full justify-center bg-cyan-500 hover:bg-cyan-400 text-black border-none"
            >
              <Download className="w-4 h-4" />
              Download {platform?.name} Agent
            </a>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            {/* Quick Install */}
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Quick Install
              </h3>
              
              {selectedPlatform === "windows" ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Run in PowerShell:</p>
                  <div className="p-3 rounded-lg bg-black border border-gray-800">
                    <code className="text-sm text-gray-300 font-mono block whitespace-pre-wrap">{windowsCommand}</code>
                  </div>
                  <button
                    onClick={() => copyCommand(windowsCommand)}
                    className="btn-pill-secondary w-full justify-center text-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    Copy Command
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Run in Terminal:</p>
                  <div className="p-3 rounded-lg bg-black border border-gray-800 flex items-center gap-2">
                    <code className="flex-1 text-sm text-gray-300 font-mono">{installCommand}</code>
                    <button
                      onClick={() => copyCommand(installCommand)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">What the agent does:</h3>
              <ul className="space-y-3">
                {platform?.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  Detects full hardware specs (CPU, GPU, RAM)
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  Registers your device automatically
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  Accepts matching jobs automatically
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  Earns RUN tokens 24/7
                </li>
              </ul>
            </div>

            {/* Manual Steps */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">Manual Steps:</h3>
              <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                <li>Download the agent for your platform</li>
                <li>Run the executable (Windows) or make it executable (Linux)</li>
                <li>Enter your RunCor username when prompted</li>
                <li>The agent will register and start automatically</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link href="/dashboard/device" className="btn-pill">
            Go to Device Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
