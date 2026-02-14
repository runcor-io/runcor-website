"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, User, ArrowRight } from "lucide-react";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    // Simple auth - store in localStorage for testing
    const users = JSON.parse(localStorage.getItem("runcor_users") || "[]");
    
    if (isLogin) {
      // Login
      const user = users.find((u: string) => u === username.trim());
      if (!user) {
        setError("User not found. Please register first.");
        return;
      }
    } else {
      // Register
      if (users.includes(username.trim())) {
        setError("Username already exists. Please choose another.");
        return;
      }
      users.push(username.trim());
      localStorage.setItem("runcor_users", JSON.stringify(users));
    }

    // Set current user
    localStorage.setItem("runcor_current_user", username.trim());
    
    // Redirect to dashboard
    router.push("/dashboard");
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
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold mb-2">RUNCOR</h1>
          <p className="text-gray-500">Universal Device Autonomy Network</p>
        </div>

        {/* Auth Card */}
        <div className="card p-8">
          <h2 className="text-xl font-bold text-center mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
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

            <button
              type="submit"
              className="w-full btn-pill justify-center"
            >
              {isLogin ? "Sign In" : "Create Account"}
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
                ? "Don't have an account? Register" 
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Testing Mode • No password required • Data stored locally
        </p>
      </div>
    </div>
  );
}
