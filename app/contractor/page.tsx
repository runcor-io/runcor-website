"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  Loader2,
  Briefcase,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  deviceId?: string;
  reward: number;
  createdAt: string;
  completedAt?: string;
}

export default function MissionControl() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "";
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingJobs: 0,
    runningJobs: 0,
    totalEscrow: 0,
    completedJobs: 0,
    successRate: 0,
    availableDevices: 0,
  });
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<Job[]>([]);

  const fetchDashboard = async () => {
    try {
      // Fetch contractor's jobs (uses username param for $or query)
      const jobsRes = await fetch(`/api/jobs?username=${encodeURIComponent(username)}`);
      const allJobs: Job[] = jobsRes.ok ? await jobsRes.json() : [];
      
      // Fetch available devices
      const devicesRes = await fetch("/api/devices");
      const allDevices = devicesRes.ok ? await devicesRes.json() : [];
      
      // Calculate stats
      const pendingJobs = allJobs.filter((j) => j.status === "pending");
      const runningJobs = allJobs.filter((j) => j.status === "running" || j.status === "claimed");
      const completedJobs = allJobs.filter((j) => j.status === "completed");
      const failedJobs = allJobs.filter((j) => j.status === "failed");
      const activeJobsList = allJobs.filter((j) => ["pending", "claimed", "running"].includes(j.status));
      
      const totalCompleted = completedJobs.length + failedJobs.length;
      const successRate = totalCompleted > 0 ? Math.round((completedJobs.length / totalCompleted) * 100) : 0;
      
      const totalEscrow = [...pendingJobs, ...runningJobs].reduce((sum, j) => sum + (j.reward || 0), 0);
      
      setStats({
        activeJobs: activeJobsList.length,
        pendingJobs: pendingJobs.length,
        runningJobs: runningJobs.length,
        totalEscrow,
        completedJobs: completedJobs.length,
        successRate,
        availableDevices: allDevices.length,
      });
      
      // Active projects (first 5)
      setActiveJobs(activeJobsList.slice(0, 5).map(job => ({
        ...job,
        progress: job.status === "pending" ? 0 : job.status === "claimed" ? 10 : job.status === "running" ? 50 : 0,
      })));
      
      // Recent completions (last 5)
      setRecentCompletions(
        completedJobs
          .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
          .slice(0, 5)
      );
      
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 10000);
      return () => clearInterval(interval);
    }
  }, [username]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-cyan-500/20 text-cyan-400";
      case "claimed": return "bg-amber-500/20 text-amber-400";
      case "pending": return "bg-purple-500/20 text-purple-400";
      case "completed": return "bg-emerald-500/20 text-emerald-400";
      default: return "bg-zinc-800 text-zinc-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Activity className="w-5 h-5 text-cyan-400" />;
      case "claimed": return <Zap className="w-5 h-5 text-amber-400" />;
      case "pending": return <Clock className="w-5 h-5 text-purple-400" />;
      case "completed": return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default: return <Briefcase className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "claimed": return "matched";
      case "running": return "executing";
      case "pending": return "matching";
      default: return status;
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
        <span className="ml-3 text-zinc-400">Loading mission control...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-zinc-500 text-sm">Command center for autonomous job execution</p>
        </div>
        <Link 
          href="/contractor/create" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Active Projects</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeJobs}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {stats.runningJobs} executing, {stats.pendingJobs} matching
          </p>
        </div>
        
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">In Escrow</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-cyan-400">
            ${stats.totalEscrow.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">across {stats.activeJobs} projects</p>
        </div>
        
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Completed (All Time)</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.completedJobs}</p>
          <p className="text-xs text-emerald-400 mt-1">{stats.successRate}% success rate</p>
        </div>
        
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Network Status</span>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.availableDevices}</p>
          <p className="text-xs text-zinc-500 mt-1">devices available</p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-white">Active Operations</h2>
          <Link href="/contractor/tracking" className="text-xs text-amber-400 hover:text-amber-300">
            View All →
          </Link>
        </div>
        
        {activeJobs.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No active projects</p>
            <p className="text-zinc-600 text-sm mt-1">Create a new project to get started</p>
            <Link 
              href="/contractor/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-amber-500 text-black font-medium text-sm hover:bg-amber-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div
                key={job._id}
                className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{job.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="font-mono">{job._id.slice(-8)}</span>
                        <span>•</span>
                        <span>{job.deviceId ? job.deviceId.slice(0, 12) + "..." : "Searching..."}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-amber-400">${job.reward.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">in escrow</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-zinc-400 capitalize">{getStatusLabel(job.status)}</span>
                      <span className="text-zinc-500">{job.progress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(job.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-bold text-lg text-white mb-4">Recent Completions</h2>
          
          {recentCompletions.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No completed jobs yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {recentCompletions.map((job) => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">{job.title}</p>
                        <p className="text-xs text-zinc-500">
                          {job.deviceId ? job.deviceId.slice(0, 12) + "..." : "Unknown device"} • {job.completedAt ? formatTimeAgo(job.completedAt) : "Recently"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-emerald-400">${job.reward.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/contractor/results"
                className="w-full mt-4 py-2 rounded-lg bg-zinc-900 text-sm text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                View Results Gallery
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-bold text-lg text-white mb-4">Quick Deploy</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/contractor/create?type=compute"
              className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-all text-center"
            >
              <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="font-medium text-sm text-white">Compute Job</p>
              <p className="text-xs text-zinc-500 mt-1">AI, Render, Batch</p>
            </Link>
            <Link
              href="/contractor/create?type=physical"
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all text-center"
            >
              <Activity className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="font-medium text-sm text-white">Physical Job</p>
              <p className="text-xs text-zinc-500 mt-1">3D Print, CNC, Drone</p>
            </Link>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Network Status</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {stats.availableDevices} devices are online and available. 
                  Average job completion time is 15 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
