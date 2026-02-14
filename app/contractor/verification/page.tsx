"use client";

import { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Download,
  Hash,
} from "lucide-react";

const verificationItems = [
  {
    id: 1,
    type: "hash",
    name: "Output Hash Verification",
    status: "passed",
    details: "SHA-256 match confirmed",
    value: "a3f5c8...9e2d",
  },
  {
    id: 2,
    type: "container",
    name: "Container Integrity",
    status: "passed",
    details: "No tampering detected",
    value: "docker:sha256:7d8a...",
  },
  {
    id: 3,
    type: "resource",
    name: "Resource Usage Audit",
    status: "passed",
    details: "Within declared bounds",
    value: "GPU: 87% avg",
  },
  {
    id: 4,
    type: "time",
    name: "Execution Time",
    status: "passed",
    details: "Completed within SLA",
    value: "1h 23m / 2h max",
  },
];

const disputeReasons = [
  "Output doesn't match specification",
  "Incomplete or corrupted files",
  "Quality below acceptable threshold",
  "Other (describe in details)",
];

export default function Verification() {
  const [showDispute, setShowDispute] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verification Chamber</h1>
          <p className="text-gray-500 text-sm">Quality assurance and proof validation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono text-green-400">ALL CHECKS PASSED</span>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-lg mb-1">PRJ-4521: Blender Render Batch</h2>
            <p className="text-gray-500 text-sm">Completed 15 minutes ago • RTX 4090 Server</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono text-cyan-400">0.045 ETH</p>
            <p className="text-xs text-gray-500">Ready for release</p>
          </div>
        </div>
      </div>

      {/* Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automated Verification */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold">Automated Verification</h3>
          </div>
          <div className="space-y-3">
            {verificationItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-gray-400">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Preview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold">Results Preview</h3>
            </div>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <Download className="w-3 h-3" />
              Download All
            </button>
          </div>
          
          {/* Preview Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <FileCheck className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <span className="text-xs text-gray-600">frame_{i * 30}.png</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-black border border-gray-800">
            <div className="flex items-center gap-2 text-xs">
              <Hash className="w-3 h-3 text-gray-500" />
              <span className="text-gray-500">Merkle Root:</span>
              <span className="font-mono text-gray-400">0x7a3f...c9e2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="font-bold">Verification Complete</p>
              <p className="text-sm text-gray-400">
                All automated checks passed. Release payment to device owner?
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDispute(true)}
              className="px-4 py-2 rounded-full bg-white/5 text-gray-400 hover:text-white font-medium text-sm transition-all"
            >
              Reject & Dispute
            </button>
            <button className="btn-pill bg-green-500 hover:bg-green-400 text-black border-none">
              <CheckCircle className="w-4 h-4" />
              Accept & Release
            </button>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {showDispute && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card p-8 max-w-lg w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-4 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Initiate Dispute</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              Describe the issue with the delivered work. Your escrowed funds will remain locked pending arbitration.
            </p>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium">Reason for dispute:</p>
              {disputeReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedReason === reason
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedReason === reason ? "bg-red-500 border-red-500" : "border-gray-600"
                    }`} />
                    <span className="text-sm">{reason}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDispute(false)}
                className="flex-1 btn-pill-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDispute(false)}
                disabled={!selectedReason}
                className="flex-1 px-4 py-2 rounded-full bg-red-500 text-black font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
