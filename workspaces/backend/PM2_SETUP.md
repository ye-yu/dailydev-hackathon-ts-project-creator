# Backend PM2 Rolling Update Setup

This backend uses PM2 for process management with a rolling update strategy that ensures zero-downtime deployments.

## Quick Start

### Build the project
```bash
pnpm build
```

### Start with PM2 (production)
```bash
pnpm start:pm2
```

### Start with PM2 and watch for changes (development)
```bash
pnpm start:pm2:watch
```

### Manual rolling update
When `./dist` changes, trigger a rolling update:
```bash
pnpm reload:pm2
```

### Stop PM2 instance
```bash
pnpm stop:pm2
```

### Delete PM2 instance
```bash
pnpm delete:pm2
```

## How Rolling Updates Work

### Architecture

The rolling update process follows this sequence:

1. **Build Changes**: When TypeScript is compiled to `./dist`, PM2 detects the changes
2. **Start New Instance**: A new instance of the backend starts running
3. **Health Check**: The system polls the `/health` endpoint on the new instance
4. **Graceful Shutdown**: Once the new instance is healthy, the old instance shuts down
5. **Cleanup**: The old instance is removed from PM2's process list

### Diagram

```
┌─────────────────┐
│  Old Instance   │ (Running)
│ PID: 1234       │
│ /health: ✓      │
└─────────────────┘
         │
    dist changes
         │
         ▼
┌─────────────────┐
│  New Instance   │ (Starting)
│ PID: 5678       │
│ /health: ⏳      │ (waiting)
└─────────────────┘
         │
  health check passes
         │
         ▼
    ┌─────────────────┐
    │ New Instance    │ (Running)
    │ PID: 5678       │
    │ /health: ✓      │
    └─────────────────┘
    
    ┌─────────────────┐
    │ Old Instance    │ (Stopped)
    │ PID: 1234       │
    │ /health: ✗      │
    └─────────────────┘
```

## Configuration

### `ecosystem.config.js`

The PM2 configuration file defines:

- **watch**: `['./dist']` - Watches the dist folder for changes
- **ignore_watch**: `['node_modules', 'logs', '.git']` - Excludes these from watching
- **watch_delay**: `1000ms` - Debounces restart by 1 second
- **kill_timeout**: `5000ms` - Allows 5 seconds for graceful shutdown
- **max_memory_restart**: `500M` - Restarts if memory exceeds 500MB
- **autorestart**: `true` - Auto-restarts on crash

### `bin/rolling-update.mjs`

The rolling update script:

- Detects running instances of the backend
- Starts a new instance via PM2
- Polls the `/health` endpoint until it responds with 200
- Stops old instances once new instance is healthy
- Times out after 30 seconds if health check fails

## Health Check

The `/health` endpoint is implemented in `src/health/health.router.ts` and must return:

```
HTTP 200 OK
```

This is checked by the rolling update script to ensure the new instance is ready to serve traffic.

## Manual Monitoring

View running processes:
```bash
pm2 list
```

View logs:
```bash
pm2 logs ye-yu-backend
```

Monitor in real-time:
```bash
pm2 monit
```

View logs for a specific instance:
```bash
pm2 logs ye-yu-backend --lines 100
```

## Troubleshooting

### Rolling update hangs
If the health check times out (30 seconds), the update is aborted and the old instance keeps running. Check:
- Is the new instance crashing on startup?
- Is the `/health` endpoint responding?
- Check logs: `pm2 logs ye-yu-backend`

### Port already in use
If port 3000 is already in use:
1. Check what's running: `lsof -i :3000`
2. Kill conflicting process: `kill -9 <PID>`
3. Or change the port in config.ts

### Out of memory
If the instance is killed due to memory limits:
1. Increase `max_memory_restart` in ecosystem.config.js
2. Or find and fix memory leaks in the code
3. Check memory usage: `pm2 monit`

## Development vs Production

### Development (with watch)
```bash
pnpm start:pm2:watch
```
- Automatically restarts when `./dist` changes
- Useful during development with `npm run watch` in another terminal

### Production
```bash
pnpm start:pm2
```
- Doesn't watch for changes
- Provides stable, long-running process
- Use `pnpm reload:pm2` to manually trigger updates

## API Server Port

The default port is 3000 (from `API_SERVER_PORT` env var). This must match the health check URL in `rolling-update.mjs` if you change it.
