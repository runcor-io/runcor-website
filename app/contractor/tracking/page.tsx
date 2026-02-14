"use client";

import { useState } from "react";
import {
  Activity,
  Clock,
  Pause,
  XCircle,
  Terminal,
  Cpu,
  Thermometer,
  HardDrive,
  Shield,
  CheckCircle,
  AlertTriangle,
  Zap,
  ChevronRight,
} from "lucide-react";

const projectStages = [
  { name: "Escrow Locked", status: "complete", time: "2h ago" },
  { name: "Device Matched", status: "complete", time: "1h 58m ago" },
  { name: "Executing", status: "active", time: "In progress" },
  { name: "Verification", status: "pending", time: "Pending" },
  { name: "Complete", status: "pending", time: "Pending" },
];

const telemetry = {
  cpu: 78,
  gpu: 87,
  vram: 64,
  temp: 72,
};

const logs = [
  "[16:22:01] Container initialized",
  "[16:22:05] GPU memory allocated: 8GB",
  "[16:22:08] Model loaded: blender-render-v3",
  "[16:22:15] Rendering frame 1-120",
  "[16:23:01] Progress: 34%",
  "[16:24:30] Progress: 67%",
  "[16:25:45] Progress: 89%",
];

export default function ActiveOperations() {
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">PRJ-4521: Blender Render Batch</h1>
            <span className="px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400">
              Executing
            </span>
          </div>
          <p className="text-gray-500 text-sm">Device: RTX 4090 Server • DEV-001</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-pill-secondary">
            <Pause className="w-4 h-4" />
            Pause
          </button>
          <button
            onClick={() => setShowCancel(true)}
            className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-medium text-sm hover:bg-red-500/30 transition-all flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      {/* Progress Pipeline */}
      <div className="card p-6">
        <h3 className="font-bold mb-6">Mission Timeline</h3>
        <div className="flex items-center">
          {projectStages.map((stage, i) => (
            <div key={stage.name} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stage.status === "complete"
                      ? "bg-green-500/20 border border-green-500/50"
                      : stage.status === "active"
                      ? "bg-cyan-500/20 border border-cyan-500/50 animate-pulse"
                      : "bg-gray-900 border border-gray-700"
                  }`}
                >
                  {stage.status === "complete" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : stage.status === "active" ? (
                    <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  stage.status === "pending" ? "text-gray-600" : "text-white"
                }`}>
                  {stage.name}
                </p>
                <p className="text-[10px] text-gray-500">{stage.time}</p>
              </div>
              {i < projectStages.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-800">
                  <div
                    className={`h-full transition-all ${
                      stage.status === "complete" ? "bg-green-500" : ""
                    }`}
                    style={{ width: stage.status === "complete" ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Terminal */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold">Live Execution Logs</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400">Connected</span>
            </div>
          </div>
          <div className="bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs space-y-1 h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <p key={i} className="text-gray-400">
                <span className="text-gray-600">{log.split(" ")[0]}</span>{" "}
                <span className={
                  log.includes("Progress") ? "text-cyan-400" :
                  log.includes("allocated") ? "text-amber-400" :
                  "text-gray-400"
                }>
                  {log.split(" ").slice(1).join(" ")}
                </span>
              </p>
            ))}
            <p className="text-gray-600 animate-pulse">_</p>
          </div>
        </div>

        {/* Resource Monitor */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Resource Burn</h3>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">GPU Utilization</span>
                  <span className="font-mono">{telemetry.gpu}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${telemetry.gpu}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">VRAM Usage</span>
                  <span className="font-mono">{telemetry.vram}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${telemetry.vram}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Temperature</span>
                  <span className="font-mono">{telemetry.temp}°C</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${telemetry.temp}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold">Blockchain Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Block</span>
                <span className="font-mono">#18472921</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Confirmations</span>
                <span className="font-mono text-green-400">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Escrow</span>
                <span className="font-mono text-cyan-400">Locked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="card p-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-400">Approaching Completion</p>
          <p className="text-sm text-gray-400">
            Job is 89% complete. Verification will begin automatically upon completion.
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card p-8 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Cancel Project?</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              This will trigger a dispute process. Your escrowed funds may be partially forfeit depending on work completed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 btn-pill-secondary"
              >
                Resume Project
              </button>
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 px-4 py-2 rounded-full bg-red-500 text-black font-bold hover:bg-red-600 transition-all"
              >
                Initiate Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
