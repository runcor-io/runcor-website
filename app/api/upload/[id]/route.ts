import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

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

// GET /api/upload/:id - Download a file by ID (from URL path)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Find file
    const files = await db.collection("uploads.files").findOne({
      _id: new ObjectId(fileId)
    });

    if (!files) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Create download stream
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": files.metadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${files.filename}"`,
        "Content-Length": buffer.length.toString()
      }
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
