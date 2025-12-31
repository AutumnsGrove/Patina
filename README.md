# Patina - Automated Database Backup System

> **Internal codename:** GrovePatina

**Automated nightly backups of all Grove D1 databases to R2**

*Age as armor. Time as protection.*

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

Patina is a Cloudflare Worker that automatically backs up all 6 Grove D1 databases to R2 storage every night. It provides SQL dump exports, weekly archive compression, 12-week retention, manual backup triggers, and disaster recovery tools.

**Key Features:**
- **Automated nightly backups** - Every day at 3:00 AM UTC
- **Weekly meta-backups** - Sundays at 4:00 AM UTC, compressing 7 daily backups
- **6 D1 databases** - groveauth, scout-db, grove-engine-db, and more
- **SQL dump format** - Portable, human-readable, easy to restore
- **Smart retention** - 7 days daily + 12 weeks of weekly archives
- **Manual triggers** - On-demand backups via API
- **Status dashboard** - View backup history and storage stats
- **Webhook alerts** - Notifications on backup failures
- **Restore guides** - Step-by-step recovery procedures

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Patina System                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    grove-patina (Worker)                         │
│                                                                  │
│  Cron Triggers:                                                  │
│    - Nightly @ 3:00 AM UTC (backup all databases)               │
│    - Sunday @ 4:00 AM UTC (weekly archive + cleanup)            │
│                                                                  │
│  HTTP Endpoints: /status, /trigger, /download, /restore-guide   │
│                                                                  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   D1 Databases  │  │  grove-patina   │  │  grove-patina   │
│   (6 total)     │  │     (R2)        │  │     -db (D1)    │
│                 │  │                 │  │                 │
│ • groveauth     │  │ Backup Storage  │  │ Backup metadata │
│ • scout-db      │  │                 │  │ Job history     │
│ • grove-engine  │  │ /daily/         │  │ Alert config    │
│ • autumnsgrove- │  │   YYYY-MM-DD/   │  │                 │
│   posts         │  │   db-name.sql   │  │                 │
│ • autumnsgrove- │  │                 │  │                 │
│   git-stats     │  │ /weekly/        │  │                 │
│ • grove-domain- │  │   YYYY-Www.tar  │  │                 │
│   jobs          │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Nightly Backup Flow (3:00 AM UTC):**
1. Cron triggers worker daily
2. Iterates through 6 databases with concurrency=3
3. Exports each as SQL to R2: `/daily/YYYY-MM-DD/db-name.sql`
4. Logs results to metadata database
5. Sends alerts on failures

**Weekly Meta-Backup (4:00 AM UTC Sundays):**
1. Collects 7 daily backups from past week
2. Compresses into archive: `/weekly/YYYY-Www.tar.gz`
3. Deletes daily backups older than 7 days
4. Deletes weekly archives older than 12 weeks

---

## Backed Up Databases

| Database | Priority | Size | Description |
|----------|----------|------|-------------|
| `groveauth` | Critical | 212 KB | Authentication, OAuth (Heartwood) |
| `scout-db` | Critical | 364 KB | Searches, credits, referrals |
| `grove-engine-db` | Critical | 180 KB | Core platform, multi-tenant data (Lattice) |
| `autumnsgrove-posts` | High | 118 KB | Blog posts |
| `autumnsgrove-git-stats` | Normal | 335 KB | Git statistics |
| `grove-domain-jobs` | Normal | 45 KB | Domain search jobs (Forage/Acorn) |

**Total:** ~1.25 MB per full backup
**Retention:** 7 daily + 12 weekly archives

---

## API Endpoints

### `GET /`
Worker information and documentation.

```json
{
  "name": "Patina",
  "version": "1.0.0",
  "description": "Automated D1 database backup system for Grove",
  "schedule": {
    "nightly": "Every day at 3:00 AM UTC",
    "weekly": "Every Sunday at 4:00 AM UTC"
  },
  "retention": {
    "daily": "7 days",
    "weekly": "12 weeks"
  },
  "databases": 6
}
```

### `GET /status`
Current backup status and recent history.

```json
{
  "currentStatus": "idle",
  "lastBackup": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-08",
    "status": "completed",
    "successful": 6,
    "failed": 0,
    "totalSize": "1.25 MB",
    "duration": "25s"
  },
  "nextScheduled": "2024-12-09T03:00:00Z",
  "storage": {
    "dailyBackups": 42,
    "weeklyArchives": 12,
    "totalSize": "15.2 MB"
  }
}
```

### `GET /list`
List all available backups with filtering.

**Query Parameters:**
- `?database=groveauth` - Filter by database
- `?date=2024-12-08` - Filter by date
- `?limit=20` - Limit results

### `POST /trigger`
Manually trigger a backup job.

**Request:**
```json
{
  "databases": ["groveauth", "scout-db"],
  "reason": "Pre-deployment backup"
}
```

### `GET /download/:date/:db`
Download a specific backup file.

```bash
curl -O https://patina.grove.place/download/2024-12-08/groveauth
```

### `GET /restore-guide/:db`
Get restore instructions for a specific database.

---

## Deployment

