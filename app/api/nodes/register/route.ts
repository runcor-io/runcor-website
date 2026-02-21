import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";
const DB_NAME = "runcor";
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

let client: MongoClient | null = null;

async function getDb() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

// POST /api/nodes/register - Register a new node (provider device)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nodeId, 
      publicKey, 
      capabilities, 
      supportedRuntimes, 
      region,
      pricing 
    } = body;

    if (!nodeId || !capabilities) {
      return NextResponse.json(
        { error: "nodeId and capabilities are required" },
        { status: 400 }
      );
    }

    // Get authenticated user from token
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = (token.username as string).toLowerCase();
    const db = await getDb();
    const nodes = db.collection("nodes");

    // Check if node already exists
    const existingNode = await nodes.findOne({ nodeId });
    if (existingNode) {
      // Update existing node
      await nodes.updateOne(
        { nodeId },
        {
          $set: {
            capabilities,
            supportedRuntimes: supportedRuntimes || [],
            region: region || "unknown",
            pricing: pricing || {},
            status: "online",
            lastHeartbeatAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      );
    } else {
      // Create new node
      await nodes.insertOne({
        nodeId,
        publicKey: publicKey || null,
        providerUserId: username,
        name: `Node ${nodeId.slice(0, 8)}`,
        region: region || "unknown",
        capabilities,
        supportedRuntimes: supportedRuntimes || [],
        pricing: pricing || {
          cpuPerHour: 0.01,
          memoryGbPerHour: 0.005,
          gpuPerHour: 0.50,
        },
        status: "online",
        totalTasksCompleted: 0,
        totalTasksFailed: 0,
        successRate30d: 1.0,
        registeredAt: new Date().toISOString(),
        lastHeartbeatAt: new Date().toISOString(),
      });
    }

    // Generate JWT token for node authentication using jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const nodeToken = await new SignJWT({ 
      nodeId, 
      username,
      type: "node" 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    return NextResponse.json({
      success: true,
      token: nodeToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error registering node:", error);
    return NextResponse.json({ error: "Failed to register node" }, { status: 500 });
  }
}
