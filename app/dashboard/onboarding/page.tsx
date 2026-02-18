"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Cpu,
  Box,
  ArrowRight,
  Check,
  Copy,
  Download,
  Shield,
  Thermometer,
  Activity,
  Server,
  FileCode,
  Monitor,
  Rocket,
} from "lucide-react";

const platforms = [
  {
    id: "windows",
    name: "Windows",
    icon: Monitor,
    description: "Windows 10/11 Desktop App",
    filename: "runcor-agent-v17.exe",
    size: "~15 MB",
    isGUI: true,
  },
  {
    id: "linux-amd64",
    name: "Linux x86_64",
    icon: Server,
    description: "Intel/AMD servers and desktops",
    filename: "runcor-agent-linux-amd64",
    size: "~15 MB",
    isGUI: false,
  },
  {
    id: "linux-riscv64",
    name: "Linux RISC-V",
    icon: Cpu,
    description: "Milk-V, StarFive boards",
    filename: "runcor-agent-linux-riscv64",
    size: "~18 MB",
    isGUI: false,
  },
  {
    id: "linux-arm64",
    name: "Linux ARM64",
    icon: Server,
    description: "Raspberry Pi, ARM servers",
    filename: "runcor-agent-linux-arm64",
    size: "~15 MB",
    isGUI: false,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<"software" | "hardware" | null>(null);
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("linux-amd64");

  const installCommand = "curl -fsSL https://runcor.io/install.sh | bash";
  const manualCommand = `wget https://runcor.io/downloads/${platforms.find(p => p.id === selectedPlatform)?.filename}
chmod +x runcor-agent-*
sudo mv runcor-agent-* /usr/local/bin/runcor-agent`;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToInstall = () => {
    router.push("/install");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono text-cyan-400 mb-4">
          <Terminal className="w-3 h-3" />
          ONBOARDING TERMINAL
        </div>
        <h1 className="text-3xl font-bold mb-2">Initialize Your Asset</h1>
        <p className="text-gray-500">Choose your deployment path to begin autonomous operation</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
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
            {s < 3 && (
              <div
                className={`w-16 h-0.5 ${
                  step > s ? "bg-cyan-500" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Path Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Software Path */}
          <button
            onClick={() => setSelectedPath("software")}
            className={`card p-8 text-left transition-all ${
              selectedPath === "software"
                ? "border-cyan-500/50 bg-cyan-500/5"
                : "hover:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-cyan-400" />
              </div>
              {selectedPath === "software" && (
                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">Software Agent</h3>
            <p className="text-gray-400 text-sm mb-4">
              Deploy on GPU servers, CPU clusters, and cloud instances. Lightweight binary with container sandboxing.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" /> Single binary install
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" /> Auto-discovery of specs
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" /> 24/7 background operation
              </li>
            </ul>
          </button>

          {/* Hardware Path */}
          <button
            onClick={() => setSelectedPath("hardware")}
            className={`card p-8 text-left transition-all ${
              selectedPath === "hardware"
                ? "border-amber-500/50 bg-amber-500/5"
                : "hover:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Box className="w-8 h-8 text-amber-400" />
              </div>
              {selectedPath === "hardware" && (
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">Hardware Module</h3>
            <p className="text-gray-400 text-sm mb-4">
              Physical bridge for CNC, 3D printers, and robotics. Translates platform commands to machine protocols.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" /> USB/Serial/GPIO connect
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" /> Safety interlocks built-in
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" /> $25-50 BOM cost
              </li>
            </ul>
          </button>
        </div>
      )}

      {/* Step 2: Installation */}
      {step === 2 && selectedPath === "software" && (
        <div className="space-y-6">
          {/* Web Installer CTA */}
          <div className="card p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Web-Based Installer</h3>
                <p className="text-gray-400">
                  The easiest way to get started. We&apos;ll detect your system specs, 
                  download the right agent, and register your device automatically.
                </p>
              </div>
              <button
                onClick={goToInstall}
                className="btn-pill bg-cyan-500 hover:bg-cyan-400 text-black border-none whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Start Installation
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-black text-sm text-gray-500">Or manual installation</span>
            </div>
          </div>

          {/* Manual Download Section */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Manual Installation</h3>
                <p className="text-gray-500 text-sm">Download and install the agent yourself</p>
              </div>
            </div>

            {/* Platform Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              className="btn-pill w-full justify-center"
            >
              <Download className="w-4 h-4" />
              Download {platforms.find(p => p.id === selectedPlatform)?.name} Agent
            </a>

            {/* Quick Install */}
            <div className="p-4 rounded-lg bg-black border border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Quick Install Command:</p>
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
        </div>
      )}

      {step === 2 && selectedPath === "hardware" && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Box className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Order Hardware Module</h3>
              <p className="text-gray-500 text-sm">Join the waitlist for the RunCor Bridge Module</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
            <p className="text-amber-400 font-bold text-lg mb-2">Development Kit Coming Soon</p>
            <p className="text-gray-400 text-sm">
              Hardware modules are currently in beta testing. Join the waitlist to receive updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <Thermometer className="w-5 h-5 text-gray-400 mb-2" />
              <p className="text-sm font-medium">Temperature Monitoring</p>
              <p className="text-xs text-gray-500">Auto-shutdown on overheat</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <Shield className="w-5 h-5 text-gray-400 mb-2" />
              <p className="text-sm font-medium">Emergency Stop</p>
              <p className="text-xs text-gray-500">Hardware + software interlock</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Device Profile */}
      {step === 3 && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Device Profile Created</h3>
              <p className="text-gray-500 text-sm">Your device is now being registered on the network</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Device ID</span>
              <span className="font-mono text-sm">DEV-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Type</span>
              <span className="text-sm capitalize">{selectedPath}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm">Verifying</span>
              </div>
            </div>
          </div>

          <Link href="/dashboard" className="btn-pill w-full justify-center">
            Go to Fleet Command
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
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !selectedPath}
            className="btn-pill ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
