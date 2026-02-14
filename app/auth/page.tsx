"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cpu, User, ArrowRight, Server, Briefcase, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState<"auth" | "choice">("auth");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user wants login mode
    const mode = searchParams.get("mode");
    if (mode === "login") {
      setIsLogin(true);
    }
    
    // Check if already logged in
    const currentUser = localStorage.getItem("runcor_current_user");
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [router, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    const users = JSON.parse(localStorage.getItem("runcor_users") || "[]");
    
    if (isLogin) {
      const user = users.find((u: string) => u === username.trim());
      if (!user) {
        setError("User not found. Please register first.");
        return;
      }
      // Login success - go to choice
      localStorage.setItem("runcor_current_user", username.trim());
      setStep("choice");
    } else {
      // Register
      if (users.includes(username.trim())) {
        setError("Username already exists. Please choose another.");
        return;
      }
      users.push(username.trim());
      localStorage.setItem("runcor_users", JSON.stringify(users));
      localStorage.setItem("runcor_current_user", username.trim());
      
      // Registration success - go to choice
      setStep("choice");
    }
  };

  const selectRole = (role: "owner" | "contractor") => {
    localStorage.setItem("runcor_role", role);
    if (role === "contractor") {
      router.push("/contractor");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 machine-visual">
        <div className="machine-grid" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold mb-2">RUNCOR</h1>
            <p className="text-gray-500">Universal Device Autonomy Network</p>
          </Link>
        </div>

        {step === "auth" && (
          <div className="card p-8">
            <h2 className="text-xl font-bold text-center mb-6">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="w-full btn-pill justify-center">
                {isLogin ? "Continue" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Create one" 
                  : "Already have an account? Sign In"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link href="/contractor" className="text-sm text-gray-500 hover:text-gray-300">
                Skip to Contractor Portal →
              </Link>
            </div>
          </div>
        )}

        {step === "choice" && (
          <div className="card p-8">
            <button
              onClick={() => setStep("auth")}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-xl font-bold text-center mb-2">Choose Your Path</h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              How would you like to participate in the network?
            </p>

            <div className="space-y-4">
              <button
                onClick={() => selectRole("owner")}
                className="w-full card p-6 text-left hover:border-cyan-500/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <Server className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Device Owner</h3>
                    <p className="text-sm text-gray-400">
                      Connect your computers, servers, or hardware to earn by completing jobs.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => selectRole("contractor")}
                className="w-full card p-6 text-left hover:border-amber-500/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <Briefcase className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Contractor</h3>
                    <p className="text-sm text-gray-400">
                      Post jobs and commission work from the autonomous device network.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-amber-400 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Testing Mode • No password required • Data stored locally
        </p>
      </div>
    </div>
  );
}
