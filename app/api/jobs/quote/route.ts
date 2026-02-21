import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
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

// Calculate base cost from resource requirements
function calculateBaseCost(resources: any): number {
  // Median market rates (RUN tokens per second)
  const CPU_RATE = 0.01 / 3600;      // 0.01 RUN/hour per core
  const MEMORY_RATE = 0.005 / 3600;  // 0.005 RUN/hour per GB
  const GPU_RATE = 0.50 / 3600;      // 0.50 RUN/hour per GPU
  
  const estimatedSeconds = 600; // 10 minutes default
  
  const cpuCost = (resources.cpuCores || 1) * estimatedSeconds * CPU_RATE;
  const memoryCost = (resources.memoryGb || 4) * estimatedSeconds * MEMORY_RATE;
  const gpuCost = (resources.gpuCount || 0) * estimatedSeconds * GPU_RATE;
  
  return cpuCost + memoryCost + gpuCost;
}

// POST /api/jobs/quote - Get fixed price quote for a job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      runtimeImage,
      resources,
      parallelMode,
      inputSizeBytes,
    } = body;

    if (!runtimeImage || !resources) {
      return NextResponse.json(
        { error: "runtimeImage and resources are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // 1. Calculate base cost from resources
    let baseCost = calculateBaseCost(resources);
    
    // 2. Apply multipliers
    const multipliers = {
      parallelOverhead: parallelMode === "map" ? 1.1 : 1.0,
      gpuPremium: resources.gpuCount > 0 ? 1.5 : 1.0,
      inputSize: inputSizeBytes > 100 * 1024 * 1024 ? 1.2 : 1.0, // >100MB
      timeoutRisk: resources.timeoutSeconds > 3600 ? 1.15 : 1.0, // >1 hour
      retryBuffer: 1.15, // 15% buffer for retries
    };
    
    const multiplierProduct = Object.values(multipliers).reduce((a, b) => a * b, 1);
    
    // 3. Historical accuracy adjustment
    // Look for similar completed jobs
    const jobs = db.collection("jobs");
    const similarJobs = await jobs.find({
      runtimeImage: runtimeImage,
      "resources.cpuCores": resources.cpuCores,
      "resources.memoryGb": resources.memoryGb,
      status: "completed",
      actualCost: { $exists: true },
    }).limit(10).toArray();
    
    let historicalAdjustment = 1.3; // Default 30% buffer if no history
    
    if (similarJobs.length > 0) {
      const ratios = similarJobs.map(j => 
        (j.actualCost || j.quotedPriceRun || 10) / (j.quotedPriceRun || 10)
      );
      const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      historicalAdjustment = Math.max(1.0, Math.min(2.0, avgRatio));
    }
    
    // 4. Calculate fixed price
    const providerPool = baseCost * multiplierProduct * historicalAdjustment;
    const platformFee = providerPool * 0.15; // 15% platform fee
    const totalPrice = providerPool + platformFee;
    
    // 5. Estimate duration
    const estimatedDuration = Math.round(
      600 * (resources.cpuCores > 4 ? 0.8 : 1.0) * 
      (resources.gpuCount > 0 ? 0.5 : 1.0)
    ); // seconds
    
    // 6. Calculate confidence based on historical data
    const confidence = similarJobs.length >= 5 ? 0.9 : 
                      similarJobs.length >= 3 ? 0.75 : 
                      similarJobs.length >= 1 ? 0.6 : 0.4;

    return NextResponse.json({
      success: true,
      quote: {
        fixedPriceRun: Math.round(totalPrice * 100) / 100,
        providerPool: Math.round(providerPool * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        platformFeePercent: 15,
        estimatedDuration: estimatedDuration,
        estimatedDurationFormatted: formatDuration(estimatedDuration),
        confidence: confidence,
        breakdown: {
          baseCost: Math.round(baseCost * 100) / 100,
          multipliers,
          historicalAdjustment: Math.round(historicalAdjustment * 100) / 100,
        },
        similarJobsFound: similarJobs.length,
      },
    });
  } catch (error) {
    console.error("Error generating quote:", error);
    return NextResponse.json({ error: "Failed to generate quote" }, { status: 500 });
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600 * 10) / 10}h`;
}
