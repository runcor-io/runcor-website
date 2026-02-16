# GitHub + Vercel Deployment Guide

## 🔄 Workflow Overview

```
Local Development → GitHub Push → Vercel Auto-Deploy → Live Site
       ↑_________________________________________________|
                    (Rollback if issues)
```

## 📋 Step-by-Step Setup

### 1. Initialize Git Repository (if not already)

```bash
# In your project directory
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
.cache/
EOF

# Initial commit
git add .
git commit -m "Initial commit - RunCor platform"
```

### 2. Create GitHub Repository

**Option A: GitHub CLI**
```bash
# Install gh CLI from https://cli.github.com/
gh auth login
gh repo create runcor-platform --public --source=. --push
```

**Option B: GitHub Website**
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `runcor-platform`
3. Public or Private (your choice)
4. Don't initialize with README (you already have one)
5. Copy the push commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/runcor-platform.git
git branch -M main
git push -u origin main
```

### 3. Connect to Vercel

**Method 1: Vercel Dashboard (Easiest)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git Repository → Select your `runcor-platform` repo
3. Configure Project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Environment Variables (add these before deploying):
   ```
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=https://runcor.io  # Will update after domain setup
   ```
5. Click **Deploy**

**Method 2: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Link to project
vercel

# Follow prompts:
# ? Set up and deploy "...runcor-platform"? [Y/n] Y
# ? Which scope? [your-account]
# ? Link to existing project? [y/N] n
# ? What's your project name? [runcor-platform]

# Set environment variables
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy
vercel --prod
```

### 4. Configure Production Domain

**Vercel Dashboard:**
1. Go to Project → Settings → Domains
2. Add your domain: `runcor.io`
3. Follow DNS instructions:
   - **Option A (Recommended):** Nameservers
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - **Option B:** A + CNAME Records
     ```
     A Record: @ → 76.76.21.21
     CNAME: www → cname.vercel-dns.com
     ```

4. Update `NEXTAUTH_URL` in Vercel with your actual domain

### 5. Branch Strategy for Development

```bash
# Main branches
main         → Production (auto-deploys to runcor.io)
develop      → Staging/testing (deploys to preview URL)
feature/*    → Feature branches (preview deployments)
hotfix/*     → Emergency fixes
```

**Workflow:**
```bash
# Start new feature
git checkout -b feature/new-analytics-page

# Work on code...
git add .
git commit -m "Add new analytics dashboard"
git push origin feature/new-analytics-page

# Create Pull Request on GitHub
# Vercel automatically creates preview deployment
# Test at: https://runcor-platform-git-feature-xxx.vercel.app

# After review/approval, merge to main
# Auto-deploys to production!
```

## 🔐 Environment Variables Management

### Development (.env.local) - Never commit!
```env
# Local development only
MONGODB_URI=mongodb://localhost:27017/runcor
NEXTAUTH_SECRET=dev_secret_not_for_production
NEXTAUTH_URL=http://localhost:3000
```

### Production (Vercel Dashboard)
```env
# Production values
MONGODB_URI=mongodb+srv://production_user:xxx@cluster0.xxxxx.mongodb.net/runcor
NEXTAUTH_SECRET=openssl_rand_base64_32_output
NEXTAUTH_URL=https://runcor.io
```

### Syncing env vars across team
```bash
# Pull env vars from Vercel
vercel env pull .env.local

# Add new env var to production
vercel env add VARIABLE_NAME production
```

## 🚀 Deployment Commands

```bash
# Deploy preview (every push to any branch)
git push origin feature/xyz
# Vercel auto-creates: https://runcor-platform-git-feature-xyz.vercel.app

# Deploy production (merge to main)
git checkout main
git merge feature/xyz
git push origin main
# Auto-deploys to: https://runcor.io

# Deploy specific commit
vercel --prod --cwd .

# View deployment logs
vercel logs --tail
```

## 🧪 Testing Before Merge

### 1. Local Testing
```bash
npm run build
npm start
# Test at http://localhost:3000
```

### 2. Preview Deployment Testing
- Every PR gets a preview URL
- Test thoroughly on the preview URL
- Share with team for review

