"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Package,
  Download,
  CheckCircle,
  FileText,
  Terminal,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface JobResult {
  _id: string;
  title: string;
  type: string;
  status: string;
  deviceId: string;
  reward: number;
  completedAt: string;
  result: any;
  logs: string[];
  claimedBy: string;
  postedBy: string;
}

export default function Results() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [expandedLogs, setExpandedLogs] = useState(false);

  const fetchCompletedJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        // Filter only completed jobs posted by current user
        const completed = data.filter(
          (job: JobResult) => 
            job.status === "completed" && 
            job.postedBy?.toLowerCase() === (session?.user as any)?.username?.toLowerCase()
        );
        setJobs(completed);
        if (completed.length > 0 && !selectedJob) {
          setSelectedJob(completed[0]);
        }
      } else {
        setError("Failed to load results");
      }
    } catch (err) {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCompletedJobs();
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const downloadResults = (job: JobResult) => {
    // Create a JSON file with the job results
    const data = JSON.stringify(
      {
        jobId: job._id,
        title: job.title,
        type: job.type,
        completedAt: job.completedAt,
        result: job.result,
        logs: job.logs,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-${job._id.slice(-8)}-results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading results...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Results</h1>
          <p className="text-zinc-500 text-sm">View and download completed job results</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCompletedJobs}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">{jobs.length} completed</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center">
          <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No completed jobs yet</h3>
          <p className="text-zinc-500 mb-6">Post a job and wait for it to complete to see results here.</p>
          <a
            href="/contractor/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-400 transition-colors"
          >
            Post a Job
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {jobs.map((job) => (
              <button
                key={job._id}
                onClick={() => {
                  setSelectedJob(job);
                  setExpandedLogs(false);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedJob?._id === job._id
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{job.title}</p>
                      <p className="text-xs text-zinc-500">
                        {job.deviceId?.slice(0, 12)}... • {formatTimeAgo(job.completedAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-zinc-500">{job.logs?.length || 0} log entries</span>
                  <span className="font-mono text-amber-400">{job.reward} tokens</span>
                </div>
              </button>
            ))}
          </div>

          {/* Job Details */}
          {selectedJob && (
            <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                  <p className="text-zinc-500 text-sm">
                    {selectedJob._id} • Completed {formatDate(selectedJob.completedAt)}
                  </p>
                </div>
                <button
                  onClick={() => downloadResults(selectedJob)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-medium text-sm hover:bg-amber-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Results
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Completed
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs text-zinc-500">
                  Processed by {selectedJob.claimedBy}
                </span>
              </div>

              {/* Result Data */}
              {selectedJob.result && (
                <div className="mb-6">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    Result Data
                  </h3>
                  <div className="bg-black rounded-lg p-4 font-mono text-xs text-zinc-400 overflow-x-auto max-h-48 overflow-y-auto">
                    <pre>{JSON.stringify(selectedJob.result, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Logs */}
              {selectedJob.logs && selectedJob.logs.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedLogs(!expandedLogs)}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-medium text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-zinc-400" />
                      Execution Logs
                    </h3>
                    {expandedLogs ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                  <div
                    className={`bg-black rounded-lg p-4 font-mono text-xs text-zinc-400 overflow-y-auto transition-all ${
                      expandedLogs ? "max-h-64" : "max-h-32"
                    }`}
                  >
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
