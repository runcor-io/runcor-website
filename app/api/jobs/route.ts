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

// Job states: pending → claimed → running → completed | failed

// GET /api/jobs - Get jobs (with filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("device_id");
    const status = searchParams.get("status");
    const jobId = searchParams.get("id");
    const usernameParam = searchParams.get("username"); // For agent compatibility

    const db = await getDb();
    const jobs = db.collection("jobs");

    // Get specific job
    if (jobId) {
      const job = await jobs.findOne({ _id: new ObjectId(jobId) });
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json(job);
    }

    // Build query
    const query: any = {};
    if (deviceId) query.deviceId = deviceId;
    if (status) query.status = status;

    // Agent compatibility: use username from query param if provided
    if (usernameParam) {
      const lowerUsername = usernameParam.toLowerCase();
      console.log("[Jobs API] Agent request for:", lowerUsername);
      query.$or = [
        { postedBy: { $regex: new RegExp(`^${lowerUsername}$`, 'i') } },
        { claimedBy: { $regex: new RegExp(`^${lowerUsername}$`, 'i') } }
      ];
      const results = await jobs.find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(results);
    }
    
    // Web browser: get authenticated user from token
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (token?.username) {
      const authenticatedUsername = (token.username as string).toLowerCase();
      console.log("[Jobs API] Authenticated user:", authenticatedUsername);
      
      query.$or = [
        { postedBy: { $regex: new RegExp(`^${authenticatedUsername}$`, 'i') } },
        { claimedBy: { $regex: new RegExp(`^${authenticatedUsername}$`, 'i') } }
      ];

      const results = await jobs.find(query).sort({ createdAt: -1 }).toArray();
      console.log("[Jobs API] Found jobs:", results.length, "for user:", authenticatedUsername);
      return NextResponse.json(results);
    }

    // No auth - return empty
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job or claim a job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const db = await getDb();
    const jobs = db.collection("jobs");

    // Claim a pending job (called by agent)
    if (action === "claim") {
      const { deviceId, capabilities, claimedBy } = body;
      
      if (!deviceId) {
        return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
      }
      
      // Get device info to find owner
      const devices = db.collection("devices");
      const device = await devices.findOne({ deviceId });
      const claimerUsername = claimedBy || device?.username || "unknown";

      // Atomically find and claim a pending job
      const job = await jobs.findOneAndUpdate(
        { 
          status: "pending",
          $or: [
            { requiredCapabilities: { $exists: false } },
            { requiredCapabilities: { $in: capabilities || [] } },
            { requiredCapabilities: { $size: 0 } }
          ]
        },
        { 
          $set: { 
            status: "claimed", 
            deviceId: deviceId,
            claimedBy: claimerUsername,
            claimedAt: new Date().toISOString()
          } 
        },
        { returnDocument: "after", sort: { createdAt: 1 } }
      );

      if (!job) {
        return NextResponse.json({ message: "No jobs available" }, { status: 200 });
      }

      return NextResponse.json({ success: true, job });
    }

    // Create new job (called by contractor)
    const { title, type, script, scriptUrl, postedBy, reward, requiredCapabilities } = body;

    if (!title || !type || !postedBy) {
      return NextResponse.json(
        { error: "title, type, and postedBy are required" },
        { status: 400 }
      );
    }

    const job = {
      title,
      type, // "ml_training", "data_processing", "compute"
      status: "pending",
      postedBy,
      reward: reward || 0,
      script: script || null,
      scriptUrl: scriptUrl || null,
      requiredCapabilities: requiredCapabilities || [],
      deviceId: null,
      createdAt: new Date().toISOString(),
      claimedAt: null,
      startedAt: null,
      completedAt: null,
      result: null,
      logs: [],
    };

    const result = await jobs.insertOne(job);
    
    return NextResponse.json({
      success: true,
      jobId: result.insertedId,
      job: { ...job, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

// PATCH /api/jobs - Update job status (running, completed, failed)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, status, deviceId, logs, result, error: jobError } = body;

    console.log("[Jobs API] PATCH request:", { jobId, status, deviceId });

    if (!jobId || !status) {
      return NextResponse.json(
        { error: "jobId and status are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const jobs = db.collection("jobs");

    const update: any = { $set: { status } };
    
    if (status === "running") {
      update.$set.startedAt = new Date().toISOString();
    } else if (status === "completed" || status === "failed") {
      update.$set.completedAt = new Date().toISOString();
    }
    
    if (logs) {
      update.$push = { logs: { $each: Array.isArray(logs) ? logs : [logs] } };
    }
    if (result !== undefined) update.$set.result = result;
    if (jobError !== undefined) update.$set.error = jobError;

    // First find the job to check if deviceId matches
    const existingJob = await jobs.findOne({ _id: new ObjectId(jobId) });
    console.log("[Jobs API] Existing job:", existingJob ? { id: existingJob._id, deviceId: existingJob.deviceId, status: existingJob.status } : "not found");

    const job = await jobs.findOneAndUpdate(
      { _id: new ObjectId(jobId), deviceId: deviceId },
      update,
      { returnDocument: "after" }
    );

    if (!job) {
      console.log("[Jobs API] Update failed - job not found or deviceId mismatch");
      return NextResponse.json({ error: "Job not found or not owned by device" }, { status: 404 });
    }

    console.log("[Jobs API] Job updated successfully:", job._id, "status:", job.status);
    return NextResponse.json({ success: true, job });
  } catch (err) {
    console.error("Error updating job:", err);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

// DELETE /api/jobs - Cancel/delete a job
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const db = await getDb();
    const jobs = db.collection("jobs");

    const result = await jobs.deleteOne({ _id: new ObjectId(jobId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
