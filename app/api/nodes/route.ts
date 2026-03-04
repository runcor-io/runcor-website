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

// GET /api/nodes - List nodes for the authenticated provider
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = (token.username as string).toLowerCase();
    const db = await getDb();
    const nodes = db.collection("nodes");

    // Find nodes registered by this provider
    const nodeList = await nodes.find({
      providerUserId: username,
    }).sort({ registeredAt: -1 }).toArray();

    return NextResponse.json(nodeList);
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 });
  }
}
