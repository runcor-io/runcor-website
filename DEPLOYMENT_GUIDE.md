# RunCor Deployment Guide

## 🚀 Deploying to Vercel

### Step 1: Prepare Your Code

#### 1.1 Update `.env.local` for Production

Create a `.env.local` file with these variables:

```env
# MongoDB Atlas (REQUIRED - local won't work on Vercel)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/runcor?retryWrites=true&w=majority

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://your-domain.com

# Optional: For additional security
# ADMIN_API_KEY=some_random_key_for_admin_endpoints
```

**⚠️ CRITICAL:** Never commit this file to git!

#### 1.2 Add to `.gitignore`

Ensure these are in your `.gitignore`:
```
.env.local
.env*.local
node_modules/
.next/
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login and deploy:
```bash
vercel login
vercel
```

3. Follow prompts:
   - Set up project: `Yes`
   - Root directory: `./` (current)
   - Override settings: `No`

4. Add environment variables in Vercel dashboard:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project
   - Settings → Environment Variables
   - Add:
     - `MONGODB_URI` = your Atlas connection string
     - `NEXTAUTH_SECRET` = random 32-char string
     - `NEXTAUTH_URL` = your domain (e.g., https://runcor.io)

5. Redeploy:
```bash
vercel --prod
```

#### Option B: GitHub Integration

1. Push code to GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables (same as above)
6. Deploy

### Step 3: Connect Custom Domain

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `your-domain.com`
3. Follow DNS configuration:
   - **Option 1 (Recommended):** Nameservers
     - Point your domain's nameservers to Vercel:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - **Option 2:** A + CNAME Records
     - A Record: `@` → `76.76.21.21`
     - CNAME Record: `www` → `cname.vercel-dns.com`

4. Wait for SSL certificate (automatic, takes 1-2 minutes)

### Step 4: Update Agent Configuration

After deployment, update your agent to use the production URL:

**In `agent-gui/runcor-agent-gui.py`:**
```python
# Change from:
API_URL = "http://localhost:3000/api"

# To:
API_URL = "https://your-domain.com/api"
```

Rebuild and redistribute the agent executable.

### Step 5: Verify Deployment

Test these endpoints:
```
https://your-domain.com/api/auth/me
https://your-domain.com/api/devices
https://your-domain.com/api/jobs
```

## 🔧 Production Considerations

### 1. MongoDB Atlas Limits (Free Tier)
- **512MB storage** - enough for testing, monitor usage
- **Concurrent connections: 500** - plenty for startup
- **Monitoring:** Set up alerts at 80% capacity

### 2. NextAuth Configuration
Make sure `NEXTAUTH_URL` matches your domain exactly:
- ✅ `https://runcor.io`
- ❌ `https://www.runcor.io` (different!)
- ❌ `http://runcor.io` (no SSL)

### 3. CORS (If Needed)
If you access API from external tools, update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 4. WebSocket Considerations
If using Socket.io for real-time updates:
- Vercel is serverless (stateless)
- WebSockets don't persist between requests
- **Recommendation:** Use Vercel's Edge Runtime with PartyKit or Ably for real-time
- **Alternative:** Keep polling (10s interval) - works fine for MVP

### 5. File Uploads
If contractors upload files (scripts, data):
- Vercel has 4.5MB body size limit
- For larger files, use:
  - AWS S3 + presigned URLs
  - Cloudflare R2
  - MongoDB GridFS

## 🐛 Troubleshooting

### "MongoDB connection timeout"
- Check IP whitelist in Atlas (must allow 0.0.0.0/0)
- Verify connection string format
- Check if password has special characters (URL-encode them)

### "Invalid NEXTAUTH_URL"
- Must include protocol: `https://`
- Must match domain exactly (no trailing slash)
- No path: `/` is implicit

### "Build failed"
```bash
# Test build locally first
npm run build
# Check for TypeScript errors
npx tsc --noEmit
```

### "API returns 500"
Check Vercel logs:
```bash
vercel logs --tail
```

## 📱 Post-Deployment Agent Setup

### Windows Agent (.exe)
1. Update `API_URL` in Python source
2. Rebuild with PyInstaller:
```bash
cd agent-gui
pyinstaller --onefile --windowed --add-data "runcor-logo-512px.png;." runcor-agent-gui.py
```
3. Distribute `dist/runcor-agent-gui.exe`

### Agent Configuration File
Instead of hardcoding, create `config.json`:
```json
{
  "api_url": "https://your-domain.com/api",
  "device_name": "My Computer",
  "auto_start": false
}
```

## 🔒 Security Checklist

- [ ] MongoDB Atlas IP whitelist set to 0.0.0.0/0 (or Vercel IPs only)
- [ ] NEXTAUTH_SECRET is random and 32+ characters
- [ ] Admin usernames updated in API files (not just "admin")
- [ ] No `.env.local` committed to git
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Rate limiting considered (add `rate-limiter-flexible` if needed)

## 💰 Cost Estimate

| Service | Free Tier | Paid (Start) |
|---------|-----------|--------------|
| Vercel | 100GB bandwidth | $20/mo Pro |
| MongoDB Atlas | 512MB storage | $9/mo M10 |
| Domain | - | $10-15/year |
| **Total Start** | **FREE** | ~$30/mo |

## 🚀 Next Steps After Deployment

1. **Register first admin account** (`admin` username)
2. **Test job posting** from contractor view
3. **Run agent locally** and verify it picks up jobs
4. **Create demo accounts** for testing
5. **Set up monitoring** (Vercel Analytics, MongoDB Atlas alerts)

---

**Your domain:** `your-domain.com`
**Admin panel:** `https://your-domain.com/admin`

Good luck with the deployment! 🎉
