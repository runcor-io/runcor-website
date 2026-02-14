"use client";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Cpu,
  Award,
} from "lucide-react";

const devicePerformance = [
  { name: "RTX 4090 Server", earnings: "2.847 ETH", efficiency: 94, uptime: "98.5%", trend: "up" },
  { name: "Prusa XL", earnings: "0.987 ETH", efficiency: 87, uptime: "95.2%", trend: "up" },
  { name: "CNC Mill #1", earnings: "1.234 ETH", efficiency: 76, uptime: "89.1%", trend: "down" },
  { name: "A100 Cluster", earnings: "0.000 ETH", efficiency: 0, uptime: "0%", trend: "neutral" },
];

const dailyEarnings = [
  { day: "Mon", amount: 0.089 },
  { day: "Tue", amount: 0.112 },
  { day: "Wed", amount: 0.095 },
  { day: "Thu", amount: 0.134 },
  { day: "Fri", amount: 0.156 },
  { day: "Sat", amount: 0.142 },
  { day: "Sun", amount: 0.118 },
];

export default function Analytics() {
  const maxEarning = Math.max(...dailyEarnings.map(d => d.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics & Insights</h1>
        <p className="text-gray-500 text-sm">Performance metrics and optimization recommendations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold font-mono">4.847 ETH</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+23% this week</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Jobs Completed</span>
          </div>
          <p className="text-3xl font-bold">587</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+12% this week</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400 text-sm">Avg. Job Time</span>
          </div>
          <p className="text-3xl font-bold">24m</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">-8% faster</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Success Rate</span>
          </div>
          <p className="text-3xl font-bold">98.2%</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+0.5% this week</span>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold">Daily Earnings</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Last 7 days:</span>
            <span className="font-mono text-cyan-400">0.846 ETH</span>
          </div>
        </div>
        <div className="h-48 flex items-end gap-4">
          {dailyEarnings.map((day, i) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative">
                <div
                  className="w-full bg-cyan-500/20 rounded-t-lg transition-all hover:bg-cyan-500/40"
                  style={{ height: `${(day.amount / maxEarning) * 160}px` }}
                />
                <div
                  className="absolute bottom-0 w-full bg-cyan-500 rounded-t-lg"
                  style={{ height: `${(day.amount / maxEarning) * 80}px` }}
                />
              </div>
              <span className="text-xs text-gray-500">{day.day}</span>
              <span className="text-[10px] text-gray-600 font-mono">{day.amount.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Device Performance */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Device Performance</h3>
          <button className="text-xs text-cyan-400 hover:text-cyan-300">View Details</button>
        </div>
        <div className="space-y-4">
          {devicePerformance.map((device) => (
            <div key={device.name} className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium truncate">{device.name}</p>
                  <p className="font-mono text-cyan-400">{device.earnings}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-500">Efficiency</span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-[100px]">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${device.efficiency}%` }}
                      />
                    </div>
                    <span className="text-gray-400 w-8">{device.efficiency}%</span>
                  </div>
                  <span className="text-gray-500">Uptime: {device.uptime}</span>
                  {device.trend === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
                  {device.trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="font-medium text-cyan-400 mb-1">Pricing Optimization</p>
              <p className="text-sm text-gray-400">
                Your RTX 4090 Server is underpriced for AI training jobs. 
                Increase rates by 15% to match market demand and earn an additional 
                <span className="text-cyan-400 font-mono"> +0.42 ETH/month</span>.
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-400 mb-1">Downtime Alert</p>
              <p className="text-sm text-gray-400">
                CNC Mill #1 was offline for 4.2 hours yesterday. 
                Estimated revenue loss: 
                <span className="text-amber-400 font-mono"> 0.018 ETH</span>.
                Schedule preventive maintenance?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Contribution */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold">Network Contribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-3xl font-bold text-purple-400">Top 5%</p>
            <p className="text-sm text-gray-500 mt-1">Earnings Rank</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-3xl font-bold text-purple-400">12</p>
            <p className="text-sm text-gray-500 mt-1">Verification Proofs</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <p className="text-3xl font-bold text-purple-400">99.7%</p>
            <p className="text-sm text-gray-500 mt-1">Reputation Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
