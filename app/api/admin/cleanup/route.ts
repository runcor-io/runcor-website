import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

export async function POST(request: NextRequest) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Delete all collections data
    await db.collection("users").deleteMany({});
    await db.collection("devices").deleteMany({});
    await db.collection("jobs").deleteMany({});
    await db.collection("payouts").deleteMany({});

    await client.close();

    return NextResponse.json({
      success: true,
      message: "Database cleaned - all users, devices, and jobs deleted",
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
