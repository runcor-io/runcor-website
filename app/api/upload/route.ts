import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

// Prevent caching - ensure fresh DB lookup every time
export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI || "";

// GET handler - Download file
export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;

  try {
    // Parse file ID from URL
    const url = new URL(request.url);
    let fileIdStr = url.searchParams.get("id");

    if (!fileIdStr) {
      const pathMatch = url.pathname.match(/\/api\/upload\/([^\/]+)$/);
      if (pathMatch) fileIdStr = pathMatch[1];
    }

    if (!fileIdStr) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    // Validate ObjectId
    let fileId: ObjectId;
    try {
      fileId = new ObjectId(fileIdStr);
    } catch {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    // Fresh connection per request (serverless-safe)
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Get file info
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      await client.close();
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const fileDoc = files[0];

    // Buffer the entire file before closing the connection.
    // Streaming directly while closing the client in `finally` kills the
    // stream before it finishes, which is the root cause of the 404/broken
    // download you were seeing.
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const downloadStream = bucket.openDownloadStream(fileId);
      downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      downloadStream.on("end", resolve);
      downloadStream.on("error", reject);
    });

    // Safe to close now — all data is in memory
    await client.close();
    client = null;

    const fileBuffer = Buffer.concat(chunks);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type":
          fileDoc.metadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileDoc.filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Upload API] Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

// POST handler - Upload file
export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;

  try {
    // Auth check
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get file
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (50MB max)" },
        { status: 400 }
      );
    }

    // Fresh connection per request
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload with promise wrapper
    const fileId = await new Promise<ObjectId>((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: {
          uploadedBy: token.username,
          uploadedAt: new Date().toISOString(),
          contentType: file.type,
          size: file.size,
        },
      });

      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve(uploadStream.id));
      uploadStream.end(buffer);
    });

    // Verify file exists immediately after upload
    const verify = await bucket.find({ _id: fileId }).toArray();
    if (!verify || verify.length === 0) {
      return NextResponse.json(
        { error: "Upload verification failed" },
        { status: 500 }
      );
    }

    // Build URL
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "www.runcor.io";
    const fullUrl = `${protocol}://${host}/api/upload/${fileId.toString()}`;

    return NextResponse.json({
      success: true,
      fileId: fileId.toString(),
      filename: file.name,
      size: file.size,
      url: fullUrl,
    });
  } catch (error) {
    console.error("[Upload API] Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}
