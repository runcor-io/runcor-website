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

// POST /api/nodes/heartbeat - Node heartbeat with current status
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
    const { 
      status, 
      currentLoad, 
      availableResources,
      activeTasks 
    } = body;

    const db = await getDb();
    const nodes = db.collection("nodes");

    // Update node heartbeat
    await nodes.updateOne(
      { nodeId },
      {
        $set: {
          status: status || "healthy",
          currentLoad: currentLoad || {},
          availableResources: availableResources || {},
          activeTasks: activeTasks || 0,
          lastHeartbeatAt: new Date().toISOString(),
        }
      }
    );

    // Check for tasks assigned to this node
    const tasks = db.collection("tasks");
    const assignedTasks = await tasks.find({ 
      assignedNodeId: nodeId,
      status: { $in: ["assigned", "pulling_image"] }
    }).toArray();

    return NextResponse.json({
      success: true,
      tasks: assignedTasks.map(t => ({
        taskId: t._id.toString(),
        jobId: t.jobId.toString(),
        status: t.status,
        runtimeImage: t.runtimeImage,
        command: t.command,
        resources: t.resources,
        inputRefs: t.inputRefs,
      })),
    });
  } catch (error) {
    console.error("Error processing heartbeat:", error);
    return NextResponse.json({ error: "Failed to process heartbeat" }, { status: 500 });
  }
}
