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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const query: any = {};
    if (type) query.type = type;

    const transactions = await db
      .collection("transactions")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    await client.close();

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        _id: t._id.toString(),
        userId: t.userId?.toString() || t.userId,
        username: t.username,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
