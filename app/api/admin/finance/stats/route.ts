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

    // Calculate financial stats
    const deposits = await db
      .collection("transactions")
      .find({ type: { $in: ["deposit", "credit"] }, status: "completed" })
      .toArray();
    const totalDeposits = deposits.reduce((sum, t) => sum + (t.amount || 0), 0);

    const withdrawals = await db
      .collection("transactions")
      .find({ type: { $in: ["withdrawal", "debit"] }, status: "completed" })
      .toArray();
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + (t.amount || 0), 0);

    const fees = await db
      .collection("transactions")
      .find({ type: "fee", status: "completed" })
      .toArray();
    const totalFees = fees.reduce((sum, t) => sum + (t.amount || 0), 0);

    const pendingWithdrawals = await db
      .collection("transactions")
      .countDocuments({ type: "withdrawal", status: "pending" });

    await client.close();

    return NextResponse.json({
      totalDeposits,
      totalWithdrawals,
      totalFees,
      platformBalance: totalDeposits - totalWithdrawals,
      pendingWithdrawals,
    });
  } catch (error) {
    console.error("Finance stats error:", error);
    return NextResponse.json({ error: "Failed to fetch financial stats" }, { status: 500 });
  }
}
