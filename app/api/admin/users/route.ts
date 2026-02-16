import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/runcor";

// List of admin usernames (hardcoded for simplicity, could be moved to DB)
const ADMIN_USERNAMES = ["admin"]; // Add admin usernames here

async function isAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.username) return false;
  return ADMIN_USERNAMES.includes((token.username as string).toLowerCase());
}

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } }) // Exclude passwords
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        role: u.role,
        walletBalance: u.walletBalance || 0,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Get username before deleting
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

    // Also delete their devices and jobs
    await db.collection("devices").deleteMany({ username: user.username });
    await db.collection("jobs").deleteMany({ postedBy: user.username });
    await db.collection("transactions").deleteMany({ username: user.username });

    await client.close();

    return NextResponse.json({ success: true, message: "User and all associated data deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update user (adjust balance, change role, etc.)
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, action, amount, role } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "add_tokens" && amount) {
      const newBalance = (user.walletBalance || 0) + amount;
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { walletBalance: newBalance, updatedAt: new Date().toISOString() } }
      );
      // Record transaction
      await db.collection("transactions").insertOne({
        username: user.username,
        type: "credit",
        amount,
        description: "Admin credit",
        balanceAfter: newBalance,
        createdAt: new Date().toISOString(),
      });
    } else if (action === "remove_tokens" && amount) {
      const newBalance = Math.max(0, (user.walletBalance || 0) - amount);
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { walletBalance: newBalance, updatedAt: new Date().toISOString() } }
      );
    } else if (role) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { role, updatedAt: new Date().toISOString() } }
      );
    }

    await client.close();

    return NextResponse.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
