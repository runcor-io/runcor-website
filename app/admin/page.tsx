"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  Cpu,
  Coins,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

interface Stats {
  users: { total: number; providers: number; contractors: number; admins: number };
  jobs: { total: number; pending: number; running: number; completed: number; failed: number; successRate: number };
  devices: { total: number; online: number; offline: number };
  financial: { totalDeposits: number; totalWithdrawals: number; totalFees: number; platformBalance: number };
  recentTransactions: any[];
  systemHealth: { cpuUsage: number; memoryUsage: number; diskUsage: number; status: string };
}

export default function AdminOverview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = (session?.user as any)?.entityType === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated" && isAdmin) {
      fetchData();
    }
  }, [status, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/system/health"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setStats((prev: any) => ({ ...prev, systemHealth: healthData }));
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-zinc-500">System overview and key metrics</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs text-zinc-500">Total Users</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.users?.total || 0}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-zinc-500">
              {stats?.users?.providers || 0} providers
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-xs text-zinc-500">
              {stats?.users?.contractors || 0} contractors
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Briefcase className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xs text-zinc-500">Total Jobs</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.jobs?.total || 0}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-purple-400">
              {stats?.jobs?.pending || 0} pending
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-xs text-cyan-400">
              {stats?.jobs?.running || 0} running
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-zinc-500">Devices</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.devices?.total || 0}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-emerald-400">
              {stats?.devices?.online || 0} online
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-xs text-zinc-500">
              {stats?.devices?.offline || 0} offline
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs text-zinc-500">Platform Revenue</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(stats?.financial?.platformBalance || 0).toLocaleString()} RUN
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-zinc-500">
              {(stats?.financial?.totalFees || 0).toLocaleString()} fees collected
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Distribution */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Job Status Distribution
          </h3>
          <div className="space-y-4">
            {[
              { label: "Pending", value: stats?.jobs?.pending || 0, color: "bg-purple-400", total: stats?.jobs?.total || 0 },
              { label: "Running", value: stats?.jobs?.running || 0, color: "bg-cyan-400", total: stats?.jobs?.total || 0 },
              { label: "Completed", value: stats?.jobs?.completed || 0, color: "bg-emerald-400", total: stats?.jobs?.total || 0 },
              { label: "Failed", value: stats?.jobs?.failed || 0, color: "bg-red-400", total: stats?.jobs?.total || 0 },
            ].map((item) => {
              const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{item.label}</span>
                    <span className="text-white font-mono">{item.value}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            System Health
          </h3>
          <div className="space-y-4">
            {[
              { label: "CPU Usage", value: stats?.systemHealth?.cpuUsage || 0, color: "bg-cyan-400" },
              { label: "Memory Usage", value: stats?.systemHealth?.memoryUsage || 0, color: "bg-amber-400" },
              { label: "Disk Usage", value: stats?.systemHealth?.diskUsage || 0, color: "bg-purple-400" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="text-white font-mono">{item.value.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">System Status</span>
                <span className={`text-sm font-medium ${
                  stats?.systemHealth?.status === "healthy" ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {stats?.systemHealth?.status === "healthy" ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Healthy
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Degraded
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {stats?.recentTransactions?.length === 0 ? (
            <p className="text-zinc-500 text-sm">No recent activity</p>
          ) : (
            stats?.recentTransactions?.slice(0, 5).map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.type === "credit" ? "bg-emerald-400" : "bg-rose-400"
                  }`} />
                  <div>
                    <p className="text-sm text-white">{tx.description}</p>
                    <p className="text-xs text-zinc-500">{tx.username}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm ${
                  tx.type === "credit" ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {tx.type === "credit" ? "+" : "-"}{tx.amount} RUN
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
