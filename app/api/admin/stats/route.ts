import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

const ADMIN_USERNAMES = ["admin"];

async function isAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.username) return false;
  return ADMIN_USERNAMES.includes((token.username as string).toLowerCase());
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // User stats
    const totalUsers = await db.collection("users").countDocuments();
    const contractors = await db.collection("users").countDocuments({ role: "contractor" });
    const owners = await db.collection("users").countDocuments({ role: "owner" });

    // Job stats
    const totalJobs = await db.collection("jobs").countDocuments();
    const pendingJobs = await db.collection("jobs").countDocuments({ status: "pending" });
    const runningJobs = await db.collection("jobs").countDocuments({ status: "running" });
    const completedJobs = await db.collection("jobs").countDocuments({ status: "completed" });
    const failedJobs = await db.collection("jobs").countDocuments({ status: "failed" });

    // Device stats
    const totalDevices = await db.collection("devices").countDocuments();
    const onlineDevices = await db.collection("devices").countDocuments({ 
      lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000).toISOString() } 
    });

    // Token economy
    const allUsers = await db.collection("users").find({}, { projection: { walletBalance: 1 } }).toArray();
    const totalTokensInCirculation = allUsers.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

    // Recent transactions
    const recentTransactions = await db
      .collection("transactions")
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Total tokens transacted
    const allTransactions = await db.collection("transactions").find().toArray();
    const totalTokensTransacted = allTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    await client.close();

    return NextResponse.json({
      users: {
        total: totalUsers,
        contractors,
        owners,
      },
      jobs: {
        total: totalJobs,
        pending: pendingJobs,
        running: runningJobs,
        completed: completedJobs,
        failed: failedJobs,
        successRate: totalJobs > 0 ? Math.round((completedJobs / (completedJobs + failedJobs || 1)) * 100) : 0,
      },
      devices: {
        total: totalDevices,
        online: onlineDevices,
      },
      tokens: {
        inCirculation: totalTokensInCirculation,
        totalTransacted: totalTokensTransacted,
      },
      recentTransactions: recentTransactions.map((t) => ({
        id: t._id.toString(),
        username: t.username,
        type: t.type,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
