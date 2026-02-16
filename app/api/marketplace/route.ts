import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

// GET /api/marketplace - Get available jobs for device owners (not posted by current user)
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = (token.username as string).toLowerCase();
    console.log("[Marketplace GET] Username:", username);

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Get pending jobs that were NOT posted by current user
    const availableJobs = await db
      .collection("jobs")
      .find({
        status: "pending",
        postedBy: { $ne: username }, // Not equal to current user
      })
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    return NextResponse.json(availableJobs);
  } catch (error) {
    console.error("Marketplace error:", error);
    return NextResponse.json({ error: "Failed to fetch marketplace" }, { status: 500 });
  }
}

// POST /api/marketplace/claim - Claim a job for a device
export async function POST(request: NextRequest) {
  try {
    // Read session properly using getToken for App Router
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, deviceId } = await request.json();
    
    console.log("[Marketplace Claim] Token username:", token.username);

    if (!jobId || !deviceId) {
      return NextResponse.json(
        { error: "jobId and deviceId required" },
        { status: 400 }
      );
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Verify device belongs to current user
    const device = await db.collection("devices").findOne({ deviceId });
    if (!device) {
      await client.close();
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Get username from token (ensure lowercase)
    const username = (token.username as string).toLowerCase();
    console.log("[Marketplace Claim] Using username:", username);

    // Update job to claimed
    const result = await db.collection("jobs").findOneAndUpdate(
      { _id: new ObjectId(jobId), status: "pending" },
      {
        $set: {
          status: "claimed",
          deviceId: deviceId,
          claimedBy: username,
          claimedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" }
    );

    await client.close();

    if (!result) {
      return NextResponse.json(
        { error: "Job not available" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, job: result });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Failed to claim job" }, { status: 500 });
  }
}
