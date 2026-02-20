import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_USERNAMES = ["admin"];

async function isAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.username) return false;
  return ADMIN_USERNAMES.includes((token.username as string).toLowerCase());
}

// Simulated logs (in production, these would come from a logging service)
const simulatedLogs = [
  { timestamp: new Date(Date.now() - 60000).toISOString(), level: "info", message: "Job completed successfully", source: "job-runner" },
  { timestamp: new Date(Date.now() - 120000).toISOString(), level: "info", message: "New device registered", source: "device-manager" },
  { timestamp: new Date(Date.now() - 180000).toISOString(), level: "warn", message: "High memory usage detected", source: "system-monitor" },
  { timestamp: new Date(Date.now() - 240000).toISOString(), level: "info", message: "User deposited 1000 RUN", source: "wallet-service" },
  { timestamp: new Date(Date.now() - 300000).toISOString(), level: "error", message: "Failed to connect to agent", source: "agent-client" },
  { timestamp: new Date(Date.now() - 360000).toISOString(), level: "info", message: "Contractor approved", source: "admin-panel" },
  { timestamp: new Date(Date.now() - 420000).toISOString(), level: "info", message: "Job claimed by provider", source: "job-manager" },
  { timestamp: new Date(Date.now() - 480000).toISOString(), level: "warn", message: "Slow database query detected", source: "db-monitor" },
  { timestamp: new Date(Date.now() - 540000).toISOString(), level: "info", message: "System backup completed", source: "backup-service" },
  { timestamp: new Date(Date.now() - 600000).toISOString(), level: "error", message: "Payment processing failed", source: "payment-gateway" },
];

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Return simulated logs (in production, fetch from logging service)
    return NextResponse.json({
      logs: simulatedLogs.slice(0, limit),
    });
  } catch (error) {
    console.error("System logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
