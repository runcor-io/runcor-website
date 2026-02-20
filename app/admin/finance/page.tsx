"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Coins,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface Transaction {
  _id: string;
  userId: string;
  username: string;
  type: "deposit" | "withdrawal" | "earning" | "fee" | "adjustment";
  amount: number;
  status: "completed" | "pending" | "failed";
  description: string;
  createdAt: string;
}

interface FinancialStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalFees: number;
  platformBalance: number;
  pendingWithdrawals: number;
}

export default function FinanceManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adjustUser, setAdjustUser] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

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
      fetchData();
    }
  }, [status, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, statsRes] = await Promise.all([
        fetch("/api/admin/transactions?limit=50"),
        fetch("/api/admin/finance/stats"),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      setError("Failed to fetch financial data");
    } finally {
      setLoading(false);
    }
  };

  const adjustBalance = async () => {
    if (!adjustUser || !adjustAmount || !adjustReason) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/admin/finance/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adjustUser,
          amount: parseInt(adjustAmount),
          reason: adjustReason,
        }),
      });

      if (res.ok) {
        setSuccess("Balance adjusted successfully");
        setAdjustUser("");
        setAdjustAmount("");
        setAdjustReason("");
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to adjust balance");
      }
    } catch (err) {
      setError("Error adjusting balance");
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "withdrawal":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "earning":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "fee":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "earning":
        return <ArrowDownRight className="w-4 h-4 text-emerald-400" />;
      case "withdrawal":
      case "fee":
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Controls</h1>
          <p className="text-zinc-500">Manage transactions and platform finances</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-sm">Total Deposits</span>
          </div>
          <p className="text-2xl font-bold text-white">{(stats?.totalDeposits || 0).toLocaleString()} RUN</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-sm">Total Withdrawals</span>
          </div>
          <p className="text-2xl font-bold text-white">{(stats?.totalWithdrawals || 0).toLocaleString()} RUN</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-sm">Platform Fees</span>
          </div>
          <p className="text-2xl font-bold text-white">{(stats?.totalFees || 0).toLocaleString()} RUN</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-400 text-sm">Platform Balance</span>
          </div>
          <p className="text-2xl font-bold text-white">{(stats?.platformBalance || 0).toLocaleString()} RUN</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adjust Balance */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Adjust User Balance
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Username</label>
              <input
                type="text"
                value={adjustUser}
                onChange={(e) => setAdjustUser(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Amount (use negative to deduct)</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 100 or -50"
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Reason</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Reason for adjustment"
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <button
              onClick={adjustBalance}
              className="w-full py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
            >
              Adjust Balance
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Recent Transactions</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-700"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="earning">Earnings</option>
                <option value="fee">Fees</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-500" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No transactions found</p>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tx.type)}
                    <div>
                      <p className="text-sm text-white">{tx.description}</p>
                      <p className="text-xs text-zinc-500">{tx.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono text-sm ${
                      tx.type === "deposit" || tx.type === "earning" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {tx.type === "deposit" || tx.type === "earning" ? "+" : "-"}{tx.amount} RUN
                    </span>
                    <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
