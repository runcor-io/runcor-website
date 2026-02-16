# RunCor - Phase 6: WebSocket Real-time Updates

## Overview

Added WebSocket support for instant job status updates. When an agent claims or completes a job, the dashboard updates immediately instead of waiting for the 10-second poll.

## Architecture

```
Agent (Python)          Server (Next.js)         Dashboard (React)
     |                         |                         |
     |---- job:update -------->|                         |
     |                         |---- io.emit() --------->|
     |                         |                         | (instant update)
     |                         |                         |
     |<--- HTTP API (fallback) |<--- HTTP API (fallback) |
```

## Files Added/Modified

### Server-side
| File | Change |
|------|--------|
| `server.ts` | Custom Next.js server with Socket.io |
| `package.json` | Added socket.io, socket.io-client dependencies |

### Client-side
| File | Change |
|------|--------|
| `app/lib/socket.ts` | Socket.io client utilities |
| `app/components/SocketProvider.tsx` | React context for WebSocket |
| `app/layout.tsx` | Wrapped with SocketProvider |
| `app/dashboard/jobs/page.tsx` | Real-time job updates + connection indicator |

### Agent
| File | Change |
|------|--------|
| `public/downloads/runcor-agent-windows.py` | WebSocket emit on job updates |

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd C:\Users\OMEN\Desktop\RUNCOR
npm install
```

This installs:
- `socket.io` - Server-side WebSocket library
- `socket.io-client` - Client-side WebSocket library

### Step 2: Install Python Socket.io (Optional)

For real-time updates from agent:

```bash
pip install python-socketio[client]
```

If not installed, agent falls back to HTTP polling (still works).

### Step 3: Start the Server

```bash
# Option A: With WebSocket support (recommended)
npm run dev

# Option B: Standard Next.js (no WebSocket)
npm run dev:next
```

### Step 4: Run the Agent

```bash
python public\downloads\runcor-agent-windows.py
```

You should see:
```
[✓] Real-time updates: ENABLED (WebSocket)
```

Or if python-socketio not installed:
```
[*] Real-time updates: DISABLED (HTTP polling)
```

## How It Works

### Dashboard Connection
1. Dashboard loads → Socket.io connects
2. Joins "jobs" room for job updates
3. Shows "LIVE" indicator when connected
4. Falls back to 10-second polling if disconnected

### Job Execution Flow
1. Agent claims job → HTTP PATCH to API
2. Agent emits `job:update` via WebSocket
3. Server broadcasts to all dashboard clients
4. Dashboard updates instantly (no page refresh)

### Connection States

| Indicator | Meaning |
|-----------|---------|
| 🟢 **LIVE** | WebSocket connected, instant updates |
| ⚪ **POLLING** | WebSocket disconnected, 10s polling |

## Testing Real-time Updates

1. **Open Dashboard**: http://localhost:3000/dashboard/jobs
2. **Check Connection**: Look for "LIVE" badge in header
3. **Create Job**: Contractor Portal → New Project
4. **Watch Agent**: Terminal shows job execution
5. **See Instant Update**: Dashboard updates immediately when job claimed/completed

## Troubleshooting

### WebSocket Not Connecting
- Check browser DevTools → Network → WS tab
- Look for `socket.io/?EIO=4` connections
- Common causes: Firewall, proxy, wrong port

### Agent Shows "POLLING"
- Install python-socketio: `pip install python-socketio[client]`
- Agent still works, just uses HTTP instead of WebSocket

### Dashboard Shows "POLLING"
- Check server logs for Socket.io errors
- Ensure using `npm run dev` (not `dev:next`)
- Refresh page to reconnect

## Performance

| Mode | Latency | CPU/Battery |
|------|---------|-------------|
| WebSocket | ~50ms | Low (persistent connection) |
| HTTP Polling | ~10s | Higher (repeated requests) |

## Security

- WebSocket respects existing NextAuth session
- Agents authenticated via device registration
- CORS configured for localhost development

## Next Steps

Phase 7: Payment Integration
- Stripe for USD payments
- OR Smart contract escrow
