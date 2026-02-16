"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Clock,
  Edit3,
  Save,
  X,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Cpu,
  Wallet,
} from "lucide-react";

interface UserStats {
  totalJobsPosted: number;
  totalJobsClaimed: number;
  devicesRegistered: number;
  memberSince: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState<UserStats | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const username = (session?.user as any)?.username || "";
  const role = (session?.user as any)?.role || "owner";
  const walletBalance = (session?.user as any)?.walletBalance || 0;

  const fetchUserStats = async () => {
    try {
      // Fetch jobs to calculate stats
      const jobsResponse = await fetch("/api/jobs");
      const devicesResponse = await fetch("/api/devices");
      
      let totalPosted = 0;
      let totalClaimed = 0;
      let devicesCount = 0;

      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json();
        totalPosted = jobs.filter((j: any) => 
          j.postedBy?.toLowerCase() === username.toLowerCase()
        ).length;
        totalClaimed = jobs.filter((j: any) => 
          j.claimedBy?.toLowerCase() === username.toLowerCase()
        ).length;
      }

      if (devicesResponse.ok) {
        const devices = await devicesResponse.json();
        devicesCount = devices.length;
      }

      setStats({
        totalJobsPosted: totalPosted,
        totalJobsClaimed: totalClaimed,
        devicesRegistered: devicesCount,
        memberSince: "Recently", // Would need to fetch from user record
      });
      
      setDisplayName(username);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchUserStats();
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // For now, just simulate a save
      // In a real implementation, you'd call an API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-zinc-500">Manage your account settings</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            Back
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                {username.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white">{username}</h2>
              <p className="text-zinc-500 text-sm capitalize mb-4">{role} Account</p>
              
              <div className="p-3 rounded-lg bg-zinc-900/50 mb-4">
                <p className="text-xs text-zinc-500 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-cyan-400 font-mono">{walletBalance.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">tokens</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats & Settings */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" />
                Account Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900/50 text-center">
                  <Briefcase className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats?.totalJobsPosted || 0}</p>
                  <p className="text-xs text-zinc-500">Jobs Posted</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/50 text-center">
                  <Cpu className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats?.totalJobsClaimed || 0}</p>
                  <p className="text-xs text-zinc-500">Jobs Claimed</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/50 text-center">
                  <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats?.devicesRegistered || 0}</p>
                  <p className="text-xs text-zinc-500">Devices</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/50 text-center">
                  <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats?.memberSince}</p>
                  <p className="text-xs text-zinc-500">Member</p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  Profile Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-600 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white disabled:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Not set"
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white disabled:text-zinc-500 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Account Type</label>
                  <input
                    type="text"
                    value={role === "contractor" ? "Job Poster" : "Device Owner"}
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" />
                Security
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Password</p>
                      <p className="text-xs text-zinc-500">Set a strong password</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400">Active</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Wallet</p>
                      <p className="text-xs text-zinc-500">Token balance secured</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
