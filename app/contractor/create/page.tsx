"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  Upload, 
  Play, 
  Coins, 
  Cpu,
  Code,
  CheckCircle,
  AlertCircle,
  Wallet,
  FileInput,
  X,
  Loader2,
  Server,
  HardDrive,
  Clock,
  Layers,
  Settings,
  Zap
} from "lucide-react";

// Runtime Environment Options
const RUNTIMES = [
  { id: "python:3.11-slim", label: "Python 3.11", size: "~50MB", icon: "🐍", category: "Language" },
  { id: "python:3.10-slim", label: "Python 3.10", size: "~48MB", icon: "🐍", category: "Language" },
  { id: "node:20-alpine", label: "Node.js 20", size: "~40MB", icon: "⬢", category: "Language" },
  { id: "node:18-alpine", label: "Node.js 18", size: "~38MB", icon: "⬢", category: "Language" },
  { id: "rust:latest", label: "Rust", size: "~25MB", icon: "🦀", category: "Language" },
  { id: "golang:latest", label: "Go", size: "~20MB", icon: "🐹", category: "Language" },
  { id: "nvidia/cuda:12.0-devel-ubuntu22.04", label: "CUDA 12.0", size: "~2GB", icon: "🚀", category: "GPU" },
  { id: "nvidia/cuda:11.8-devel-ubuntu22.04", label: "CUDA 11.8", size: "~1.8GB", icon: "🚀", category: "GPU" },
  { id: "rocm/dev-ubuntu-22.04:5.7", label: "ROCm 5.7", size: "~2GB", icon: "🔴", category: "GPU" },
];

// Templates
const TEMPLATES = [
  { id: "ocr", label: "OCR / PDF Processing", runtime: "python:3.11-slim", description: "Extract text from documents" },
  { id: "resize", label: "Image Resize Batch", runtime: "python:3.11-slim", description: "Batch resize images" },
  { id: "pytorch", label: "PyTorch Training", runtime: "nvidia/cuda:12.0-devel-ubuntu22.04", description: "GPU ML training" },
  { id: "blender", label: "Blender Rendering", runtime: "runcor/blender:latest", description: "3D rendering" },
  { id: "data-pipeline", label: "Data Pipeline", runtime: "python:3.11-slim", description: "ETL processing" },
];

// Default scripts per runtime
const DEFAULT_SCRIPTS: Record<string, string> = {
  "python:3.11-slim": `#!/usr/bin/env python3
import os
import json

# Input available at /workspace/input/
# Output write to /workspace/output/

input_file = os.environ.get('INPUT_FILE', '')
print(f"Processing: {input_file}")

# Your code here
result = {"processed": True, "input": input_file}

# Save results
with open('/workspace/output/result.json', 'w') as f:
    json.dump(result, f, indent=2)

print("Job completed!")
`,
  "node:20-alpine": `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Input available at /workspace/input/
// Output write to /workspace/output/

const inputFile = process.env.INPUT_FILE || '';
console.log('Processing:', inputFile);

// Your code here
const result = { processed: true, input: inputFile };

// Save results
fs.writeFileSync('/workspace/output/result.json', JSON.stringify(result, null, 2));

console.log('Job completed!');
`,
  "rust:latest": `use std::env;
use std::fs;

fn main() {
    let input_file = env::var("INPUT_FILE").unwrap_or_default();
    println!("Processing: {}", input_file);
    
    // Your code here
    let result = format!("Processed: {}", input_file);
    
    // Save output
    fs::write("/workspace/output/result.txt", result).expect("Write failed");
    
    println!("Job completed!");
}
`,
  "golang:latest": `package main

import (
    "fmt"
    "os"
)

func main() {
    inputFile := os.Getenv("INPUT_FILE")
    fmt.Printf("Processing: %s\\n", inputFile)
    
    // Your code here
    result := fmt.Sprintf("Processed: %s", inputFile)
    
    // Save output
    os.WriteFile("/workspace/output/result.txt", []byte(result), 0644)
    
    fmt.Println("Job completed!")
}
`,
  "nvidia/cuda:12.0-devel-ubuntu22.04": `#!/usr/bin/env python3
import torch
import os

print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA version: {torch.version.cuda}")

if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")

# Your GPU code here
# ...

print("Job completed!")
`,
  "rocm/dev-ubuntu-22.04:5.7": `#!/usr/bin/env python3
import torch
import os

print(f"ROCm available: {torch.cuda.is_available()}")

# Your ROCm code here
# ...

print("Job completed!")
`,
};

