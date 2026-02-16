"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const username = (session?.user as any)?.username || "";

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/runcor-logo-512px.png"
            alt="RC Logo"
            width={32}
            height={32}
            className="object-cover rounded-md"
          />
          <span className="font-bold text-xl tracking-tight">RUNCOR</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/contractor" className="text-sm font-medium hover:text-white transition-colors text-gray-400">
                Contractor Portal
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:text-white transition-colors text-gray-400">
                Device Owner
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                <span className="text-sm text-cyan-400">{username}</span>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login" className="text-sm font-medium hover:text-white transition-colors text-gray-400">
                Log In
              </Link>
              <Link href="/auth" className="btn-pill">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
