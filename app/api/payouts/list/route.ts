import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";
const DB_NAME = "runcor";

let client: MongoClient | null = null;

async function getDb() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

// GET /api/payouts?username=xyz - Get payouts for a provider
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    const db = await getDb();
    const providerPayouts = db.collection("providerPayouts");
    const nodes = db.collection("nodes");
    const taskContributions = db.collection("taskContributions");

    // Find all nodes for this user
    const userNodes = await nodes.find({ 
      providerUserId: username.toLowerCase() 
    }).toArray();
    
    const nodeIds = userNodes.map(n => n.nodeId);

    // Get payouts for these nodes
    const payouts = await providerPayouts.find({
      providerUserId: username.toLowerCase()
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

    // Calculate stats
    const totalEarned = payouts
      .filter(p => p.transactionStatus === "confirmed")
      .reduce((sum, p) => sum + (p.amountRun || 0), 0);

    const pendingPayouts = payouts
      .filter(p => p.transactionStatus === "pending")
      .reduce((sum, p) => sum + (p.amountRun || 0), 0);

    const totalTasks = await taskContributions.countDocuments({
      nodeId: { $in: nodeIds }
    });

    return NextResponse.json({
      success: true,
      payouts: payouts.map(p => ({
        _id: p._id.toString(),
        jobId: p.jobId.toString(),
        amountRun: p.amountRun,
        percentageOfPool: p.percentageOfPool,
        workScore: p.workScore,
        tasksContributed: p.tasksContributed,
        transactionStatus: p.transactionStatus,
        createdAt: p.createdAt,
      })),
      stats: {
        totalEarned: Math.round(totalEarned * 100) / 100,
        pendingPayouts: Math.round(pendingPayouts * 100) / 100,
        totalTasks,
        activeNodes: userNodes.length,
      }
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}