// File Upload Component
function FileUpload({ onUploadComplete, uploadedUrl }: { onUploadComplete: (url: string) => void, uploadedUrl: string }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("File too large (max 50MB)");
      return;
    }

    setUploading(true);
    setError("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onUploadComplete(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    onUploadComplete("");
    setFileName("");
    setError("");
  };

  if (uploadedUrl) {
    return (
      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-400">{fileName || "File uploaded"}</span>
        </div>
        <button type="button" onClick={clearFile} className="p-1 hover:bg-emerald-500/20 rounded">
          <X className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-500/50 hover:bg-zinc-900/50 transition-all cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-4 pb-4">
          {uploading ? (
            <><Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-1" /><p className="text-xs text-zinc-400">Uploading...</p></>
          ) : (
            <><Upload className="w-6 h-6 text-zinc-500 mb-1" /><p className="text-xs text-zinc-400"><span className="text-amber-500">Click to upload</span></p></>
          )}
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}

export default function CreateJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "unknown";
  
  // Step 1: Runtime Selection
  const [selectedRuntime, setSelectedRuntime] = useState(RUNTIMES[0].id);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  // Step 2: Resource Configuration
  const [title, setTitle] = useState("");
  const [cpuCores, setCpuCores] = useState(2);
  const [memoryGb, setMemoryGb] = useState(4);
  const [gpuEnabled, setGpuEnabled] = useState(false);
  const [diskGb, setDiskGb] = useState(20);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);
  const [maxRetries, setMaxRetries] = useState(2);
  
  // Step 3: Input & Script
  const [inputSource, setInputSource] = useState("upload"); // upload, url, s3
  const [inputUrl, setInputUrl] = useState("");
  const [inputFileUrl, setInputFileUrl] = useState("");
  const [parallelMode, setParallelMode] = useState(false);
  const [inputPattern, setInputPattern] = useState("/workspace/input/*");
  const [outputPattern, setOutputPattern] = useState("/workspace/output/{name}.json");
  const [script, setScript] = useState(DEFAULT_SCRIPTS["python:3.11-slim"]);
  const [dependencies, setDependencies] = useState("");
  const [envVars, setEnvVars] = useState<{key: string, value: string, secret: boolean}[]>([]);
  
  // Step 4: Pricing
  const [reward, setReward] = useState("10");
  const [balance, setBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success?: boolean; message?: string; jobId?: string} | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/wallet");
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };
    fetchBalance();
  }, []);

  // Update script when runtime changes
  useEffect(() => {
    setScript(DEFAULT_SCRIPTS[selectedRuntime] || DEFAULT_SCRIPTS["python:3.11-slim"]);
  }, [selectedRuntime]);

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedRuntime(template.runtime);
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
          runtimeImage: selectedRuntime,
          script,
          dependencies: dependencies || undefined,
          environment: envVars.reduce((acc, {key, value}) => ({...acc, [key]: value}), {}),
          resources: {
            cpuCores,
            memoryGb,
            gpuCount: gpuEnabled ? 1 : 0,
            diskGb,
            timeoutSeconds: timeoutMinutes * 60,
            maxRetries,
          },
          parallelMode: parallelMode ? "map" : "single",
          inputPattern: parallelMode ? inputPattern : undefined,
          outputPattern: parallelMode ? outputPattern : undefined,
          inputFileUrl: inputFileUrl || null,
          postedBy: username,
          reward: parseFloat(reward) || 0,
        })
      });

      const data = await response.json();

      if (data.success) {
        // Trigger scheduler to create tasks and assign to nodes
        try {
          await fetch("/api/scheduler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId: data.jobId })
          });
        } catch (e) {
          console.error("Failed to trigger scheduler:", e);
        }
        
        setResult({
          success: true,
          message: `Job created! ${parallelMode ? 'Will split into parallel tasks.' : ''}`,
          jobId: data.jobId
        });
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

  const currentRuntime = RUNTIMES.find(r => r.id === selectedRuntime);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/contractor")} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors">
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: Runtime Selection */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-500" />
            Step 1: Select Runtime Environment
          </h2>

          {/* Toggle: Base vs Template */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUseTemplate(false)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${!useTemplate ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-900 border-zinc-800'}`}
            >
              <span className="text-sm font-medium text-white">Base Image</span>
              <p className="text-xs text-zinc-500">Start from official Docker image</p>
            </button>
            <button
              type="button"
              onClick={() => setUseTemplate(true)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${useTemplate ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-900 border-zinc-800'}`}
            >
              <span className="text-sm font-medium text-white">Use Template</span>
              <p className="text-xs text-zinc-500">Start from pre-configured setup</p>
            </button>
          </div>

          {!useTemplate ? (
            // Base Runtime Selection
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {RUNTIMES.map((runtime) => (
                <button
                  key={runtime.id}
                  type="button"
                  onClick={() => setSelectedRuntime(runtime.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRuntime === runtime.id
                      ? "bg-amber-500/10 border-amber-500/50"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{runtime.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{runtime.label}</p>
                      <p className="text-xs text-zinc-500">{runtime.size}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Template Selection
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTemplate === template.id
                      ? "bg-amber-500/10 border-amber-500/50"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <p className="font-medium text-white">{template.label}</p>
                  <p className="text-xs text-zinc-500">{template.description}</p>
                  <p className="text-xs text-amber-400 mt-1">{template.runtime}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STEP 2: Resource Requirements */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-500" />
            Step 2: Resource Requirements
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Process dataset v1"
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* CPU */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">CPU Cores</label>
                <input
                  type="number"
                  min={1}
                  max={32}
                  value={cpuCores}
                  onChange={(e) => setCpuCores(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Memory */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Memory (GB)</label>
                <input
                  type="number"
                  min={1}
                  max={128}
                  value={memoryGb}
                  onChange={(e) => setMemoryGb(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Disk */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Disk (GB)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={diskGb}
                  onChange={(e) => setDiskGb(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Timeout (min)</label>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={timeoutMinutes}
                  onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* GPU Toggle */}
            <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">GPU Required</p>
                <p className="text-xs text-zinc-500">Enable if job needs CUDA/ROCm</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gpuEnabled}
                  onChange={(e) => setGpuEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Retries */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-zinc-400">Max Retries:</label>
              <input
                type="number"
                min={0}
                max={5}
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: Input Data */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileInput className="w-5 h-5 text-amber-500" />
            Step 3: Input Data
          </h2>

          {/* Input Source */}
          <div className="flex gap-2 mb-4">
            {['upload', 'url'].map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setInputSource(source)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  inputSource === source
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                }`}
              >
                {source === 'upload' ? 'Upload Files' : 'URL'}
              </button>
            ))}
          </div>

          {inputSource === 'upload' ? (
            <FileUpload onUploadComplete={setInputFileUrl} uploadedUrl={inputFileUrl} />
          ) : (
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/data.zip"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          )}

          {/* Parallel Mode */}
          <div className="mt-4 flex items-center gap-4 p-4 bg-zinc-900 rounded-lg">
            <Layers className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Parallel Processing (Map)</p>
              <p className="text-xs text-zinc-500">Split job into tasks per input file</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={parallelMode}
                onChange={(e) => setParallelMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {parallelMode && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Input Pattern</label>
                <input
                  type="text"
                  value={inputPattern}
                  onChange={(e) => setInputPattern(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Output Pattern</label>
                <input
                  type="text"
                  value={outputPattern}
                  onChange={(e) => setOutputPattern(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* STEP 4: Script */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-500" />
            Step 4: Script
          </h2>

          <div className="mb-4 p-3 bg-zinc-900 rounded-lg">
            <p className="text-xs text-zinc-400">
              Running in: <code className="text-amber-400">{currentRuntime?.label}</code>
            </p>
          </div>

          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-800 text-zinc-300 font-mono text-sm focus:outline-none focus:border-amber-500/50 resize-y"
            required
          />

          {/* Dependencies */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Dependencies (requirements.txt, package.json, etc.)</label>
            <textarea
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value)}
              rows={3}
              placeholder="pandas==2.0.0
numpy==1.24.0"
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm font-mono"
            />
          </div>
        </div>

        {/* STEP 5: Pricing & Deploy */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Step 5: Pricing
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Reward (RUN tokens)</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">Balance: {balance.toLocaleString()} RUN</p>
              {parseInt(reward) > balance && <p className="text-xs text-red-400">Insufficient balance</p>}
            </div>

            {/* Summary */}
            <div className="p-4 bg-zinc-900 rounded-lg">
              <p className="text-sm font-medium text-white mb-2">Job Summary</p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>Runtime: {currentRuntime?.label}</li>
                <li>Resources: {cpuCores} CPU, {memoryGb}GB RAM{gpuEnabled ? ', GPU' : ''}</li>
                <li>Timeout: {timeoutMinutes} min</li>
                <li>Parallel: {parallelMode ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => router.push("/contractor")} className="px-6 py-3 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || parseInt(reward) > balance}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
            ) : (
              <><Play className="w-5 h-5" /> Deploy Job</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
