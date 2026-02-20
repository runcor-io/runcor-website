"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  RefreshCw,
  AlertCircle,
  Briefcase,
  Search
} from "lucide-react";

interface Contractor {
  _id: string;
  username: string;
  contractorStatus: "pending" | "approved" | "rejected";
  walletBalance: number;
  createdAt: string;
  rejectionReason?: string;
}

export default function ContractorApprovals() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

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
      fetchContractors();
    }
  }, [status, isAdmin, activeTab]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/contractors?status=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setContractors(data.contractors || []);
      } else {
        setError("Failed to load contractors");
      }
    } catch (err) {
      setError("Error fetching contractors");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessing(userId);
    try {
      const response = await fetch("/api/admin/contractors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "approved" }),
      });

      if (response.ok) {
        fetchContractors();
      } else {
        setError("Failed to approve contractor");
      }
    } catch (err) {
      setError("Error approving contractor");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessing(userId);
    try {
      const response = await fetch("/api/admin/contractors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          status: "rejected",
          rejectionReason 
        }),
      });

      if (response.ok) {
        setShowRejectModal(null);
        setRejectionReason("");
        fetchContractors();
      } else {
        setError("Failed to reject contractor");
      }
    } catch (err) {
      setError("Error rejecting contractor");
    } finally {
      setProcessing(null);
    }
  };

  const filteredContractors = contractors.filter(c => 
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/10 text-red-400 border-red-500/30",
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${classes[status as keyof typeof classes]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contractor Approvals</h1>
          <p className="text-zinc-500 text-sm">Manage contractor registration requests</p>
        </div>
        <button
          onClick={fetchContractors}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== "all" && (
              <span className="ml-2 text-xs text-zinc-600">
                {contractors.filter(c => c.contractorStatus === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search contractors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
        />
      </div>

      {/* Contractors List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : filteredContractors.length === 0 ? (
        <div className="text-center py-12 bg-zinc-950 rounded-xl border border-zinc-800">
          <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No {activeTab} contractors found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContractors.map((contractor) => (
            <div
              key={contractor._id}
              className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <p className="font-medium text-white">{contractor.username}</p>
                  <p className="text-sm text-zinc-500">
                    Joined {new Date(contractor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {getStatusBadge(contractor.contractorStatus)}
                
                {contractor.contractorStatus === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(contractor._id)}
                      disabled={processing === contractor._id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(contractor._id)}
                      disabled={processing === contractor._id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">Reject Contractor</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Please provide a reason for rejecting this contractor application.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Rejection reason..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 mb-4 resize-none"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
