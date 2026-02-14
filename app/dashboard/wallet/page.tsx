"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  Shield,
  AlertTriangle,
} from "lucide-react";

const transactions = [
  { id: "TXN-4821", type: "income", amount: "0.0042 ETH", from: "Job #8492", time: "2m ago", status: "confirmed" },
  { id: "TXN-4820", type: "income", amount: "0.0028 ETH", from: "Job #8491", time: "15m ago", status: "confirmed" },
  { id: "TXN-4819", type: "income", amount: "0.0051 ETH", from: "Job #8490", time: "32m ago", status: "confirmed" },
  { id: "TXN-4818", type: "escrow", amount: "0.045 ETH", from: "REQ-1294", time: "1h ago", status: "locked" },
  { id: "TXN-4817", type: "income", amount: "0.0084 ETH", from: "Job #8489", time: "2h ago", status: "confirmed" },
];

const escrows = [
  { id: "ESC-293", job: "REQ-1294", amount: "0.045 ETH", unlocksIn: "3h 24m", status: "active" },
  { id: "ESC-292", job: "REQ-1288", amount: "0.012 ETH", unlocksIn: "Ready", status: "releasable" },
];

export default function BlockchainConsole() {
  const [copied, setCopied] = useState(false);
  const walletAddress = "0x7a23...4f91";

  const copyAddress = () => {
    navigator.clipboard.writeText("0x7a23c8567d1a9e8f4c2b5d6e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Blockchain Console</h1>
        <p className="text-gray-500 text-sm">Manage your wallet, escrows, and transaction history</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="card p-6 md:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Balance</p>
              <p className="text-4xl font-bold font-mono">2.847 ETH</p>
              <p className="text-sm text-gray-500 mt-1">≈ $7,112.50 USD</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-gray-800">
            <span className="font-mono text-sm text-gray-400">{walletAddress}</span>
            <button
              onClick={copyAddress}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
            <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button className="flex-1 btn-pill text-sm">
              <ArrowDownLeft className="w-4 h-4" />
              Deposit
            </button>
            <button className="flex-1 btn-pill-secondary text-sm">
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Escrow Summary */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold">Escrow Status</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Locked in Escrow</p>
              <p className="text-2xl font-bold font-mono text-amber-400">0.057 ETH</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Available to Claim</p>
              <p className="text-2xl font-bold font-mono text-green-400">0.012 ETH</p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">Total Secured (All Time)</p>
              <p className="text-xl font-bold font-mono">12.456 ETH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Escrows */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Active Escrows</h3>
          <span className="text-xs text-gray-500">Smart Contract Secured</span>
        </div>
        <div className="space-y-3">
          {escrows.map((escrow) => (
            <div
              key={escrow.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  escrow.status === "active" ? "bg-amber-500/20" : "bg-green-500/20"
                }`}>
                  <Lock className={`w-5 h-5 ${
                    escrow.status === "active" ? "text-amber-400" : "text-green-400"
                  }`} />
                </div>
                <div>
                  <p className="font-medium">{escrow.job}</p>
                  <p className="text-xs text-gray-500 font-mono">{escrow.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">{escrow.amount}</p>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className={escrow.status === "releasable" ? "text-green-400" : "text-gray-500"}>
                    {escrow.unlocksIn}
                  </span>
                </div>
              </div>
              {escrow.status === "releasable" && (
                <button className="px-4 py-2 rounded-full bg-green-500 text-black text-sm font-medium hover:bg-green-400 transition-all">
                  Claim
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Transaction History</h3>
          <button className="text-xs text-cyan-400 hover:text-cyan-300">View All</button>
        </div>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === "income" ? "bg-green-500/20" : "bg-amber-500/20"
                }`}>
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.from}</p>
                  <p className="text-xs text-gray-500 font-mono">{tx.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-mono text-sm ${tx.type === "income" ? "text-green-400" : "text-amber-400"}`}>
                  {tx.type === "income" ? "+" : ""}{tx.amount}
                </p>
                <p className="text-xs text-gray-500">{tx.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="card p-4 flex items-center gap-4 border-green-500/30 bg-green-500/5">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-green-400">Non-Custodial Security</p>
          <p className="text-sm text-gray-400">
            You maintain full control of your private keys. RunCor never has access to your funds.
          </p>
        </div>
      </div>
    </div>
  );
}
