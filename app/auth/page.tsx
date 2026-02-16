"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { User, Lock, ArrowRight, Server, Briefcase, ChevronLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

function AuthContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState(""); // Keep for role selection
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"auth" | "choice">("auth");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsRole, setNeedsRole] = useState(false); // Track if user needs to select role
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Redirect if already logged in AND has role (skip choice if role exists)
  useEffect(() => {
    if (status === "authenticated" && step !== "choice" && !needsRole) {
      const role = (session?.user as any)?.role;
      // Only redirect if user already has a role
      if (role === "contractor") {
        router.push("/contractor");
      } else if (role === "owner") {
        router.push("/dashboard");
      }
      // If no role, stay on auth page (needsRole will be set in handleSubmit)
    }
  }, [status, session, router, step, needsRole]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "register") {
      setIsLogin(false);
    }
    
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "AccessDenied") {
        setError("Access denied. You don't have permission to view that page.");
      } else if (errorParam === "CredentialsSignin") {
        setError("Invalid username or password.");
      } else {
        setError("Authentication error. Please try again.");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password,
        action: isLogin ? "login" : "register",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Store password for role selection
      setStoredPassword(password);
      setNeedsRole(true);
      
      // Show role choice step
      setStep("choice");
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const selectRole = async (role: "owner" | "contractor") => {
    setLoading(true);
    setError("");
    
    try {
      // Update user role in database
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      // Simply redirect - role is saved, session will pick it up on next request
      if (role === "contractor") {
        window.location.href = "/contractor";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Role selection error:", err);
      setError(err.message || "Failed to set role. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/runcor-logo-512px.png"
              alt="RunCor Logo"
              width={64}
              height={64}
              className="object-cover rounded-xl mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white mb-2">RUNCOR</h1>
            <p className="text-zinc-500">Universal Device Autonomy Network</p>
          </Link>
        </div>

        {step === "auth" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white text-center mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-zinc-500 text-center text-sm mb-6">
              {isLogin 
                ? "Enter your credentials to continue" 
                : "Sign up to start using the network"}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium py-3 rounded-full hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        )}

        {step === "choice" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
            <button
              onClick={() => setStep("auth")}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-xl font-bold text-white text-center mb-2">Choose Your Path</h2>
            <p className="text-zinc-500 text-center text-sm mb-6">
              How would you like to participate in the network?
            </p>

            <div className="space-y-4">
              <button
                onClick={() => selectRole("owner")}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-left hover:border-cyan-500/50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <Server className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">Provider</h3>
                    <p className="text-sm text-zinc-400">
                      Connect your computers, servers, or hardware to earn by completing jobs.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => selectRole("contractor")}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-left hover:border-amber-500/50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <Briefcase className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">Contractor</h3>
                    <p className="text-sm text-zinc-400">
                      Post jobs and commission work from the autonomous device network.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          Secure Authentication • HTTP-only Cookies • Bcrypt Passwords
        </p>
      </div>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
