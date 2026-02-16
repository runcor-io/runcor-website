"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Radio,
  Cpu,
  Box,
  Zap,
  Shield,
  Clock,
  Check,
  Search,
  SlidersHorizontal,
  Loader2,
  Briefcase,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  type: string;
  reward: number;
  postedBy: string;
  requiredCapabilities: string[];
  createdAt: string;
}

interface Device {
  deviceId: string;
  specs: {
    cpu: string;
    capabilities: string[];
  };
}

export default function Marketplace() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "";
  
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "compute" | "hardware">("all");
  const [acceptingJob, setAcceptingJob] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchMarketplace = async () => {
    try {
      if (!username) {
        console.log("[Marketplace] No username, skipping fetch");
        return;
      }
      
      console.log("[Marketplace] Fetching for username:", username);
      
      // Fetch available jobs (not posted by current user)
      const jobsRes = await fetch("/api/marketplace");
      const jobsData = jobsRes.ok ? await jobsRes.json() : [];
      console.log("[Marketplace] Available jobs:", jobsData.length);
      setJobs(jobsData);
      
      // Fetch user's devices (backend uses JWT token)
      const devicesRes = await fetch("/api/devices");
      const devicesData = devicesRes.ok ? await devicesRes.json() : [];
      console.log("[Marketplace] User devices:", devicesData.length, devicesData);
      setDevices(devicesData);
    } catch (error) {
      console.error("Failed to fetch marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchMarketplace();
      const interval = setInterval(fetchMarketplace, 10000);
      return () => clearInterval(interval);
    }
  }, [username]);

  const getMatchPercentage = (job: Job) => {
    if (devices.length === 0) return 0;
    
    // Simple matching based on capabilities
    const deviceCaps = devices[0]?.specs?.capabilities || [];
    if (job.requiredCapabilities.length === 0) return 95;
    
    const matches = job.requiredCapabilities.filter(cap => deviceCaps.includes(cap));
    return Math.round((matches.length / job.requiredCapabilities.length) * 100);
  };

  const getBestDevice = () => {
    if (devices.length === 0) return null;
    // Return first online device for now
    return devices[0];
  };

  const acceptJob = async (job: Job) => {
    const device = getBestDevice();
    if (!device) {
      setMessage("No devices available. Please register a device first.");
      return;
    }

    setAcceptingJob(job._id);
    setMessage("");

    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          deviceId: device.deviceId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Job "${job.title}" accepted! Check Job Monitor to track progress.`);
        fetchMarketplace(); // Refresh list
      } else {
        setMessage(data.error || "Failed to accept job");
      }
    } catch (error) {
      setMessage("Failed to accept job. Please try again.");
    } finally {
      setAcceptingJob(null);
    }
  };

  const filteredJobs = selectedCategory === "all" 
    ? jobs 
    : jobs.filter(j => {
        if (selectedCategory === "compute") {
          return j.type === "ml_training" || j.type === "python" || j.type === "compute";
        }
        return j.type === "data_processing" || j.type === "physical";
      });

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
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading marketplace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-zinc-500 text-sm">Find jobs matching your hardware capabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <span className="text-sm text-zinc-400">{jobs.length} jobs available</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.includes("accepted") 
            ? "bg-emerald-500/10 border border-emerald-500/30" 
            : "bg-red-500/10 border border-red-500/30"
        }`}>
          {message.includes("accepted") ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={message.includes("accepted") ? "text-emerald-400" : "text-red-400"}>
            {message}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setSelectedCategory("compute")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === "compute" ? "bg-cyan-500 text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              Compute
            </button>
            <button
              onClick={() => setSelectedCategory("hardware")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === "hardware" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Box className="w-4 h-4" />
              Physical
            </button>
          </div>
        </div>
      </div>

      {/* Devices Info */}
      {devices.length === 0 && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-amber-400 font-medium">No devices registered</p>
              <p className="text-amber-400/70 text-sm">
                Go to Onboarding to register your device before accepting jobs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
          <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No jobs available</p>
          <p className="text-zinc-600 text-sm mt-1">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const matchPct = getMatchPercentage(job);
            const canAccept = devices.length > 0 && matchPct > 50;
            
            return (
              <div key={job._id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      job.type === "ml_training" || job.type === "compute" || job.type === "python"
                        ? "bg-cyan-500/20" 
                        : "bg-amber-500/20"
                    }`}>
                      {job.type === "ml_training" || job.type === "compute" || job.type === "python" ? (
                        <Cpu className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Box className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{job.title}</h3>
                      <p className="text-xs text-zinc-500 font-mono">{job._id.slice(-8)} • Posted by {job.postedBy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold font-mono text-cyan-400">${job.reward.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">Reward</p>
                  </div>
                </div>

                {/* Match & Posted */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                    matchPct >= 90 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    matchPct >= 70 ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" :
                    "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}>
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-medium">{matchPct}% Match</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(job.createdAt)}
                  </div>
                </div>

                {/* Required Capabilities */}
                {job.requiredCapabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.requiredCapabilities.map((cap) => (
                      <span key={cap} className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-400">
                        {cap.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => acceptJob(job)}
                    disabled={!canAccept || acceptingJob === job._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {acceptingJob === job._id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Accept Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-white">How it works</p>
          <p className="text-sm text-zinc-400">
            Accept jobs that match your device capabilities. Once accepted, your agent will automatically 
            download and execute the job. Payment is released upon successful completion.
          </p>
        </div>
      </div>
    </div>
  );
}
