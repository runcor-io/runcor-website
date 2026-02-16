"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Cpu,
  Briefcase,
  Wallet,
  BarChart3,
  Zap,
  Radio,
  Building2,
} from "lucide-react";
import RequireAuth from "../components/RequireAuth";
import LogoutButton from "../components/LogoutButton";

const navItems = [
  { href: "/dashboard", label: "Fleet Command", icon: LayoutDashboard },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Zap },
  { href: "/dashboard/device", label: "Devices", icon: Cpu },
  { href: "/dashboard/jobs", label: "Job Monitor", icon: Briefcase },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: Radio },
  { href: "/dashboard/wallet", label: "Blockchain", icon: Wallet },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "User";

  return (
    <RequireAuth>
      <div className="min-h-screen bg-black flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col fixed h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/runcor-logo-512px.png"
                alt="RunCor Logo"
                width={32}
                height={32}
                className="object-cover rounded-md"
              />
              <div>
                <span className="font-bold text-lg tracking-tight text-white">RUNCOR</span>
                <p className="text-[10px] text-zinc-500 font-mono">COMMAND CENTER</p>
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
                      ? "bg-zinc-900 text-white border border-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : ""}`} />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-zinc-800 space-y-2">
            <Link
              href="/contractor"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all"
            >
              <Building2 className="w-4 h-4" />
              Switch to Contractor View
            </Link>
            
            <LogoutButton variant="sidebar" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Top Bar */}
          <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-zinc-500">SYSTEM STATUS</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400">ONLINE</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-zinc-500 font-mono">NETWORK EARNINGS</p>
                <p className="text-sm font-mono text-cyan-400">+2.847 ETH</p>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="pt-16 p-6">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
