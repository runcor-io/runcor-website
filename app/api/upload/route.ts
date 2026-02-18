import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

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

// POST /api/upload - Upload a file to GridFS
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'text/plain',
      'application/json',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.zip')) {
      return NextResponse.json({ 
        error: "Invalid file type. Allowed: ZIP, JSON, CSV, TXT, images" 
      }, { status: 400 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload stream and wait for it to complete
    const fileId = await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: {
          uploadedBy: token.username,
          uploadedAt: new Date().toISOString(),
          contentType: file.type,
          size: file.size
        }
      });

      uploadStream.on('error', (err) => {
        console.error('[Upload API] Stream error:', err);
        reject(err);
      });

      uploadStream.on('finish', () => {
        console.log('[Upload API] Upload finished, fileId:', uploadStream.id);
        resolve(uploadStream.id);
      });

      // Write buffer to stream
      uploadStream.end(buffer);
    });

    // Build full URL for the uploaded file
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'www.runcor.io';
    const fullUrl = `${protocol}://${host}/api/upload/${fileId}`;

    return NextResponse.json({
      success: true,
      fileId: fileId.toString(),
      filename: file.name,
      size: file.size,
      url: fullUrl
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// GET /api/upload/:id - Download a file
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    console.log("[Upload API] Request URL:", request.url);
    console.log("[Upload API] Pathname:", url.pathname);
    
    const { searchParams } = url;
    
    // Support both /api/upload?id=xxx and /api/upload/xxx formats
    let fileId = searchParams.get("id");
    console.log("[Upload API] Query param id:", fileId);
    
    // If no query param, try to extract from path (e.g., /api/upload/xxx)
    if (!fileId) {
      const pathMatch = url.pathname.match(/\/api\/upload\/([^\/]+)$/);
      if (pathMatch) {
        fileId = pathMatch[1];
        console.log("[Upload API] Extracted from path:", fileId);
      }
    }

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Find file
    console.log("[Upload API] Looking for file:", fileId);
    const files = await db.collection("uploads.files").findOne({
      _id: new ObjectId(fileId)
    });

    if (!files) {
      console.log("[Upload API] File not found in DB:", fileId);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.log("[Upload API] File found:", files.filename);

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
