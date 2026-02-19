# RunCor Technical Documentation

> **Last Updated:** February 19, 2026  
> **Version:** v19  
> **Status:** Beta - Core features working, minor bugs remaining

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Key Components](#key-components)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [File Upload System](#file-upload-system)
8. [Job Execution Flow](#job-execution-flow)
9. [Current Issues](#current-issues)
10. [Development Guide](#development-guide)

---

## Project Overview

**RunCor** is a decentralized compute marketplace connecting:
- **Contractors**: Users who post computing jobs
- **Providers**: Users who rent out their idle computing power

### Core Concept
Contractors upload data + scripts, providers execute them in Docker containers, and get paid upon completion.

---

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Contractor    │────▶│   RunCor Web     │────▶│   MongoDB       │
│   (Browser)     │     │   (Next.js)      │     │   (Atlas)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                │ POST /api/jobs
                                ▼
                        ┌──────────────────┐
                        │   RunCor Agent   │
                        │   (Windows .exe) │
                        └──────────────────┘
                                │
                                │ Docker Container
                                ▼
                        ┌──────────────────┐
                        │   Job Execution  │
                        │   (Isolated)     │
                        └──────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS | Web UI |
| **Backend** | Next.js API Routes | Serverless API |
| **Database** | MongoDB Atlas | Data persistence |
| **File Storage** | MongoDB GridFS | File upload/download |
| **Auth** | NextAuth.js | User authentication |
| **Agent** | Python 3.12, Tkinter | Windows desktop app |
| **Container** | Docker | Job isolation |
| **Deployment** | Vercel | Web hosting |

---

## Key Components

### 1. Web Platform (`/app`)

#### Main Pages
| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing page | ✅ |
| `/auth/login` | User login | ✅ |
| `/auth/register` | User registration | ✅ |
| `/dashboard` | Provider portal (job monitor) | ⚠️ |
| `/contractor/create` | Create new job | ✅ |
| `/contractor/tracking` | Track job status | ✅ |
| `/install` | Agent download page | ✅ |

#### API Routes (`/app/api`)

**Authentication**
- `POST /api/auth/[...nextauth]` - NextAuth handlers

**Jobs**
- `GET /api/jobs` - List jobs (with filtering)
- `POST /api/jobs` - Create job OR claim job (action=claim)
- `PATCH /api/jobs` - Update job status

**File Upload**
- `POST /api/upload` - Upload file to GridFS
- `GET /api/upload/[id]` - Download file from GridFS

**Devices**
- `POST /api/devices` - Register/update device

**Wallet**
- `GET /api/wallet` - Get balance
- `POST /api/wallet` - Record transaction

---

### 2. Windows Agent (`/agent-gui`)

**Main Files:**
- `runcor-agent-gui.py` - Main GUI application (~1500 lines)
- `docker_utils.py` - Docker container management

**Key Features:**
- Device registration with hardware detection
- Job polling loop (every 10 seconds)
- Docker container execution
- File download and extraction
- Progress monitoring
- Stats tracking (jobs completed, earnings)

**Agent Flow:**
1. Register device with API
2. Poll `/api/jobs` for pending jobs
3. Claim job via POST
4. Download input file from GridFS
5. Extract ZIP to temp directory
6. Execute in Docker container
7. Report completion

---

### 3. Demo Scripts (`/demo`)

| Script | Purpose | Dependencies |
|--------|---------|--------------|
| `simple_image_processor.py` | Resize images, create thumbnails | Pillow |
| `real_ai_image_classification.py` | AI image classification | torch, torchvision |

---

## API Documentation

### Job API

#### Create Job
```http
POST /api/jobs
Content-Type: application/json

{
  "title": "Image Processing",
  "type": "python",
  "script": "#!/usr/bin/env python3...",
  "postedBy": "username",
  "reward": 10.00,
  "inputFileUrl": "https://www.runcor.io/api/upload/xxx",
  "deterministic": false
}
```

#### Claim Job (Agent)
```http
POST /api/jobs
Content-Type: application/json

{
  "action": "claim",
  "deviceId": "0x123...",
  "claimedBy": "provider_username",
  "capabilities": ["cpu_compute", "gpu_compute"]
}
```

#### Update Job Status
```http
PATCH /api/jobs
Content-Type: application/json

{
  "jobId": "xxx",
  "status": "completed", // or "failed"
  "deviceId": "0x123...",
  "actualOutputHash": "sha256:xxx" // optional
}
```

### File Upload API

#### Upload File
```http
POST /api/upload
Content-Type: multipart/form-data

file: <binary>
```

**Response:**
```json
{
  "success": true,
  "fileId": "6995xxx",
  "filename": "input.zip",
  "size": 2681909,
  "url": "https://www.runcor.io/api/upload/6995xxx"
}
```

#### Download File
```http
GET /api/upload/6995xxx
```

**Technical Details:**
- Files stored in MongoDB GridFS
- Bucket name: `uploads`
- Collections: `uploads.files`, `uploads.chunks`
- Max file size: 50MB

---

## Database Schema

### Collections

#### `users`
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // hashed
  walletBalance: Number,
  role: String, // "contractor" | "provider"
  createdAt: String // ISO date
}
```

#### `jobs`
```javascript
{
  _id: ObjectId,
  title: String,
  type: String, // "python" | "powershell"
  script: String,
  scriptUrl: String,
  status: String, // "pending" | "claimed" | "running" | "completed" | "failed"
  postedBy: String, // username
  claimedBy: String, // username
  deviceId: String,
  reward: Number,
  inputFileUrl: String,
  expectedOutputHash: String,
  actualOutputHash: String,
  deterministic: Boolean,
  createdAt: String,
  claimedAt: String,
  startedAt: String,
  completedAt: String,
  result: Object,
  logs: Array
}
```

#### `devices`
```javascript
{
  _id: ObjectId,
  deviceId: String,
  username: String,
  status: Object, // cpu, ram, etc.
  capabilities: Array,
  lastSeen: String
}
```

#### `uploads.files` (GridFS)
```javascript
{
  _id: ObjectId,
  filename: String,
  length: Number, // bytes
  chunkSize: Number,
  uploadDate: Date,
  metadata: {
    uploadedBy: String,
    contentType: String,
    size: Number
  }
}
```

---

## File Upload System

### How It Works

1. **Upload:**
   - File received at `POST /api/upload`
   - Stored in MongoDB GridFS
   - Returns file ID and download URL

2. **Download:**
   - Request to `GET /api/upload/[id]`
   - Dynamic route extracts ID from URL
   - GridFS streams file chunks
   - Buffers in memory, then returns

### Implementation Details

**Route File:** `app/api/upload/[id]/route.ts`

```typescript
// Key points:
- Uses GridFSBucket for file operations
- Dynamic route with Promise-based params (Next.js 15)
- Fresh MongoDB connection per request
- Buffers file before closing connection
```

---

## Job Execution Flow

### 1. Job Creation (Contractor)
```
Browser → POST /api/upload → GridFS
      → POST /api/jobs → MongoDB
```

### 2. Job Claiming (Agent)
```
Agent → GET /api/jobs → List pending
    → POST /api/jobs (action=claim) → Claim job
```

### 3. Job Execution (Agent)
```
Agent → GET /api/upload/[id] → Download input
    → Extract ZIP to temp dir
    → docker run (isolated)
    → PATCH /api/jobs (status=completed)
```

### Docker Command
```bash
docker run --rm \
  --name runcor-job-[id] \
  --network none \
  --cpus 1.0 \
  --memory 4g \
  --memory-swap 4g \
  --pids-limit 100 \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  -v [script_dir]:/app:ro \
  -v [work_dir]:/workspace:rw \
  -w /workspace \
  runcor-python:latest \
  python /app/job.py
```

---

## Current Issues

### 🔴 Critical
| Issue | Status | Description |
|-------|--------|-------------|
| Image path | 🔄 | Script only searches `/workspace/input/`, not subdirectories |

### 🟡 Medium
| Issue | Status | Description |
|-------|--------|-------------|
| Job status sync | ⚠️ | Web UI doesn't auto-update when job completes |
| Status tracking | ⚠️ | Shows old failed job instead of completed |

### 🟢 Low
| Issue | Status | Description |
|-------|--------|-------------|
| Payment processing | ❌ | Not implemented (UI only) |
| Verification | ⚠️ | Deterministic verification UI exists but not enforced |

---

## Development Guide

### Local Development

```bash
# 1. Clone repo
git clone https://github.com/runcor-io/runcor-website.git
cd runcor-website

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and secrets

# 4. Run dev server
npm run dev
```

### Building Agent

```bash
cd agent-gui
./build_exe.bat
```

### Environment Variables

```bash
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/runcor
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional
NEXT_PUBLIC_API_URL=https://www.runcor.io
```

---

## File Structure Reference

```
RUNCOR/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── upload/               # File upload
│   │   │   ├── route.ts          # POST handler
│   │   │   └── [id]/             # Dynamic GET handler
│   │   │       └── route.ts
│   │   ├── jobs/route.ts         # Job CRUD
│   │   ├── devices/route.ts      # Device registration
│   │   ├── wallet/route.ts       # Transactions
│   │   └── auth/[...nextauth]/   # NextAuth
│   ├── contractor/               # Job creation UI
│   ├── dashboard/                # Provider portal
│   ├── install/page.tsx          # Download page
│   └── layout.tsx                # Root layout
├── agent-gui/                    # Windows Agent
│   ├── runcor-agent-gui.py       # Main GUI (~1500 lines)
│   ├── docker_utils.py           # Docker wrapper
│   ├── build_exe.bat             # Build script
│   └── dist/                     # Built executables
├── demo/                         # Sample scripts
│   ├── simple_image_processor.py
│   └── real_ai_image_classification.py
├── public/downloads/             # Agent releases
│   └── runcor-agent-v19.exe
├── .env.local                    # Environment variables
└── vercel.json                   # Vercel config
```

---

## Quick Links

| Resource | URL |
|----------|-----|
| Production | https://www.runcor.io |
| Agent Download | https://www.runcor.io/install |
| GitHub Repo | https://github.com/runcor-io/runcor-website |
| MongoDB Atlas | https://cloud.mongodb.com |
| Vercel Dashboard | https://vercel.com/runcor-io/runcor-website |

---

## Changelog

### v19 (Latest)
- ✅ Fixed file download (dynamic route)
- ✅ Custom Docker image with Pillow
- ✅ Agent properly handles input files

### v18
- Added detailed logging for debugging

### v17
- Fixed job data retrieval from claim response

### v16
- Added debug logging for inputFileUrl

### v15
- Added file extraction logging

---

## Contributors & Contact

- **Project Lead:** Tijani
- **Repository:** https://github.com/runcor-io/runcor-website

---

*This documentation is auto-generated. Last updated: February 19, 2026*
