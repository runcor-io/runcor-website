# RunCor - Real Job Execution Implementation

## ✅ What Was Implemented

This document describes the **real job execution system** that replaces the previous mock/demo functionality.

---

## 1. Database Migration (JSON → MongoDB)

### Before
- Devices stored in `data/devices.json` 
- Race condition risk with concurrent writes
- No atomic operations

### After
- MongoDB for all data storage
- Atomic operations for job claiming (prevents race conditions)
- Scalable for multiple agents

### Setup
```bash
# Option 1: Local MongoDB
Install MongoDB Community Edition locally
MONGODB_URI=mongodb://localhost:27017/runcor

# Option 2: MongoDB Atlas (Cloud)
Create free cluster at mongodb.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/runcor
```

---

## 2. Job Queue API

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | List jobs (filter by device_id, status, username) |
| `/api/jobs` | POST | Create job OR claim job (action=claim) |
| `/api/jobs` | PATCH | Update job status, add logs, set result |
| `/api/jobs?id=xxx` | DELETE | Delete/cancel a job |

### Job State Machine
```
pending → claimed → running → completed
   ↓         ↓          ↓           ↓
(Timeout) (Reject)  (Crash)     (Failed)
```

### Claim Mechanism (Race Condition Safe)
```javascript
// Atomic find-and-update prevents double-claiming
const job = await jobs.findOneAndUpdate(
  { status: "pending" },           // Find pending job
  { $set: { status: "claimed", deviceId: "..." } },  // Claim it
  { returnDocument: "after" }      // Return updated doc
);
```

---

## 3. Python Agent (Job Execution)

### File: `public/downloads/runcor-agent-windows.py`

### Features
- **Hardware Detection**: CPU, RAM, GPU (NVIDIA via nvidia-smi)
- **Job Polling**: Polls `/api/jobs` every 10 seconds
- **Job Execution**: Downloads and runs Python scripts
- **Real-time Logs**: Streams stdout back to API
- **Result Capture**: Returns output files < 1MB
- **Heartbeat**: Updates device status every 30 seconds

### Usage
```bash
# 1. Install MongoDB (local or Atlas)
# 2. Update .env.local with MONGODB_URI
# 3. Start the Next.js dev server
npm run dev

# 4. Run the agent on your HP Omen
python public/downloads/runcor-agent-windows.py

# 5. Agent will:
#    - Register device
#    - Poll for jobs
#    - Execute any pending jobs
#    - Report results
```

---

## 4. Contractor Job Creation

### File: `app/contractor/create/page.tsx`

### Features
- Create Python/ML/Data Processing jobs
- Upload script directly (embedded in job)
- Set reward amount
- Specify required capabilities (GPU, CUDA, etc.)
- Real-time job creation with API

### Workflow
1. Contractor fills job form
2. Clicks "Deploy Job"
3. Job created with status `pending`
4. Agent claims job on next poll
5. Agent executes and reports back

---

## 5. Job Monitor (Real Data)

### File: `app/dashboard/jobs/page.tsx`

### Features
- Fetches real jobs from MongoDB
- Auto-refreshes every 10 seconds
- Expandable job logs
- Real-time status updates
- Shows actual earnings

---

## Quick Start Demo

### Step 1: Start Infrastructure
```bash
# Terminal 1: Start MongoDB
mongod --dbpath /path/to/data

# Terminal 2: Start Next.js
npm install  # Install mongodb package
npm run dev
```

### Step 2: Run Agent
```bash
# Terminal 3: Run agent
python public/downloads/runcor-agent-windows.py
# Enter username: testuser
# API URL: http://localhost:3000
```

### Step 3: Create Job
1. Open http://localhost:3000/auth
2. Login as contractor
3. Go to "New Project"
4. Create a simple job:
   ```python
   #!/usr/bin/env python3
   import time
   print("Starting computation...")
   time.sleep(5)
   result = sum(range(1000000))
   print(f"Result: {result}")
   with open("output.txt", "w") as f:
       f.write(str(result))
   ```
5. Click "Deploy Job"

### Step 4: Watch Execution
1. Agent will claim job within 10 seconds
2. Job status changes: `pending` → `claimed` → `running` → `completed`
3. View logs in real-time on Job Monitor page
4. Download results from job details

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Contractor    │────▶│   Next.js API   │────▶│    MongoDB      │
│   Dashboard     │     │   /api/jobs     │     │  jobs collection│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               ▲                         │
                               │                         │
┌─────────────────┐            │                         │
│  Device Owner   │            │                         ▼
│  Job Monitor    │────────────┘                ┌─────────────────┐
└─────────────────┘                             │  Python Agent   │
                                                │  (HP Omen)      │
                                                └─────────────────┘
```

---

## Next Steps (From Roadmap)

### Phase 5: Real Authentication (JWT)
- Replace localStorage with NextAuth.js
- Add password hashing with bcrypt
- HTTP-only cookies for tokens

### Phase 6: Real-time Updates
- WebSocket or Server-Sent Events
- Push job status instead of polling
- Dashboard live updates

### Phase 7: Payment Integration
- Stripe for USD payments (MVP)
- OR Smart contract escrow (later)
- Automatic payout on job completion

---

## Files Changed

| File | Change |
|------|--------|
| `app/api/devices/route.ts` | Migrated to MongoDB |
| `app/api/jobs/route.ts` | New job queue API |
| `public/downloads/runcor-agent-windows.py` | Complete rewrite with job execution |
| `app/contractor/create/page.tsx` | New real job creation page |
| `app/dashboard/jobs/page.tsx` | Real data from API |
| `package.json` | Added mongodb dependency |
| `.env.local` | MongoDB configuration |

---

**Status**: ✅ REAL JOB EXECUTION IMPLEMENTED

You can now:
- Create jobs from contractor portal
- Have agents execute them automatically
- View real-time logs and results
- Track actual job status
