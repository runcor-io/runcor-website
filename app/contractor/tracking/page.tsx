"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Clock,
  CheckCircle,
  Terminal,
  Cpu,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Briefcase,
  XCircle,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  type: string;
  status: "pending" | "claimed" | "running" | "completed" | "failed";
  deviceId?: string;
  reward: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
  error?: string;
  result?: any;
}

interface Device {
  deviceId: string;
  specs: {
    cpu: string;
    gpu?: {
      model: string;
    };
  };
  status?: {
    cpuLoadPercent: number;
    ramUsedPercent: number;
  };
}

export default function ActiveOperations() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "";
  const searchParams = useSearchParams();
  const selectedJobId = searchParams.get("job");
  
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [devices, setDevices] = useState<Record<string, Device>>({});

  const fetchActiveJobs = async () => {
    try {
      // Fetch contractor's active jobs (not completed/failed)
      const response = await fetch(`/api/jobs`);
      if (response.ok) {
        const allJobs: Job[] = await response.json();
        const activeJobs = allJobs.filter((j) => 
          ["pending", "claimed", "running"].includes(j.status)
        );
        setJobs(activeJobs);
        
        // If a job is selected via URL, find it
        if (selectedJobId) {
          const job = allJobs.find((j) => j._id === selectedJobId);
          if (job) setSelectedJob(job);
        } else if (activeJobs.length > 0 && !selectedJob) {
          setSelectedJob(activeJobs[0]);
        }
      }
      
      // Fetch device info for all jobs
      const devicesRes = await fetch("/api/devices");
      if (devicesRes.ok) {
        const allDevices: Device[] = await devicesRes.json();
        const deviceMap: Record<string, Device> = {};
        allDevices.forEach((d) => {
          deviceMap[d.deviceId] = d;
        });
        setDevices(deviceMap);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchActiveJobs();
      const interval = setInterval(fetchActiveJobs, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [username, selectedJobId]);

  const getStatusStage = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "claimed": return 1;
      case "running": return 2;
      default: return 0;
    }
  };

  const getProgress = (job: Job) => {
    switch (job.status) {
      case "pending": return 0;
      case "claimed": return 10;
      case "running": return 50;
      case "completed": return 100;
      case "failed": return 0;
      default: return 0;
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "—";
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
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading operations...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Operations</h1>
          <p className="text-zinc-500 text-sm">Monitor your running jobs in real-time</p>
        </div>
        
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
          <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No active operations</p>
          <p className="text-zinc-600 text-sm mt-1">Create a new project to get started</p>
          <Link 
            href="/contractor/create"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-amber-500 text-black font-medium text-sm hover:bg-amber-400 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      </div>
    );
  }

  const device = selectedJob?.deviceId ? devices[selectedJob.deviceId] : null;
  const stage = selectedJob ? getStatusStage(selectedJob.status) : 0;

  const projectStages = [
    { name: "Posted", status: stage >= 0 ? "complete" : "pending", time: selectedJob ? formatTimeAgo(selectedJob.createdAt) : "—" },
    { name: "Matched", status: stage >= 1 ? "complete" : "pending", time: stage >= 1 ? "Device assigned" : "Pending" },
    { name: "Executing", status: stage >= 2 ? "active" : "pending", time: stage >= 2 ? "In progress" : "Pending" },
    { name: "Complete", status: selectedJob?.status === "completed" ? "complete" : "pending", time: selectedJob?.completedAt ? formatTimeAgo(selectedJob.completedAt) : "Pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Operations</h1>
          <p className="text-zinc-500 text-sm">
            {jobs.length} active job{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-1 space-y-3">
          {jobs.map((job) => (
            <Link
              key={job._id}
              href={`/contractor/tracking?job=${job._id}`}
              onClick={() => setSelectedJob(job)}
              className={`block p-4 rounded-xl border transition-all ${
                selectedJob?._id === job._id
                  ? "bg-amber-500/10 border-amber-500/50"
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white text-sm">{job.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {job.deviceId ? job.deviceId.slice(0, 12) + "..." : "Finding device..."}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] uppercase ${
                  job.status === "running" ? "bg-cyan-500/20 text-cyan-400" :
                  job.status === "claimed" ? "bg-amber-500/20 text-amber-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-500">Progress</span>
                  <span className="text-zinc-400">{getProgress(job)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${getProgress(job)}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Job Details */}
        {selectedJob && (
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedJob.status === "running" ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400" :
                    selectedJob.status === "claimed" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" :
                    "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                  }`}>
                    {selectedJob.status}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm">
                  Device: {device ? device.specs.cpu.split(" ").slice(0, 3).join(" ") : "Finding..."} 
                  {selectedJob.deviceId && ` • ${selectedJob.deviceId.slice(0, 16)}...`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-amber-400">${selectedJob.reward.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Reward</p>
              </div>
            </div>

            {/* Progress Pipeline */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6">Mission Timeline</h3>
              <div className="flex items-center">
                {projectStages.map((stage, i) => (
                  <div key={stage.name} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          stage.status === "complete"
                            ? "bg-emerald-500/20 border border-emerald-500/50"
                            : stage.status === "active"
                            ? "bg-cyan-500/20 border border-cyan-500/50 animate-pulse"
                            : "bg-zinc-900 border border-zinc-700"
                        }`}
                      >
                        {stage.status === "complete" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : stage.status === "active" ? (
                          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                        ) : (
                          <Clock className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <p className={`text-xs mt-2 font-medium ${
                        stage.status === "pending" ? "text-zinc-600" : "text-white"
                      }`}>
                        {stage.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">{stage.time}</p>
                    </div>
                    {i < projectStages.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 bg-zinc-800">
                        <div
                          className={`h-full transition-all ${
                            stage.status === "complete" ? "bg-emerald-500" : ""
                          }`}
                          style={{ width: stage.status === "complete" ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Terminal */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  <h3 className="font-bold text-white">Live Execution Logs</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">Connected</span>
                </div>
              </div>
              <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-1 h-64 overflow-y-auto">
                {selectedJob.logs?.length > 0 ? (
                  selectedJob.logs.map((log, i) => (
                    <p key={i} className="text-zinc-400">
                      <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>{" "}
                      {log}
                    </p>
                  ))
                ) : (
                  <p className="text-zinc-600 italic">Waiting for logs...</p>
                )}
                {selectedJob.status === "running" && (
                  <p className="text-zinc-600 animate-pulse">_</p>
                )}
              </div>
            </div>

            {/* Device Stats */}
            {device && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Device Resources</h3>
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400">CPU Load</span>
                        <span className="font-mono">{device.status?.cpuLoadPercent || 0}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full" 
                          style={{ width: `${device.status?.cpuLoadPercent || 0}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400">RAM Usage</span>
                        <span className="font-mono">{device.status?.ramUsedPercent || 0}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 rounded-full" 
                          style={{ width: `${device.status?.ramUsedPercent || 0}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white">Job Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Status</span>
                      <span className="font-mono text-cyan-400 capitalize">{selectedJob.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Started</span>
                      <span className="font-mono">{selectedJob.startedAt ? formatTimeAgo(selectedJob.startedAt) : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Reward</span>
                      <span className="font-mono text-emerald-400">${selectedJob.reward.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
