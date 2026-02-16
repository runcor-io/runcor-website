"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Briefcase,
  Cpu,
  Coins,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  X,
  Plus,
  Minus,
  CheckCircle,
  Activity,
  Clock,
  Package,
  UserX,
  Edit3,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  role: string;
  walletBalance: number;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  postedBy: string;
  claimedBy?: string;
  deviceId?: string;
  reward: number;
  createdAt: string;
}

interface Stats {
  users: { total: number; contractors: number; owners: number };
  jobs: { total: number; pending: number; running: number; completed: number; failed: number; successRate: number };
  devices: { total: number; online: number };
  tokens: { inCirculation: number; totalTransacted: number };
  recentTransactions: any[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if admin
  const isAdmin = (session?.user as any)?.username?.toLowerCase() === "admin";

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
    try {
      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }

      // Fetch jobs
      const jobsRes = await fetch("/api/admin/jobs?limit=50");
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs);
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user and ALL their data? This cannot be undone!")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        setSuccess("User deleted");
      } else {
        setError("Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const adjustTokens = async (userId: string, action: "add" | "remove") => {
    const amount = parseInt(tokenAmount);
    if (!amount || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: action === "add" ? "add_tokens" : "remove_tokens",
          amount,
        }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  walletBalance:
                    action === "add"
                      ? u.walletBalance + amount
                      : Math.max(0, u.walletBalance - amount),
                }
              : u
          )
        );
        setSuccess(`Tokens ${action === "add" ? "added" : "removed"}`);
        setTokenAmount("");
        setSelectedUser(null);
      } else {
        setError("Failed to adjust tokens");
      }
    } catch (err) {
      setError("Failed to adjust tokens");
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Delete this job?")) return;

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== jobId));
        setSuccess("Job deleted");
      } else {
        setError("Failed to delete job");
      }
    } catch (err) {
      setError("Failed to delete job");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.postedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-zinc-500 text-sm">System management and oversight</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError("")} className="ml-auto">
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto">
              <X className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-zinc-400 text-sm">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.users.total || 0}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {stats?.users.contractors || 0} contractors, {stats?.users.owners || 0} owners
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span className="text-zinc-400 text-sm">Total Jobs</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.jobs.total || 0}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {stats?.jobs.pending || 0} pending, {stats?.jobs.running || 0} running
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-zinc-400 text-sm">Devices</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.devices.total || 0}</p>
            <p className="text-xs text-zinc-500 mt-1">{stats?.devices.online || 0} online</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-400 text-sm">Tokens in Circulation</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {(stats?.tokens.inCirculation || 0).toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {(stats?.tokens.totalTransacted || 0).toLocaleString()} transacted
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-800 mb-6">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "users", label: "Users", icon: Users },
            { id: "jobs", label: "Jobs", icon: Briefcase },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-cyan-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {(activeTab === "users" || activeTab === "jobs") && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        )}

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Status Distribution */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Job Status Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: "Pending", value: stats?.jobs.pending || 0, color: "bg-purple-400" },
                  { label: "Running", value: stats?.jobs.running || 0, color: "bg-cyan-400" },
                  { label: "Completed", value: stats?.jobs.completed || 0, color: "bg-emerald-400" },
                  { label: "Failed", value: stats?.jobs.failed || 0, color: "bg-red-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400 w-20">{item.label}</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{
                          width: `${
                            stats?.jobs.total
                              ? (item.value / stats.jobs.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-mono text-white w-12 text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Recent Transactions</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats?.recentTransactions.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No transactions yet</p>
                ) : (
                  stats?.recentTransactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50"
                    >
                      <div>
                        <p className="text-sm text-white">{tx.description}</p>
                        <p className="text-xs text-zinc-500">{tx.username}</p>
                      </div>
                      <span
                        className={`font-mono text-sm ${
                          tx.type === "credit" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}
                        {tx.amount}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">User</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Role</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Balance</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Joined</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-emerald-400">
                        {user.walletBalance.toLocaleString()} tokens
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          title="Adjust tokens"
                        >
                          <Coins className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          title="Delete user"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Job</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Posted By</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Reward</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{job.title}</p>
                        <p className="text-xs text-zinc-500 font-mono">{job.id.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${
                          job.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : job.status === "running"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : job.status === "pending"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">{job.postedBy}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-amber-400">{job.reward} tokens</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Token Adjustment Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-2">Adjust Tokens</h3>
              <p className="text-zinc-500 text-sm mb-4">
                User: <span className="text-white">{selectedUser.username}</span>
                <br />
                Current Balance: <span className="text-emerald-400">{selectedUser.walletBalance.toLocaleString()} tokens</span>
              </p>

              <div className="mb-4">
                <label className="block text-xs text-zinc-500 mb-2">Amount</label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => adjustTokens(selectedUser.id, "remove")}
                  disabled={!tokenAmount}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  Remove
                </button>
                <button
                  onClick={() => adjustTokens(selectedUser.id, "add")}
                  disabled={!tokenAmount}
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
