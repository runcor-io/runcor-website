import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

// GET /api/wallet - Get user's wallet balance and transaction history
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = (token.username as string).toLowerCase();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Get user
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get transactions
    const transactions = await db
      .collection("transactions")
      .find({ username })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    await client.close();

    return NextResponse.json({
      balance: user.walletBalance || 0,
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        type: t.type, // 'credit' or 'debit'
        description: t.description,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        jobId: t.jobId,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Wallet error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

// Helper function to record a transaction (used by other APIs)
export async function recordTransaction(
  username: string,
  type: "credit" | "debit",
  amount: number,
  description: string,
  jobId?: string
) {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("runcor");

  try {
    // Get current balance
    const user = await db.collection("users").findOne({ username: username.toLowerCase() });
    if (!user) throw new Error("User not found");

    const currentBalance = user.walletBalance || 0;
    const newBalance = type === "credit" ? currentBalance + amount : currentBalance - amount;

    if (type === "debit" && currentBalance < amount) {
      throw new Error("Insufficient balance");
    }

    // Update user balance
    await db.collection("users").updateOne(
      { username: username.toLowerCase() },
      { $set: { walletBalance: newBalance, updatedAt: new Date().toISOString() } }
    );

    // Record transaction
    const transaction = {
      username: username.toLowerCase(),
      type,
      amount,
      description,
      balanceAfter: newBalance,
      jobId: jobId || null,
      createdAt: new Date().toISOString(),
    };

    await db.collection("transactions").insertOne(transaction);

    await client.close();
    return { success: true, newBalance };
  } catch (error) {
    await client.close();
    throw error;
  }
}
