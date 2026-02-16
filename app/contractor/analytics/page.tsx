"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Star,
  Target,
  Zap,
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
    totalSpent: number;
    successRate: number;
  };
  earningsChart: { date: string; amount: number }[];
  spendingChart: { date: string; amount: number }[];
  jobsByType: { type: string; count: number }[];
  recentActivity: {
    id: string;
    title: string;
    status: string;
    reward: number;
    date: string;
    deviceId?: string;
  }[];
}

export default function ContractorAnalytics() {
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
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading analytics...</span>
      </div>
    );
  }

  const maxSpending = data?.spendingChart && data.spendingChart.length > 0
    ? Math.max(...data.spendingChart.map((d) => d.amount))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-500 text-sm">Track your job postings and spending</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors"
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
            <DollarSign className="w-4 h-4 text-rose-400" />
            <span className="text-zinc-400 text-sm">Total Spent</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {(data?.summary?.totalSpent || 0).toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-1">tokens</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-sm">Jobs Posted</span>
          </div>
          <p className="text-3xl font-bold text-white">{data?.summary?.totalJobs || 0}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {data?.summary?.completedJobs || 0} completed
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-400 text-sm">Active Jobs</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(data?.summary?.pendingJobs || 0) + (data?.summary?.runningJobs || 0)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {data?.summary?.runningJobs || 0} running
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-sm">Success Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{data?.summary?.successRate || 0}%</p>
          <p className="text-xs text-zinc-500 mt-1">
            {data?.summary?.failedJobs || 0} failed
          </p>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Daily Spending (Last 30 Days)</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Total:</span>
            <span className="font-mono text-amber-400">
              {(data?.summary?.totalSpent || 0).toLocaleString()} tokens
            </span>
          </div>
        </div>

        {data?.spendingChart?.every((d) => d.amount === 0) ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No spending data yet</p>
              <p className="text-zinc-600 text-sm">Post jobs to see your spending chart</p>
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-end gap-1">
            {data?.spendingChart?.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative group">
                  <div
                    className="w-full bg-amber-500/20 rounded-t transition-all hover:bg-amber-500/40"
                    style={{ height: `${(day.amount / (maxSpending || 1)) * 160}px` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.amount.toLocaleString()} tokens
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
        {/* Jobs by Type */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">Jobs by Type</h3>
          </div>

          {data?.jobsByType.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No jobs posted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.jobsByType.map((type) => (
                <div key={type.type} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white capitalize">{type.type.replace(/_/g, " ")}</span>
                      <span className="font-mono text-sm text-amber-400">{type.count} jobs</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${Math.min((type.count / (data.summary.totalJobs || 1)) * 100, 100)}%` }}
                      />
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
                        <Zap className="w-4 h-4 text-cyan-400" />
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
                    <p className="font-mono text-sm text-rose-400">
                      -{job.reward.toLocaleString()} tokens
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">{job.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
