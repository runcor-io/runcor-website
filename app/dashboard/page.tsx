"use client";

import Link from "next/link";
import {
  Activity,
  Cpu,
  Zap,
  TrendingUp,
  AlertCircle,
  Plus,
  Radio,
} from "lucide-react";

// Mock data for the fleet
const devices = [
  { id: "gpu-001", name: "RTX 4090 Server", type: "compute", status: "active", earnings: "0.042 ETH", load: 87 },
  { id: "cnc-001", name: "CNC Mill #1", type: "hardware", status: "idle", earnings: "0.018 ETH", load: 0 },
  { id: "prn-001", name: "Prusa XL", type: "hardware", status: "active", earnings: "0.031 ETH", load: 64 },
  { id: "gpu-002", name: "A100 Cluster", type: "compute", status: "pending", earnings: "0.000 ETH", load: 0 },
  { id: "drn-001", name: "DJI Matrice", type: "hardware", status: "offline", earnings: "0.000 ETH", load: 0 },
];

const recentJobs = [
  { id: "JOB-8492", device: "RTX 4090 Server", type: "AI Render", reward: "+0.0042 ETH", time: "2m ago", status: "completed" },
  { id: "JOB-8491", device: "Prusa XL", type: "3D Print", reward: "+0.0028 ETH", time: "15m ago", status: "completed" },
  { id: "JOB-8490", device: "CNC Mill #1", type: "G-code Exec", reward: "+0.0051 ETH", time: "32m ago", status: "completed" },
  { id: "JOB-8489", device: "RTX 4090 Server", type: "Model Training", reward: "+0.0084 ETH", time: "1h ago", status: "completed" },
];

export default function FleetCommand() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fleet Command</h1>
          <p className="text-gray-500 text-sm">Real-time overview of your autonomous assets</p>
        </div>
        <Link
          href="/dashboard/onboarding"
          className="btn-pill text-sm"
        >
          <Plus className="w-4 h-4" />
          Deploy New Device
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Active Devices</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold">3</p>
          <p className="text-xs text-gray-500 mt-1">of 5 total</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Network Load</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold">67%</p>
          <p className="text-xs text-gray-500 mt-1">avg across fleet</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">24h Earnings</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold">0.142 ETH</p>
          <p className="text-xs text-green-400 mt-1">+12% vs yesterday</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Pending Jobs</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold">7</p>
          <p className="text-xs text-gray-500 mt-1">in queue</p>
        </div>
      </div>

      {/* Live Topology Map */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold">Live Topology</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Active</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /> Executing</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" /> Offline</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400" /> Pending</span>
          </div>
        </div>
        
        {/* Device Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {devices.map((device) => {
            const statusColors = {
              active: "border-cyan-500/50 bg-cyan-500/10",
              idle: "border-gray-700 bg-gray-900",
              pending: "border-purple-500/50 bg-purple-500/10",
              offline: "border-red-500/50 bg-red-500/10",
            };
            const dotColors = {
              active: "bg-cyan-400 animate-pulse",
              idle: "bg-gray-500",
              pending: "bg-purple-400 animate-pulse",
              offline: "bg-red-400",
            };
            return (
              <Link
                key={device.id}
                href={`/dashboard/device/${device.id}`}
                className={`p-4 rounded-xl border ${statusColors[device.status as keyof typeof statusColors]} hover:border-white/30 transition-all group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-2 h-2 rounded-full ${dotColors[device.status as keyof typeof dotColors]}`} />
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{device.type}</span>
                </div>
                <p className="font-medium text-sm truncate">{device.name}</p>
                <p className="text-xs font-mono text-gray-400 mt-1">{device.earnings}</p>
                {device.load > 0 && (
                  <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${device.load}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Jobs</h2>
            <Link href="/dashboard/jobs" className="text-xs text-cyan-400 hover:text-cyan-300">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{job.type}</p>
                    <p className="text-xs text-gray-500 font-mono">{job.device} • {job.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-cyan-400">{job.reward}</p>
                  <p className="text-xs text-gray-500">{job.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Deploy Panel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Quick Deploy</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Auto-Accept</span>
              <button className="w-10 h-5 rounded-full bg-cyan-500 relative">
                <span className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Job Acceptance Rate</span>
                <span className="text-sm font-mono text-cyan-400">94%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[94%] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Based on your risk profile & hardware specs</p>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Queue Alert</p>
                  <p className="text-xs text-gray-400 mt-1">
                    3 high-priority jobs matching your RTX 4090 Server specs are waiting in queue.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/marketplace"
              className="btn-pill w-full justify-center"
            >
              <Radio className="w-4 h-4" />
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
