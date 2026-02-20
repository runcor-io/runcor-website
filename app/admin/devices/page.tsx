"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Cpu,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Power,
  Ban,
  HardDrive,
  Activity,
} from "lucide-react";

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  owner: string;
  status: "online" | "offline" | "banned";
  specs?: {
    cpu?: string;
    ram?: string;
    gpu?: string;
  };
  lastSeen?: string;
  totalJobsCompleted: number;
  earnings: number;
}

export default function DeviceManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
      fetchDevices();
    }
  }, [status, isAdmin]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      } else {
        setError("Failed to fetch devices");
      }
    } catch (err) {
      setError("Error fetching devices");
    } finally {
      setLoading(false);
    }
  };

  const banDevice = async (deviceId: string, ban: boolean) => {
    const action = ban ? "ban" : "unban";
    if (!confirm(`Are you sure you want to ${action} this device?`)) return;

    try {
      const res = await fetch("/api/admin/devices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, action }),
      });

      if (res.ok) {
        setDevices(devices.map((d) => (d._id === deviceId ? { ...d, status: ban ? "banned" : "offline" } : d)));
        setSuccess(`Device ${action}ned successfully`);
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${action} device`);
      }
    } catch (err) {
      setError(`Error ${action}ning device`);
    }
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "offline":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
      case "banned":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Power className="w-4 h-4 text-emerald-400" />;
      case "offline":
        return <Power className="w-4 h-4 text-zinc-400" />;
      case "banned":
        return <Ban className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Device Management</h1>
          <p className="text-zinc-500">Monitor and manage all devices</p>
        </div>
        <button
          onClick={fetchDevices}
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
      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search devices..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Devices Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Device</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Owner</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Jobs</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Earnings</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No devices found
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => (
                <tr key={device._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{device.name || "Unnamed Device"}</p>
                        <p className="text-xs text-zinc-500 font-mono">{device.deviceId.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(device.status)}
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-sm">{device.owner}</td>
                  <td className="px-4 py-3 text-zinc-400 text-sm">{device.totalJobsCompleted}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-emerald-400">{device.earnings} RUN</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {device.status === "banned" ? (
                        <button
                          onClick={() => banDevice(device._id, false)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          title="Unban device"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => banDevice(device._id, true)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          title="Ban device"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: devices.length, color: "text-white" },
          { label: "Online", value: devices.filter((d) => d.status === "online").length, color: "text-emerald-400" },
          { label: "Offline", value: devices.filter((d) => d.status === "offline").length, color: "text-zinc-400" },
          { label: "Banned", value: devices.filter((d) => d.status === "banned").length, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
