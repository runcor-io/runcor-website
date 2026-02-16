"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Cpu,
  MapPin,
  Star,
  Activity,
  Shield,
  Check,
  Globe,
  Filter,
  Search,
  Loader2,
  Zap,
  Briefcase,
} from "lucide-react";

interface Device {
  deviceId: string;
  username: string;
  specs: {
    architecture: string;
    cpu: string;
    cpuCores: number;
    ramGB: number;
    gpu?: {
      model: string;
      vramGB: number;
    };
    os: string;
    capabilities: string[];
    maxJobRAM: string;
  };
  status?: {
    cpuLoadPercent: number;
    ramUsedPercent: number;
    jobStatus: string;
  };
  lastSeen: string;
  registeredAt: string;
}

export default function FleetSelection() {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filter, setFilter] = useState<"all" | "compute" | "physical">("all");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices");
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = (id: string) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const getDeviceType = (device: Device) => {
    if (device.specs.gpu) return "compute";
    if (device.specs.capabilities.includes("3d_print") || device.specs.capabilities.includes("cnc")) return "physical";
    return "compute";
  };

  const isDeviceOnline = (device: Device) => {
    const lastSeen = new Date(device.lastSeen);
    const now = new Date();
    return now.getTime() - lastSeen.getTime() < 120000; // 2 minutes
  };

  const getEstimatedRate = (device: Device) => {
    // Simple rate calculation based on specs
    let rate = 0.50; // Base rate
    if (device.specs.gpu) rate += 2.00;
    if (device.specs.ramGB >= 16) rate += 1.00;
    return rate;
  };

  const filteredDevices = devices.filter((device) => {
    const type = getDeviceType(device);
    const matchesFilter = filter === "all" || type === filter;
    const matchesSearch = 
      device.specs.cpu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.specs.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const onlineCount = devices.filter(isDeviceOnline).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading fleet...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fleet Selection</h1>
          <p className="text-zinc-500 text-sm">Choose specific devices for your mission</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white">{selectedDevices.length} selected</span>
          </div>
          {selectedDevices.length > 0 && (
            <Link
              href={`/contractor/create?devices=${selectedDevices.join(",")}`}
              className="px-4 py-2 rounded-full bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors text-sm"
            >
              Confirm Selection
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices by CPU, GPU, capabilities..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("compute")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "compute" ? "bg-cyan-500 text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              Compute
            </button>
            <button
              onClick={() => setFilter("physical")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "physical" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Radio className="w-4 h-4" />
              Physical
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{devices.length}</p>
          <p className="text-xs text-zinc-500">Total Devices</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{onlineCount}</p>
          <p className="text-xs text-zinc-500">Online Now</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">
            {devices.filter(d => d.specs.gpu).length}
          </p>
          <p className="text-xs text-zinc-500">GPU Enabled</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{filteredDevices.length}</p>
          <p className="text-xs text-zinc-500">Matching Filter</p>
        </div>
      </div>

      {/* Device Grid */}
      {filteredDevices.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
          <Globe className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No devices match your criteria</p>
          <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDevices.map((device) => {
            const type = getDeviceType(device);
            const online = isDeviceOnline(device);
            const rate = getEstimatedRate(device);
            
            return (
              <div
                key={device.deviceId}
                onClick={() => toggleDevice(device.deviceId)}
                className={`bg-zinc-950 border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedDevices.includes(device.deviceId)
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      type === "compute" ? "bg-cyan-500/20" : "bg-amber-500/20"
                    }`}>
                      {type === "compute" ? (
                        <Cpu className="w-6 h-6 text-cyan-400" />
                      ) : (
                        <Radio className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{device.specs.cpu.split(" ").slice(0, 3).join(" ")}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                        {online ? "Online" : "Offline"}
                        <span>•</span>
                        <span className="font-mono">{device.deviceId.slice(0, 16)}...</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedDevices.includes(device.deviceId)
                      ? "bg-amber-500 border-amber-500"
                      : "border-zinc-600"
                  }`}>
                    {selectedDevices.includes(device.deviceId) && <Check className="w-4 h-4 text-black" />}
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-zinc-900/50">
                    <p className="text-[10px] text-zinc-500 uppercase">CPU</p>
                    <p className="text-xs font-medium text-white">{device.specs.cpuCores} cores</p>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/50">
                    <p className="text-[10px] text-zinc-500 uppercase">RAM</p>
                    <p className="text-xs font-medium text-white">{device.specs.ramGB}GB</p>
                  </div>
                  {device.specs.gpu ? (
                    <div className="p-2 rounded-lg bg-zinc-900/50">
                      <p className="text-[10px] text-zinc-500 uppercase">GPU</p>
                      <p className="text-xs font-medium text-white">{device.specs.gpu.vramGB}GB</p>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-zinc-900/50">
                      <p className="text-[10px] text-zinc-500 uppercase">Arch</p>
                      <p className="text-xs font-medium text-white">{device.specs.architecture}</p>
                    </div>
                  )}
                  <div className="p-2 rounded-lg bg-zinc-900/50">
                    <p className="text-[10px] text-zinc-500 uppercase">OS</p>
                    <p className="text-xs font-medium text-white">{device.specs.os}</p>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {device.specs.capabilities.slice(0, 4).map((cap) => (
                    <span key={cap} className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-400">
                      {cap.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span className="text-zinc-400">{device.status?.cpuLoadPercent || 0}% load</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-zinc-400">{device.status?.ramUsedPercent || 0}% RAM</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-amber-400">~${rate.toFixed(2)}/hr</p>
                    {!online && <span className="text-xs text-red-400">Offline</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
