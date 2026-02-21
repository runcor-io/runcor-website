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
  Shield,
  Hash,
  FileInput,
  X,
  Loader2,
  FileText,
  Image,
  Activity,
  Sprout,
  Brain,
  Film,
  Server
} from "lucide-react";

// Job Type Definitions
const JOB_TYPES = [
  {
    id: "python",
    label: "Python Script",
    description: "General Python computation",
    icon: Code,
    image: "python:3.11-slim",
    estimatedSize: "~50MB",
    capabilities: ["cpu_compute"],
    defaultScript: `#!/usr/bin/env python3
"""
RunCor Job - Python Script
Your script runs in an isolated container with Python 3.11
"""

import json

# Your code here
result = {"status": "success", "message": "Job completed!"}

# Save results
with open("output.json", "w") as f:
    json.dump(result, f, indent=2)

print("Job finished successfully!")
`,
    exampleInput: "Optional: Upload a ZIP with data files"
  },
  {
    id: "ocr",
    label: "OCR / Document Processing",
    description: "Extract text from images and PDFs",
    icon: FileText,
    image: "runcor/ocr:latest",
    estimatedSize: "~500MB",
    capabilities: ["cpu_compute"],
    defaultScript: `#!/usr/bin/env python3
"""
OCR Job - Extract text from documents
Input: Images or PDFs in /workspace/input/
Output: Extracted text in output.json
"""

import pytesseract
from PIL import Image
import json
import os

results = []
input_dir = "/workspace/input"

# Process all images
for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
        image_path = os.path.join(input_dir, filename)
        text = pytesseract.image_to_string(Image.open(image_path))
        results.append({"file": filename, "text": text})

# Save results
with open("output.json", "w") as f:
    json.dump({"documents": results}, f, indent=2)

print(f"Processed {len(results)} documents")
`,
    exampleInput: "Upload ZIP with images/PDFs to process"
  },
  {
    id: "ai",
    label: "AI / Data Labeling",
    description: "Image augmentation and dataset prep",
    icon: Brain,
    image: "runcor/ai:latest",
    estimatedSize: "~2GB (includes PyTorch)",
    capabilities: ["cpu_compute", "gpu_compute"],
    defaultScript: `#!/usr/bin/env python3
"""
AI Job - Data augmentation and preprocessing
Input: Images in /workspace/input/
Output: Augmented dataset in /workspace/output/
"""

import torch
import torchvision.transforms as transforms
from PIL import Image
import os

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

# Your augmentation code here
input_dir = "/workspace/input"
output_dir = "/workspace/output"
os.makedirs(output_dir, exist_ok=True)

# Example: Convert and resize images
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

processed = 0
for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        img = Image.open(os.path.join(input_dir, filename))
        tensor = transform(img)
        # Save processed image
        processed += 1

print(f"Processed {processed} images")
`,
    exampleInput: "Upload ZIP with images for AI processing"
  },
  {
    id: "blender",
    label: "3D Rendering",
    description: "Blender rendering with GPU support",
    icon: Film,
    image: "runcor/blender:latest",
    estimatedSize: "~2GB (includes Blender + CUDA)",
    capabilities: ["gpu_compute", "cuda", "rendering"],
    defaultScript: `#!/usr/bin/env python3
"""
Blender Rendering Job
Input: .blend file in /workspace/input/
Output: Rendered frames in /workspace/output/
"""

import bpy
import os

# Setup paths
blend_file = None
input_dir = "/workspace/input"
output_dir = "/workspace/output"

# Find .blend file
for f in os.listdir(input_dir):
    if f.endswith('.blend'):
        blend_file = os.path.join(input_dir, f)
        break

if not blend_file:
    print("No .blend file found in input!")
    exit(1)

# Load blend file
bpy.ops.wm.open_mainfile(filepath=blend_file)

# Configure render settings
bpy.context.scene.render.filepath = os.path.join(output_dir, "frame_")
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.device = 'GPU'  # Use GPU if available

# Render
bpy.ops.render.render(write_file=True)
print("Render complete!")
`,
    exampleInput: "Upload .blend file or ZIP with project"
  },
  {
    id: "medical",
    label: "Medical Imaging",
    description: "DICOM processing and anonymization",
    icon: Activity,
    image: "runcor/medical:latest",
    estimatedSize: "~1GB",
    capabilities: ["cpu_compute"],
    defaultScript: `#!/usr/bin/env python3
"""
Medical Imaging Job - DICOM processing
Input: DICOM files in /workspace/input/
Output: Processed/anonymized images
HIPAA-compliant local processing
"""

import pydicom
from pydicom import dcmread
import json
import os

input_dir = "/workspace/input"
results = []

# Process DICOM files
for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.dcm', '.dicom')):
        filepath = os.path.join(input_dir, filename)
        try:
            ds = dcmread(filepath)
            
            # Example: Anonymize patient info
            ds.PatientName = "ANONYMOUS"
            ds.PatientID = "000000"
            
            # Save anonymized version
            output_path = os.path.join("/workspace/output", f"anon_{filename}")
            ds.save_as(output_path)
            
            results.append({
                "file": filename,
                "modality": ds.Modality,
                "shape": ds.pixel_array.shape
            })
        except Exception as e:
            print(f"Error processing {filename}: {e}")

# Save metadata
with open("output.json", "w") as f:
    json.dump({"processed": results}, f, indent=2)

print(f"Processed {len(results)} DICOM files")
`,
    exampleInput: "Upload DICOM files (.dcm) in ZIP"
  },
  {
    id: "satellite",
    label: "Satellite / Drone Analysis",
    description: "GeoTIFF and crop health analysis",
    icon: Sprout,
    image: "runcor/satellite:latest",
    estimatedSize: "~800MB",
    capabilities: ["cpu_compute"],
    defaultScript: `#!/usr/bin/env python3
"""
Satellite/Drone Analysis Job
Input: GeoTIFF or aerial images in /workspace/input/
Output: NDVI analysis and crop health reports
"""

import rasterio
from rasterio.plot import show
import numpy as np
import json
import os

input_dir = "/workspace/input"
results = []

# Process satellite/drone imagery
for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.tif', '.tiff', '.geotiff')):
        filepath = os.path.join(input_dir, filename)
        
        with rasterio.open(filepath) as src:
            # Read bands (assuming RGB+NIR)
            red = src.read(1).astype(float)
            nir = src.read(4).astype(float) if src.count >= 4 else src.read(1)
            
            # Calculate NDVI
            ndvi = np.where((nir + red) == 0, 0, (nir - red) / (nir + red))
            
            # Health statistics
            mean_ndvi = float(np.mean(ndvi))
            
            results.append({
                "file": filename,
                "ndvi_mean": mean_ndvi,
                "health": "good" if mean_ndvi > 0.4 else "poor" if mean_ndvi < 0.2 else "fair"
            })

# Save report
with open("output.json", "w") as f:
    json.dump({"crop_analysis": results}, f, indent=2)

print(f"Analyzed {len(results)} images")
`,
    exampleInput: "Upload GeoTIFF or aerial images"
  }
];

