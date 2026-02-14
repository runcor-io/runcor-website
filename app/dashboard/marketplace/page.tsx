"use client";

import { useState } from "react";
import {
  Radio,
  Cpu,
  Box,
  Zap,
  Shield,
  Clock,
  Check,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";

const jobs = [
  {
    id: "REQ-1294",
    type: "AI Training",
    category: "compute",
    specs: { gpu: "RTX 4090+", vram: "24GB+", duration: "2-4 hours" },
    reward: "0.045 ETH",
    match: 98,
    risk: "low",
    contractor: { name: "Neural Labs", rep: 4.9, jobs: 234 },
    escrow: "0.045 ETH",
    location: "Global",
  },
  {
    id: "REQ-1293",
    type: "3D Print - Prototype",
    category: "hardware",
    specs: { material: "PLA/PETG", volume: "200x200x200mm", time: "4-6 hours" },
    reward: "0.012 ETH",
    match: 94,
    risk: "low",
    contractor: { name: "MakerDAO", rep: 4.7, jobs: 89 },
    escrow: "0.012 ETH",
    location: "North America",
  },
  {
    id: "REQ-1292",
    type: "CNC Machining",
    category: "hardware",
    specs: { material: "Aluminum", tolerance: "±0.05mm", time: "1-2 hours" },
    reward: "0.028 ETH",
    match: 87,
    risk: "medium",
    contractor: { name: "PrecisionWorks", rep: 4.5, jobs: 156 },
    escrow: "0.028 ETH",
    location: "Europe",
  },
  {
    id: "REQ-1291",
    type: "Video Render Farm",
    category: "compute",
    specs: { gpu: "Multi-GPU", vram: "48GB+", duration: "6-12 hours" },
    reward: "0.089 ETH",
    match: 76,
    risk: "medium",
    contractor: { name: "RenderPool", rep: 4.8, jobs: 512 },
    escrow: "0.089 ETH",
    location: "Global",
  },
  {
    id: "REQ-1290",
    type: "Drone Survey",
    category: "hardware",
    specs: { area: "50 acres", altitude: "120m", deliverables: "4K + Thermal" },
    reward: "0.035 ETH",
    match: 45,
    risk: "high",
    contractor: { name: "AgriTech", rep: 4.2, jobs: 34 },
    escrow: "0.035 ETH",
    location: "Local (< 50km)",
  },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "compute" | "hardware">("all");

  const filteredJobs = selectedCategory === "all" 
    ? jobs 
    : jobs.filter(j => j.category === selectedCategory);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400 border-green-500/30 bg-green-500/10";
      case "medium": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "high": return "text-red-400 border-red-500/30 bg-red-500/10";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-gray-500 text-sm">Find jobs matching your hardware capabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <span className="text-sm text-gray-400">Live Feed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search job types, contractors..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black border border-gray-800 text-sm focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setSelectedCategory("compute")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === "compute" ? "bg-cyan-500 text-black" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              Compute
            </button>
            <button
              onClick={() => setSelectedCategory("hardware")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === "hardware" ? "bg-amber-500 text-black" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Box className="w-4 h-4" />
              Hardware
            </button>
          </div>
          <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="card p-5 hover:border-white/20 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  job.category === "compute" ? "bg-cyan-500/20" : "bg-amber-500/20"
                }`}>
                  {job.category === "compute" ? (
                    <Cpu className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Box className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{job.type}</h3>
                  <p className="text-xs text-gray-500 font-mono">{job.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono text-cyan-400">{job.reward}</p>
                <p className="text-xs text-gray-500">Reward</p>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(job.specs).map(([key, value]) => (
                <div key={key} className="p-2 rounded-lg bg-white/5">
                  <p className="text-[10px] text-gray-500 uppercase">{key}</p>
                  <p className="text-xs font-medium truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Match & Risk */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">{job.match}% Match</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getRiskColor(job.risk)}`}>
                <Shield className="w-3 h-3" />
                <span className="text-xs font-medium capitalize">{job.risk} Risk</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {job.location}
              </div>
            </div>

            {/* Contractor */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold">
                  {job.contractor.name[0]}
                </div>
                <span className="text-sm">{job.contractor.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-400" />
                  {job.contractor.rep}
                </span>
                <span className="text-gray-500">{job.contractor.jobs} jobs</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex-1 btn-pill text-sm">
                <Zap className="w-4 h-4" />
                Accept Job
              </button>
              <button className="px-4 py-2 rounded-full bg-white/5 text-sm text-gray-400 hover:text-white transition-all">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="card p-12 text-center">
          <Radio className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No jobs found in this category</p>
        </div>
      )}

      {/* Escrow Info */}
      <div className="card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Trust-Minimized Escrow</p>
          <p className="text-sm text-gray-500">
            All payments are locked in smart contracts until job verification is complete.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Secured</p>
          <p className="font-mono text-green-400">1,247.5 ETH</p>
        </div>
      </div>
    </div>
  );
}
