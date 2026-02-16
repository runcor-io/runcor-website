import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth"; 
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

// GET /api/devices - Get all devices or filter by username/deviceId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("id");
    const mode = searchParams.get("mode"); // "all" or "mine"
    const usernameParam = searchParams.get("username"); // For agent compatibility

    const db = await getDb();
    const devices = db.collection("devices");

    // If deviceId provided, return specific device
    if (deviceId) {
      const device = await devices.findOne({ deviceId });
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }
      return NextResponse.json(device);
    }

    // If mode="all", return all devices (for contractor fleet selection)
    if (mode === "all") {
      console.log("[API] Fetching all devices (contractor mode)");
      const allDevices = await devices.find({}).toArray();
      console.log("[API] Found devices:", allDevices.length);
      return NextResponse.json(allDevices);
    }

    // If username provided (agent compatibility), use it
    if (usernameParam) {
      console.log("[API] Fetching devices for username (agent):", usernameParam);
      const userDevices = await devices.find({ 
        username: { $regex: new RegExp(`^${usernameParam}$`, 'i') }
      }).toArray();
      console.log("[API] Found devices:", userDevices.length);
      return NextResponse.json(userDevices);
    }

    // Try to get authenticated user from token (web browser)
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (token?.username) {
      const authenticatedUsername = (token.username as string).toLowerCase();
      console.log("[API] Fetching devices for authenticated user:", authenticatedUsername);
      const userDevices = await devices.find({ 
        username: { $regex: new RegExp(`^${authenticatedUsername}$`, 'i') }
      }).toArray();
      console.log("[API] Found devices:", userDevices.length);
      return NextResponse.json(userDevices);
    }

    // No auth - return empty
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}

// POST /api/devices - Register or update a device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, specs, status, username, currentJob } = body;

    console.log("[API] Device registration attempt:", { deviceId, username });

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const devices = db.collection("devices");

    // Build update document
    const updateDoc: any = {
      $set: {
        deviceId,
        lastSeen: new Date().toISOString(),
      },
      $setOnInsert: {
        registeredAt: new Date().toISOString(),
        control: {
          paused: false,
          estop: false,
        }
      }
    };

    // Store username in lowercase for consistency
    if (username) updateDoc.$set.username = username.toLowerCase();
    if (specs) updateDoc.$set.specs = specs;
    if (status) updateDoc.$set.status = status;
    if (currentJob !== undefined) updateDoc.$set.currentJob = currentJob;
    
    // Ensure control field exists for older devices
    updateDoc.$setOnInsert.control = {
      paused: false,
      estop: false,
    };

    // Upsert device
    await devices.updateOne({ deviceId }, updateDoc, { upsert: true });

    // Return the updated device
    const device = await devices.findOne({ deviceId });

    return NextResponse.json({
      success: true,
      device,
    });
  } catch (error) {
    console.error("Error saving device:", error);
    return NextResponse.json(
      { error: "Failed to save device" },
      { status: 500 }
    );
  }
}

// DELETE /api/devices - Delete a device
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("id");

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const devices = db.collection("devices");

    const result = await devices.deleteOne({ deviceId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    );
  }
}
