import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

const ADMIN_USERNAMES = ["admin"];

async function isAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.username) return false;
  return ADMIN_USERNAMES.includes((token.username as string).toLowerCase());
}

// Simulated system metrics (in production, these would come from actual system monitoring)
let lastCheck = Date.now();
let cachedMetrics = {
  cpuUsage: 25.5,
  memoryUsage: 45.2,
  diskUsage: 32.1,
  status: "healthy",
  uptime: 0,
};

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update metrics every 30 seconds
    const now = Date.now();
    if (now - lastCheck > 30000) {
      // Simulate some variation in metrics
      cachedMetrics = {
        cpuUsage: Math.max(5, Math.min(95, cachedMetrics.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(10, Math.min(90, cachedMetrics.memoryUsage + (Math.random() - 0.5) * 5)),
        diskUsage: Math.min(85, cachedMetrics.diskUsage + 0.01),
        status: cachedMetrics.cpuUsage > 80 || cachedMetrics.memoryUsage > 80 ? "degraded" : "healthy",
        uptime: Math.floor((now - lastCheck) / 1000) + cachedMetrics.uptime,
      };
      lastCheck = now;
    }

    // Check database connection
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");
    await db.command({ ping: 1 });
    await client.close();

    return NextResponse.json({
      ...cachedMetrics,
      lastChecked: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error("System health error:", error);
    return NextResponse.json({
      ...cachedMetrics,
      status: "degraded",
      lastChecked: new Date().toISOString(),
      database: "disconnected",
    });
  }
}
