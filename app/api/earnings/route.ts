import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

// GET /api/earnings - Get user's earnings summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = (session.user as any).username;

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Get all completed jobs claimed by this user
    // Only count jobs that are either:
    // 1. Non-deterministic (no expectedOutputHash)
    // 2. Deterministic with verificationStatus === "verified"
    const userEarnings = await db
      .collection("jobs")
      .find({
        status: "completed",
        claimedBy: username,
        $or: [
          { expectedOutputHash: { $exists: false } },
          { expectedOutputHash: null },
          { verificationStatus: "verified" }
        ]
      })
      .toArray();

    // Get pending/hold jobs (completed but verification failed or pending)
    const heldJobs = await db
      .collection("jobs")
      .find({
        status: "completed",
        claimedBy: username,
        expectedOutputHash: { $exists: true, $ne: null },
        verificationStatus: { $in: ["failed", "pending", "manual_review"] }
      })
      .toArray();

    // Calculate totals
    const totalEarned = userEarnings.reduce(
      (sum, job) => sum + (job.reward || 0),
      0
    );

    const totalHeld = heldJobs.reduce(
      (sum, job) => sum + (job.reward || 0),
      0
    );

    // Format transactions
    const earningTransactions = userEarnings.map((job) => ({
      id: job._id.toString(),
      type: "earning",
      description: `Job: ${job.title}`,
      amount: job.reward || 0,
      status: "completed",
      date: job.completedAt || job.createdAt,
      deviceId: job.deviceId,
    }));

    const heldTransactions = heldJobs.map((job) => ({
      id: job._id.toString(),
      type: "held",
      description: `Job: ${job.title} (Verification ${job.verificationStatus})`,
      amount: job.reward || 0,
      status: job.verificationStatus,
      date: job.completedAt || job.createdAt,
      deviceId: job.deviceId,
    }));

    const transactions = [...earningTransactions, ...heldTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Sort by date (newest first)
    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    await client.close();

    return NextResponse.json({
      balance: totalEarned,
      totalEarned,
      totalHeld,
      pendingPayout: 0,
      transactions,
    });
  } catch (error) {
    console.error("Earnings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}

// POST /api/earnings/payout - Request a payout
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payout amount" },
        { status: 400 }
      );
    }

    const username = (session.user as any).username;

    // For now, just log the payout request
    // In production, this would create a payout record and process it

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    await db.collection("payouts").insertOne({
      username,
      amount,
      method: method || "bank_transfer",
      status: "pending",
      requestedAt: new Date().toISOString(),
    });

    await client.close();

    return NextResponse.json({
      success: true,
      message: `Payout request for $${amount.toFixed(2)} submitted`,
    });
  } catch (error) {
    console.error("Payout error:", error);
    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 }
    );
  }
}
