# RunCor Investor Demo: AI Compute Marketplace

## 🎯 The Pitch (60 seconds)

**"RunCor is the Airbnb for compute - turning idle devices into income streams"**

---

## 💰 The Numbers

| Metric | Value |
|--------|-------|
| **Market Size** | $50B+ cloud compute market by 2027 |
| **Target Users** | 1.5B闲置 devices worldwide |
| **Average Earnings** | $50-200/month per device |
| **Platform Fee** | 15% (vs AWS 30%+) |
| **Security** | Docker isolation, zero-trust model |

---

## 🎬 Demo Flow (5 minutes)

### Scene 1: The Problem (30s)
- Show AWS/GCP pricing page - expensive
- Mention crypto mining is dying - devices idle
- **Hook**: "What if your laptop could earn while you sleep?"

### Scene 2: Post a Job (1 min)
```
Contractor Dashboard:
├── Wallet: $1,000 demo credits
├── Create Job: "Caption 10 images"
├── Reward: $5.00 (10 × $0.50)
└── Upload: demo_images.zip
```

**Talking Points:**
- "Just like Uber - post task, set price"
- "No contracts, no minimums"
- "Pay only for results"

### Scene 3: Device Claims Job (1 min)
```
Provider Agent (Windows Laptop):
├── Hardware: i7, RTX 3060, 16GB RAM
├── Docker: ✅ Security enabled
├── Claim Job: "Test job" ($5.00)
└── Execute: Download → Process → Upload
```

**Talking Points:**
- "Fully automated - no technical knowledge needed"
- "Docker isolation = bank-level security"
- "Works on Windows, Linux, ARM, even Raspberry Pi"

### Scene 4: Real-time Tracking (1 min)
```
Contractor Tracking Page:
├── Progress: 0% → 25% → 50% → 75% → 100%
├── Device: 0x3244... (HP Omen, verified)
├── Logs: Real-time stdout
└── ETA: 45 seconds
```

**Talking Points:**
- "Real-time transparency"
- "Verified hardware (no fake devices)"
- "Automatic failover if device fails"

### Scene 5: Completion & Payment (1 min)
```
Results:
├── Status: ✅ Completed
├── Output: captions.json (download)
├── Payment: $5.00 → Provider wallet
└── Verification: Deterministic hash match
```

**Talking Points:**
- "Cryptographic verification ensures quality"
- "Instant payment on completion"
- "15% fee vs 30%+ for AWS"

---

## 🛡️ Security Deep Dive (Optional)

| Feature | Implementation |
|---------|---------------|
| **Isolation** | Docker containers with `--network none` |
| **Resource Limits** | CPU, RAM, disk quotas enforced |
| **No Privilege Esc** | `--cap-drop ALL --security-opt no-new-privileges` |
| **Verification** | SHA-256 hashes for deterministic jobs |
| **Payment Escrow** | Smart contract-like release on verification |

---

## 🚀 Growth Strategy

### Phase 1: AI/ML Workloads (Now)
- Model inference (CLIP, Whisper, LLMs)
- Image processing, video encoding
- **Target**: AI startups, researchers

### Phase 2: Enterprise (Q2 2026)
- CI/CD build runners
- Batch processing pipelines
- **Target**: DevOps teams

### Phase 3: Consumer (Q4 2026)
- Render farms for creators
- Gaming cloud (GeForce NOW competitor)
- **Target**: 3D artists, gamers

---

## 📊 Competitive Advantage

| | AWS | RunCor |
|---|---|---|
| **Price** | $0.10/compute unit | $0.05/compute unit |
| **Setup** | Complex accounts | One-click agent |
| **Scale** | Pre-provision | Elastic (idle devices) |
| **Geo** | 30 regions | Everywhere (edge) |
| **Crypto** | No | Native token payments |

---

## 💡 The Ask

**Raising: $2M Seed**
- $800K Engineering (agent, platform)
- $600K Marketing (provider acquisition)
- $400K Operations (security audits)
- $200K Legal (compliance)

**Use of Funds Demo:**
- 3 months: 1000 active devices
- 6 months: 10,000 jobs/month
- 12 months: $100K MRR

---

## 🎤 Closing (10 seconds)

> "RunCor turns the world's idle compute into passive income. 
> We're not just cheaper than AWS - we're everywhere AWS isn't."

**Demo URL**: https://www.runcor.io/demo
**Contact**: tijani@runcor.io
