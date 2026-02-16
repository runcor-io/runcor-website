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

    // Get all completed jobs claimed by this user (simpler than device matching)
    const userEarnings = await db
      .collection("jobs")
      .find({
        status: "completed",
        claimedBy: username,
      })
      .toArray();

    // Calculate totals
    const totalEarned = userEarnings.reduce(
      (sum, job) => sum + (job.reward || 0),
      0
    );

    const pendingPayout = 0; // Will implement later

    // Format transactions
    const transactions = userEarnings.map((job) => ({
      id: job._id.toString(),
      type: "earning",
      description: `Job: ${job.title}`,
      amount: job.reward || 0,
      status: "completed",
      date: job.completedAt || job.createdAt,
      deviceId: job.deviceId,
    }));

    // Sort by date (newest first)
    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    await client.close();

    return NextResponse.json({
      balance: totalEarned - pendingPayout,
      totalEarned,
      pendingPayout,
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
