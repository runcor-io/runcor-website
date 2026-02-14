import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "devices.json");

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
  }
}

// Read devices from file
function readDevices(): Record<string, any> {
  ensureDataDir();
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Write devices to file
function writeDevices(devices: Record<string, any>) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(devices, null, 2));
}

// GET /api/devices - Get all devices or a specific device
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("id");
  const username = searchParams.get("username");

  const devices = readDevices();

  // If deviceId provided, return specific device
  if (deviceId) {
    const device = devices[deviceId];
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }
    return NextResponse.json(device);
  }

  // If username provided, return devices for that user
  if (username) {
    const userDevices = Object.values(devices).filter(
      (d: any) => d.username === username
    );
    return NextResponse.json(userDevices);
  }

  // Return all devices
  return NextResponse.json(Object.values(devices));
}

// POST /api/devices - Register or update a device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, specs, status, username } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 }
      );
    }

    const devices = readDevices();

    // Update or create device
    devices[deviceId] = {
      ...devices[deviceId],
      deviceId,
      username: username || devices[deviceId]?.username || "unknown",
      specs: specs || devices[deviceId]?.specs,
      status: status || devices[deviceId]?.status,
      lastSeen: new Date().toISOString(),
      registeredAt: devices[deviceId]?.registeredAt || new Date().toISOString(),
    };

    writeDevices(devices);

    return NextResponse.json({
      success: true,
      device: devices[deviceId],
    });
  } catch (error) {
    console.error("Error saving device:", error);
    return NextResponse.json(
      { error: "Failed to save device" },
      { status: 500 }
    );
  }
}
