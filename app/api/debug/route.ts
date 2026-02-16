import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

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

    // Get user's devices
    const userDevices = await db.collection("devices").find({ username }).toArray();
    const deviceIds = userDevices.map((d) => d.deviceId);

    // Get all completed jobs
    const allCompletedJobs = await db
      .collection("jobs")
      .find({ status: "completed" })
      .toArray();

    // Filter jobs by device
    const userEarnings = allCompletedJobs.filter((job) =>
      deviceIds.includes(job.deviceId)
    );

    await client.close();

    return NextResponse.json({
      username,
      deviceCount: userDevices.length,
      deviceIds,
      totalCompletedJobs: allCompletedJobs.length,
      matchingJobs: userEarnings.length,
      sampleJob: allCompletedJobs[0] || null,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}
