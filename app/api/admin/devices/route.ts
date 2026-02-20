import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

const ADMIN_USERNAMES = ["admin"];

async function isAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.username) return false;
  return ADMIN_USERNAMES.includes((token.username as string).toLowerCase());
}

// GET /api/admin/devices - Get all devices
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const query: any = {};
    if (status) query.status = status;

    const devices = await db
      .collection("devices")
      .find(query)
      .sort({ lastSeen: -1 })
      .toArray();

    // Get owners' usernames
    const ownerIds = devices.map((d) => d.ownerId).filter(Boolean);
    const owners = await db
      .collection("users")
      .find({ _id: { $in: ownerIds.map((id) => new ObjectId(id)) } })
      .project({ username: 1 })
      .toArray();
    const ownerMap = new Map(owners.map((o) => [o._id.toString(), o.username]));

    // Calculate online status
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    await client.close();

    return NextResponse.json({
      devices: devices.map((d) => ({
        _id: d._id.toString(),
        deviceId: d.deviceId || d._id.toString(),
        name: d.name || "Unnamed Device",
        owner: ownerMap.get(d.ownerId?.toString()) || d.owner || "Unknown",
        status: d.status === "banned" ? "banned" : d.lastSeen > fiveMinutesAgo ? "online" : "offline",
        specs: d.specs || {},
        lastSeen: d.lastSeen,
        totalJobsCompleted: d.totalJobsCompleted || 0,
        earnings: d.earnings || 0,
      })),
    });
  } catch (error) {
    console.error("Admin devices error:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}

// PATCH /api/admin/devices - Ban/unban device
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { deviceId, action } = await request.json();
    if (!deviceId || !action) {
      return NextResponse.json({ error: "Device ID and action required" }, { status: 400 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const newStatus = action === "ban" ? "banned" : "offline";

    const result = await db.collection("devices").updateOne(
      { _id: new ObjectId(deviceId) },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Device ${action}ned successfully`,
    });
  } catch (error) {
    console.error("Update device error:", error);
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 });
  }
}
