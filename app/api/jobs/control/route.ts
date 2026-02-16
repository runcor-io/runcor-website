import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

// POST /api/jobs/control - Control a job (pause, resume, estop)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = (session.user as any).username;
    const { jobId, action } = await request.json();

    if (!jobId || !action) {
      return NextResponse.json(
        { error: "jobId and action are required" },
        { status: 400 }
      );
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Verify user owns this job (either posted it or claimed it)
    const job = await db.collection("jobs").findOne({
      _id: new ObjectId(jobId),
      $or: [
        { postedBy: username },
        { claimedBy: username }
      ]
    });

    if (!job) {
      await client.close();
      return NextResponse.json(
        { error: "Job not found or not authorized" },
        { status: 404 }
      );
    }

    let update: any = {};
    
    switch (action) {
      case "pause":
        if (job.status !== "running") {
          await client.close();
          return NextResponse.json(
            { error: "Can only pause running jobs" },
            { status: 400 }
          );
        }
        update = { $set: { status: "paused", pausedAt: new Date().toISOString() } };
        break;
        
      case "resume":
        if (job.status !== "paused") {
          await client.close();
          return NextResponse.json(
            { error: "Can only resume paused jobs" },
            { status: 400 }
          );
        }
        update = { $set: { status: "running", resumedAt: new Date().toISOString() } };
        break;
        
      case "estop":
        if (job.status !== "running" && job.status !== "paused" && job.status !== "claimed") {
          await client.close();
          return NextResponse.json(
            { error: "Can only stop active jobs" },
            { status: 400 }
          );
        }
        update = { 
          $set: { 
            status: "failed", 
            error: "Emergency stop triggered by user",
            stoppedAt: new Date().toISOString(),
            stoppedBy: username
          } 
        };
        break;
        
      default:
        await client.close();
        return NextResponse.json(
          { error: "Invalid action. Use: pause, resume, estop" },
          { status: 400 }
        );
    }

    await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      update
    );

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: `Job ${action}d successfully`,
      action,
      jobId
    });
  } catch (error) {
    console.error("Job control error:", error);
    return NextResponse.json(
      { error: "Failed to control job" },
      { status: 500 }
    );
  }
}
