# Build RunCor Agent as Windows Executable

## Prerequisites

1. Install Python 3.8 or higher from https://python.org
2. Install required packages:
   ```
   pip install pyinstaller pillow psutil
   ```

## Building the .exe

### Option 1: Using the build script (Recommended)

Double-click `build_exe.bat` or run in terminal:
```
build_exe.bat
```

### Option 2: Manual build

```bash
# Navigate to the agent-gui folder
cd agent-gui

# Build the executable
pyinstaller --onefile --windowed \
  --name "RunCor-Agent" \
  --icon "../public/runcor-logo-512px.png" \
  --add-data "../public/runcor-logo-512px.png;." \
  runcor-agent-gui.py

# The .exe will be in the 'dist' folder
```

## Build Options Explained

- `--onefile` - Creates a single .exe file (easier to distribute)
- `--windowed` - No console window (GUI mode)
- `--name` - Output filename
- `--icon` - Application icon
- `--add-data` - Include additional files (logo)

## Output

After building, you'll find:
- `dist/RunCor-Agent.exe` - The executable to distribute

## Testing

1. Copy `RunCor-Agent.exe` to a test machine
2. Double-click to run
3. Login with your RunCor credentials
4. The device should appear online in the web dashboard
5. Close the window - device should go offline

## Troubleshooting

**"Python not found"**
- Make sure Python is installed and added to PATH

**"Module not found"**
- Install missing packages: `pip install <module_name>`

**Antivirus blocks the .exe**
- This is common for PyInstaller executables
- Add an exception or sign the executable with a certificate

**GUI doesn't show**
- Remove `--windowed` flag to see error messages in console
