"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  Zap,
  TrendingUp,
  AlertCircle,
  Plus,
  Radio,
  Loader2,
  Server,
  Briefcase,
} from "lucide-react";

interface Device {
  deviceId: string;
  username: string;
  specs: {
    cpu: string;
    cpuCores: number;
    ramGB: number;
    gpu?: { model: string; vramGB: number };
    capabilities: string[];
  };
  status?: {
    cpuLoadPercent: number;
    ramUsedPercent: number;
    jobStatus: string;
  };
  lastSeen: string;
  control?: {
    paused: boolean;
    estop: boolean;
  };
}

interface Job {
  _id: string;
  title: string;
  type: string;
  status: string;
  reward: number;
  deviceId?: string;
  createdAt: string;
  completedAt?: string;
  claimedBy?: string;
  postedBy?: string;
}

export default function FleetCommand() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "";
  
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchData = async () => {
    if (!username) return;
    
    try {
      // Fetch user's devices (backend uses JWT token)
      const devicesRes = await fetch(`/api/devices`);
      const devicesData = devicesRes.ok ? await devicesRes.json() : [];
      setDevices(devicesData);
      
      // Fetch user's jobs (backend uses JWT token for authentication)
      const jobsRes = await fetch(`/api/jobs`);
      console.log("[Fleet] Jobs response:", jobsRes.status);
      const jobsData = jobsRes.ok ? await jobsRes.json() : [];
      console.log("[Fleet] Jobs fetched:", jobsData.length, jobsData.map((j: any) => ({ id: j._id.slice(-8), status: j.status, claimedBy: j.claimedBy })));
      setJobs(jobsData);
    } catch (error) {
      console.error("Failed to fetch fleet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [username]);

  // Calculate stats
  const activeDevices = devices.filter(d => {
    const lastSeen = new Date(d.lastSeen);
    const now = new Date();
    return now.getTime() - lastSeen.getTime() < 120000; // 2 minutes
  }).length;
  
  const avgLoad = devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + (d.status?.cpuLoadPercent || 0), 0) / devices.length)
    : 0;
  
  // Debug: log all jobs
  console.log("[Fleet] All jobs:", jobs.map(j => ({ id: j._id.slice(-8), status: j.status, claimedBy: j.claimedBy, postedBy: j.postedBy, reward: j.reward })));
  
  const completedJobs = jobs.filter(j => j.status === "completed");
  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.reward || 0), 0);
  
  const runningJobs = jobs.filter(j => j.status === "running" || j.status === "claimed").length;
  
  // Recent completed jobs (API already filters by username)
  const recentJobs = completedJobs
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    .slice(0, 4);

  const getDeviceStatus = (device: Device) => {
    const lastSeen = new Date(device.lastSeen);
    const now = new Date();
    const isOnline = now.getTime() - lastSeen.getTime() < 120000;
    
    if (!isOnline) return "offline";
    if (device.control?.estop) return "offline";
    if (device.status?.jobStatus === "busy" || device.status?.jobStatus === "running") return "active";
    if (device.control?.paused) return "pending";
    return "idle";
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading fleet command...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fleet Command</h1>
          <p className="text-zinc-500 text-sm">Real-time overview of your autonomous assets</p>
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
            <span className="text-zinc-400 text-sm">Active Devices</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-white">{activeDevices}</p>
          <p className="text-xs text-zinc-500 mt-1">of {devices.length} total</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Network Load</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white">{avgLoad}%</p>
          <p className="text-xs text-zinc-500 mt-1">avg across fleet</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Total Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-400">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-zinc-500 mt-1">from {completedJobs.length} jobs</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Active Jobs</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{runningJobs}</p>
          <p className="text-xs text-zinc-500 mt-1">executing now</p>
        </div>
      </div>

      {/* Live Topology Map */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white">Your Devices</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Active</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-500" /> Idle</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" /> Offline</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400" /> Paused</span>
          </div>
        </div>
        
        {devices.length === 0 ? (
          <div className="p-8 text-center">
            <Server className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No devices registered</p>
            <p className="text-zinc-600 text-sm mt-1">Download the agent to register your first device</p>
            <Link 
              href="/dashboard/onboarding"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Register Device
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {devices.map((device) => {
              const status = getDeviceStatus(device);
              const statusColors = {
                active: "border-cyan-500/50 bg-cyan-500/10",
                idle: "border-zinc-700 bg-zinc-900",
                pending: "border-purple-500/50 bg-purple-500/10",
                offline: "border-red-500/50 bg-red-500/10",
              };
              const dotColors = {
                active: "bg-cyan-400 animate-pulse",
                idle: "bg-zinc-500",
                pending: "bg-purple-400 animate-pulse",
                offline: "bg-red-400",
              };
              const load = device.status?.cpuLoadPercent || 0;
              
              return (
                <Link
                  key={device.deviceId}
                  href="/dashboard/device"
                  className={`p-4 rounded-xl border ${statusColors[status]} hover:border-white/30 transition-all group`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      {device.specs.gpu ? "GPU" : "CPU"}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-white truncate">
                    {device.specs.cpu.split(" ").slice(0, 3).join(" ")}
                  </p>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {device.specs.ramGB}GB RAM
                  </p>
                  {load > 0 && status !== "offline" && (
                    <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${load}%` }}
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Recent Completed Jobs</h2>
            <Link href="/dashboard/jobs" className="text-xs text-cyan-400 hover:text-cyan-300">
              View All →
            </Link>
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No completed jobs yet</p>
              <p className="text-zinc-600 text-sm mt-1">Accept jobs from the marketplace to start earning</p>
              <Link 
                href="/dashboard/marketplace"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 transition-colors"
              >
                <Radio className="w-4 h-4" />
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{job.title}</p>
                      <p className="text-xs text-zinc-500 font-mono">
                        {job.deviceId ? job.deviceId.slice(0, 12) + "..." : "Unknown device"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-emerald-400">+${job.reward.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{formatTimeAgo(job.completedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info */}
        {jobs.length > 0 && (
          <div className="card p-4 mb-4 bg-zinc-900/50 border-dashed border-zinc-700">
            <h3 className="text-xs font-mono text-zinc-500 mb-2">DEBUG: All Jobs ({jobs.length})</h3>
            <div className="space-y-1 text-xs font-mono">
              {jobs.map(j => (
                <div key={j._id} className="flex justify-between">
                  <span className={j.status === "completed" ? "text-emerald-400" : "text-zinc-400"}>
                    {j._id.slice(-8)}: {j.status}
                  </span>
                  <span className="text-zinc-600">${j.reward} | by: {j.claimedBy || "none"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Quick Actions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-start gap-3">
                <Radio className="w-4 h-4 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Find Jobs</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Browse available jobs in the marketplace and accept ones that match your hardware.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-start gap-3">
                <Server className="w-4 h-4 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Manage Devices</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    You have {devices.length} device{devices.length !== 1 ? 's' : ''} registered. 
                    View status and control devices in the Device Control Center.
                  </p>
                </div>
              </div>
            </div>

            {runningJobs > 0 && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Activity className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">Jobs Running</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      You have {runningJobs} job{runningJobs !== 1 ? 's' : ''} currently executing. 
                      Check the Job Monitor for real-time progress.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/marketplace"
                className="btn-pill justify-center"
              >
                <Radio className="w-4 h-4" />
                Marketplace
              </Link>
              <Link
                href="/dashboard/device"
                className="btn-pill-secondary justify-center"
              >
                <Server className="w-4 h-4" />
                Devices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
