import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
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

    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Get the job
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      await client.close();
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Only allow retrying failed jobs
    if (job.status !== "failed") {
      await client.close();
      return NextResponse.json({ error: "Only failed jobs can be retried" }, { status: 400 });
    }

    // Update job status back to pending
    await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          status: "pending",
          claimedBy: null,
          deviceId: null,
          retryCount: (job.retryCount || 0) + 1,
          updatedAt: new Date().toISOString(),
          adminNote: "Retried by admin",
        },
        $unset: {
          completedAt: "",
          result: "",
          error: "",
        },
      }
    );

    await client.close();

    return NextResponse.json({ success: true, message: "Job queued for retry" });
  } catch (error) {
    console.error("Retry job error:", error);
    return NextResponse.json({ error: "Failed to retry job" }, { status: 500 });
  }
}
