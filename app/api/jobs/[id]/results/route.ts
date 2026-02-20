import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI || "";

// GET /api/jobs/[id]/results - Download job result files
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await context.params;
  
  let client: MongoClient | null = null;

  try {
    console.log(`[Results API] Download request for job ${jobId}`);
    
    // Get query param for file index (if multiple results)
    const url = new URL(request.url);
    const fileIndex = parseInt(url.searchParams.get("index") || "0");

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Get job to find result file IDs
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
    
    if (!job) {
      console.log(`[Results API] Job ${jobId} not found`);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    console.log(`[Results API] Job found: ${job.title}, hasResults: ${job.hasResults}, resultFileIds: ${JSON.stringify(job.resultFileIds)}`);

    // Check if job has result files
    const resultFileIds = job.resultFileIds || [];
    
    if (resultFileIds.length === 0) {
      console.log(`[Results API] No result files for job ${jobId}`);
      return NextResponse.json({ error: "No results available for this job" }, { status: 404 });
    }

    if (fileIndex >= resultFileIds.length) {
      console.log(`[Results API] File index ${fileIndex} out of range (total: ${resultFileIds.length})`);
      return NextResponse.json({ error: "Result file not found" }, { status: 404 });
    }

    const fileIdStr = resultFileIds[fileIndex];
    console.log(`[Results API] Looking for file ID: ${fileIdStr}`);
    
    let fileId;
    try {
      fileId = new ObjectId(fileIdStr);
    } catch (e) {
      console.log(`[Results API] Invalid ObjectId: ${fileIdStr}`);
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }
    
    const bucket = new GridFSBucket(db, { bucketName: "jobresults" });

    // Get file info
    const files = await bucket.find({ _id: fileId }).toArray();
    console.log(`[Results API] GridFS query found ${files.length} files`);
    
    if (!files || files.length === 0) {
      console.log(`[Results API] File ${fileId} not found in GridFS`);
      return NextResponse.json({ error: "Result file not found in storage" }, { status: 404 });
    }
    const fileDoc = files[0];
    console.log(`[Results API] File found: ${fileDoc.filename}, size: ${fileDoc.length}`);

    // Stream file
    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(fileId);
    
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    
    const fileBuffer = Buffer.concat(chunks);
    console.log(`[Results API] Downloaded ${fileBuffer.length} bytes`);
    
    await client.close();

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileDoc.filename || 'results.zip'}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("[Results API] Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  } finally {
    if (client) await client.close().catch(() => {});
  }
}

// POST /api/jobs/[id]/results - Upload job result files (from agent)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await context.params;
  
  let client: MongoClient | null = null;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit for results
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("runcor");

    // Verify job exists
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Store file in GridFS (separate bucket for job results)
    const bucket = new GridFSBucket(db, { bucketName: "jobresults" });
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileId = await new Promise<ObjectId>((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: {
          jobId: jobId,
          uploadedAt: new Date().toISOString(),
          contentType: file.type,
          size: file.size
        }
      });

      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve(uploadStream.id));
      uploadStream.end(buffer);
    });

    // Update job with result file reference
    await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      { 
        $push: { resultFileIds: fileId.toString() } as any,
        $set: { 
          resultUploadedAt: new Date().toISOString(),
          hasResults: true 
        }
      }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      fileId: fileId.toString(),
      filename: file.name,
      size: file.size,
      downloadUrl: `/api/jobs/${jobId}/results?index=0`
    });

  } catch (error) {
    console.error("[Results API] Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  } finally {
    if (client) await client.close().catch(() => {});
  }
}
