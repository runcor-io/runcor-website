import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = (token.username as string).toLowerCase();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Get user's devices
    const userDevices = await db.collection("devices").find({ username }).toArray();

    // Get all jobs the user claimed OR posted
    const jobs = await db
      .collection("jobs")
      .find({
        $or: [
          { claimedBy: username },
          { postedBy: username }
        ]
      })
      .toArray();

    // Calculate metrics
    const completedJobs = jobs.filter((j) => j.status === "completed");
    const failedJobs = jobs.filter((j) => j.status === "failed");
    const pendingJobs = jobs.filter((j) => j.status === "pending");
    const runningJobs = jobs.filter((j) => j.status === "running");

    // Total earnings (for claimed jobs) and total spent (for posted jobs)
    const postedJobs = jobs.filter((j) => j.postedBy?.toLowerCase() === username.toLowerCase());
    const claimedJobs = jobs.filter((j) => j.claimedBy?.toLowerCase() === username.toLowerCase());
    
    const totalEarnings = claimedJobs
      .filter((j) => j.status === "completed")
      .reduce((sum, j) => sum + (j.reward || 0), 0);
    
    const totalSpent = postedJobs.reduce((sum, j) => sum + (j.reward || 0), 0);

    // Earnings by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const earningsByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      earningsByDay[d.toISOString().split("T")[0]] = 0;
    }

    completedJobs.forEach((job) => {
      const date = job.completedAt?.split("T")[0];
      if (date && earningsByDay[date] !== undefined) {
        earningsByDay[date] += job.reward || 0;
      }
    });

    const earningsChart = Object.entries(earningsByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Spending by day (for posted jobs)
    const spendingByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      spendingByDay[d.toISOString().split("T")[0]] = 0;
    }
    postedJobs.forEach((job) => {
      const date = job.createdAt?.split("T")[0];
      if (date && spendingByDay[date] !== undefined) {
        spendingByDay[date] += job.reward || 0;
      }
    });
    const spendingChart = Object.entries(spendingByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Jobs by type
    const jobsByType: Record<string, number> = {};
    jobs.forEach((job) => {
      const type = job.type || "unknown";
      jobsByType[type] = (jobsByType[type] || 0) + 1;
    });

    // Device performance
    const deviceStats = userDevices.map((device) => {
      const deviceJobs = jobs.filter((j) => j.deviceId === device.deviceId);
      const deviceCompleted = deviceJobs.filter((j) => j.status === "completed");
      const deviceFailed = deviceJobs.filter((j) => j.status === "failed");
      const totalDeviceJobs = deviceJobs.length;
      const successRate = totalDeviceJobs > 0 ? (deviceCompleted.length / totalDeviceJobs) * 100 : 0;
      const deviceEarnings = deviceCompleted.reduce((sum, j) => sum + (j.reward || 0), 0);

      return {
        deviceId: device.deviceId,
        cpu: device.specs?.cpu?.split(" ")[0] || "Unknown",
        totalJobs: totalDeviceJobs,
        completedJobs: deviceCompleted.length,
        failedJobs: deviceFailed.length,
        successRate: Math.round(successRate),
        earnings: deviceEarnings,
        lastSeen: device.lastSeen,
      };
    });

    // Recent activity (last 10 jobs)
    const recentActivity = jobs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((job) => ({
        id: job._id.toString(),
        title: job.title,
        status: job.status,
        reward: job.reward || 0,
        date: job.createdAt,
        deviceId: job.deviceId,
      }));

    await client.close();

    return NextResponse.json({
      summary: {
        totalJobs: jobs.length,
        completedJobs: completedJobs.length,
        failedJobs: failedJobs.length,
        pendingJobs: pendingJobs.length,
        runningJobs: runningJobs.length,
        totalEarnings,
        totalSpent,
        successRate: jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0,
      },
      earningsChart,
      spendingChart,
      jobsByType: Object.entries(jobsByType).map(([type, count]) => ({ type, count })),
      deviceStats,
      recentActivity,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
