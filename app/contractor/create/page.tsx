"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Box,
  ArrowRight,
  ArrowLeft,
  Upload,
  Zap,
  Clock,
  DollarSign,
  Shield,
  Check,
  Terminal,
  HardDrive,
  Layers,
} from "lucide-react";

const computeTemplates = [
  { id: "blender", name: "Blender Render", icon: Layers, vram: "8GB+", time: "1-4h" },
  { id: "llm", name: "LLM Fine-tuning", icon: Terminal, vram: "24GB+", time: "6-12h" },
  { id: "batch", name: "Batch Processing", icon: HardDrive, vram: "4GB+", time: "30m-2h" },
];

export default function JobCreation() {
  const [step, setStep] = useState(1);
  const [jobType, setJobType] = useState<"compute" | "physical" | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [specs, setSpecs] = useState({ vram: 8, cores: 4, duration: 2 });
  const [budget, setBudget] = useState(0.04);

  const estimatedMatch = 94;
  const estimatedTime = "2h 15m";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-mono text-amber-400 mb-4">
          <Terminal className="w-3 h-3" />
          MISSION BRIEFING
        </div>
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-500">Define specifications and commission autonomous execution</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[
          { num: 1, label: "Path" },
          { num: 2, label: "Specs" },
          { num: 3, label: "Budget" },
          { num: 4, label: "Deploy" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold ${
                  step >= s.num
                    ? "bg-amber-500 text-black"
                    : "bg-gray-900 border border-gray-700 text-gray-500"
                }`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-xs mt-1 ${step >= s.num ? "text-amber-400" : "text-gray-500"}`}>
                {s.label}
              </span>
            </div>
            {i < 3 && (
              <div className={`w-12 h-0.5 ${step > s.num ? "bg-amber-500" : "bg-gray-800"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Path Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setJobType("compute")}
            className={`card p-8 text-left transition-all ${
              jobType === "compute"
                ? "border-cyan-500/50 bg-cyan-500/5"
                : "hover:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-cyan-400" />
              </div>
              {jobType === "compute" && (
                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">Compute Job</h3>
            <p className="text-gray-400 text-sm mb-4">
              Digital workloads: AI training, rendering, batch processing, simulations.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" /> Containerized execution
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" /> Deterministic verification
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" /> Instant result delivery
              </li>
            </ul>
          </button>

          <button
            onClick={() => setJobType("physical")}
            className={`card p-8 text-left transition-all ${
              jobType === "physical"
                ? "border-amber-500/50 bg-amber-500/5"
                : "hover:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Box className="w-8 h-8 text-amber-400" />
              </div>
              {jobType === "physical" && (
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">Physical Job</h3>
            <p className="text-gray-400 text-sm mb-4">
              Real-world manufacturing: 3D printing, CNC machining, drone operations.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" /> Photo/video verification
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" /> Telemetry audit trail
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" /> Physical delivery option
              </li>
            </ul>
          </button>
        </div>
      )}

      {/* Step 2: Specifications */}
      {step === 2 && jobType === "compute" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Select Template</h3>
            <div className="grid grid-cols-3 gap-4">
              {computeTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedTemplate === template.id
                        ? "border-cyan-500/50 bg-cyan-500/10"
                        : "border-gray-800 bg-white/5 hover:border-gray-600"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-cyan-400 mb-3" />
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{template.vram} • {template.time}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-6">Resource Requirements</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">VRAM Required</span>
                  <span className="font-mono text-cyan-400">{specs.vram} GB</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="48"
                  step="4"
                  value={specs.vram}
                  onChange={(e) => setSpecs({ ...specs, vram: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>4GB</span>
                  <span>48GB</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">CPU Cores</span>
                  <span className="font-mono text-cyan-400">{specs.cores}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="64"
                  step="2"
                  value={specs.cores}
                  onChange={(e) => setSpecs({ ...specs, cores: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Max Duration</span>
                  <span className="font-mono text-cyan-400">{specs.duration}h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={specs.duration}
                  onChange={(e) => setSpecs({ ...specs, duration: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Upload Assets</h3>
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-2">Drop files here or click to browse</p>
              <p className="text-xs text-gray-600">Docker images, Python scripts, datasets (max 10GB)</p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && jobType === "physical" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Upload Design Files</h3>
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-2">Drop STL, STEP, or G-code files</p>
              <p className="text-xs text-gray-600">Auto-analysis will estimate volume and print time</p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Material Selection</h3>
            <div className="grid grid-cols-3 gap-3">
              {["PLA", "PETG", "ABS", "Nylon", "Resin", "Aluminum"].map((mat) => (
                <button
                  key={mat}
                  className="p-3 rounded-lg border border-gray-800 hover:border-amber-500/50 transition-all text-sm"
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Budget & Matching */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold mb-6">Budget Allocation</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Budget</span>
                  <span className="font-mono text-amber-400">{budget.toFixed(3)} ETH</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.001"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Price Oracle Suggestion</span>
              </div>
              <p className="text-sm text-gray-400">
                Based on current network demand, similar jobs are completing at <span className="text-white font-mono">0.038 ETH</span>.
                Your budget is <span className="text-green-400">{budget >= 0.038 ? "competitive" : "below average"}</span>.
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Smart Matching Preview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Device Match</span>
                </div>
                <p className="text-2xl font-bold">{estimatedMatch}%</p>
                <p className="text-xs text-gray-500">12 devices available now</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-400">Est. Completion</span>
                </div>
                <p className="text-2xl font-bold">{estimatedTime}</p>
                <p className="text-xs text-gray-500">includes verification</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Escrow Terms</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">Release on verification</span>
                </div>
                <span className="text-sm font-mono">50%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">Release after 24h grace</span>
                </div>
                <span className="text-sm font-mono">50%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Deploy */}
      {step === 4 && (
        <div className="card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Ready to Deploy</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Your job will be posted to the network with {budget.toFixed(3)} ETH in escrow.
            Funds will be locked in the smart contract until verification is complete.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contractor/tracking" className="btn-pill bg-amber-500 hover:bg-amber-400 text-black border-none justify-center">
              <Shield className="w-4 h-4" />
              Lock Funds & Deploy
            </Link>
            <button className="btn-pill-secondary justify-center">
              Save as Draft
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="btn-pill-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {step < 4 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !jobType}
            className="btn-pill ml-auto disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 text-black border-none"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
