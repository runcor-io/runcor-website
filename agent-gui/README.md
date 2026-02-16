# RunCor Agent - GUI Version

A Windows desktop application for connecting devices to the RunCor network.

## Features

- ✅ **Graphical Interface** - No command line needed
- ✅ **Hardware Auto-Detection** - Automatically detects CPU, RAM, GPU
- ✅ **Real-time Job Status** - See jobs execute live
- ✅ **Device Control** - Pause, resume, and E-STOP from GUI
- ✅ **Live Logs** - View agent activity in real-time
- ✅ **Online/Offline Status** - Website shows device status based on GUI state

## How It Works

1. **GUI Open** → Device shows as "Active" on website
2. **GUI Closed** → Device shows as "Offline" on website
3. **Job Assigned** → Agent auto-executes and updates GUI
4. **Earnings Tracked** → Completed jobs show earnings in dashboard

## Installation

### For Users (Download .exe)

1. Download `RunCor-Agent.exe` from the Onboarding page
2. Double-click to run
3. Login with your RunCor credentials
4. Device appears in your Fleet Command

### For Developers (Build from source)

```bash
# Install dependencies
pip install pyinstaller psutil pillow

# Build executable
cd agent-gui
python build_exe.bat
```

## File Structure

```
agent-gui/
├── runcor-agent-gui.py      # Main GUI application
├── build_exe.bat            # Build script for Windows
├── BUILD_INSTRUCTIONS.md    # Detailed build guide
└── README.md               # This file
```

## GUI Components

### Login Screen
- Username/password entry
- API URL configuration
- Hardware preview before registration

### Dashboard
- **Device Info Panel** - Shows CPU, RAM, GPU specs
- **Job Status Panel** - Current job progress and logs
- **Control Buttons** - Pause, E-STOP, Disconnect
- **Stats** - Jobs completed, total earnings

### Log Window
- Real-time agent logs
- Timestamps for all events
- Error highlighting

## Technical Details

- **Framework**: Tkinter (built into Python)
- **Threading**: Background workers for jobs and heartbeat
- **API**: REST API with automatic device registration
- **Status Updates**: Every 30 seconds while GUI is open

## Troubleshooting

**"Device not showing online"**
- Check that the GUI is running
- Verify username/password
- Check the API URL is correct

**"Jobs not executing"**
- Accept a job from the Marketplace first
- Check the Job Status panel for errors
- Verify device capabilities match job requirements

**"Build fails"**
- Install Python 3.8+
- Run `pip install pyinstaller psutil pillow`
- Use the build_exe.bat script
