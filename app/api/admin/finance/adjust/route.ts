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

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { username, amount, reason } = await request.json();
    if (!username || amount === undefined || !reason) {
      return NextResponse.json({ error: "Username, amount, and reason required" }, { status: 400 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Find user
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if adjustment would result in negative balance
    if (amount < 0 && user.walletBalance + amount < 0) {
      await client.close();
      return NextResponse.json({ error: "Adjustment would result in negative balance" }, { status: 400 });
    }

    // Start session for transaction
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // Update user balance
        await db.collection("users").updateOne(
          { username },
          { $inc: { walletBalance: amount } },
          { session }
        );

        // Create transaction record
        await db.collection("transactions").insertOne(
          {
            userId: user._id.toString(),
            username,
            type: "adjustment",
            amount: Math.abs(amount),
            description: reason,
            status: "completed",
            adjustmentType: amount >= 0 ? "credit" : "debit",
            adminAction: true,
            createdAt: new Date().toISOString(),
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    await client.close();

    return NextResponse.json({
      success: true,
      message: `Balance ${amount >= 0 ? "credited" : "debited"} by ${Math.abs(amount)} RUN`,
    });
  } catch (error) {
    console.error("Adjust balance error:", error);
    return NextResponse.json({ error: "Failed to adjust balance" }, { status: 500 });
  }
}
