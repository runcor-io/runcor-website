"use client";

import { useState } from "react";
import {
  Package,
  Download,
  FileCheck,
  Image,
  Film,
  Box,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  RefreshCw,
} from "lucide-react";

const completedProjects = [
  {
    id: "PRJ-4518",
    name: "CNC Aluminum Part",
    type: "physical",
    device: "CNC Mill #1",
    completed: "2h ago",
    files: 3,
    size: "45.2 MB",
    rating: 5,
    cost: "0.028 ETH",
    status: "delivered",
  },
  {
    id: "PRJ-4517",
    name: "Video Encode Batch",
    type: "compute",
    device: "RTX 4090 Server",
    completed: "5h ago",
    files: 12,
    size: "1.2 GB",
    rating: 5,
    cost: "0.015 ETH",
    status: "downloaded",
  },
  {
    id: "PRJ-4516",
    name: "3D Print Prototype",
    type: "physical",
    device: "Prusa XL",
    completed: "1d ago",
    files: 8,
    size: "234 MB",
    rating: 4,
    cost: "0.012 ETH",
    status: "shipping",
  },
  {
    id: "PRJ-4515",
    name: "AI Model Training",
    type: "compute",
    device: "A100 Cluster",
    completed: "2d ago",
    files: 2,
    size: "4.5 GB",
    rating: 5,
    cost: "0.089 ETH",
    status: "archived",
  },
];

export default function Results() {
  const [selectedProject, setSelectedProject] = useState(completedProjects[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Results Gallery</h1>
          <p className="text-gray-500 text-sm">Download and manage completed work</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm">12 completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="space-y-3">
          {completedProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`w-full card p-4 text-left transition-all ${
                selectedProject.id === project.id
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    project.type === "compute" ? "bg-cyan-500/20" : "bg-amber-500/20"
                  }`}>
                    {project.type === "compute" ? (
                      <Film className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Box className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.device} • {project.completed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: project.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-gray-500">{project.files} files • {project.size}</span>
                <span className="font-mono text-cyan-400">{project.cost}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">{selectedProject.name}</h2>
              <p className="text-gray-500 text-sm">{selectedProject.id} • Completed {selectedProject.completed}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="btn-pill bg-amber-500 hover:bg-amber-400 text-black border-none text-sm">
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedProject.status === "delivered" ? "bg-green-500/10 border border-green-500/30 text-green-400" :
              selectedProject.status === "shipping" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" :
              "bg-gray-800 text-gray-400"
            }`}>
              {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{selectedProject.size} total</span>
          </div>

          {/* File Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6].slice(0, Math.min(selectedProject.files, 6)).map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-4 hover:border-amber-500/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-2 group-hover:bg-amber-500/20 transition-colors">
                  {selectedProject.type === "compute" ? (
                    <Film className="w-6 h-6 text-gray-500 group-hover:text-amber-400" />
                  ) : (
                    <Image className="w-6 h-6 text-gray-500 group-hover:text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono">output_{i}.png</p>
                <p className="text-[10px] text-gray-600">2.4 MB</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <button className="flex-1 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View on IPFS
            </button>
            <button className="flex-1 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <FileCheck className="w-4 h-4" />
              Certificate
            </button>
            <button className="flex-1 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Run Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
