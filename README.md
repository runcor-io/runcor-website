# RunCor Landing Page

A modern Next.js 14 landing page for RunCor - Universal Device Autonomy Network.

## 🚀 Quick Start

### ⭐ EASIEST WAY (Recommended)
**Double-click `START_HERE.bat`** - This is the main setup script that:
- ✅ Checks if Node.js is installed
- ✅ Automatically installs Node.js (via winget or Chocolatey)
- ✅ Installs all project dependencies
- ✅ Starts the development server
- ✅ Works on fresh Windows installations

### Quick Run (After first setup)
**Double-click `run.bat`** - For subsequent runs:
- Checks if dependencies are installed
- Installs them if needed
- Starts the development server

### Manual Setup
If you prefer to set up manually:

1. **Install Node.js** (if not already installed)
   - Visit: https://nodejs.org/
   - Download and install the LTS version
   - Restart your terminal/command prompt

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to: http://localhost:3000

## Features

- Built with Next.js 14 App Router
- Tailwind CSS configured via PostCSS
- Optimized fonts using next/font (Inter & JetBrains Mono)
- Reusable component architecture
- SEO optimized with metadata and OpenGraph tags
- Production ready for Vercel deployment

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles and animations
├── components/
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── TwoPathsSection.tsx
│   ├── LifecycleSection.tsx
│   ├── ArchitectureSection.tsx
│   └── TargetDevicesSection.tsx
├── public/
│   └── runcor-logo-512px.png
├── setup-and-run.bat    # First-time setup script
└── run.bat              # Quick start script
```

## Scripts

- `setup-and-run.bat` - Full setup and run (checks Node.js, installs dependencies, runs server)
- `run.bat` - Quick start (assumes Node.js is installed)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linter

## Deployment

This project is ready for deployment on Vercel. Simply push to your repository and connect it to Vercel.

## Requirements

- Node.js 18+ (LTS version recommended)
- npm (comes with Node.js)

## Troubleshooting

### Node.js not found
- Install Node.js from https://nodejs.org/
- Or run `setup-and-run.bat` which can install it automatically (if winget is available)

### Port 3000 already in use
- Stop any other applications using port 3000
- Or set a different port: `set PORT=3001 && npm run dev`

### Dependencies installation fails
- Make sure you have internet connection
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again
- Check if you have sufficient disk space
