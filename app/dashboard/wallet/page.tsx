"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  RefreshCw,
  DollarSign,
  Briefcase,
  AlertCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  date: string;
  deviceId: string;
}

interface EarningsData {
  balance: number;
  totalEarned: number;
  pendingPayout: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { data: session } = useSession();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");

  const fetchEarnings = async () => {
    try {
      const response = await fetch("/api/earnings");
      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      } else {
        setError("Failed to load earnings");
      }
    } catch (err) {
      setError("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
    // Refresh every 30 seconds
    const interval = setInterval(fetchEarnings, 30000);
    return () => clearInterval(interval);
  }, []);

  const requestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount > (earnings?.balance || 0)) {
      setError("Insufficient balance");
      return;
    }

    setPayoutLoading(true);
    setError("");

    try {
      const response = await fetch("/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: "bank_transfer" }),
      });

      const data = await response.json();

      if (response.ok) {
        setPayoutMessage(data.message);
        setPayoutAmount("");
        fetchEarnings(); // Refresh earnings
      } else {
        setError(data.error || "Failed to request payout");
      }
    } catch (err) {
      setError("Failed to request payout");
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
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
          <p className="text-zinc-500 text-sm">Track your earnings and request payouts</p>
        </div>
        <button
          onClick={fetchEarnings}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {payoutMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400">{payoutMessage}</p>
        </div>
      )}

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Balance */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 md:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-white font-mono">
                ${earnings?.balance.toFixed(2) || "0.00"}
              </p>
              <p className="text-sm text-zinc-500 mt-1">USD</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500 uppercase">Total Earned</p>
              <p className="text-xl font-bold text-emerald-400 font-mono">
                +${earnings?.totalEarned.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase">Pending Payout</p>
              <p className="text-xl font-bold text-amber-400 font-mono">
                ${earnings?.pendingPayout.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Payout Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white">Request Payout</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  max={earnings?.balance}
                  className="w-full pl-8 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Max: ${earnings?.balance.toFixed(2)}
              </p>
            </div>

            <button
              onClick={requestPayout}
              disabled={payoutLoading || !payoutAmount || parseFloat(payoutAmount) <= 0}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-black font-medium py-2 rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {payoutLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Request Payout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Earnings History</h3>
          <span className="text-xs text-zinc-500">{earnings?.transactions.length || 0} transactions</span>
        </div>

        {earnings?.transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No earnings yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              Complete jobs to start earning
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings?.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description}</p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {tx.deviceId?.slice(0, 12)}... • {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-emerald-400">
                    +${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-500">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-blue-400">Payout Processing</p>
          <p className="text-sm text-zinc-400">
            Payout requests are processed within 3-5 business days. Minimum payout: $10.00
          </p>
        </div>
      </div>
    </div>
  );
}
