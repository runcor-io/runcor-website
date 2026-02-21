# RunCor - Complete Technical Specification

## Table of Contents

1. [Job Posting Flow (UI/UX)](#1-job-posting-flow-uiux)
2. [Resource Scheduling Backend](#2-resource-scheduling-backend)
3. [Input/Output Data Flow](#3-inputoutput-data-flow)
4. [Billing & Payout System](#4-billing--payout-system)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)

---

## 1. Job Posting Flow (UI/UX)

### Current Problem
Preset verticals ("Medical Imaging", "AI/Data Labeling") force users into boxes. Real users have scripts, binaries, containers — they need flexibility.

### Proposed Step 1: "What are you running?"

#### Option A: Start from Base Image
```
┌─────────────────────────────────────────────────────────┐
│  Select Runtime Environment                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Python]    [Node.js]    [Rust]     [Go]              │
│  3.11-slim   20-alpine    latest     latest            │
│  ~50MB       ~40MB        ~25MB      ~20MB             │
│                                                          │
│  [CUDA]      [ROCm]       [Custom]                     │
│  12.0-devel  5.7          Dockerfile                   │
│  ~2GB        ~2GB          upload                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Option B: Use a Template
```
┌─────────────────────────────────────────────────────────┐
│  Or start from a template                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [OCR / PDF Processing]    [Image Resize Batch]         │
│  [PyTorch Training]        [Blender Rendering]          │
│  [Data Pipeline]           [Custom Template...]         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Option C: Bring Your Own Container
```
┌─────────────────────────────────────────────────────────┐
│  Upload Dockerfile or docker-compose.yml                │
│  ─────────────────────────────────────────────────────  │
│  [Drag & drop or click to upload]                       │
│  Supports: Dockerfile, docker-compose.yml, .tar.gz      │
└─────────────────────────────────────────────────────────┘
```

### After Selection: Resource & Input Configuration

```
┌─────────────────────────────────────────────────────────┐
│  Resource Requirements                                   │
├─────────────────────────────────────────────────────────┤
│  CPU: [○○○○●○○○○○] 4 cores                              │
│  Memory: [○○○●○○○○○○] 8 GB                              │
│  GPU: [None ▼]  (CUDA, ROCm, or None)                  │
│  Disk: [○●○○○○○○○○] 20 GB                              │
│  Timeout: [30 ▼] minutes                               │
│  Max retries: [2 ▼]                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Input Data                                              │
├─────────────────────────────────────────────────────────┤
│  Source: [Upload ▼]                                     │
│          Upload / S3 URL / HTTP URL / Previous Job      │
│                                                          │
│  [Click to upload or drag files]                        │
│  Max 50MB per file. For larger files, use S3 or URL.    │
│                                                          │
│  [✓] Split job into parallel tasks (map-reduce)         │
│      Input pattern: /input/*.csv → /output/*.json       │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Script / Command Configuration

```
┌─────────────────────────────────────────────────────────┐
│  Entry Point                                             │
├─────────────────────────────────────────────────────────┤
│  Command: [python main.py ▼]  or custom: [________]     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  #!/usr/bin/env python3                         │   │
│  │                                                 │   │
│  │  import os                                      │   │
│  │  import json                                    │   │
│  │                                                 │   │
│  │  # Input available at /workspace/input/         │   │
│  │  # Output write to /workspace/output/           │   │
│  │                                                 │   │
│  │  input_file = os.environ.get('INPUT_FILE')      │   │
│  │                                                 │   │
│  │  # Your code here                               │   │
│  │  result = {"processed": True}                   │   │
│  │                                                 │   │
│  │  with open('/workspace/output/result.json', 'w')│   │
│  │       as f:                                     │   │
│  │      json.dump(result, f)                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [Dependencies] [Env Vars] [Test Run]                   │
└─────────────────────────────────────────────────────────┘
```

### Dependencies Tab

```
┌─────────────────────────────────────────────────────────┐
│  requirements.txt              [Upload ▼] [Edit ▼]      │
│  ─────────────────────────────────────────────────────  │
│  pandas==2.0.0                                          │
│  numpy==1.24.0                                          │
│  Pillow==10.0.0                                         │
│                                                          │
│  [+ Add package]                                        │
└─────────────────────────────────────────────────────────┘
```

### Environment Variables Tab

```
┌─────────────────────────────────────────────────────────┐
│  KEY                    VALUE           SECRET?         │
│  ─────────────────────────────────────────────────────  │
│  API_KEY                [••••••••]      [✓]            │
│  BATCH_SIZE             100             [ ]            │
│  MODEL_PATH             /models/v1      [ ]            │
│                                                          │
│  [+ Add variable]                                       │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Review & Deploy

```
┌─────────────────────────────────────────────────────────┐
│  Job Summary                                             │
├─────────────────────────────────────────────────────────┤
│  Runtime: python:3.11-slim                              │
│  Resources: 4 CPU, 8 GB RAM, No GPU                     │
│  Parallel tasks: 100 (1 per input file)                 │
│  Estimated cost: ~45 RUN tokens                         │
│  Estimated time: ~12 minutes                            │
│                                                          │
│  [Cancel]                              [Deploy Job →]   │
└─────────────────────────────────────────────────────────┘
```

### Key Changes Summary

1. **Runtime-first, not use-case-first** — Pick a base image, not a vertical
2. **Templates are shortcuts, not categories** — Optional, not required
3. **Explicit resource controls** — CPU, memory, GPU, timeout, retries
4. **Flexible input sources** — Upload, S3, URL, or previous job output
5. **Map-reduce as first-class** — Parallelization is a config, not a different job type
6. **Dependencies & env vars visible** — Not hidden in the script
7. **Cost/time estimates before deploy** — Set expectations

---

## 2. Resource Scheduling Backend

### Node Registration & Heartbeat

```python
# Node registration on startup
POST /api/v1/nodes/register
{
  "node_id": "uuid-generated-by-node",
  "public_key": "...",
  "capabilities": {
    "cpu": {"cores": 8, "architecture": "x86_64"},
    "memory": {"total_gb": 32, "available_gb": 28},
    "gpu": [
      {"model": "RTX 4090", "vram_gb": 24, "cuda_version": "12.0"}
    ],
    "storage": {"total_gb": 500, "available_gb": 400},
    "network": {"bandwidth_mbps": 1000}
  },
  "supported_runtimes": ["python:3.11", "python:3.10", "cuda:12.0"],
  "region": "us-east-1",
  "pricing": {
    "cpu_per_hour": 0.01,
    "gpu_per_hour": 0.50,
    "memory_gb_per_hour": 0.005
  }
}

# Response: JWT token for authenticated heartbeats
{"token": "...", "expires_at": "..."}
```

```python
# Heartbeat every 30 seconds
POST /api/v1/nodes/heartbeat
Authorization: Bearer <token>
{
  "node_id": "...",
  "status": "healthy",
  "current_load": {
    "cpu_percent": 45,
    "memory_used_gb": 12,
    "gpu_utilization": [0.8],
    "active_tasks": 3
  },
  "available_resources": {
    "cpu_cores": 4,
    "memory_gb": 16,
    "gpu_slots": 0
  }
}
```

### Job Scheduling Algorithm

```python
class Scheduler:
    def schedule_job(self, job: Job) -> List[TaskAssignment]:
        """
        Break job into tasks and assign to nodes.
        Returns list of (task, node) assignments.
        """
        
        # 1. Determine parallelism
        if job.parallel_mode == "single":
            tasks = [job.as_single_task()]
        elif job.parallel_mode == "map":
            tasks = job.split_by_input_pattern()
        elif job.parallel_mode == "parameter_sweep":
            tasks = job.generate_parameter_combinations()
        
        # 2. Filter eligible nodes
        eligible_nodes = [
            n for n in self.node_registry.get_healthy_nodes()
            if n.meets_requirements(job.resource_requirements)
            and n.has_runtime(job.runtime)
            and n.region in job.allowed_regions
        ]
        
        # 3. Score and assign
        assignments = []
        for task in tasks:
            def score_node(node):
                scores = {
                    'resource_fit': node.available_resources.fit_score(task.needs),
                    'latency': 1.0 / (1 + node.network_latency_ms),
                    'price': 1.0 / node.estimated_cost(task),
                    'reliability': node.success_rate_24h,
                    'data_locality': node.has_cached_data(task.input_data_refs)
                }
                return weighted_sum(scores, self.config.weights)
            
            best_node = max(eligible_nodes, key=score_node)
            assignments.append((task, best_node))
            best_node.reserve_resources(task.needs)
        
        return assignments
```

### Task State Machine

```
PENDING → ASSIGNED → PULLING_IMAGE → RUNNING → COMPLETED
   ↓         ↓            ↓            ↓           ↓
CANCELLED  FAILED      FAILED       FAILED     FAILED
```

```python
class TaskExecutor:
    async def execute(self, task: Task):
        # 1. Pull input data
        input_paths = await self.data_manager.pull_inputs(task.input_refs)
        
        # 2. Pull container image (cached if possible)
        image = await self.container_runtime.pull(task.runtime_image)
        
        # 3. Run container with resource limits
        container = await self.container_runtime.run(
            image=image,
            command=task.command,
            env=task.environment,
            resources={
                "cpu_quota": task.cpu_cores * 100000,
                "memory_limit": f"{task.memory_gb}g",
                "gpu_devices": task.gpu_indices if task.needs_gpu else []
            },
            binds={
                input_paths: "/workspace/input",
                self.output_dir: "/workspace/output"
            },
            timeout=task.timeout_seconds
        )
        
        # 4. Stream logs back to coordinator
        async for log_line in container.logs():
            await self.coordinator.stream_log(task.id, log_line)
        
        # 5. Wait for completion or timeout
        result = await container.wait()
        
        # 6. Push outputs
        output_refs = await self.data_manager.push_outputs(
            task.id, 
            f"{self.output_dir}/*"
        )
        
        return TaskResult(
            status="completed" if result.exit_code == 0 else "failed",
            exit_code=result.exit_code,
            output_refs=output_refs,
            metrics={
                "cpu_seconds": result.cpu_usage,
                "memory_peak_gb": result.memory_peak,
                "runtime_seconds": result.duration
            }
        )
```

---

## 3. Input/Output Data Flow

### Data References

Everything is content-addressed:

```python
@dataclass
class DataRef:
    ref_type: Literal["inline", "s3", "gcs", "azure", "ipfs", "job_output", "url"]
    uri: str
    size_bytes: int
    checksum: str  # sha256
    content_type: Optional[str] = None
    
    def resolve(self) -> AsyncIterator[bytes]:
        resolver = get_resolver(self.ref_type)
        return resolver.stream(self.uri)
```

### Input Sources

```python
# 1. Inline (small data)
{
  "input": {
    "ref_type": "inline",
    "data": "base64-encoded-content",
    "size_bytes": 1024,
    "checksum": "sha256:..."
  }
}

# 2. S3 / Cloud Storage
{
  "input": {
    "ref_type": "s3",
    "uri": "s3://my-bucket/datasets/images.zip",
    "size_bytes": 1073741824,
    "checksum": "sha256:...",
    "credentials_ref": "secret://aws-credentials"
  }
}

# 3. Previous job output (chaining)
{
  "input": {
    "ref_type": "job_output",
    "uri": "job://job-abc123/task-0/output/processed.csv",
    "size_bytes": 10485760,
    "checksum": "sha256:..."
  }
}

# 4. URL (HTTP/HTTPS)
{
  "input": {
    "ref_type": "url",
    "uri": "https://example.com/data.zip",
    "size_bytes": null,
    "checksum": null
  }
}

# 5. IPFS (decentralized)
{
  "input": {
    "ref_type": "ipfs",
    "uri": "ipfs://QmXyz...",
    "size_bytes": 52428800,
    "checksum": "sha256:..."
  }
}
```

### Map-Reduce Input Expansion

```python
# User specifies: "Run this on every .csv file"
{
  "parallel_mode": "map",
  "input_pattern": "s3://bucket/datasets/*.csv",
  "output_pattern": "/workspace/output/{input_name}.json"
}

# Scheduler expands this:
async def expand_map_inputs(pattern: str) -> List[DataRef]:
    provider = get_storage_provider(pattern)
    files = await provider.glob(pattern)
    return [
        DataRef(
            ref_type=provider.type,
            uri=file.uri,
            size_bytes=file.size,
            checksum=file.etag
        )
        for file in files
    ]

# Creates N tasks, one per input file
tasks = [
    Task(
        input_refs=[file_ref],
        env={"INPUT_FILE": "/workspace/input/" + file_ref.name},
        output_pattern=f"/workspace/output/{file_ref.stem}.json"
    )
    for file_ref in expanded_inputs
]
```

### Data Caching Strategy

```python
class DataCache:
    """LRU cache on each node to avoid re-downloading."""
    
    def __init__(self, max_size_gb: int = 100):
        self.cache_dir = "/var/runcor/cache"
        self.max_size = max_size_gb * 1024**3
        self.index: Dict[str, CacheEntry] = {}
    
    async def get(self, ref: DataRef) -> Path:
        if ref.checksum in self.index:
            entry = self.index[ref.checksum]
            if entry.path.exists():
                entry.last_accessed = now()
                return entry.path
        
        path = await self.download(ref)
        await self.make_space(ref.size_bytes)
        
        self.index[ref.checksum] = CacheEntry(
            path=path,
            size=ref.size_bytes,
            last_accessed=now()
        )
        
        return path
    
    async def make_space(self, needed_bytes: int):
        while self.total_size + needed_bytes > self.max_size:
            oldest = min(self.index.values(), key=lambda e: e.last_accessed)
            oldest.path.unlink()
            del self.index[oldest.checksum]
```

### Output Aggregation

```python
class OutputAggregator:
    async def aggregate(self, job: Job, task_results: List[TaskResult]) -> DataRef:
        if job.aggregate_mode == "none":
            return self.create_manifest(task_results)
        
        elif job.aggregate_mode == "concat":
            return await self.concatenate(task_results, job.output_format)
        
        elif job.aggregate_mode == "custom":
            reducer_input = await self.create_manifest(task_results)
            reducer_task = Task(
                runtime=job.reducer_runtime,
                command=job.reducer_command,
                input_refs=[reducer_input],
                resources=job.reducer_resources
            )
            result = await self.scheduler.run_task(reducer_task)
            return result.output_refs[0]
```

---

## 4. Billing & Payout System

### Fixed Price Algorithm

```python
@dataclass
class JobQuote:
    fixed_price_run: float
    estimated_duration: timedelta
    confidence: float

class PricingEngine:
    def quote(self, job: Job) -> JobQuote:
        # Base cost from resource requirements
        base = self.base_cost(job.resource_requirements)
        
        # Multipliers for complexity
        multipliers = {
            'parallel_overhead': 1.1 if job.parallel_mode != 'single' else 1.0,
            'gpu_premium': 1.5 if job.needs_gpu else 1.0,
            'input_size': self.size_multiplier(job.total_input_bytes),
            'timeout_risk': self.timeout_risk_multiplier(job.timeout_seconds),
            'retry_buffer': 1.15,
        }
        
        # Historical accuracy adjustment
        similar_jobs = self.db.get_similar_completed_jobs(job)
        if similar_jobs:
            avg_actual_vs_estimate = mean(
                j.actual_cost / j.estimated_cost 
                for j in similar_jobs
            )
            historical_adjustment = avg_actual_vs_estimate
        else:
            historical_adjustment = 1.3
        
        fixed_price = base * product(multipliers.values()) * historical_adjustment
        total = fixed_price * 1.15  # Platform fee
        
        return JobQuote(
            fixed_price_run=round(total, 2),
            estimated_duration=self.estimate_duration(job),
            confidence=self.calculate_confidence(similar_jobs)
        )
    
    def base_cost(self, resources: ResourceRequirements) -> float:
        median_cpu = statistics.median(p.rates.cpu_per_second for p in providers)
        median_mem = statistics.median(p.rates.memory_gb_per_second for p in providers)
        median_gpu = statistics.median(p.rates.gpu_per_second for p in providers)
        
        estimated_seconds = 600
        
        return (
            resources.cpu_cores * estimated_seconds * median_cpu +
            resources.memory_gb * estimated_seconds * median_mem +
            (resources.gpu_count * estimated_seconds * median_gpu if resources.gpu else 0)
        )
```

### Provider Payout Distribution

```python
@dataclass
class TaskContribution:
    node_id: str
    task_id: str
    cpu_seconds: float
    memory_gb_seconds: float
    gpu_seconds: float
    data_egress_bytes: int

class PayoutDistributor:
    def distribute(self, job: Job, contributions: List[TaskContribution]) -> Dict[str, float]:
        # Calculate each provider's work score
        scores = {}
        for c in contributions:
            score = (
                c.cpu_seconds * CPU_WEIGHT +
                c.memory_gb_seconds * MEMORY_WEIGHT +
                c.gpu_seconds * GPU_WEIGHT +
                c.data_egress_bytes * CACHE_BONUS_WEIGHT
            )
            scores[c.node_id] = scores.get(c.node_id, 0) + score
        
        total_score = sum(scores.values())
        
        # Available pool after platform fee
        platform_fee = job.fixed_price * 0.15
        provider_pool = job.fixed_price - platform_fee
        
        # Proportional payout
        payouts = {}
        for node_id, score in scores.items():
            percentage = score / total_score
            payouts[node_id] = {
                'amount_run': round(provider_pool * percentage, 4),
                'percentage': round(percentage * 100, 2),
                'work_units': score
            }
        
        return payouts
```

### Example

```
Job fixed price: 100 RUN

Provider contributions:
├── Node A: 10 tasks, 500 CPU-sec, 2000 GB-sec → 45% of work → 45 RUN
├── Node B: 8 tasks, 400 CPU-sec, 1500 GB-sec → 35% of work → 35 RUN  
└── Node C: 5 tasks, 200 CPU-sec, 800 GB-sec → 20% of work → 20 RUN

Platform fee: 15 RUN (15%)
Total distributed: 85 RUN
```

---

## 5. Database Schema

### jobs

```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Job configuration
    runtime_image VARCHAR(255) NOT NULL,
    command TEXT NOT NULL,
    resource_cpu_cores INT NOT NULL,
    resource_memory_gb INT NOT NULL,
    resource_gpu_count INT DEFAULT 0,
    timeout_seconds INT NOT NULL,
    parallel_mode VARCHAR(50) NOT NULL,
    
    -- Pricing
    quoted_price_run DECIMAL(18, 8) NOT NULL,
    platform_fee_percent DECIMAL(5, 2) DEFAULT 15.00,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    quoted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Totals
    total_tasks INT DEFAULT 0,
    completed_tasks INT DEFAULT 0,
    failed_tasks INT DEFAULT 0,
    
    -- Actual usage
    actual_cpu_seconds DECIMAL(18, 4) DEFAULT 0,
    actual_memory_gb_seconds DECIMAL(18, 4) DEFAULT 0,
    actual_gpu_seconds DECIMAL(18, 4) DEFAULT 0,
    
    INDEX idx_jobs_user_status (user_id, status),
    INDEX idx_jobs_status_created (status, created_at)
);
```

### tasks

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    task_index INT NOT NULL,
    
    input_refs JSONB NOT NULL,
    output_refs JSONB,
    
    assigned_node_id UUID REFERENCES nodes(id),
    assigned_at TIMESTAMPTZ,
    
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds DECIMAL(10, 4),
    
    cpu_seconds DECIMAL(18, 4),
    memory_gb_seconds DECIMAL(18, 4),
    gpu_seconds DECIMAL(18, 4),
    memory_peak_gb DECIMAL(10, 4),
    
    exit_code INT,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    original_task_id UUID REFERENCES tasks(id),
    
    UNIQUE(job_id, task_index),
    INDEX idx_tasks_job_status (job_id, status),
    INDEX idx_tasks_node_status (assigned_node_id, status)
);
```

### nodes

```sql
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_key TEXT NOT NULL UNIQUE,
    name VARCHAR(255),
    region VARCHAR(100),
    provider_user_id UUID NOT NULL REFERENCES users(id),
    
    capabilities JSONB NOT NULL,
    
    rate_cpu_per_second DECIMAL(18, 12) NOT NULL,
    rate_memory_gb_per_second DECIMAL(18, 12) NOT NULL,
    rate_gpu_per_second DECIMAL(18, 12) DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'offline',
    total_tasks_completed INT DEFAULT 0,
    total_tasks_failed INT DEFAULT 0,
    success_rate_30d DECIMAL(5, 4),
    
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    last_heartbeat_at TIMESTAMPTZ,
    
    INDEX idx_nodes_provider (provider_user_id),
    INDEX idx_nodes_status (status)
);
```

### task_contributions

```sql
CREATE TABLE task_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id),
    node_id UUID NOT NULL REFERENCES nodes(id),
    
    cpu_seconds DECIMAL(18, 4) NOT NULL DEFAULT 0,
    memory_gb_seconds DECIMAL(18, 4) NOT NULL DEFAULT 0,
    gpu_seconds DECIMAL(18, 4) NOT NULL DEFAULT 0,
    data_served_bytes BIGINT DEFAULT 0,
    
    work_score DECIMAL(18, 8) NOT NULL,
    
    payout_status VARCHAR(50) DEFAULT 'pending',
    payout_amount_run DECIMAL(18, 8),
    payout_percentage DECIMAL(5, 2),
    
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    payout_calculated_at TIMESTAMPTZ,
    payout_paid_at TIMESTAMPTZ,
    
    INDEX idx_contributions_job (job_id),
    INDEX idx_contributions_node (node_id),
    UNIQUE(task_id, node_id)
);
```

### job_payouts

```sql
CREATE TABLE job_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL UNIQUE REFERENCES jobs(id),
    
    total_job_price_run DECIMAL(18, 8) NOT NULL,
    platform_fee_run DECIMAL(18, 8) NOT NULL,
    platform_fee_percent DECIMAL(5, 2) NOT NULL,
    provider_pool_run DECIMAL(18, 8) NOT NULL,
    
    total_work_score DECIMAL(18, 8) NOT NULL,
    provider_count INT NOT NULL,
    
    status VARCHAR(50) DEFAULT 'calculating',
    calculated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    INDEX idx_payouts_status (status)
);
```

### provider_payouts

```sql
CREATE TABLE provider_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_payout_id UUID NOT NULL REFERENCES job_payouts(id),
    job_id UUID NOT NULL REFERENCES jobs(id),
    node_id UUID NOT NULL REFERENCES nodes(id),
    provider_user_id UUID NOT NULL REFERENCES users(id),
    
    amount_run DECIMAL(18, 8) NOT NULL,
    percentage_of_pool DECIMAL(5, 2) NOT NULL,
    work_score DECIMAL(18, 8) NOT NULL,
    tasks_contributed INT NOT NULL,
    
    transaction_hash VARCHAR(255),
    transaction_status VARCHAR(50) DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    
    INDEX idx_provider_payouts_job (job_id),
    INDEX idx_provider_payouts_node (node_id),
    INDEX idx_provider_payouts_provider (provider_user_id)
);
```

### user_balances

```sql
CREATE TABLE user_balances (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    balance_run DECIMAL(18, 8) DEFAULT 0,
    balance_locked_run DECIMAL(18, 8) DEFAULT 0,
    total_spent_run DECIMAL(18, 8) DEFAULT 0,
    total_earned_run DECIMAL(18, 8) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE balance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    amount_run DECIMAL(18, 8) NOT NULL,
    balance_after_run DECIMAL(18, 8) NOT NULL,
    job_id UUID REFERENCES jobs(id),
    provider_payout_id UUID REFERENCES provider_payouts(id),
    external_ref VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_tx_user_type (user_id, type),
    INDEX idx_tx_created (created_at)
);
```

---

## 6. API Reference

### Job Lifecycle

```
POST   /api/v1/jobs              # Create job
GET    /api/v1/jobs/{id}         # Get job status
GET    /api/v1/jobs/{id}/logs    # Stream logs
POST   /api/v1/jobs/{id}/cancel  # Cancel job
DELETE /api/v1/jobs/{id}         # Delete job + data
```

### Data

```
POST   /api/v1/data/upload       # Get signed URL for upload
GET    /api/v1/data/{ref}        # Download data (redirect to signed URL)
```

### Nodes (Provider API)

```
POST   /api/v1/nodes/register
POST   /api/v1/nodes/heartbeat
POST   /api/v1/nodes/tasks/{id}/claim
POST   /api/v1/nodes/tasks/{id}/complete
```

### Pricing

```
POST   /api/v1/jobs/quote        # Get fixed price quote
```

---

## End-to-End Flow Example

```
User posts job:
├── Runtime: python:3.11-slim
├── Resources: 2 CPU, 4GB RAM
├── Input: s3://bucket/images/*.jpg (1000 files)
├── Parallel: map (1 task per file)
├── Script: process_image.py
└── Aggregate: none

Scheduler:
├── Expands input pattern → 1000 DataRefs
├── Filters nodes with python:3.11
├── Scores nodes by price, latency, reliability
├── Assigns tasks (100 tasks to 10 nodes, 10 each)
└── Queues tasks

Node execution (per task):
├── Pulls input image from S3 (cached after first)
├── Pulls python:3.11-slim image (cached)
├── Runs container with resource limits
├── Streams logs to coordinator
├── Uploads output to S3
└── Reports completion with metrics

Coordinator:
├── Tracks all 1000 task completions
├── Calculates work scores per node
├── Creates payout distribution
├── Charges user fixed price (100 RUN)
├── Pays providers proportionally:
│   ├── Node A: 45 RUN (45% of work)
│   ├── Node B: 35 RUN (35% of work)
│   └── Node C: 20 RUN (20% of work)
├── Takes 15 RUN platform fee (15%)
└── Notifies user job is done
```

---

## Open Questions

1. **Payment timing** — Pay upfront (escrow) or pay-as-you-go?
2. **Failed task retry** — Same node or different node?
3. **Data retention** — How long keep job outputs? Tiered storage?
4. **Provider reputation** — How to bootstrap trust in new providers?
5. **Preemption** — Can you interrupt low-priority jobs for high-priority?
