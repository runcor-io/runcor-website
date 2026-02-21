"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Server,
  ArrowRight
} from "lucide-react";

interface Payout {
  _id: string;
  jobId: string;
  amountRun: number;
  percentageOfPool: number;
  workScore: number;
  tasksContributed: number;
  transactionStatus: string;
  createdAt: string;
}

interface Stats {
  totalEarned: number;
  pendingPayouts: number;
  totalTasks: number;
  activeNodes: number;
}

export default function ProviderPayouts() {
  const { data: session } = useSession();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEarned: 0,
    pendingPayouts: 0,
    totalTasks: 0,
    activeNodes: 0,
  });
  const [loading, setLoading] = useState(true);
  const username = (session?.user as any)?.username || "";

  useEffect(() => {
    if (username) {
      fetchPayouts();
    }
  }, [username]);

  const fetchPayouts = async () => {
    try {
      const response = await fetch(`/api/payouts?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts || []);
        setStats(data.stats || stats);
      }
    } catch (err) {
      console.error("Error fetching payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "failed": return "bg-red-500/10 text-red-400 border-red-500/30";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Provider Earnings</h1>
        <p className="text-zinc-400 mt-1">View your payouts from completed jobs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400 text-sm">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalEarned.toLocaleString()} RUN</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pendingPayouts.toLocaleString()} RUN</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-400 text-sm">Tasks Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-sm">Active Nodes</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.activeNodes}</p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Recent Payouts</h2>
        </div>

        {payouts.length === 0 ? (
          <div className="p-8 text-center">
            <Coins className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500">No payouts yet</p>
            <p className="text-zinc-600 text-sm mt-1">Complete tasks to start earning</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Job ID</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Percentage</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Tasks</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {payouts.map((payout) => (
                <tr key={payout._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <code className="text-sm text-zinc-400">{payout.jobId.slice(-8)}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-emerald-400">+{payout.amountRun} RUN</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{payout.percentageOfPool}%</td>
                  <td className="px-4 py-3 text-zinc-400">{payout.tasksContributed}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(payout.transactionStatus)}`}>
                      {payout.transactionStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* How It Works */}
      <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
        <h2 className="font-semibold text-white mb-4">How Payouts Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Server className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">1. Run Tasks</h3>
              <p className="text-xs text-zinc-500 mt-1">Your node executes assigned tasks</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">2. Work Scored</h3>
              <p className="text-xs text-zinc-500 mt-1">Payout based on CPU, memory, GPU usage</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">3. Get Paid</h3>
              <p className="text-xs text-zinc-500 mt-1">Receive RUN tokens proportionally</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
