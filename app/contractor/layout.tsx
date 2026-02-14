"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Plus,
  Radio,
  Activity,
  Shield,
  Wallet,
  Package,
  BarChart3,
  LogOut,
  Terminal,
} from "lucide-react";

const navItems = [
  { href: "/contractor", label: "Mission Control", icon: Briefcase },
  { href: "/contractor/create", label: "New Project", icon: Plus },
  { href: "/contractor/fleet", label: "Fleet Selection", icon: Radio },
  { href: "/contractor/tracking", label: "Active Ops", icon: Activity },
  { href: "/contractor/verification", label: "Verification", icon: Shield },
  { href: "/contractor/vault", label: "Vault & Settlement", icon: Wallet },
  { href: "/contractor/results", label: "Results", icon: Package },
  { href: "/contractor/analytics", label: "Intelligence", icon: BarChart3 },
];

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#050505] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-sm">RC</span>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">RUNCOR</span>
              <p className="text-[10px] text-gray-500 font-mono">CONTRACTOR DECK</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-white border border-amber-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : ""}`} />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Terminal className="w-4 h-4" />
            Switch to Device View
          </Link>
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Exit Console
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-md fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-gray-500">CONTRACTOR STATUS</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono text-amber-400">ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-mono">PENDING PAYMENTS</p>
              <p className="text-sm font-mono text-amber-400">0.156 ETH</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold">
              CX
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-16 p-6">{children}</div>
      </main>
    </div>
  );
}
