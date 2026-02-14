"use client";

import { useState } from "react";
import {
  Wallet,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Shield,
  FileText,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const escrows = [
  { id: "ESC-101", project: "PRJ-4521", amount: "0.045 ETH", status: "locked", lockedAt: "2h ago", unlocks: "On verification" },
  { id: "ESC-102", project: "PRJ-4520", amount: "0.012 ETH", status: "releasable", lockedAt: "1d ago", unlocks: "Ready now" },
  { id: "ESC-103", project: "PRJ-4518", amount: "0.028 ETH", status: "released", lockedAt: "3d ago", unlocks: "Released" },
];

const transactions = [
  { id: "TXN-9821", type: "lock", amount: "0.045 ETH", project: "PRJ-4521", time: "2h ago", status: "confirmed" },
  { id: "TXN-9820", type: "release", amount: "0.028 ETH", project: "PRJ-4518", time: "1d ago", status: "confirmed" },
  { id: "TXN-9819", type: "lock", amount: "0.012 ETH", project: "PRJ-4520", time: "2d ago", status: "confirmed" },
];

export default function Vault() {
  const [activeTab, setActiveTab] = useState<"escrows" | "history">("escrows");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Vault & Settlement</h1>
        <p className="text-gray-500 text-sm">Blockchain escrow management and payment flows</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold font-mono">5.247 ETH</p>
              <p className="text-sm text-gray-500 mt-1">≈ $13,117.50 USD</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="flex-1 btn-pill bg-amber-500 hover:bg-amber-400 text-black border-none justify-center">
              <ArrowDownLeft className="w-4 h-4" />
              Deposit
            </button>
            <button className="flex-1 btn-pill-secondary justify-center">
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold">In Escrow</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold font-mono text-amber-400">0.057 ETH</p>
              <p className="text-xs text-gray-500">Locked in active projects</p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">Available to Release</p>
              <p className="text-xl font-bold font-mono text-green-400">0.012 ETH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("escrows")}
          className={`pb-4 text-sm font-medium transition-all ${
            activeTab === "escrows"
              ? "text-amber-400 border-b-2 border-amber-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Active Escrows
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 text-sm font-medium transition-all ${
            activeTab === "history"
              ? "text-amber-400 border-b-2 border-amber-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Transaction History
        </button>
      </div>

      {/* Escrows Tab */}
      {activeTab === "escrows" && (
        <div className="space-y-3">
          {escrows.map((escrow) => (
            <div
              key={escrow.id}
              className="card p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  escrow.status === "locked" ? "bg-amber-500/20" :
                  escrow.status === "releasable" ? "bg-green-500/20" :
                  "bg-gray-800"
                }`}>
                  {escrow.status === "locked" ? (
                    <Lock className="w-6 h-6 text-amber-400" />
                  ) : escrow.status === "releasable" ? (
                    <Unlock className="w-6 h-6 text-green-400" />
                  ) : (
                    <ExternalLink className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold">{escrow.project}</p>
                  <p className="text-xs text-gray-500 font-mono">{escrow.id} • Locked {escrow.lockedAt}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">{escrow.amount}</p>
                <div className="flex items-center justify-end gap-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className={`text-xs ${
                    escrow.status === "releasable" ? "text-green-400" : "text-gray-500"
                  }`}>
                    {escrow.unlocks}
                  </span>
                </div>
              </div>
              {escrow.status === "releasable" && (
                <button className="px-4 py-2 rounded-full bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-all">
                  Release
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Transaction</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Project</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Time</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === "lock" ? "bg-amber-500/20" : "bg-green-500/20"
                      }`}>
                        {tx.type === "lock" ? (
                          <Lock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Unlock className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-500 font-mono">{tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{tx.project}</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-sm ${
                      tx.type === "release" ? "text-green-400" : "text-amber-400"
                    }`}>
                      {tx.type === "release" ? "+" : "-"}{tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{tx.time}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs text-green-400">
                      <Shield className="w-3 h-3" />
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Security Info */}
      <div className="card p-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Smart Contract Security</p>
          <p className="text-sm text-gray-400">
            All funds are secured by audited smart contracts. Multi-sig required for disputes.
          </p>
        </div>
        <button className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
          View Contract
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
