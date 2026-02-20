"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Cpu,
  ArrowRight,
  Check,
  Copy,
  Download,
  Server,
  Monitor,
} from "lucide-react";

const platforms = [
  {
    id: "windows",
    name: "Windows",
    icon: Monitor,
    description: "Windows 10/11 Desktop App",
    filename: "runcor-agent-v24.exe",
    size: "~11 MB",
  },
  {
    id: "linux-amd64",
    name: "Linux x86_64",
    icon: Server,
    description: "Intel/AMD servers and desktops",
    filename: "runcor-agent-linux-amd64",
    size: "~12 MB",
  },
  {
    id: "linux-riscv64",
    name: "Linux RISC-V",
    icon: Cpu,
    description: "Milk-V, StarFive boards",
    filename: "runcor-agent-linux-riscv64",
    size: "~14 MB",
  },
  {
    id: "linux-arm64",
    name: "Linux ARM64",
    icon: Server,
    description: "Raspberry Pi, ARM servers",
    filename: "runcor-agent-linux-arm64",
    size: "~12 MB",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("linux-amd64");

  const installCommand = "curl -fsSL https://runcor.io/install.sh | bash";

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono text-cyan-400 mb-4">
          <Terminal className="w-3 h-3" />
          ONBOARDING TERMINAL
        </div>
        <h1 className="text-3xl font-bold mb-2">Install RunCor Agent</h1>
        <p className="text-gray-500">Download and install the agent to start earning</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold ${
                step >= s
                  ? "bg-cyan-500 text-black"
                  : "bg-gray-900 border border-gray-700 text-gray-500"
              }`}
            >
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 2 && (
              <div
                className={`w-16 h-0.5 ${
                  step > s ? "bg-cyan-500" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Download & Install */}
      {step === 1 && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Software Agent</h3>
              <p className="text-gray-500 text-sm">Deploy on GPU servers, CPU clusters, and cloud instances</p>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <li className="flex items-center gap-2 text-gray-400">
              <Check className="w-4 h-4 text-cyan-400" /> Single binary install
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <Check className="w-4 h-4 text-cyan-400" /> Auto-discovery of specs
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <Check className="w-4 h-4 text-cyan-400" /> 24/7 background operation
            </li>
          </ul>

          {/* Platform Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedPlatform === platform.id
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-gray-800 bg-white/5 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    {selectedPlatform === platform.id && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <p className="font-medium text-sm">{platform.name}</p>
                  <p className="text-xs text-gray-500">{platform.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{platform.size}</p>
                </button>
              );
            })}
          </div>

          {/* Download Button */}
          <a
            href={`/downloads/${platforms.find(p => p.id === selectedPlatform)?.filename}`}
            download
            className="btn-pill w-full justify-center bg-cyan-500 hover:bg-cyan-400 text-black border-none"
          >
            <Download className="w-4 h-4" />
            Download {platforms.find(p => p.id === selectedPlatform)?.name} Agent
          </a>

          {/* Quick Install */}
          <div className="p-4 rounded-lg bg-black border border-gray-800">
            <p className="text-xs text-gray-500 mb-2">Or use Quick Install (Linux/macOS):</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-gray-300 font-mono break-all">{installCommand}</code>
              <button
                onClick={() => copyCommand(installCommand)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Device Profile */}
      {step === 2 && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Installation Complete</h3>
              <p className="text-gray-500 text-sm">Your agent is now running and registering with the network</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Device ID</span>
              <span className="font-mono text-sm">DEV-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Platform</span>
              <span className="text-sm capitalize">{platforms.find(p => p.id === selectedPlatform)?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-400">Online</span>
              </div>
            </div>
          </div>

          <Link href="/dashboard/device" className="btn-pill w-full justify-center">
            Go to Device Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="btn-pill-secondary"
          >
            Back
          </button>
        )}
        {step < 2 && (
          <button
            onClick={() => setStep(step + 1)}
            className="btn-pill ml-auto"
          >
            I&apos;ve Installed the Agent
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
