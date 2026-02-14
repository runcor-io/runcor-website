"use client";

import Link from "next/link";
import {
  Plus,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Radio,
  ArrowRight,
  Zap,
  Shield,
} from "lucide-react";

const activeProjects = [
  { id: "PRJ-4521", name: "Blender Render Batch", type: "compute", status: "executing", progress: 67, device: "RTX 4090 Server", eta: "12m", escrow: "0.045 ETH" },
  { id: "PRJ-4520", name: "Prototype 3D Print", type: "physical", status: "verifying", progress: 94, device: "Prusa XL", eta: "2m", escrow: "0.012 ETH" },
  { id: "PRJ-4519", name: "LLM Fine-tuning", type: "compute", status: "matching", progress: 0, device: "Searching...", eta: "—", escrow: "0.089 ETH" },
];

const recentCompletions = [
  { id: "PRJ-4518", name: "CNC Aluminum Part", device: "CNC Mill #1", reward: "0.028 ETH", time: "2h ago", rating: 5 },
  { id: "PRJ-4517", name: "Video Encode", device: "RTX 4090 Server", reward: "0.015 ETH", time: "5h ago", rating: 5 },
];

export default function MissionControl() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mission Control</h1>
          <p className="text-gray-500 text-sm">Command center for autonomous job execution</p>
        </div>
        <Link href="/contractor/create" className="btn-pill bg-amber-500 hover:bg-amber-400 text-black border-none">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Active Projects</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold">3</p>
          <p className="text-xs text-gray-500 mt-1">2 executing, 1 matching</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">In Escrow</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-cyan-400">0.146 ETH</p>
          <p className="text-xs text-gray-500 mt-1">across 3 projects</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Completed (30d)</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-green-400 mt-1">98% success rate</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Network Status</span>
            <Radio className="w-4 h-4 text-green-400 animate-pulse" />
          </div>
          <p className="text-3xl font-bold">47</p>
          <p className="text-xs text-gray-500 mt-1">devices available</p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">Active Operations</h2>
          <Link href="/contractor/tracking" className="text-xs text-amber-400 hover:text-amber-300">
            View All →
          </Link>
        </div>
        <div className="space-y-4">
          {activeProjects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    project.type === "compute" ? "bg-cyan-500/20" : "bg-amber-500/20"
                  }`}>
                    {project.type === "compute" ? (
                      <Zap className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Activity className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{project.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-mono">{project.id}</span>
                      <span>•</span>
                      <span>{project.device}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-amber-400">{project.escrow}</p>
                  <p className="text-xs text-gray-500">in escrow</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400 capitalize">{project.status}</span>
                    <span className="text-gray-500">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {project.eta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completions */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Recent Completions</h2>
          <div className="space-y-3">
            {recentCompletions.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{job.name}</p>
                    <p className="text-xs text-gray-500">{job.device} • {job.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-green-400">{job.reward}</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    {Array.from({ length: job.rating }).map((_, i) => (
                      <span key={i} className="text-[8px] text-amber-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/contractor/results"
            className="w-full mt-4 py-2 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            View Results Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Quick Deploy</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/contractor/create?type=compute"
              className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-all text-center"
            >
              <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="font-medium text-sm">Compute Job</p>
              <p className="text-xs text-gray-500 mt-1">AI, Render, Batch</p>
            </Link>
            <Link
              href="/contractor/create?type=physical"
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all text-center"
            >
              <Activity className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="font-medium text-sm">Physical Job</p>
              <p className="text-xs text-gray-500 mt-1">3D Print, CNC, Drone</p>
            </Link>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Network Optimization</p>
                <p className="text-xs text-gray-400 mt-1">
                  12 devices matching your typical specs are idle now. 
                  Posting now could save you 15% on compute costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
