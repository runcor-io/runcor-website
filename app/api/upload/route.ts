import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI || "";

// POST /api/upload - Upload file
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
