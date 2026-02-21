import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

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

// Weights for work score calculation
const WEIGHTS = {
  cpuSeconds: 1.0,
  memoryGbSeconds: 0.5,
  gpuSeconds: 10.0,
  dataServedBytes: 0.000001, // Per MB
};

interface TaskContribution {
  nodeId: string;
  taskId: string;
  cpuSeconds: number;
  memoryGbSeconds: number;
  gpuSeconds: number;
  dataServedBytes: number;
}

// POST /api/payouts/calculate - Calculate payouts for a completed job
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
    const taskContributions = db.collection("taskContributions");
    const jobPayouts = db.collection("jobPayouts");
    const providerPayouts = db.collection("providerPayouts");

    // Get job details
    const job = await jobs.findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "completed") {
      return NextResponse.json({ error: "Job not completed yet" }, { status: 400 });
    }

    // Check if payout already calculated
    const existingPayout = await jobPayouts.findOne({ jobId: new ObjectId(jobId) });
    if (existingPayout) {
      return NextResponse.json({
        success: true,
        message: "Payout already calculated",
        payout: existingPayout,
      });
    }

    // Get all completed tasks for this job
    const completedTasks = await tasks.find({
      jobId: new ObjectId(jobId),
      status: "completed",
    }).toArray();

    if (completedTasks.length === 0) {
      return NextResponse.json({ error: "No completed tasks found" }, { status: 400 });
    }

    // Calculate work score for each task contribution
    const contributions: TaskContribution[] = completedTasks.map(task => ({
      nodeId: task.assignedNodeId,
      taskId: task._id.toString(),
      cpuSeconds: task.cpuSeconds || 0,
      memoryGbSeconds: task.memoryGbSeconds || 0,
      gpuSeconds: task.gpuSeconds || 0,
      dataServedBytes: task.dataServedBytes || 0,
    }));

    // Calculate work score for each contribution
    const scoredContributions = contributions.map(c => {
      const workScore = 
        c.cpuSeconds * WEIGHTS.cpuSeconds +
        c.memoryGbSeconds * WEIGHTS.memoryGbSeconds +
        c.gpuSeconds * WEIGHTS.gpuSeconds +
        c.dataServedBytes * WEIGHTS.dataServedBytes;
      
      return { ...c, workScore };
    });

    // Aggregate by node
    const nodeScores: Record<string, { 
      workScore: number; 
      tasks: number;
      details: TaskContribution[];
    }> = {};
    
    for (const sc of scoredContributions) {
      if (!nodeScores[sc.nodeId]) {
        nodeScores[sc.nodeId] = { workScore: 0, tasks: 0, details: [] };
      }
      nodeScores[sc.nodeId].workScore += sc.workScore;
      nodeScores[sc.nodeId].tasks += 1;
      nodeScores[sc.nodeId].details.push(sc);
    }

    const totalWorkScore = Object.values(nodeScores).reduce((sum, n) => sum + n.workScore, 0);

    // Available pool after platform fee
    const totalJobPrice = job.reward || 0;
    const platformFeePercent = job.platformFeePercent || 15;
    const platformFee = totalJobPrice * (platformFeePercent / 100);
    const providerPool = totalJobPrice - platformFee;

    // Calculate proportional payouts
    const nodePayouts = Object.entries(nodeScores).map(([nodeId, data]) => {
      const percentage = data.workScore / totalWorkScore;
      const amount = providerPool * percentage;
      
      return {
        nodeId,
        workScore: data.workScore,
        percentage: Math.round(percentage * 10000) / 100, // 2 decimal places
        amountRun: Math.round(amount * 10000) / 10000, // 4 decimal places
        tasks: data.tasks,
      };
    });

    // Get node details for user mapping
    const nodeIds = nodePayouts.map(n => n.nodeId);
    const nodeDetails = await nodes.find({
      nodeId: { $in: nodeIds }
    }).toArray();

    const nodeToUser: Record<string, string> = {};
    for (const node of nodeDetails) {
      nodeToUser[node.nodeId] = node.providerUserId;
    }

    // Create job payout record
    const payoutRecord = {
      jobId: new ObjectId(jobId),
      totalJobPriceRun: totalJobPrice,
      platformFeeRun: platformFee,
      platformFeePercent: platformFeePercent,
      providerPoolRun: providerPool,
      totalWorkScore: totalWorkScore,
      providerCount: nodePayouts.length,
      status: "calculated",
      calculatedAt: new Date().toISOString(),
    };

    const payoutResult = await jobPayouts.insertOne(payoutRecord);

    // Create individual provider payouts
    const providerPayoutRecords = nodePayouts.map(p => ({
      jobPayoutId: payoutResult.insertedId,
      jobId: new ObjectId(jobId),
      nodeId: p.nodeId,
      providerUserId: nodeToUser[p.nodeId] || "unknown",
      amountRun: p.amountRun,
      percentageOfPool: p.percentage,
      workScore: p.workScore,
      tasksContributed: p.tasks,
      transactionStatus: "pending",
      createdAt: new Date().toISOString(),
    }));

    if (providerPayoutRecords.length > 0) {
      await providerPayouts.insertMany(providerPayoutRecords);
    }

    // Create task contribution records
    const contributionRecords = scoredContributions.map(sc => ({
      taskId: new ObjectId(sc.taskId),
      jobId: new ObjectId(jobId),
      nodeId: sc.nodeId,
      cpuSeconds: sc.cpuSeconds,
      memoryGbSeconds: sc.memoryGbSeconds,
      gpuSeconds: sc.gpuSeconds,
      dataServedBytes: sc.dataServedBytes,
      workScore: sc.cpuSeconds * WEIGHTS.cpuSeconds +
                 sc.memoryGbSeconds * WEIGHTS.memoryGbSeconds +
                 sc.gpuSeconds * WEIGHTS.gpuSeconds +
                 sc.dataServedBytes * WEIGHTS.dataServedBytes,
      payoutStatus: "pending",
      recordedAt: new Date().toISOString(),
    }));

    if (contributionRecords.length > 0) {
      await taskContributions.insertMany(contributionRecords);
    }

    // Update job with actual cost
    await jobs.updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          actualCost: totalJobPrice,
          payoutCalculatedAt: new Date().toISOString(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      payout: {
        jobId,
        totalJobPriceRun: totalJobPrice,
        platformFeeRun: platformFee,
        providerPoolRun: providerPool,
        providerCount: nodePayouts.length,
        providers: nodePayouts.map(p => ({
          nodeId: p.nodeId,
          userId: nodeToUser[p.nodeId] || "unknown",
          amountRun: p.amountRun,
          percentage: p.percentage,
          tasks: p.tasks,
        })),
      },
    });
  } catch (error) {
    console.error("Error calculating payout:", error);
    return NextResponse.json({ error: "Failed to calculate payout" }, { status: 500 });
  }
}
