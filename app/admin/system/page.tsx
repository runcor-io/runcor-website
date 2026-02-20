"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Server,
  Database,
  HardDrive,
  Wifi,
  Clock,
  AlertTriangle,
  Terminal,
} from "lucide-react";

interface SystemHealth {
  status: string;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  lastChecked: string;
}

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  source: string;
}

export default function SystemHealth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logLevel, setLogLevel] = useState<string>("all");
  const [error, setError] = useState("");

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
      const [healthRes, logsRes] = await Promise.all([
        fetch("/api/admin/system/health"),
        fetch("/api/admin/system/logs"),
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      setError("Failed to fetch system data");
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredLogs = logs.filter((log) => {
    return logLevel === "all" || log.level === logLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-amber-400";
      case "info":
        return "text-cyan-400";
      default:
        return "text-zinc-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-emerald-400";
      case "degraded":
        return "text-amber-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-zinc-500">Monitor platform health and logs</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
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

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-400 text-sm">System Status</span>
          </div>
          <p className={`text-2xl font-bold capitalize ${getStatusColor(health?.status || "unknown")}`}>
            {health?.status || "Unknown"}
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-sm">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatUptime(health?.uptime || 0)}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-sm">Database</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">Connected</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-sm">API Status</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">Operational</p>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              CPU Usage
            </h3>
            <span className="text-2xl font-bold text-white">{(health?.cpuUsage || 0).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(health?.cpuUsage || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              Memory Usage
            </h3>
            <span className="text-2xl font-bold text-white">{(health?.memoryUsage || 0).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(health?.memoryUsage || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Disk Usage
            </h3>
            <span className="text-2xl font-bold text-white">{(health?.diskUsage || 0).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(health?.diskUsage || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-zinc-400" />
            System Logs
          </h3>
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-700"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-500" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No logs found</p>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-zinc-900/50">
                <span className="text-zinc-500 text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`text-xs uppercase font-bold ${getLevelColor(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-zinc-400 text-xs">[{log.source}]</span>
                <span className="text-zinc-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Active Alerts
        </h3>
        <div className="space-y-2">
          {(health?.cpuUsage || 0) > 80 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-amber-400 font-medium">High CPU Usage</p>
                <p className="text-zinc-500 text-sm">CPU usage is above 80%</p>
              </div>
            </div>
          )}
          {(health?.memoryUsage || 0) > 80 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-amber-400 font-medium">High Memory Usage</p>
                <p className="text-zinc-500 text-sm">Memory usage is above 80%</p>
              </div>
            </div>
          )}
          {(health?.diskUsage || 0) > 80 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">High Disk Usage</p>
                <p className="text-zinc-500 text-sm">Disk usage is above 80%</p>
              </div>
            </div>
          )}
          {(health?.cpuUsage || 0) <= 80 && (health?.memoryUsage || 0) <= 80 && (health?.diskUsage || 0) <= 80 && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-400">No active alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
