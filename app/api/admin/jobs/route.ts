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

// GET /api/admin/jobs - Get all jobs with filters
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const query: any = {};
    if (status) query.status = status;

    const jobs = await db
      .collection("jobs")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    await client.close();

    return NextResponse.json({
      jobs: jobs.map((j) => ({
        id: j._id.toString(),
        title: j.title,
        type: j.type,
        status: j.status,
        postedBy: j.postedBy,
        claimedBy: j.claimedBy,
        deviceId: j.deviceId,
        reward: j.reward,
        createdAt: j.createdAt,
        completedAt: j.completedAt,
      })),
    });
  } catch (error) {
    console.error("Admin jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

// DELETE /api/admin/jobs - Delete a job
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const result = await db.collection("jobs").deleteOne({
      _id: new ObjectId(jobId),
    });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}

// PATCH /api/admin/jobs - Update job status (for admin intervention)
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { jobId, status, note } = await request.json();
    if (!jobId || !status) {
      return NextResponse.json({ error: "Job ID and status required" }, { status: 400 });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    const update: any = {
      $set: {
        status,
        updatedAt: new Date().toISOString(),
        adminNote: note || "Admin intervention",
      },
    };

    if (status === "completed" || status === "failed") {
      update.$set.completedAt = new Date().toISOString();
    }

    const result = await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      update
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job updated" });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}
