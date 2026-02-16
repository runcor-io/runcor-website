"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "../../components/SocketProvider";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Search,
  Zap,
  RefreshCw,
  Terminal,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  type: string;
  status: "pending" | "claimed" | "running" | "paused" | "completed" | "failed";
  postedBy: string;
  claimedBy?: string;
  deviceId: string | null;
  reward: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  logs: string[];
  error?: string;
  result?: any;
}

const filters = ["All", "Pending", "Running", "Completed", "Failed"];

export default function JobMonitor() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [updatingJob, setUpdatingJob] = useState<string | null>(null);
  const { data: session } = useSession();
  const { isConnected, socket } = useSocket();
  const username = (session?.user as any)?.username || "";

  useEffect(() => {
    if (username) {
      fetchJobs();
      
      // Fallback: Auto-refresh every 10 seconds if WebSocket not connected
      const interval = setInterval(() => {
        if (!isConnected) {
          fetchJobs();
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, username]);

  // WebSocket: Listen for real-time job updates
  useEffect(() => {
    if (!socket) return;

    const handleJobUpdate = (updatedJob: Job) => {
      console.log("Real-time job update:", updatedJob);
      setJobs((currentJobs) => {
        const exists = currentJobs.find((j) => j._id === updatedJob._id);
        if (exists) {
          // Update existing job
          return currentJobs.map((j) =>
            j._id === updatedJob._id ? { ...j, ...updatedJob } : j
          );
        } else {
          // Add new job
          return [updatedJob, ...currentJobs];
        }
      });
    };

    socket.on("job:updated", handleJobUpdate);

    return () => {
      socket.off("job:updated", handleJobUpdate);
    };
  }, [socket]);

  const fetchJobs = async () => {
    try {
      if (!username) {
        console.log("[Jobs] No username, skipping fetch");
        return;
      }
      
      console.log("[Jobs] Fetching jobs for username:", username);
      const response = await fetch(`/api/jobs?username=${encodeURIComponent(username)}`);
      console.log("[Jobs] Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("[Jobs] Found jobs:", data.length, data.map((j: any) => ({ 
          id: j._id?.slice(-8), 
          status: j.status, 
          claimedBy: j.claimedBy,
          postedBy: j.postedBy,
          title: j.title 
        })));
        setJobs(data);
      } else {
        console.error("[Jobs] Failed to fetch:", await response.text());
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeFilter === "All" || job.status === activeFilter.toLowerCase();
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
      case "paused":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-purple-400" />;
      case "claimed":
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
      case "paused":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "claimed":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "completed":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "failed":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "pending":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400";
      default:
        return "";
    }
  };

  const getProgress = (job: Job) => {
    switch (job.status) {
      case "pending":
        return 0;
      case "claimed":
        return 10;
      case "running":
        return 50;
      case "paused":
        return job.logs?.length > 0 ? 50 : 25;
      case "completed":
        return 100;
      case "failed":
        return job.logs?.length > 0 ? 50 : 0;
      default:
        return 0;
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (job: Job) => {
    if (!job.startedAt) return "—";
    const end = job.completedAt ? new Date(job.completedAt) : new Date();
    const start = new Date(job.startedAt);
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  const controlJob = async (jobId: string, action: "pause" | "resume" | "estop") => {
    setUpdatingJob(jobId);
    try {
      const response = await fetch("/api/jobs/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, action }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchJobs();
      } else {
        alert(data.error || `Failed to ${action} job`);
      }
    } catch (error) {
      console.error("Failed to control job:", error);
      alert(`Failed to ${action} job`);
    } finally {
      setUpdatingJob(null);
    }
  };

  const activeCount = jobs.filter(j => j.status === "running").length;
  const pendingCount = jobs.filter(j => j.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Monitor</h1>
          <p className="text-zinc-500 text-sm">Track compute jobs across your fleet</p>
        </div>
        <div className="flex items-center gap-3">
          {/* WebSocket Connection Status */}
          <div 
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${
              isConnected 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
            title={isConnected ? "Real-time updates active" : "Polling mode (10s)"}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isConnected ? "LIVE" : "POLLING"}</span>
          </div>
          <button
            onClick={fetchJobs}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-mono">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-mono">{pendingCount} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase">Job</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase">Device</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase">Progress</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase">Reward</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase">Duration</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredJobs.map((job) => (
                <React.Fragment key={job._id}>
                  <tr 
                    className="hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white">{job.title}</p>
                          <p className="text-xs text-zinc-500 font-mono">{job._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {job.deviceId ? job.deviceId.slice(0, 12) + "..." : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="capitalize">{job.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              job.status === "failed" ? "bg-red-400" : "bg-cyan-400"
                            }`}
                            style={{ width: `${getProgress(job)}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">{getProgress(job)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-cyan-400">${job.reward?.toFixed(2) || "0.00"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">
                        <p>{formatDuration(job)}</p>
                        <p className="text-xs text-zinc-500">{formatTime(job.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {expandedJob === job._id ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </td>
                  </tr>
                  {expandedJob === job._id && (
                    <tr className="bg-zinc-900/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-3">
                          {/* Control Buttons */}
                          {(job.status === "running" || job.status === "paused" || job.status === "claimed") && (
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                              {job.status === "running" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    controlJob(job._id, "pause");
                                  }}
                                  disabled={updatingJob === job._id}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm hover:bg-amber-500/20 disabled:opacity-50"
                                >
                                  {updatingJob === job._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )}
                                  Pause
                                </button>
                              )}
                              {job.status === "paused" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    controlJob(job._id, "resume");
                                  }}
                                  disabled={updatingJob === job._id}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm hover:bg-emerald-500/20 disabled:opacity-50"
                                >
                                  {updatingJob === job._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Zap className="w-4 h-4" />
                                  )}
                                  Resume
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Emergency stop this job?")) {
                                    controlJob(job._id, "estop");
                                  }
                                }}
                                disabled={updatingJob === job._id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                E-STOP
                              </button>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Terminal className="w-4 h-4" />
                            <span>Job Logs</span>
                          </div>
                          <div className="bg-black rounded-lg p-4 font-mono text-xs text-zinc-400 max-h-64 overflow-y-auto">
                            {job.logs?.length > 0 ? (
                              job.logs.map((log, i) => (
                                <div key={i} className="py-0.5">
                                  <span className="text-zinc-600">[{i + 1}]</span> {log}
                                </div>
                              ))
                            ) : (
                              <span className="text-zinc-600 italic">No logs yet...</span>
                            )}
                          </div>
                          {job.error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                              <p className="text-red-400 text-sm font-medium">Error</p>
                              <p className="text-red-400/70 text-xs mt-1">{job.error}</p>
                            </div>
                          )}
                          {job.result && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                              <p className="text-emerald-400 text-sm font-medium">Result</p>
                              <pre className="text-emerald-400/70 text-xs mt-1 overflow-x-auto">
                                {JSON.stringify(job.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredJobs.length === 0 && !loading && (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No jobs found</p>
            <p className="text-zinc-600 text-sm mt-1">
              Create a job from the Contractor Portal to get started
            </p>
          </div>
        )}
        {loading && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-zinc-500 mt-4">Loading jobs...</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, color: "text-white" },
          { label: "Completed", value: jobs.filter(j => j.status === "completed").length, color: "text-emerald-400" },
          { label: "Failed", value: jobs.filter(j => j.status === "failed").length, color: "text-red-400" },
          { label: "Total Earned", value: `$${jobs.filter(j => j.status === "completed").reduce((a, j) => a + (j.reward || 0), 0).toFixed(2)}`, color: "text-cyan-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
