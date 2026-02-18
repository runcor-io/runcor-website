# RunCor Developer Integration Guide

## Quick Start (5 minutes)

### 1. Install the Agent

```bash
# Windows (PowerShell)
irm https://runcor.io/install.ps1 | iex

# Linux/macOS
curl -fsSL https://runcor.io/install.sh | bash
```

### 2. Register Your Device

```bash
runcor-agent --register --username yourname
```

### 3. Start Earning

```bash
runcor-agent
# Agent runs in background, polls for jobs
```

---

## API Reference

### Authentication

All API requests require a JWT token from NextAuth session:

```javascript
const token = await getSession();
const headers = {
  'Authorization': `Bearer ${token.accessToken}`,
  'Content-Type': 'application/json'
};
```

### Post a Job

```javascript
POST /api/jobs
Content-Type: application/json

{
  "title": "Image Captioning Batch",
  "type": "python",
  "script": "# Python code...",
  "postedBy": "your_username",
  "reward": 5.00,
  "requiredCapabilities": ["gpu_compute"],
  "inputFileUrl": "https://.../input.zip"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "6994a7c1ee944455fdf342a1",
  "newBalance": 95.00
}
```

### Check Job Status

```javascript
GET /api/jobs?id=6994a7c1ee944455fdf342a1

Response:
{
  "_id": "6994a7c1ee944455fdf342a1",
  "title": "Image Captioning Batch",
  "status": "completed",
  "claimedBy": "provider_name",
  "result": {
    "outputUrl": "https://.../output.zip"
  }
}
```

### Download Results

```javascript
GET /api/jobs/results?id=6994a7c1ee944455fdf342a1

Response: Binary file (application/zip)
```

---

## Creating Custom Jobs

### Template Structure

```python
#!/usr/bin/env python3
"""
Job Template for RunCor
- Input: /workspace/input/
- Output: /workspace/output/
- Progress: Write to /workspace/output/progress.json
"""

import json
import os

INPUT_DIR = "/workspace/input"
OUTPUT_DIR = "/workspace/output"

def report_progress(percent, message):
    """Report progress to RunCor"""
    progress = {
        "percent": percent,
        "message": message
    }
    with open(f"{OUTPUT_DIR}/progress.json", "w") as f:
        json.dump(progress, f)

def main():
    # Your processing logic here
    report_progress(0, "Starting...")
    
    # Process files
    files = os.listdir(INPUT_DIR)
    for i, filename in enumerate(files):
        # Do work...
        percent = int((i / len(files)) * 100)
        report_progress(percent, f"Processing {filename}")
    
    # Save results
    with open(f"{OUTPUT_DIR}/results.json", "w") as f:
        json.dump({"status": "complete"}, f)
    
    report_progress(100, "Complete!")

if __name__ == "__main__":
    main()
```

### Docker Considerations

Your job runs in an isolated container:

```dockerfile
# Available in container:
# - python:3.11-slim (default)
# - /workspace/input (read-only)
# - /workspace/output (writable)

# Network: DISABLED (--network none)
# Max RAM: 4GB (--memory 4g)
# Max CPU: 1 core (--cpus 1.0)
```

### Supported Base Images

| Image | Use Case |
|-------|----------|
| `python:3.11-slim` | Python scripts (default) |
| `node:18-alpine` | JavaScript/Node.js |
| `pytorch/pytorch:latest` | ML inference |
| `nvidia/cuda:11.8-runtime` | GPU workloads |

---

## Advanced Features

### Deterministic Jobs (Verification)

For jobs requiring output verification:

```javascript
POST /api/jobs
{
  "title": "Verified Computation",
  "deterministic": true,
  "expectedOutputHash": "sha256:abc123...",
  "script": "# Must produce same output given same input"
}
```

Payment only releases if `actualOutputHash == expectedOutputHash`.

### Custom Capabilities

Require specific hardware:

```javascript
{
  "requiredCapabilities": [
    "gpu_compute",      // NVIDIA GPU
    "cuda",             // CUDA support
    "min_ram_16gb",     // 16GB+ RAM
    "avx512"            // AVX-512 CPU
  ]
}
```

### Webhook Notifications

Get notified on job completion:

```javascript
{
  "webhookUrl": "https://your-app.com/webhook",
  "webhookEvents": ["claimed", "completed", "failed"]
}
```

---

## SDK Examples

### Python SDK

```python
from runcor import Client

client = Client(api_key="your_key")

# Post job
job = client.jobs.create(
    title="Batch Process",
    script=open("job.py").read(),
    reward=10.00,
    input_file="input.zip"
)

# Wait for completion
result = client.jobs.wait_for(job.id, timeout=300)
print(f"Output: {result.output_url}")
```

### JavaScript/TypeScript SDK

```typescript
import { RunCor } from '@runcor/sdk';

const runcor = new RunCor({ apiKey: 'your_key' });

// Post job
const job = await runcor.jobs.create({
  title: 'Image Processing',
  script: fs.readFileSync('job.py', 'utf8'),
  reward: 5.00,
  inputFile: fs.createReadStream('input.zip')
});

// Track progress
runcor.jobs.onProgress(job.id, (progress) => {
  console.log(`${progress.percent}%: ${progress.message}`);
});

// Get results
const result = await runcor.jobs.waitFor(job.id);
```

---

## Local Development

### Test Jobs Locally

```bash
# Run the same container locally
docker run --rm \
  --network none \
  --cpus 1.0 \
  --memory 4g \
  -v $(pwd)/input:/workspace/input:ro \
  -v $(pwd)/output:/workspace/output \
  python:3.11-slim \
  python /workspace/input/job.py
```

### Mock Server

```bash
# Start local RunCor API mock
npm install -g @runcor/mock-server
runcor-mock-server --port 3001
```

---

## Best Practices

1. **Idempotency**: Jobs should produce same output for same input
2. **Progress Reporting**: Update progress every 5-10% for UX
3. **Error Handling**: Always write error details to output
4. **Resource Limits**: Test with 4GB RAM, 1 CPU limit
5. **Input Validation**: Check file formats before processing
6. **Cleanup**: Don't leave temp files in /workspace

---

## Support

- **Docs**: https://docs.runcor.io
- **Discord**: https://discord.gg/runcor
- **Email**: dev@runcor.io
- **GitHub**: https://github.com/runcor-io/runcor-website
