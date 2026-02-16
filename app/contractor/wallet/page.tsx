"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  Coins,
  Briefcase,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  balanceAfter: number;
  jobId?: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export default function ContractorWalletPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWallet = async () => {
    try {
      const response = await fetch("/api/wallet");
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      } else {
        setError("Failed to load wallet");
      }
    } catch (err) {
      setError("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const username = (session?.user as any)?.username;

  useEffect(() => {
    if (username) {
      fetchWallet();
    }
  }, [username]);

  // Separate polling effect
  useEffect(() => {
    if (!username) return;
    
    const interval = setInterval(() => {
      fetchWallet();
    }, 10000);
    return () => clearInterval(interval);
  }, [username]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const totalEarned = wallet?.transactions
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalSpent = wallet?.transactions
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading wallet...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
          <p className="text-zinc-500 text-sm">Manage your tokens and view transaction history</p>
        </div>
        <button
          onClick={fetchWallet}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Balance */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-white font-mono">
                {wallet?.balance.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-zinc-500 mt-1">tokens</p>
            </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Total Earned</p>
              <p className="text-4xl font-bold text-emerald-400 font-mono">
                +{totalEarned.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500 mt-1">tokens</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Total Spent</p>
              <p className="text-4xl font-bold text-rose-400 font-mono">
                -{totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500 mt-1">tokens</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Transaction History</h3>
          <span className="text-xs text-zinc-500">{wallet?.transactions.length || 0} transactions</span>
        </div>

        {wallet?.transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No transactions yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              Post or claim jobs to start transacting
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallet?.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.type === "credit" ? "bg-emerald-500/20" : "bg-rose-500/20"
                  }`}>
                    {tx.type === "credit" ? (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description}</p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm ${
                    tx.type === "credit" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {tx.type === "credit" ? "+" : "-"}{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500">{tx.balanceAfter.toLocaleString()} balance</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Coins className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-400">RunCor Tokens</p>
          <p className="text-sm text-zinc-400">
            Tokens are used to pay for job postings. Earn tokens by completing jobs posted by others.
            New accounts start with 1,000 free tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
