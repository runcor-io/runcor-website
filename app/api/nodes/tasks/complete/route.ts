import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { jwtVerify } from "jose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";
const DB_NAME = "runcor";
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

let client: MongoClient | null = null;

async function getDb() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

// POST /api/nodes/tasks/{taskId}/complete - Report task completion
export async function POST(request: NextRequest) {
  try {
    // Verify node token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    let decoded;
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { nodeId } = decoded;
    const body = await request.json();
    const { taskId, status, metrics, outputRefs } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId and status are required" }, { status: 400 });
    }

    const db = await getDb();
    const tasks = db.collection("tasks");
    const jobs = db.collection("jobs");
    const nodes = db.collection("nodes");

    // Update task
    const updateResult = await tasks.updateOne(
      { 
        _id: new ObjectId(taskId),
        assignedNodeId: nodeId 
      },
      {
        $set: {
          status: status,
          completedAt: new Date().toISOString(),
          durationSeconds: metrics?.durationSeconds || 0,
          cpuSeconds: metrics?.cpuSeconds || 0,
          memoryGbSeconds: metrics?.memoryGbSeconds || 0,
          gpuSeconds: metrics?.gpuSeconds || 0,
          memoryPeakGb: metrics?.memoryPeakGb || 0,
          exitCode: metrics?.exitCode || 0,
          outputRefs: outputRefs || [],
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found or not assigned to this node" }, { status: 404 });
    }

    // Update node stats
    await nodes.updateOne(
      { nodeId },
      {
        $inc: {
          totalTasksCompleted: status === "completed" ? 1 : 0,
          totalTasksFailed: status === "failed" ? 1 : 0,
        }
      }
    );

    // Check if all tasks for this job are complete
    const task = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (task) {
      const jobId = task.jobId;
      const totalTasks = await tasks.countDocuments({ jobId });
      const completedTasks = await tasks.countDocuments({ jobId, status: { $in: ["completed", "failed"] } });
      
      if (totalTasks === completedTasks) {
        // All tasks done, mark job as completed
        const failedTasks = await tasks.countDocuments({ jobId, status: "failed" });
        const jobStatus = failedTasks === totalTasks ? "failed" : "completed";
        
        await jobs.updateOne(
          { _id: jobId },
          {
            $set: {
              status: jobStatus,
              completedAt: new Date().toISOString(),
              completedTasks: completedTasks - failedTasks,
              failedTasks: failedTasks,
            }
          }
        );

        // Trigger payout calculation
        try {
          await fetch(`${process.env.NEXTAUTH_URL || ''}/api/payouts/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId: jobId.toString() }),
          });
        } catch (e) {
          console.error("Failed to trigger payout calculation:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Task ${taskId} marked as ${status}`,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 });
  }
}
