"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "sidebar";
}

export default function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/auth" });
  };

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
