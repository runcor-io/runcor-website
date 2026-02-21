import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
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

interface Task {
  jobId: ObjectId;
  taskIndex: number;
  inputRefs: any[];
  runtimeImage: string;
  command: string;
  resources: any;
  environment: Record<string, string>;
  timeoutSeconds: number;
  status: string;
  createdAt: string;
}

// POST /api/scheduler/schedule - Schedule a job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const db = await getDb();
    const jobs = db.collection("jobs");
    const tasks = db.collection("tasks");
    const nodes = db.collection("nodes");

    // Get job details
    const job = await jobs.findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 1. Determine parallelism - create tasks
    let taskList: Task[] = [];

    if (job.parallelMode === "map" && job.inputPattern) {
      // For map mode, we'd expand inputs here
      // For now, create a single task (would need input expansion logic)
      taskList.push({
        jobId: job._id,
        taskIndex: 0,
        inputRefs: job.inputFileUrl ? [{ type: "url", uri: job.inputFileUrl }] : [],
        runtimeImage: job.runtimeImage || "python:3.11-slim",
        command: job.script || "python /app/job.py",
        resources: job.resources || { cpuCores: 1, memoryGb: 4 },
        environment: job.environment || {},
        timeoutSeconds: job.resources?.timeoutSeconds || 1800,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    } else {
      // Single task
      taskList.push({
        jobId: job._id,
        taskIndex: 0,
        inputRefs: job.inputFileUrl ? [{ type: "url", uri: job.inputFileUrl }] : [],
        runtimeImage: job.runtimeImage || "python:3.11-slim",
        command: job.script || "python /app/job.py",
        resources: job.resources || { cpuCores: 1, memoryGb: 4 },
        environment: job.environment || {},
        timeoutSeconds: job.resources?.timeoutSeconds || 1800,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }

    // Insert tasks
    const taskResult = await tasks.insertMany(taskList);
    const taskIds = Object.values(taskResult.insertedIds);

    // 2. Find eligible nodes
    const requiredCapabilities = job.requiredCapabilities || [];
    const runtimeImage = job.runtimeImage || "python:3.11-slim";

    const eligibleNodes = await nodes.find({
      status: { $in: ["online", "healthy"] },
      ...(requiredCapabilities.length > 0 && {
        "capabilities.gpu": { $exists: requiredCapabilities.includes("gpu_compute") }
      }),
    }).toArray();

    if (eligibleNodes.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No eligible nodes available" 
      });
    }

    // 3. Score and assign tasks to nodes
    const assignments = [];
    
    for (let i = 0; i < taskList.length; i++) {
      const task = taskList[i];
      const taskId = taskIds[i];

      // Score each node
      const scoredNodes = eligibleNodes.map(node => {
        let score = 0;
        
        // Resource fit score (0-100)
        const availCpu = node.availableResources?.cpuCores || node.capabilities?.cpu?.cores || 1;
        const availMem = node.availableResources?.memoryGb || node.capabilities?.memory?.available_gb || 4;
        
        if (availCpu >= task.resources.cpuCores) score += 40;
        if (availMem >= task.resources.memoryGb) score += 40;
        
        // Success rate score (0-20)
        score += (node.successRate30d || 1.0) * 20;
        
        return { node, score };
      });

      // Sort by score and pick best
      scoredNodes.sort((a, b) => b.score - a.score);
      const bestNode = scoredNodes[0];

      if (bestNode) {
        // Assign task to node
        await tasks.updateOne(
          { _id: taskId },
          {
            $set: {
              status: "assigned",
              assignedNodeId: bestNode.node.nodeId,
              assignedAt: new Date().toISOString(),
            }
          }
        );

        // Reserve resources on node (simplified - would need proper tracking)
        await nodes.updateOne(
          { nodeId: bestNode.node.nodeId },
          {
            $set: {
              "availableResources.cpuCores": Math.max(0, (bestNode.node.availableResources?.cpuCores || bestNode.node.capabilities?.cpu?.cores || 1) - task.resources.cpuCores),
              "availableResources.memoryGb": Math.max(0, (bestNode.node.availableResources?.memoryGb || bestNode.node.capabilities?.memory?.available_gb || 4) - task.resources.memoryGb),
            }
          }
        );

        assignments.push({
          taskId: taskId.toString(),
          nodeId: bestNode.node.nodeId,
          score: bestNode.score,
        });
      }
    }

    // Update job with task count
    await jobs.updateOne(
      { _id: job._id },
      {
        $set: {
          totalTasks: taskList.length,
          status: assignments.length > 0 ? "scheduled" : "pending",
          scheduledAt: new Date().toISOString(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      tasksCreated: taskList.length,
      assignments,
    });
  } catch (error) {
    console.error("Error scheduling job:", error);
    return NextResponse.json({ error: "Failed to schedule job" }, { status: 500 });
  }
}

// GET /api/scheduler/status - Get scheduler status
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const nodes = db.collection("nodes");
    const tasks = db.collection("tasks");

    // Get active nodes
    const activeNodes = await nodes.countDocuments({ 
      status: { $in: ["online", "healthy"] } 
    });

    // Get pending tasks
    const pendingTasks = await tasks.countDocuments({ status: "pending" });
    const assignedTasks = await tasks.countDocuments({ status: "assigned" });
    const runningTasks = await tasks.countDocuments({ status: "running" });

    return NextResponse.json({
      activeNodes,
      pendingTasks,
      assignedTasks,
      runningTasks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting scheduler status:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
