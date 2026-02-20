import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

const MONGODB_URI = process.env.MONGODB_URI || "";

// GET - List contractors (pending, approved, or rejected)
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin (you may want to add an isAdmin field to users)
  // For now, we'll allow any authenticated user to view pending contractors
  // In production, restrict this to admins only

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("runcor");
    const users = db.collection("users");

    const query: any = { entityType: "contractor" };
    if (status !== "all") {
      query.contractorStatus = status;
    }

    const contractors = await users
      .find(query)
      .project({
        _id: 1,
        username: 1,
        contractorStatus: 1,
        walletBalance: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ contractors });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json({ error: "Failed to fetch contractors" }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PATCH - Update contractor status (approve/reject)
export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add admin check here
  // For now, any authenticated user can approve/reject
  // In production, restrict this to admins only

  const body = await request.json();
  const { userId, status, rejectionReason } = body;

  if (!userId || !status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("runcor");
    const users = db.collection("users");

    const updateData: any = {
      contractorStatus: status,
      updatedAt: new Date().toISOString(),
    };

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === "approved") {
      updateData.approvedAt = new Date().toISOString();
      updateData.approvedBy = token.username;
    }

    const result = await users.updateOne(
      { _id: new ObjectId(userId), entityType: "contractor" },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Contractor ${status}` 
    });
  } catch (error) {
    console.error("Error updating contractor:", error);
    return NextResponse.json({ error: "Failed to update contractor" }, { status: 500 });
  } finally {
    await client.close();
  }
}
