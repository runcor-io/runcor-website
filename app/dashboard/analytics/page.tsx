"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Cpu,
  Award,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Briefcase,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    pendingJobs: number;
    runningJobs: number;
    totalEarnings: number;
    successRate: number;
  };
  earningsChart: { date: string; amount: number }[];
  jobsByType: { type: string; count: number }[];
  deviceStats: {
    deviceId: string;
    cpu: string;
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    successRate: number;
    earnings: number;
    lastSeen: string;
  }[];
  recentActivity: {
    id: string;
    title: string;
    status: string;
    reward: number;
    date: string;
    deviceId: string;
  }[];
}

export default function Analytics() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        setError("Failed to load analytics");
      }
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading analytics...</span>
      </div>
    );
  }

  const maxEarning =
    data?.earningsChart && data.earningsChart.length > 0
      ? Math.max(...data.earningsChart.map((d) => d.amount))
      : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-zinc-500 text-sm">Performance metrics and device statistics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-sm">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            ${data?.summary.totalEarnings.toFixed(2) || "0.00"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400">From completed jobs</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-400 text-sm">Jobs Completed</span>
          </div>
          <p className="text-3xl font-bold text-white">{data?.summary.completedJobs || 0}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-zinc-500">
              of {data?.summary.totalJobs || 0} total
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-sm">Success Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{data?.summary.successRate || 0}%</p>
          <div className="flex items-center gap-1 mt-1">
            {data && data.summary.failedJobs > 0 ? (
              <>
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">{data.summary.failedJobs} failed</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">Perfect record</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-sm">Active Jobs</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(data?.summary.pendingJobs || 0) + (data?.summary.runningJobs || 0)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-zinc-500">
              {data?.summary.runningJobs || 0} running, {data?.summary.pendingJobs || 0} pending
            </span>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white">Daily Earnings (Last 30 Days)</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Total:</span>
            <span className="font-mono text-cyan-400">
              ${data?.summary.totalEarnings.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {data?.earningsChart.every((d) => d.amount === 0) ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No earnings data yet</p>
              <p className="text-zinc-600 text-sm">Complete jobs to see your earnings chart</p>
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-end gap-1">
            {data?.earningsChart.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative group">
                  <div
                    className="w-full bg-cyan-500/20 rounded-t transition-all hover:bg-cyan-500/40"
                    style={{ height: `${(day.amount / (maxEarning || 1)) * 160}px` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    ${day.amount.toFixed(2)}
                  </div>
                </div>
                {i % 5 === 0 && (
                  <span className="text-[10px] text-zinc-600">{formatDate(day.date)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Performance */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Device Performance</h3>
            <span className="text-xs text-zinc-500">{data?.deviceStats.length || 0} devices</span>
          </div>

          {data?.deviceStats.length === 0 ? (
            <div className="p-8 text-center">
              <Cpu className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No devices registered</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.deviceStats.map((device) => (
                <div
                  key={device.deviceId}
                  className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-white truncate">{device.cpu}</p>
                      <p className="font-mono text-emerald-400">${device.earnings.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-zinc-500">Success</span>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full rounded-full ${
                              device.successRate >= 90
                                ? "bg-emerald-400"
                                : device.successRate >= 70
                                ? "bg-amber-400"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${device.successRate}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 w-8">{device.successRate}%</span>
                      </div>
                      <span className="text-zinc-500">{device.totalJobs} jobs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Recent Activity</h3>
            <span className="text-xs text-zinc-500">Last 10 jobs</span>
          </div>

          {data?.recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recentActivity.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        job.status === "completed"
                          ? "bg-emerald-500/20"
                          : job.status === "failed"
                          ? "bg-red-500/20"
                          : job.status === "running"
                          ? "bg-cyan-500/20"
                          : "bg-amber-500/20"
                      }`}
                    >
                      {job.status === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : job.status === "failed" ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : job.status === "running" ? (
                        <Activity className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{job.title}</p>
                      <p className="text-xs text-zinc-500">{formatTimeAgo(job.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono text-sm ${
                        job.status === "completed"
                          ? "text-emerald-400"
                          : job.status === "failed"
                          ? "text-red-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {job.status === "completed" ? "+" : ""}${job.reward.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">{job.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobs by Type */}
      {data && data.jobsByType.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">Jobs by Type</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.jobsByType.map((type) => (
              <div key={type.type} className="p-4 rounded-lg bg-zinc-900/50 text-center">
                <p className="text-2xl font-bold text-purple-400">{type.count}</p>
                <p className="text-sm text-zinc-500 capitalize">{type.type.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
