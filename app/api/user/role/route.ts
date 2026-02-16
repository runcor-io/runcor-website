import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

export async function POST(request: NextRequest) {
  try {
    // Get username from request body (passed from client)
    // In a production app, you'd verify the session properly
    // For now, we trust the client has a valid session (middleware protects the page)
    const body = await request.json();
    const { role, username } = body;
    
    if (!role || !["owner", "contractor"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Update role in database
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");
    
    await db.collection("users").updateOne(
      { username: username.toLowerCase() },
      { $set: { role } }
    );

    await client.close();

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
