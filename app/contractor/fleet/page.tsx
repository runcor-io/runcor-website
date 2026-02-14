"use client";

import { useState } from "react";
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
} from "lucide-react";

const devices = [
  {
    id: "DEV-001",
    name: "RTX 4090 Server",
    type: "compute",
    location: "North America",
    specs: { gpu: "RTX 4090", vram: "24GB", score: 98 },
    reputation: 99,
    uptime: "99.8%",
    jobs: 342,
    rate: "0.004 ETH/hr",
    available: true,
  },
  {
    id: "DEV-002",
    name: "AI Training Cluster",
    type: "compute",
    location: "Europe",
    specs: { gpu: "A100 x4", vram: "80GB", score: 100 },
    reputation: 97,
    uptime: "99.5%",
    jobs: 128,
    rate: "0.012 ETH/hr",
    available: true,
  },
  {
    id: "DEV-003",
    name: "Prusa XL Farm",
    type: "physical",
    location: "North America",
    specs: { model: "Prusa XL", volume: "360mm³", score: 85 },
    reputation: 95,
    uptime: "96.2%",
    jobs: 89,
    rate: "0.003 ETH/hr",
    available: true,
  },
  {
    id: "DEV-004",
    name: "CNC Workshop",
    type: "physical",
    location: "Asia Pacific",
    specs: { model: "Haas VF-2", tolerance: "±0.01mm", score: 92 },
    reputation: 94,
    uptime: "94.8%",
    jobs: 56,
    rate: "0.008 ETH/hr",
    available: false,
  },
];

export default function FleetSelection() {
  const [filter, setFilter] = useState<"all" | "compute" | "physical">("all");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const filteredDevices = filter === "all" ? devices : devices.filter(d => d.type === filter);

  const toggleDevice = (id: string) => {
    setSelectedDevices(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fleet Selection</h1>
          <p className="text-gray-500 text-sm">Choose specific devices for your mission</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">{selectedDevices.length} selected</span>
          </div>
          <Link
            href="/contractor/create"
            className="btn-pill bg-amber-500 hover:bg-amber-400 text-black border-none text-sm"
          >
            Confirm Selection
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search devices, locations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black border border-gray-800 text-sm focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("compute")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "compute" ? "bg-cyan-500 text-black" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              Compute
            </button>
            <button
              onClick={() => setFilter("physical")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "physical" ? "bg-amber-500 text-black" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Radio className="w-4 h-4" />
              Physical
            </button>
          </div>
          <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="card p-6 h-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-amber-500/5" />
        <div className="machine-grid opacity-30" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Interactive topology map</p>
            <p className="text-xs text-gray-600">{devices.length} devices across 4 regions</p>
          </div>
        </div>
        {/* Map Pins */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDevices.map((device) => (
          <div
            key={device.id}
            onClick={() => toggleDevice(device.id)}
            className={`card p-5 cursor-pointer transition-all ${
              selectedDevices.includes(device.id)
                ? "border-amber-500/50 bg-amber-500/5"
                : "hover:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  device.type === "compute" ? "bg-cyan-500/20" : "bg-amber-500/20"
                }`}>
                  {device.type === "compute" ? (
                    <Cpu className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <Radio className="w-6 h-6 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{device.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {device.location}
                    <span>•</span>
                    <span className="font-mono">{device.id}</span>
                  </div>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedDevices.includes(device.id)
                  ? "bg-amber-500 border-amber-500"
                  : "border-gray-600"
              }`}>
                {selectedDevices.includes(device.id) && <Check className="w-4 h-4 text-black" />}
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(device.specs).map(([key, value]) => (
                <div key={key} className="p-2 rounded-lg bg-white/5">
                  <p className="text-[10px] text-gray-500 uppercase">{key}</p>
                  <p className="text-xs font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>{device.reputation}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span>{device.uptime}</span>
                </div>
                <span className="text-gray-500">{device.jobs} jobs</span>
              </div>
              <div className="text-right">
                <p className="font-mono text-amber-400">{device.rate}</p>
                {!device.available && (
                  <span className="text-xs text-red-400">Busy</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
