"use client";

import { useState } from "react";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Search,
  ChevronDown,
  Zap,
} from "lucide-react";

const jobs = [
  { id: "JOB-8493", type: "AI Render", device: "RTX 4090 Server", reward: "0.0042 ETH", status: "active", progress: 67, time: "2m ago", duration: "4m" },
  { id: "JOB-8492", type: "Model Training", device: "RTX 4090 Server", reward: "0.0084 ETH", status: "completed", progress: 100, time: "15m ago", duration: "12m" },
  { id: "JOB-8491", type: "3D Print", device: "Prusa XL", reward: "0.0028 ETH", status: "completed", progress: 100, time: "1h ago", duration: "45m" },
  { id: "JOB-8490", type: "G-code Exec", device: "CNC Mill #1", reward: "0.0051 ETH", status: "completed", progress: 100, time: "2h ago", duration: "1h 20m" },
  { id: "JOB-8489", type: "Video Encode", device: "RTX 4090 Server", reward: "0.0032 ETH", status: "failed", progress: 34, time: "3h ago", duration: "—" },
  { id: "JOB-8488", type: "Simulation", device: "A100 Cluster", reward: "0.0156 ETH", status: "pending", progress: 0, time: "—", duration: "Est. 2h" },
  { id: "JOB-8487", type: "CAD Render", device: "RTX 4090 Server", reward: "0.0021 ETH", status: "completed", progress: 100, time: "5h ago", duration: "8m" },
  { id: "JOB-8486", type: "ML Inference", device: "RTX 4090 Server", reward: "0.0067 ETH", status: "completed", progress: 100, time: "6h ago", duration: "15m" },
];

const filters = ["All", "Active", "Completed", "Failed", "Pending"];

export default function JobMonitor() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeFilter === "All" || job.status === activeFilter.toLowerCase();
    const matchesSearch = job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.device.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
      case "completed":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "failed":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "pending":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Monitor</h1>
          <p className="text-gray-500 text-sm">Track and manage all compute jobs across your fleet</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-mono">1 Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-mono">1 Pending</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? "bg-white text-black"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search jobs, devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-gray-800 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Job</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Device</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Progress</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Reward</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{job.type}</p>
                        <p className="text-xs text-gray-500 font-mono">{job.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{job.device}</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="capitalize">{job.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            job.status === "failed" ? "bg-red-400" : "bg-cyan-400"
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-mono">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-cyan-400">{job.reward}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      <p>{job.time}</p>
                      <p className="text-xs text-gray-500">{job.duration}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredJobs.length === 0 && (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No jobs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
