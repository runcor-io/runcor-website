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
  Radio,
} from "lucide-react";
import RequireAuth from "../components/RequireAuth";
import LogoutButton from "../components/LogoutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/device", label: "Nodes", icon: Cpu },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/marketplace", label: "Browse Jobs", icon: Radio },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
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
          <div className="p-4 border-t border-zinc-800">
            <LogoutButton variant="sidebar" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Top Bar */}
          <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">Provider Portal</span>
            </div>
            <div className="flex items-center gap-6">
              <Link 
                href="/profile" 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white hover:opacity-80 transition-opacity"
                title="Profile"
              >
                {username.charAt(0).toUpperCase()}
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <div className="pt-16 p-6">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
