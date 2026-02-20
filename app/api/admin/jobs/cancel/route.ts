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

    // Only allow cancelling pending or running jobs
    if (job.status !== "pending" && job.status !== "running") {
      await client.close();
      return NextResponse.json({ error: "Only pending or running jobs can be cancelled" }, { status: 400 });
    }

    // Start session for transaction
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // Refund tokens to job poster
        if (job.postedBy) {
          await db.collection("users").updateOne(
            { username: job.postedBy },
            { $inc: { walletBalance: job.reward } },
            { session }
          );

          // Create refund transaction
          await db.collection("transactions").insertOne(
            {
              userId: job.postedBy,
              username: job.postedBy,
              type: "refund",
              amount: job.reward,
              description: `Refund for cancelled job: ${job.title}`,
              status: "completed",
              createdAt: new Date().toISOString(),
            },
            { session }
          );
        }

        // Update job status
        await db.collection("jobs").updateOne(
          { _id: new ObjectId(jobId) },
          {
            $set: {
              status: "cancelled",
              updatedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              adminNote: "Cancelled by admin with refund",
            },
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    await client.close();

    return NextResponse.json({ success: true, message: "Job cancelled and refunded" });
  } catch (error) {
    console.error("Cancel job error:", error);
    return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 });
  }
}
