"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  Upload, 
  Play, 
  DollarSign, 
  Cpu, 
  Code,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "unknown";
  const [title, setTitle] = useState("");
  const [type, setType] = useState("python");
  const [script, setScript] = useState(`#!/usr/bin/env python3
"""
Example job script - Modify this for your task
The script runs in a temporary directory
Output files will be captured and returned
"""

import time
import json

print("Job started!")

# Your computation here
result = {"status": "success", "data": [1, 2, 3, 4, 5]}

# Save results to output.json
with open("output.json", "w") as f:
    json.dump(result, f)

print("Job completed!")
print(f"Result: {result}")
`);
  const [reward, setReward] = useState("10");
  const [requiredCapabilities, setRequiredCapabilities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success?: boolean; message?: string; jobId?: string} | null>(null);

  const capabilities = [
    { id: "cpu_compute", label: "CPU Compute", description: "General CPU processing" },
    { id: "gpu_compute", label: "GPU Compute", description: "NVIDIA CUDA support" },
    { id: "cuda", label: "CUDA", description: "CUDA-capable GPU" },
    { id: "rendering", label: "Rendering", description: "3D/Graphics rendering" },
    { id: "windows", label: "Windows", description: "Windows OS" },
  ];

  const toggleCapability = (cap: string) => {
    if (requiredCapabilities.includes(cap)) {
      setRequiredCapabilities(prev => prev.filter(c => c !== cap));
    } else {
      setRequiredCapabilities(prev => [...prev, cap]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          script,
          postedBy: username,
          reward: parseFloat(reward) || 0,
          requiredCapabilities
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: "Job created successfully!",
          jobId: data.jobId
        });
        // Reset form
        setTitle("");
        setScript("");
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to create job"
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Network error - is the server running?"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/contractor")}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Job</h1>
          <p className="text-zinc-400 mt-1">Deploy computation to the network</p>
        </div>
      </div>

      {result?.success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-emerald-400 font-medium">{result.message}</p>
            <p className="text-emerald-400/70 text-sm">Job ID: {result.jobId}</p>
          </div>
        </div>
      )}

      {result && !result.success && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{result.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Details */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-500" />
            Job Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Train MNIST Classifier"
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Job Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="python">Python Script</option>
                  <option value="ml_training">ML Training</option>
                  <option value="data_processing">Data Processing</option>
                  <option value="compute">General Compute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Reward (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    min="1"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Script Editor */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            Python Script
          </h2>
          
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-800 text-zinc-300 font-mono text-sm focus:outline-none focus:border-amber-500/50 resize-y"
            placeholder="Enter your Python script here..."
            required
          />
          
          <p className="mt-2 text-xs text-zinc-500">
            The script will run in an isolated temporary directory. Output files under 1MB will be captured.
          </p>
        </div>

        {/* Requirements */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-500" />
            Required Capabilities
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => toggleCapability(cap.id)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  requiredCapabilities.includes(cap.id)
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
                title={cap.description}
              >
                {cap.label}
              </button>
            ))}
          </div>
          
          <p className="mt-3 text-xs text-zinc-500">
            Only devices with ALL selected capabilities will be eligible for this job.
            Leave empty to allow any device.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/contractor")}
            className="px-6 py-3 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Deploy Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
