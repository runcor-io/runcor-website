import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceId, action } = await request.json();
    
    if (!deviceId || !action) {
      return NextResponse.json({ error: "deviceId and action required" }, { status: 400 });
    }

    const username = (session.user as any).username;

    // Connect to DB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");
    const devices = db.collection("devices");

    // Verify device belongs to user
    const device = await devices.findOne({ deviceId, username });
    if (!device) {
      await client.close();
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    let update: any = {};
    let message = "";

    switch (action) {
      case "pause":
        update = { $set: { "control.paused": true, "control.estop": false } };
        message = "Device paused";
        break;
      
      case "resume":
        update = { $set: { "control.paused": false, "control.estop": false } };
        message = "Device resumed";
        break;
      
      case "estop":
        update = { $set: { "control.estop": true, "control.paused": true } };
        message = "EMERGENCY STOP activated";
        break;
      
      case "reset-estop":
        update = { $set: { "control.estop": false, "control.paused": true } };
        message = "E-STOP reset - device paused, click Resume to continue";
        break;
      
      default:
        await client.close();
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update device
    await devices.updateOne({ deviceId }, update);
    
    // Get updated device
    const updatedDevice = await devices.findOne({ deviceId });
    
    await client.close();

    // Emit WebSocket update
    const io = (global as any).io;
    if (io) {
      io.to(`device:${deviceId}`).emit("device:control", {
        deviceId,
        action,
        control: updatedDevice?.control,
      });
    }

    return NextResponse.json({
      success: true,
      message,
      control: updatedDevice?.control,
    });
  } catch (error) {
    console.error("Device control error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