// File Upload Component
function FileUpload({ onUploadComplete, uploadedUrl, label }: { onUploadComplete: (url: string) => void, uploadedUrl: string, label: string }) {
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
            <>
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-1" />
              <p className="text-xs text-zinc-400">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-zinc-500 mb-1" />
              <p className="text-xs text-zinc-400">
                <span className="text-amber-500">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-zinc-600 mt-1">Max 50MB</p>
            </>
          )}
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept=".zip,.json,.csv,.txt,.jpg,.jpeg,.png,.webp,.dcm,.tif,.tiff,.blend" />
      </label>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}

export default function CreateJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "unknown";
  
  const [selectedType, setSelectedType] = useState(JOB_TYPES[0]);
  const [title, setTitle] = useState("");
  const [script, setScript] = useState(JOB_TYPES[0].defaultScript);
  const [inputFileUrl, setInputFileUrl] = useState("");
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

  // Update script when job type changes
  const handleTypeChange = (typeId: string) => {
    const type = JOB_TYPES.find(t => t.id === typeId);
    if (type) {
      setSelectedType(type);
      setScript(type.defaultScript);
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
          type: selectedType.id,
          script,
          postedBy: username,
          reward: parseFloat(reward) || 0,
          requiredCapabilities: selectedType.capabilities,
          requiredImages: [selectedType.image],
          inputFileUrl: inputFileUrl || null,
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: "Job created successfully!",
          jobId: data.jobId
        });
        setTitle("");
        setInputFileUrl("");
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Type Selection */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-500" />
            Select Job Type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {JOB_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType.id === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-amber-500/20" : "bg-zinc-800"}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? "text-amber-400" : "text-zinc-400"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? "text-white" : "text-zinc-300"}`}>
                          {type.label}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{type.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{type.image}</span>
                        <span className="text-xs text-zinc-600">{type.estimatedSize}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Job Details */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-500" />
            Job Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g., ${selectedType.label} Task`}
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>

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

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Required Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {selectedType.capabilities.map(cap => (
                    <span key={cap} className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Input File */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
              <div className="flex items-center gap-3 mb-3">
                <FileInput className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-medium text-white">Input Files</h3>
                  <p className="text-xs text-zinc-500">{selectedType.exampleInput}</p>
                </div>
              </div>
              <FileUpload onUploadComplete={setInputFileUrl} uploadedUrl={inputFileUrl} label={selectedType.exampleInput} />
            </div>
          </div>
        </div>

        {/* Script Editor */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-500" />
              Script
            </h2>
            <span className="text-xs text-zinc-500">Runs in {selectedType.image}</span>
          </div>
          
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={16}
            className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-800 text-zinc-300 font-mono text-sm focus:outline-none focus:border-amber-500/50 resize-y"
            required
          />
          
          <p className="mt-2 text-xs text-zinc-500">
            Output files saved to <code className="text-amber-500">/workspace/output/</code> will be returned to you.
          </p>
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
              <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating...</>
            ) : (
              <><Play className="w-5 h-5" /> Deploy Job</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
