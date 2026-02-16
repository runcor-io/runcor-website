"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Terminal,
  Cpu,
  Calendar,
  Hash,
  User,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  status: string;
  deviceId: string;
  claimedBy: string;
  postedBy: string;
  createdAt: string;
  claimedAt: string;
  startedAt: string;
  completedAt: string;
  logs: string[];
  result: any;
  error: string;
  reward: number;
}

export default function Verification() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        // Filter jobs posted by current user
        const myJobs = data.filter(
          (job: Job) =>
            job.postedBy?.toLowerCase() === (session?.user as any)?.username?.toLowerCase()
        );
        setJobs(myJobs);
        if (myJobs.length > 0 && !selectedJob) {
          setSelectedJob(myJobs[0]);
        }
      } else {
        setError("Failed to load jobs");
      }
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchJobs();
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return "N/A";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading verification data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Verification</h1>
          <p className="text-zinc-500 text-sm">Audit job execution and verify results</p>
        </div>
        <button
          onClick={fetchJobs}
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

      {jobs.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center">
          <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No jobs to verify</h3>
          <p className="text-zinc-500">Post a job to see verification details here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {jobs.map((job) => (
              <button
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedJob?._id === job._id
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : job.status === "failed" ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : job.status === "running" ? (
                        <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{job.title}</p>
                      <p className="text-xs text-zinc-500">{job._id.slice(-8)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      job.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : job.status === "failed"
                        ? "bg-red-500/10 text-red-400"
                        : job.status === "running"
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Verification Details */}
          {selectedJob && (
            <div className="lg:col-span-2 space-y-4">
              {/* Job Status Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                    <p className="text-zinc-500 text-sm">Job ID: {selectedJob._id}</p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      selectedJob.status === "completed"
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : selectedJob.status === "failed"
                        ? "bg-red-500/10 border border-red-500/30"
                        : "bg-amber-500/10 border border-amber-500/30"
                    }`}
                  >
                    {selectedJob.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : selectedJob.status === "failed" ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-400" />
                    )}
                    <span
                      className={`font-medium ${
                        selectedJob.status === "completed"
                          ? "text-emerald-400"
                          : selectedJob.status === "failed"
                          ? "text-red-400"
                          : "text-amber-400"
                      }`}
                    >
                      {selectedJob.status === "completed"
                        ? "Verified"
                        : selectedJob.status === "failed"
                        ? "Failed"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    Execution Timeline
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-zinc-900/50">
                      <p className="text-zinc-500 text-xs mb-1">Posted</p>
                      <p className="text-zinc-300">{formatDate(selectedJob.createdAt)}</p>
                    </div>
                    {selectedJob.claimedAt && (
                      <div className="p-3 rounded-lg bg-zinc-900/50">
                        <p className="text-zinc-500 text-xs mb-1">Claimed</p>
                        <p className="text-zinc-300">{formatDate(selectedJob.claimedAt)}</p>
                      </div>
                    )}
                    {selectedJob.startedAt && (
                      <div className="p-3 rounded-lg bg-zinc-900/50">
                        <p className="text-zinc-500 text-xs mb-1">Started</p>
                        <p className="text-zinc-300">{formatDate(selectedJob.startedAt)}</p>
                      </div>
                    )}
                    {selectedJob.completedAt && (
                      <div className="p-3 rounded-lg bg-zinc-900/50">
                        <p className="text-zinc-500 text-xs mb-1">Completed</p>
                        <p className="text-zinc-300">{formatDate(selectedJob.completedAt)}</p>
                      </div>
                    )}
                  </div>

                  {selectedJob.startedAt && selectedJob.completedAt && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-amber-400 text-sm">
                        Duration: {getDuration(selectedJob.startedAt, selectedJob.completedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-zinc-400" />
                  Execution Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-zinc-900/50">
                    <p className="text-zinc-500 text-xs mb-1">Device ID</p>
                    <p className="font-mono text-zinc-300">{selectedJob.deviceId || "Not assigned"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/50">
                    <p className="text-zinc-500 text-xs mb-1">Executed By</p>
                    <p className="text-zinc-300 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {selectedJob.claimedBy || "Not claimed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Details (if failed) */}
              {selectedJob.error && (
                <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-6">
                  <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Error Details
                  </h3>
                  <p className="text-red-400/70 text-sm">{selectedJob.error}</p>
                </div>
              )}

              {/* Logs */}
              {selectedJob.logs && selectedJob.logs.length > 0 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    Execution Logs
                  </h3>
                  <div className="bg-black rounded-lg p-4 font-mono text-xs text-zinc-400 max-h-64 overflow-y-auto">
                    {selectedJob.logs.map((log, i) => (
                      <div key={i} className="py-0.5">
                        <span className="text-zinc-600">[{i + 1}]</span> {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
