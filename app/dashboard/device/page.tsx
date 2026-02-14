"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Thermometer,
  Activity,
  Terminal,
  Pause,
  Play,
  AlertOctagon,
  ChevronRight,
  Clock,
  Zap,
  Box,
} from "lucide-react";

// Mock device data
const devices = [
  {
    id: "gpu-001",
    name: "RTX 4090 Server",
    type: "compute",
    status: "active",
    specs: { cpu: "AMD Ryzen 9 7950X", gpu: "RTX 4090 24GB", ram: "128GB DDR5" },
    metrics: { temp: 72, load: 87, uptime: "14d 6h 32m" },
    earnings: { total: "2.847 ETH", today: "0.142 ETH" },
    jobs: { completed: 342, active: 1, failed: 3 },
  },
  {
    id: "cnc-001",
    name: "CNC Mill #1",
    type: "hardware",
    status: "idle",
    specs: { model: "Haas VF-2", spindle: "8.1k RPM", axis: "3-axis" },
    metrics: { temp: 45, load: 0, uptime: "3d 12h 15m" },
    earnings: { total: "1.234 ETH", today: "0.018 ETH" },
    jobs: { completed: 89, active: 0, failed: 1 },
  },
  {
    id: "prn-001",
    name: "Prusa XL",
    type: "hardware",
    status: "active",
    specs: { model: "Prusa XL 5T", volume: "360x360x360mm", nozzle: "0.4mm" },
    metrics: { temp: 215, load: 64, uptime: "1d 8h 45m" },
    earnings: { total: "0.987 ETH", today: "0.031 ETH" },
    jobs: { completed: 156, active: 1, failed: 2 },
  },
];

export default function DeviceControl() {
  const [selectedDevice, setSelectedDevice] = useState(devices[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [showEstop, setShowEstop] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Device Control Center</h1>
          <p className="text-gray-500 text-sm">Manage individual machine settings and monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`btn-pill-secondary ${isPaused ? "text-amber-400 border-amber-500/50" : ""}`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => setShowEstop(true)}
            className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-medium text-sm hover:bg-red-500/30 transition-all flex items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            E-STOP
          </button>
        </div>
      </div>

      {/* Device Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => setSelectedDevice(device)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
              selectedDevice.id === device.id
                ? "bg-white/10 border-white/20"
                : "bg-transparent border-gray-800 hover:border-gray-600"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              device.status === "active" ? "bg-cyan-400 animate-pulse" : "bg-gray-500"
            }`} />
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{device.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedDevice.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedDevice.status === "active" ? "bg-cyan-400 animate-pulse" : "bg-gray-500"
                    }`} />
                    <span className="text-sm text-gray-400 capitalize">{selectedDevice.status}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-500 font-mono">{selectedDevice.id}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold font-mono text-cyan-400">{selectedDevice.earnings.total}</p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(selectedDevice.specs).map(([key, value]) => (
                <div key={key} className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">{key}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span className="text-gray-400 text-sm">Temperature</span>
              </div>
              <p className="text-2xl font-bold">{selectedDevice.metrics.temp}°C</p>
              <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${Math.min(selectedDevice.metrics.temp / 100 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-sm">Load</span>
              </div>
              <p className="text-2xl font-bold">{selectedDevice.metrics.load}%</p>
              <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${selectedDevice.metrics.load}%` }}
                />
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-sm">Uptime</span>
              </div>
              <p className="text-2xl font-bold font-mono">{selectedDevice.metrics.uptime}</p>
              <p className="text-xs text-gray-500 mt-1">Since last restart</p>
            </div>
          </div>

          {/* Terminal / Logs */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold">Live Logs</h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">tail -f /var/log/runcor/agent.log</span>
            </div>
            <div className="bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs space-y-1 h-48 overflow-y-auto">
              <p className="text-gray-500">[2026-02-14 16:22:01] INFO: Agent heartbeat received</p>
              <p className="text-gray-500">[2026-02-14 16:22:05] INFO: Job JOB-8493 assigned</p>
              <p className="text-cyan-400">[2026-02-14 16:22:06] INFO: Starting container execution</p>
              <p className="text-gray-500">[2026-02-14 16:22:08] INFO: GPU memory allocated: 8GB</p>
              <p className="text-gray-500">[2026-02-14 16:22:10] INFO: Model loaded successfully</p>
              <p className="text-amber-400">[2026-02-14 16:22:15] WARN: Temperature at 72°C - within limits</p>
              <p className="text-gray-500">[2026-02-14 16:22:30] INFO: Inference progress: 34%</p>
              <p className="text-gray-500">[2026-02-14 16:23:01] INFO: Agent heartbeat received</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Job Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Completed</span>
                <span className="font-mono text-green-400">{selectedDevice.jobs.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Active</span>
                <span className="font-mono text-cyan-400">{selectedDevice.jobs.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Failed</span>
                <span className="font-mono text-red-400">{selectedDevice.jobs.failed}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {((selectedDevice.jobs.completed / (selectedDevice.jobs.completed + selectedDevice.jobs.failed)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/jobs?device=${selectedDevice.id}`}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm">View Job History</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm">Restart Agent</span>
                <Zap className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm">Update Firmware</span>
                <Box className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* E-STOP Modal */}
      {showEstop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card p-8 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Emergency Stop</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              This will immediately halt all operations on {selectedDevice.name}. All active jobs will be terminated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEstop(false)}
                className="flex-1 btn-pill-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEstop(false);
                  alert("E-STOP activated. Device halted.");
                }}
                className="flex-1 px-4 py-2 rounded-full bg-red-500 text-black font-bold hover:bg-red-600 transition-all"
              >
                CONFIRM STOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
