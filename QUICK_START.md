# Quick Start Guide

## 🚀 Easiest Way to Run (Windows)

### First Time Setup
1. **Double-click `setup-and-run.bat`**
   - This will check for Node.js
   - Install it automatically if possible
   - Install all dependencies
   - Start the server

### After First Setup
1. **Double-click `run.bat`**
   - Quick start (skips checks if everything is set up)

## 📋 What the Scripts Do

### `setup-and-run.bat`
- ✅ Checks if Node.js is installed
- ✅ Tries to install Node.js automatically (via winget)
- ✅ Installs all npm dependencies
- ✅ Builds the project
- ✅ Starts the development server

### `run.bat`
- ✅ Quick check for Node.js
- ✅ Installs dependencies if needed
- ✅ Starts the development server

### `setup-and-run.ps1` (PowerShell version)
- ✅ Same as setup-and-run.bat but for PowerShell
- ✅ Better error handling
- ✅ Supports both winget and Chocolatey

## 🌐 Access the App

Once the server starts, open your browser and go to:
**http://localhost:3000**

## ⚠️ Troubleshooting

### "Node.js is not installed"
- The script will try to install it automatically
- If that fails, manually install from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- After installing, restart the script

### "Port 3000 already in use"
- Close any other applications using port 3000
- Or edit `package.json` and change the dev script to use a different port

### Script won't run
- Make sure you're on Windows
- Right-click the .bat file → "Run as administrator" (if needed)
- Or use PowerShell: Right-click → "Run with PowerShell"

## 💡 Tips

- Keep the terminal window open while the server is running
- Press `Ctrl+C` to stop the server
- The first run may take a few minutes (installing dependencies)
- Subsequent runs will be much faster


