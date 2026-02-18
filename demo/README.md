# 🎬 RunCor Live Demo Package

Complete demonstration kit for showing RunCor to investors, developers, and users.

## 📦 What's Included

```
demo/
├── README.md                    # This file
├── runcor-demo-job.py           # AI captioning job script
├── generate_sample_images.py    # Create sample dataset
├── setup_demo.sh                # One-command setup
├── INVESTOR_PITCH.md            # Investor presentation guide
├── DEVELOPER_GUIDE.md           # API documentation
└── USER_DEMO.md                 # End-user tutorial
```

## 🚀 Quick Start (2 minutes)

```bash
cd demo
./setup_demo.sh
```

This generates sample images and prepares the demo environment.

---

## 🎭 Demo Scenarios

### 1. Investor Demo (5 minutes)

**Goal**: Secure funding by showing market opportunity

**Script**:
1. Show AWS pricing page - expensive cloud compute
2. Open RunCor, show device earning $10/month passively  
3. Post AI job: "Caption 10 images for $5"
4. Watch agent claim and execute in real-time
5. Show $5 payment + cryptographic verification

**Key Message**: "Airbnb for compute - turns idle devices into income"

**Materials**: See `INVESTOR_PITCH.md`

---

### 2. Developer Demo (10 minutes)

**Goal**: Show easy integration for compute workloads

**Script**:
1. Show API: POST /api/jobs with script
2. Run Docker container locally
3. Show SDK: `runcor.jobs.create()`
4. Demonstrate progress callbacks
5. Show deterministic verification with hashes

**Key Message**: "Drop-in replacement for AWS Lambda/Batch"

**Materials**: See `DEVELOPER_GUIDE.md`

---

### 3. User Demo (3 minutes)

**Goal**: Get people to install and start earning

**Script**:
1. Download agent (30 seconds)
2. Create account (30 seconds)
3. Click "Start" (instant)
4. Show job running: "Your computer is now earning $0.50/hour"
5. Show payout to PayPal

**Key Message**: "Your computer makes money while you sleep"

**Materials**: See `USER_DEMO.md`

---

## 📊 The Demo Job

**AI Image Captioning** - Perfect because:

- ✅ Visual progress (5% → 10% → 15%...)
- ✅ Real AI concept (CLIP/vision models)
- ✅ File I/O (upload images, download JSON)
- ✅ Resource usage (CPU/GPU visible in agent)
- ✅ Deterministic output (verifiable results)
- ✅ Safe (no network access needed)

**Mock vs Real**:
- Demo uses mock captions (no ML model needed)
- Production: Replace with real CLIP/BLIP model
- Same script structure, just swap `analyze_image()` function

---

## 🛠️ Technical Setup

### Prerequisites

```bash
# Python for image generation
pip install pillow

# Docker (for local testing)
docker --version
```

### Testing Locally

```bash
# 1. Generate images
python demo/generate_sample_images.py

# 2. Test job locally
cd demo_images
python ../demo/runcor-demo-job.py

# 3. Check output
cat output/captions.json
```

---

## 🎤 Presentation Tips

### Before Demo
- [ ] Clear browser cache
- [ ] Test agent download link
- [ ] Prepare both contractor and provider accounts
- [ ] Have sample images ready
- [ ] Check wallet balances ($20+ each)

### During Demo
- [ ] Speak slowly - let people see the UI
- [ ] Show the Docker security flags
- [ ] Highlight real-time progress updates
- [ ] Show payment actually moving
- [ ] Answer questions with "Let me show you..."

### After Demo
- [ ] Share demo recording
- [ ] Send GitHub repo link
- [ ] Provide demo_input.zip for them to try
- [ ] Follow up within 24 hours

---

## 📈 Expected Demo Metrics

| Metric | Target | How to Show |
|--------|--------|-------------|
| Job Posting | < 30 seconds | Live timer on screen |
| Agent Claim | < 5 seconds | Watch logs |
| Execution | 30-60 seconds | Real-time progress |
| Payment | Instant | Wallet balance update |
| Security | Always | Docker flags visible |

---

## 🆘 Troubleshooting

**Agent won't claim job?**
- Check username matches exactly
- Verify device shows "online" in dashboard
- Check job requirements vs device capabilities

**Progress not updating?**
- Script writes to `/workspace/output/progress.json`
- Agent polls every 2 seconds
- Check logs for "Progress: X%"

**Payment not showing?**
- Wallet updates on page refresh
- Check /api/wallet endpoint
- Verify job status is "completed"

---

## 📝 Demo Script Template

**Opening (30s)**:
> "Cloud compute is a $50B market dominated by AWS, Google, and Microsoft. 
> But there's a problem - 1.5 billion devices sit idle 22 hours a day. 
> RunCor connects these dots. Let me show you..."

**The Reveal (2min)**:
> "This laptop is about to earn $5 in the next 60 seconds."

**Closing (30s)**:
> "That's RunCor - turning idle compute into passive income. 
> We're not just cheaper than AWS. We're everywhere AWS isn't."

---

## 🎁 Additional Resources

- **Live Demo URL**: https://www.runcor.io/demo
- **Video Walkthrough**: https://youtu.be/runcor-demo (coming soon)
- **Slide Deck**: https://docs.google.com/presentation/d/runcor (coming soon)
- **Contact**: tijani@runcor.io

---

**Ready to demo? Run `./setup_demo.sh` and go!** 🚀