### 3. Production Checklist Before Merge
- [ ] Build passes locally (`npm run build`)
- [ ] No console errors
- [ ] API endpoints work
- [ ] Authentication flows work
- [ ] Mobile responsive
- [ ] Agent can connect

## 🐛 Rollback Strategy

### If Production Breaks:

**Option 1: Revert Commit (Fast)**
```bash
# Find bad commit
git log --oneline -10

# Revert
git revert abc1234
git push origin main
# Auto-deploys previous version!
```

**Option 2: Reset to Previous (Nuclear)**
```bash
# Go back to last known good commit
git reset --hard good_commit_hash
git push origin main --force
# ⚠️ Dangerous - loses commits!
```

**Option 3: Vercel Dashboard (Safest)**
1. Go to vercel.com → Your Project
2. Deployments tab
3. Find last working deployment
4. Click "..." → "Promote to Production"

## 👥 Team Collaboration

### Adding Team Members

**GitHub:**
1. Repository → Settings → Manage Access
2. Invite collaborators

**Vercel:**
1. Project → Settings → Members
2. Invite by email/GitHub username

### Branch Protection (Recommended)

GitHub → Settings → Branches → Add rule:
```
Branch name pattern: main
✓ Require pull request reviews before merging
✓ Require status checks to pass (Vercel build)
✓ Include administrators
```

This prevents direct pushes to main - all changes must go through PR + review!

## 📊 Monitoring Deployments

### GitHub Actions (Optional)

Create `.github/workflows/test.yml`:
```yaml
name: Test and Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
```

This runs tests on every PR before you can merge.

## 🔄 Update Workflow Example

```bash
# Day 1: Fix a bug
1. git checkout -b fix/login-redirect
2. Fix the code
3. git commit -m "Fix: Login redirect loop"
4. git push origin fix/login-redirect
5. Create PR on GitHub
6. Vercel creates preview: https://runcor-platform-git-fix-login.vercel.app
7. Test preview, approve PR
8. Merge to main
9. Auto-deploys to https://runcor.io 🎉

# Day 2: Feature development
1. git checkout -b feature/gpu-matching
2. Implement GPU capability matching
3. git commit -m "Add GPU capability detection"
4. git push origin feature/gpu-matching
5. PR → Review → Merge → Auto-deploy
```

## 🎯 Benefits of This Setup

| Feature | Benefit |
|---------|---------|
| **Git History** | Every change tracked, easy to find when bugs introduced |
| **Pull Requests** | Code review before production |
| **Preview URLs** | Test features before they go live |
| **Auto-deploy** | Push = Deploy, no manual steps |
| **Rollback** | One click to revert bad deployment |
| **Branching** | Multiple features in development simultaneously |

## 🆘 Troubleshooting

### "Build failed on Vercel but works locally"
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### "Environment variables not working"
- Check Vercel Dashboard → Settings → Environment Variables
- Redeploy after adding env vars (they don't auto-apply)

### "Domain not connecting"
- DNS can take 24-48 hours to propagate
- Check Vercel Dashboard for DNS verification status
- Use `dig runcor.io` to check if pointing to Vercel

### "Want to pause auto-deployments"
```bash
# In Vercel Dashboard:
# Project → Settings → Git → Pause Git Integration
```

## 📱 Quick Commands Reference

```bash
# Setup
git clone https://github.com/YOUR_USERNAME/runcor-platform.git
cd runcor-platform
npm install
cp .env.example .env.local  # Add your local env vars

# Daily workflow
git pull origin main                    # Get latest
git checkout -b feature/name            # New branch
# ... code ...
git add .                               # Stage changes
git commit -m "feat: description"       # Commit
git push origin feature/name            # Push
git checkout main && git pull           # Back to main after merge

# Emergency
git revert HEAD                         # Undo last commit
git reset --hard origin/main            # Reset to remote
```

---

**Your deployment pipeline:**
```
GitHub Repo → Vercel Build → https://runcor.io
     ↑                              ↓
   Developer                    End User
```

Push to main = Live in 2 minutes! 🚀