### Prerequisites

1. **Create R2 bucket:**
   ```bash
   wrangler r2 bucket create grove-patina
   ```

2. **Create metadata database:**
   ```bash
   wrangler d1 create grove-patina-db
   # Copy the database_id and update wrangler.toml
   ```

3. **Run migrations:**
   ```bash
   wrangler d1 execute grove-patina-db --file=migrations/001_backup_metadata.sql
   ```

4. **Set webhook URL (optional):**
   ```bash
   wrangler secret put WEBHOOK_URL
   ```

### Deploy Worker

```bash
pnpm install
pnpm deploy
```

### Verify Deployment

```bash
# Check status
curl https://patina.grove.place/status

# Trigger manual test backup
curl -X POST https://patina.grove.place/trigger

# Tail logs
wrangler tail grove-patina
```

---

## Configuration

### Backup Schedule
Configured in `wrangler.toml`:
```toml
[triggers]
crons = [
  "0 3 * * *",   # Nightly backup at 3:00 AM UTC
  "0 4 * * 0"    # Weekly archive at 4:00 AM UTC Sunday
]
```

### Retention Policy
Configured in `src/lib/databases.ts`:
```typescript
export const BACKUP_CONFIG = {
  dailyRetentionDays: 7,
  weeklyRetentionWeeks: 12,
  concurrency: 3,
  exportTimeout: 30000
};
```

---

## Recovery Procedures

### Full Database Restore

```bash
# 1. Download the backup
curl -o restore.sql https://patina.grove.place/download/2024-12-08/groveauth

# 2. Review the file
head -100 restore.sql

# 3. Execute against D1
wrangler d1 execute groveauth --file=restore.sql

# 4. Verify restoration
wrangler d1 execute groveauth --command="SELECT COUNT(*) FROM users"
```

### Using D1 Time Travel (Preferred for Recent Data)

D1 Time Travel is available for the last 7 days:

```bash
# Check available restore points
wrangler d1 time-travel info groveauth

# Restore to specific timestamp
wrangler d1 time-travel restore groveauth --timestamp="2024-12-08T10:00:00Z"
```

---

## Project Structure

```
Patina/
├── src/
│   ├── index.ts                 # Main worker entry
│   ├── scheduled.ts             # Cron handler logic
│   ├── routes/
│   │   ├── status.ts            # GET /status
│   │   ├── trigger.ts           # POST /trigger
│   │   ├── download.ts          # GET /download/:date/:db
│   │   ├── list.ts              # GET /list
│   │   └── restore-guide.ts     # GET /restore-guide/:db
│   ├── lib/
│   │   ├── exporter.ts          # D1 to SQL export logic
│   │   ├── cleanup.ts           # Old backup deletion
│   │   ├── databases.ts         # Database configuration
│   │   ├── alerting.ts          # Webhook notifications
│   │   └── utils.ts             # Helper functions
│   └── types.ts                 # TypeScript interfaces
├── migrations/
│   └── 001_backup_metadata.sql  # Metadata schema
├── wrangler.toml                # Worker configuration
├── package.json
├── tsconfig.json
├── PATINA-SPEC.md               # Full technical specification
└── README.md                    # This file
```

---

## Alerting

### Webhook Notifications

Patina sends webhook notifications for backup events:

**Success Notification** (if enabled):
```
Patina Backup Completed
Databases: 6/6 successful
Total Size: 1.25 MB
Duration: 25s
```

**Failure Notification:**
```
Patina Backup Partially Failed
Databases: 4/6 successful

Failed:
- scout-db: Timeout after 30s
- grove-engine-db: Connection refused
```

---

## Monitoring

### Key Metrics

- **Last successful backup:** Check `/status` endpoint
- **Backup size trends:** Monitor for dramatic changes
- **Failure rate:** Alert if multiple consecutive failures
- **Storage usage:** Track total R2 storage consumption

### Integration with GroveMonitor

Patina alerts integrate with broader Grove monitoring via webhooks:
- Backup completion status
- Performance metrics (duration, size)
- Failure alerts with error details

---

## Development

### Local Development

```bash
# Install dependencies
pnpm install

# Run migrations locally
wrangler d1 execute grove-patina-db --local --file=migrations/001_backup_metadata.sql

# Start dev server
pnpm dev

# Test endpoints
curl http://localhost:8787/status
```

### Tech Stack

- **Language:** TypeScript
- **Framework:** Cloudflare Workers (Hono for routing)
- **Storage:** Cloudflare R2 (backup storage), D1 (metadata tracking)
- **Key Libraries:** hono, @cloudflare/workers-types
- **Package Manager:** pnpm
- **Deployment:** wrangler CLI

---

## Additional Resources

- **Full Specification:** See [`PATINA-SPEC.md`](PATINA-SPEC.md)
- **Cloudflare Docs:** [D1 Database](https://developers.cloudflare.com/d1/) | [R2 Storage](https://developers.cloudflare.com/r2/)
- **Agent Workflows:** See [`AgentUsage/`](AgentUsage/)

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Last Updated:** 2025-12-31
**Status:** Development
**Maintained by:** AutumnsGrove
