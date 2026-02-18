import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI || "";

// GET /api/upload/[id] - Download a file by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log("[Upload API] GET request received, id:", id);
  
  let client: MongoClient | null = null;

  try {
    if (!id) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    // Validate ObjectId
    let fileId: ObjectId;
    try {
      fileId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    // Fresh connection per request
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Get file info
    console.log("[Upload API] Looking for file:", id);
    const files = await bucket.find({ _id: fileId }).toArray();
    console.log("[Upload API] Found:", files.length, "files");
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const fileDoc = files[0];

    // Buffer the file
    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(fileId);
    
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    
    const fileBuffer = Buffer.concat(chunks);
    console.log("[Upload API] File size:", fileBuffer.length, "bytes");

    // Close connection before returning
    await client.close();

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": fileDoc.metadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileDoc.filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Upload API] Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  } finally {
    if (client) await client.close().catch(() => {});
  }
}
