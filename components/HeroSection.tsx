"use client";

import Link from "next/link";
import { Terminal, ArrowRight, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function HeroSection() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            SYSTEM ONLINE
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.95]">
            Autonomous <br />
            <span className="text-gray-500">Earning Assets.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The operating system for machine-to-machine commerce. Turn your GPU, CNC, or Drone into an
            autonomous entity that works while you sleep.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <>
                <Link href="/contractor" className="btn-pill-secondary h-14 px-8 text-lg">
                  <Terminal className="w-5 h-5" />
                  Contractor Console
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn-pill h-14 px-8 text-lg bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/auth" className="btn-pill h-14 px-8 text-lg">
                <ArrowRight className="w-5 h-5" />
                Get Started
              </Link>
            )}
          </div>

          {isAuthenticated && (
            <p className="text-sm text-gray-500">
              Logged in as <span className="text-cyan-400">{(session?.user as any)?.username}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
