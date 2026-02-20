"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Trash2,
  RotateCcw,
  Ban,
  DollarSign,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  type: string;
  status: string;
  postedBy: string;
  claimedBy?: string;
  deviceId?: string;
  reward: number;
  createdAt: string;
  completedAt?: string;
}

export default function JobManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
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
      fetchJobs();
    }
  }, [status, isAdmin]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs?limit=100");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      setError("Error fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        setJobs(jobs.filter((j) => j._id !== jobId));
        setSuccess("Job deleted successfully");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete job");
      }
    } catch (err) {
      setError("Error deleting job");
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      const res = await fetch("/api/admin/jobs/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        setSuccess("Job queued for retry");
        fetchJobs();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to retry job");
      }
    } catch (err) {
      setError("Error retrying job");
    }
  };

  const cancelJob = async (jobId: string) => {
    if (!confirm("Cancel this job and refund tokens?")) return;

    try {
      const res = await fetch("/api/admin/jobs/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        setSuccess("Job cancelled and refunded");
        fetchJobs();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to cancel job");
      }
    } catch (err) {
      setError("Error cancelling job");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.postedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job._id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "running":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "pending":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "cancelled":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Management</h1>
          <p className="text-zinc-500">Monitor and manage all jobs</p>
        </div>
        <button
          onClick={fetchJobs}
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
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Job</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Posted By</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Reward</th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-400">Created</th>
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
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{job.title || "Untitled"}</p>
                      <p className="text-xs text-zinc-500 font-mono">{job._id.slice(-8)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-sm">{job.postedBy}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-amber-400">{job.reward} RUN</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {job.status === "failed" && (
                        <button
                          onClick={() => retryJob(job._id)}
                          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                          title="Retry"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      {(job.status === "pending" || job.status === "running") && (
                        <button
                          onClick={() => cancelJob(job._id)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          title="Cancel"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteJob(job._id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          { label: "Total", value: jobs.length, color: "text-white" },
          { label: "Pending", value: jobs.filter((j) => j.status === "pending").length, color: "text-purple-400" },
          { label: "Running", value: jobs.filter((j) => j.status === "running").length, color: "text-cyan-400" },
          { label: "Failed", value: jobs.filter((j) => j.status === "failed").length, color: "text-red-400" },
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
