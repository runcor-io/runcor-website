"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { User, Lock, ArrowRight, Server, Briefcase, ChevronLeft, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

function AuthContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"auth" | "entity_choice" | "pending_approval">("auth");
  const [selectedEntity, setSelectedEntity] = useState<"provider" | "contractor" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUsername, setPendingUsername] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      const entityType = (session?.user as any)?.entityType;
      if (entityType === "provider") {
        router.push("/dashboard");
      } else if (entityType === "contractor") {
        const contractorStatus = (session?.user as any)?.contractorStatus;
        if (contractorStatus === "approved") {
          router.push("/contractor");
        } else {
          // Shouldn't happen due to auth check, but handle it
          setStep("pending_approval");
        }
      }
    }
  }, [status, session, router]);

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

    if (!isLogin) {
      // For registration, show entity choice first
      if (!selectedEntity) {
        setStep("entity_choice");
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
    }

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password,
        entityType: isLogin ? undefined : selectedEntity,
        action: isLogin ? "login" : "register",
        redirect: false,
      });

      if (result?.error) {
        // Handle special error cases
        if (result.error === "ACCOUNT_PENDING_APPROVAL") {
          setPendingUsername(username);
          setStep("pending_approval");
          setLoading(false);
          return;
        }
        if (result.error === "ACCOUNT_REJECTED") {
          setError("Your account has been rejected. Please contact support.");
          setLoading(false);
          return;
        }
        setError(result.error);
        setLoading(false);
        return;
      }

      // Success - session update will trigger redirect
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const selectEntity = async (entity: "provider" | "contractor") => {
    setSelectedEntity(entity);
    setLoading(true);
    
    // Directly call signIn instead of form submission
    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password,
        entityType: entity,
        action: "register",
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "ACCOUNT_PENDING_APPROVAL") {
          setPendingUsername(username);
          setStep("pending_approval");
          setLoading(false);
          return;
        }
        setError(result.error);
        setLoading(false);
        return;
      }

      // Success - session update will trigger redirect for providers
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "entity_choice") {
      setStep("auth");
      setSelectedEntity(null);
    } else {
      setIsLogin(true);
      setError("");
    }
  };

  // Pending Approval Screen
  if (step === "pending_approval") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
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
            </Link>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-amber-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Application Submitted</h2>
            <p className="text-zinc-400 mb-6">
              Thank you for registering, <span className="text-white">{pendingUsername}</span>.
            </p>
            
            <div className="bg-zinc-900 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-zinc-400 mb-2">
                Your contractor account is pending admin approval.
              </p>
              <p className="text-sm text-zinc-400">
                You will be notified via email once your account is approved. 
                This usually takes 1-2 business days.
              </p>
            </div>

            <button
              onClick={() => {
                setStep("auth");
                setIsLogin(true);
                setUsername("");
                setPassword("");
              }}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium py-3 rounded-full hover:bg-zinc-200 transition-colors"
            >
              Return to Login
            </button>
          </div>

          <p className="text-center text-xs text-zinc-600 mt-6">
            Questions? Contact support at support@runcor.io
          </p>
        </div>
      </div>
    );
  }

  // Entity Choice Screen (Registration only)
  if (step === "entity_choice") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
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
            </Link>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-xl font-bold text-white text-center mb-2">Choose Your Path</h2>
            <p className="text-zinc-500 text-center text-sm mb-6">
              Select how you want to participate in the network
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => selectEntity("provider")}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-left hover:border-cyan-500/50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <Server className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">Become a Provider</h3>
                    <p className="text-sm text-zinc-400">
                      Connect your computers, servers, or hardware to earn by completing jobs.
                      Start earning immediately.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => selectEntity("contractor")}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-left hover:border-amber-500/50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <Briefcase className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">Become a Contractor</h3>
                    <p className="text-sm text-zinc-400">
                      Post jobs and commission compute work from the network.
                      Requires admin approval.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Auth Screen
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
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

          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
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
                  {isLogin ? "Signing In..." : "Continue..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Continue"}
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
                setSelectedEntity(null);
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

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
