"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  RefreshCw,
  Monitor,
  Trash2,
} from "lucide-react";

interface Device {
  deviceId: string;
  username: string;
  specs: {
    architecture: string;
    cpu: string;
    cpuCores: number;
    cpuFrequencyMHz: number;
    ramGB: number;
    gpu?: {
      model: string;
      vramGB: number;
    };
    os: string;
    osVersion: string;
    capabilities: string[];
    maxJobRAM: string;
  };
  status?: {
    cpuLoadPercent: number;
    ramUsedPercent: number;
    jobStatus: string;
    uptimeSeconds: number;
  };
  control?: {
    paused: boolean;
    estop: boolean;
  };
  lastSeen: string;
  registeredAt: string;
}

export default function DeviceControl() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showEstop, setShowEstop] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [controlLoading, setControlLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const currentUsername = (session?.user as any)?.username || "yourname";
  
  // Get control status from selected device
  const isPaused = selectedDevice?.control?.paused || false;
  const isEstop = selectedDevice?.control?.estop || false;

  // Fetch devices on load
  useEffect(() => {
    fetchDevices();
    // Refresh every 10 seconds
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, [currentUsername]);

  const fetchDevices = async () => {
    try {
      if (!currentUsername || currentUsername === "yourname") {
        // Wait for session to load
        return;
      }
      
      console.log("[Device] Fetching devices (backend uses JWT token)");
      
      const res = await fetch("/api/devices");
      if (!res.ok) throw new Error("Failed to fetch devices");
      
      const data = await res.json();
      console.log("[Device] Found devices:", data.length);
      setDevices(data);
      
      // Select first device if none selected
      if (data.length > 0 && !selectedDevice) {
        setSelectedDevice(data[0]);
      }
      
      setError("");
    } catch (err) {
      setError("Failed to load devices. Make sure the agent is running.");
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const deleteDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      const response = await fetch(`/api/devices?id=${encodeURIComponent(selectedDevice.deviceId)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove device from list
        setDevices(devices.filter(d => d.deviceId !== selectedDevice.deviceId));
        setSelectedDevice(null);
        setShowDelete(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete device');
      }
    } catch (err) {
      alert('Failed to delete device. Please try again.');
    }
  };

  const sendControlCommand = async (action: "pause" | "resume" | "estop" | "reset-estop") => {
    if (!selectedDevice) return;
    
    setControlLoading(true);
    setMessage("");
    
    try {
      const response = await fetch("/api/devices/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: selectedDevice.deviceId,
          action,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        // Refresh device list to get updated control state
        fetchDevices();
      } else {
        setError(data.error || "Failed to send command");
      }
    } catch (err) {
      setError("Failed to send command. Please try again.");
    } finally {
      setControlLoading(false);
    }
  };

  const formatLastSeen = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="ml-3 text-gray-400">Loading devices...</span>
      </div>
    );
  }

  if (error && devices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card p-8 text-center">
          <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Devices Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">To register a device:</p>
            <code className="block p-4 rounded-lg bg-black border border-gray-800 text-sm text-left">
              runcor-agent --register --username {currentUsername} --api-url http://localhost:3000
            </code>
          </div>
          <button 
            onClick={fetchDevices}
            className="btn-pill mt-6"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <p className="text-emerald-400">{message}</p>
        </div>
      )}
      
      {/* Error Message */}
      {error && !loading && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Device Control Center</h1>
          <p className="text-gray-500 text-sm">Manage individual machine settings and monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDevices}
            className="btn-pill-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => sendControlCommand(isPaused ? "resume" : "pause")}
            disabled={controlLoading || isEstop || !selectedDevice}
            className={`btn-pill-secondary ${isPaused ? "text-amber-400 border-amber-500/50" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {controlLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            {isPaused ? "Resume" : "Pause"}
          </button>
          {isEstop ? (
            <button
              onClick={() => sendControlCommand("reset-estop")}
              disabled={controlLoading || !selectedDevice}
              className="px-4 py-2 rounded-full bg-amber-500 text-black font-medium text-sm hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${controlLoading ? "animate-spin" : ""}`} />
              Reset E-STOP
            </button>
          ) : (
            <button
              onClick={() => setShowEstop(true)}
              disabled={controlLoading || !selectedDevice}
              className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-medium text-sm hover:bg-red-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertOctagon className="w-4 h-4" />
              E-STOP
            </button>
          )}
          {selectedDevice && (
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-400 font-medium text-sm hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Device Selector */}
      {devices.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {devices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => setSelectedDevice(device)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
                selectedDevice?.deviceId === device.deviceId
                  ? "bg-white/10 border-white/20"
                  : "bg-transparent border-gray-800 hover:border-gray-600"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                new Date().getTime() - new Date(device.lastSeen).getTime() < 60000
                  ? "bg-green-400 animate-pulse"
                  : "bg-gray-500"
              }`} />
              <Cpu className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{device.specs.cpu.split(" ")[0]}</span>
              <span className="text-xs text-gray-500">{formatLastSeen(device.lastSeen)}</span>
            </button>
          ))}
        </div>
      )}

      {selectedDevice && (
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
                    <h2 className="text-xl font-bold">{selectedDevice.specs.cpu}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        new Date().getTime() - new Date(selectedDevice.lastSeen).getTime() < 60000
                          ? "bg-green-400 animate-pulse"
                          : "bg-gray-500"
                      }`} />
                      <span className="text-sm text-gray-400 capitalize">
                        {selectedDevice.status?.jobStatus || "idle"}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-500 font-mono">{selectedDevice.deviceId}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Registered</p>
                  <p className="text-sm">{new Date(selectedDevice.registeredAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">Architecture</p>
                  <p className="text-sm font-medium">{selectedDevice.specs.architecture}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">Cores</p>
                  <p className="text-sm font-medium">{selectedDevice.specs.cpuCores}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">Frequency</p>
                  <p className="text-sm font-medium">{selectedDevice.specs.cpuFrequencyMHz} MHz</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">Total RAM</p>
                  <p className="text-sm font-medium">{selectedDevice.specs.ramGB.toFixed(1)} GB</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">Max Job RAM</p>
                  <p className="text-sm font-medium">{selectedDevice.specs.maxJobRAM}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">OS</p>
                  <p className="text-sm font-medium">{selectedDevice.specs.os}</p>
                </div>
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-400 text-sm">CPU Load</span>
                </div>
                <p className="text-2xl font-bold">{(selectedDevice.status?.cpuLoadPercent ?? 0).toFixed(1)}%</p>
                <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${selectedDevice.status?.cpuLoadPercent || 0}%` }}
                  />
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-400 text-sm">RAM Usage</span>
                </div>
                <p className="text-2xl font-bold">{(selectedDevice.status?.ramUsedPercent ?? 0).toFixed(1)}%</p>
                <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${selectedDevice.status?.ramUsedPercent || 0}%` }}
                  />
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Uptime</span>
                </div>
                <p className="text-2xl font-bold font-mono">
                  {formatUptime(selectedDevice.status?.uptimeSeconds || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Since last restart</p>
              </div>
            </div>

            {/* Capabilities */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">Device Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedDevice.specs.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs"
                  >
                    {cap}
                  </span>
                ))}
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
                <p className="text-gray-500">[{new Date().toLocaleTimeString()}] INFO: Agent started</p>
                <p className="text-gray-500">[{new Date().toLocaleTimeString()}] INFO: Hardware detected - {selectedDevice.specs.cpu}</p>
                <p className="text-gray-500">[{new Date().toLocaleTimeString()}] INFO: Device registered: {selectedDevice.deviceId}</p>
                <p className="text-cyan-400">[{new Date().toLocaleTimeString()}] INFO: Connected to backend</p>
                <p className="text-gray-500">[{new Date().toLocaleTimeString()}] INFO: Heartbeat interval: 30s</p>
                <p className="text-green-400">[{new Date().toLocaleTimeString()}] INFO: Device status: {selectedDevice.status?.jobStatus || "idle"}</p>
                <p className="text-gray-600 animate-pulse">_</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Control Status */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">Control Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className={`text-sm font-medium ${
                    isEstop ? "text-red-400" : isPaused ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {isEstop ? "EMERGENCY STOP" : isPaused ? "PAUSED" : "ACTIVE"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Job Processing</span>
                  <span className={`text-sm ${isPaused || isEstop ? "text-red-400" : "text-emerald-400"}`}>
                    {isEstop ? "HALTED" : isPaused ? "PAUSED" : "ACCEPTING"}
                  </span>
                </div>
                {isEstop && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mt-2">
                    <p className="text-red-400 text-xs">
                      ⚠️ E-STOP is active. All operations halted. Click "Reset E-STOP" to resume.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* GPU Info */}
            {selectedDevice.specs.gpu && (
              <div className="card p-6">
                <h3 className="font-bold mb-4">GPU Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Model</span>
                    <span className="text-sm">{selectedDevice.specs.gpu.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">VRAM</span>
                    <span className="font-mono">{selectedDevice.specs.gpu.vramGB} GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">CUDA</span>
                    <span className="text-green-400 text-sm">Supported</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/jobs?device=${selectedDevice.deviceId}`}
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
      )}

      {/* E-STOP Modal */}
      {showEstop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card p-8 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Emergency Stop</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              This will immediately halt all operations on {selectedDevice?.specs.cpu}. All active jobs will be terminated.
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
                  sendControlCommand("estop");
                }}
                disabled={controlLoading}
                className="flex-1 px-4 py-2 rounded-full bg-red-500 text-black font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {controlLoading ? "ACTIVATING..." : "CONFIRM STOP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && selectedDevice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card p-8 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Delete Device</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              Are you sure you want to remove <strong>{selectedDevice.specs.cpu}</strong> from your fleet? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 btn-pill-secondary"
              >
                Cancel
              </button>
              <button
                onClick={deleteDevice}
                className="flex-1 px-4 py-2 rounded-full bg-red-500 text-black font-bold hover:bg-red-600 transition-all"
              >
                DELETE DEVICE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
