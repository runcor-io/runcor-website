"use client";

import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Star,
  Target,
  Zap,
  Award,
} from "lucide-react";

const monthlySpending = [
  { month: "Jan", amount: 0.45 },
  { month: "Feb", amount: 0.62 },
  { month: "Mar", amount: 0.38 },
  { month: "Apr", amount: 0.89 },
  { month: "May", amount: 1.12 },
  { month: "Jun", amount: 0.94 },
];

const topDevices = [
  { name: "RTX 4090 Server", jobs: 23, cost: "0.847 ETH", rating: 4.9 },
  { name: "Prusa XL", jobs: 12, cost: "0.234 ETH", rating: 4.7 },
  { name: "CNC Mill #1", jobs: 8, cost: "0.189 ETH", rating: 4.8 },
];

const categoryBreakdown = [
  { name: "Rendering", count: 15, cost: "0.456 ETH", color: "cyan" },
  { name: "3D Printing", count: 12, cost: "0.312 ETH", color: "amber" },
  { name: "AI Training", count: 8, cost: "0.678 ETH", color: "purple" },
  { name: "Machining", count: 6, cost: "0.234 ETH", color: "green" },
];

export default function ContractorAnalytics() {
  const maxSpending = Math.max(...monthlySpending.map(m => m.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Intelligence Dashboard</h1>
        <p className="text-gray-500 text-sm">Contractor analytics and optimization insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400 text-sm">Total Spent (30d)</span>
          </div>
          <p className="text-3xl font-bold font-mono">1.247 ETH</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+18% vs last month</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Jobs Posted</span>
          </div>
          <p className="text-3xl font-bold">42</p>
          <p className="text-xs text-gray-500 mt-1">38 completed, 4 active</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Avg. Completion</span>
          </div>
          <p className="text-3xl font-bold">2.3h</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">-12% faster</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400 text-sm">Success Rate</span>
          </div>
          <p className="text-3xl font-bold">97.4%</p>
          <p className="text-xs text-gray-500 mt-1">1 dispute, 1 refund</p>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold">Monthly Spending</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">6 month total:</span>
            <span className="font-mono text-amber-400">4.4 ETH</span>
          </div>
        </div>
        <div className="h-48 flex items-end gap-6">
          {monthlySpending.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative">
                <div
                  className="w-full bg-amber-500/20 rounded-t-lg"
                  style={{ height: `${(month.amount / maxSpending) * 160}px` }}
                />
                <div
                  className="absolute bottom-0 w-full bg-amber-500 rounded-t-lg"
                  style={{ height: `${(month.amount / maxSpending) * 80}px` }}
                />
              </div>
              <span className="text-xs text-gray-500">{month.month}</span>
              <span className="text-[10px] text-gray-600 font-mono">{month.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Devices */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold">Top Performing Devices</h3>
          </div>
          <div className="space-y-4">
            {topDevices.map((device, i) => (
              <div key={device.name} className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{device.name}</p>
                  <p className="text-xs text-gray-500">{device.jobs} jobs completed</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-cyan-400">{device.cost}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs">{device.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold">Spending by Category</h3>
          </div>
          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  cat.color === "cyan" ? "bg-cyan-400" :
                  cat.color === "amber" ? "bg-amber-400" :
                  cat.color === "purple" ? "bg-purple-400" :
                  "bg-green-400"
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{cat.name}</span>
                    <span className="font-mono text-sm">{cat.cost}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.color === "cyan" ? "bg-cyan-400" :
                        cat.color === "amber" ? "bg-amber-400" :
                        cat.color === "purple" ? "bg-purple-400" :
                        "bg-green-400"
                      }`}
                      style={{ width: `${(cat.count / 15) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">{cat.count} jobs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-400 mb-1">Cost Optimization</p>
              <p className="text-sm text-gray-400">
                Posting jobs during off-peak hours (2-6 AM UTC) could reduce your compute costs by up to 25%.
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="font-medium text-cyan-400 mb-1">Trusted Fleet</p>
              <p className="text-sm text-gray-400">
                You have 3 preferred devices with 95%+ success rates. Enable "Trusted Only" for faster matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
