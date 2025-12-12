# Cache - Automated Database Backup System

> **Internal codename:** GroveBackups

**Automated weekly backups of all Grove D1 databases to R2 storage**

*Squirrels cache acorns for winter — Cache runs weekly backups.*

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Overview

Cache is a Cloudflare Worker that automatically backs up all 9 Grove D1 databases to R2 storage every week. It provides SQL dump exports, 12-week retention, manual backup triggers, and disaster recovery tools.

**Key Features:**
- ⏰ **Automated weekly backups** - Every Sunday at 3:00 AM UTC
- 💾 **9 D1 databases** - groveauth, scout-db, grove-engine, grovemusic, and more
- 📦 **SQL dump format** - Portable, human-readable, easy to restore
- 🗄️ **12-week retention** - Automatic cleanup of old backups
- 🔄 **Manual triggers** - On-demand backups via API
- 📊 **Status dashboard** - View backup history and storage stats
- 🔔 **Discord alerts** - Notifications on backup failures
- 📖 **Restore guides** - Step-by-step recovery procedures

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Cache System                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    grove-backups (Worker)                        │
│                                                                  │
│  Cron Trigger: Every Sunday @ 3:00 AM UTC                       │
│  HTTP Endpoints: /status, /trigger, /download, /restore-guide   │
│                                                                  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   D1 Databases  │  │  grove-backups  │  │  grove-backups  │
│   (9 total)     │  │     (R2)        │  │     -db (D1)    │
│                 │  │                 │  │                 │
│ • groveauth     │  │ Backup Storage  │  │ Backup metadata │
│ • scout-db      │  │                 │  │ Job history     │
│ • grove-engine  │  │ /YYYY-MM-DD/    │  │ Alert config    │
│ • grovemusic    │  │   db-name.sql   │  │                 │
│ • library-*     │  │                 │  │                 │
│ • autumnsgrove-*│  │                 │  │                 │
│ • grove-domain  │  │                 │  │                 │
│ • your-site     │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Backup Flow:**
1. Cron triggers at 3 AM UTC every Sunday
2. Worker iterates through all 9 databases
3. For each DB: export schema + data to SQL
4. Upload to R2 with date-prefixed path (`YYYY-MM-DD/database-name.sql`)
5. Log results to `grove-backups-db` metadata database
6. Clean up backups older than 12 weeks
7. Send Discord alert if any failures occur

---

## 📦 Backed Up Databases

| Database | Priority | Estimated Size | Description |
|----------|----------|----------------|-------------|
| `groveauth` | Critical | 212 KB | Authentication, users, sessions, OAuth |
| `scout-db` | Critical | 364 KB | GroveScout searches, credits, referrals |
| `grove-engine-db` | High | 180 KB | Core engine, CDN files, signups |
| `autumnsgrove-posts` | High | 118 KB | Blog posts |
| `grovemusic-db` | Normal | 98 KB | GroveMusic data |
| `library-enhancer-db` | Normal | 679 KB | Library enhancer data |
| `autumnsgrove-git-stats` | Normal | 335 KB | Git statistics |
| `grove-domain-jobs` | Normal | 45 KB | Domain search jobs |
| `your-site-posts` | Normal | 12 KB | Site posts |

**Total:** ~2.1 MB per full backup
**Retention:** 12 weeks × 9 databases = 108 backup files (~25 MB total storage)

---

## 🌐 API Endpoints

### `GET /`
Worker information and documentation.

```json
{
  "name": "Cache",
  "version": "1.0.0",
  "description": "Automated D1 database backup system for Grove",
  "schedule": "Every Sunday at 3:00 AM UTC",
  "retention": "12 weeks",
  "databases": 9
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
    "successful": 9,
    "failed": 0,
    "totalSize": "2.1 MB",
    "duration": "45s"
  },
  "nextScheduled": "2024-12-15T03:00:00Z",
  "storage": {
    "totalBackups": 108,
    "totalSize": "25.2 MB",
    "oldestBackup": "2024-09-15",
    "newestBackup": "2024-12-08"
  }
}
```

### `GET /list`
List all available backups with filtering.

**Query Parameters:**
- `?database=groveauth` - Filter by database
- `?date=2024-12-08` - Filter by date
- `?limit=20` - Limit results

```json
{
  "backups": [
    {
      "database": "groveauth",
      "date": "2024-12-08",
      "r2Key": "2024-12-08/groveauth.sql",
      "size": "212 KB",
      "tables": 15,
      "rows": 1234,
      "createdAt": "2024-12-08T03:00:45Z",
      "expiresAt": "2024-03-02T03:00:45Z"
    }
  ],
  "total": 108,
  "filtered": 12
}
```

### `POST /trigger`
Manually trigger a backup job.

**Request:**
```json
{
  "databases": ["groveauth", "scout-db"],
  "reason": "Pre-deployment backup"
}
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "started",
  "databases": 9,
  "message": "Backup job started. Check /status for progress."
}
```

### `GET /download/:date/:db`
Download a specific backup file.

**Example:**
```bash
curl -O https://backups.grove.place/download/2024-12-08/groveauth
```

Returns SQL file with `Content-Type: application/sql`.

### `GET /restore-guide/:db`
Get restore instructions for a specific database.

Returns step-by-step recovery procedures including wrangler CLI commands and D1 Time Travel options.

---

## 🚀 Deployment

### Prerequisites

1. **Create R2 bucket:**
   ```bash
   wrangler r2 bucket create grove-backups
   ```

2. **Create metadata database:**
   ```bash
   wrangler d1 create grove-backups-db
   # Copy the database_id and update wrangler.toml
   ```

3. **Run migrations:**
   ```bash
   wrangler d1 execute grove-backups-db --file=migrations/001_backup_metadata.sql
   ```

4. **Set Discord webhook (optional):**
   ```bash
   wrangler secret put DISCORD_WEBHOOK_URL
   ```

### Deploy Worker

```bash
cd packages/backups
pnpm install
pnpm deploy
```

### Verify Deployment

```bash
# Check status
curl https://grove-backups.YOUR_SUBDOMAIN.workers.dev/status

# Trigger manual test backup
curl -X POST https://grove-backups.YOUR_SUBDOMAIN.workers.dev/trigger

# Tail logs
wrangler tail grove-backups
```

---

## 🔧 Configuration

### Backup Schedule
Configured in `wrangler.toml`:
```toml
[triggers]
crons = ["0 3 * * 0"]  # Every Sunday at 3:00 AM UTC
```

### Retention Policy
Configured in `src/lib/databases.ts`:
```typescript
export const BACKUP_CONFIG = {
  retentionWeeks: 12,  // Keep 12 weeks of backups
  concurrency: 3,      // Max concurrent exports
  exportTimeout: 30000 // 30 second timeout per DB
};
```

### Alert Settings
Configure via environment variables in `wrangler.toml`:
```toml
[vars]
RETENTION_WEEKS = "12"
ALERT_ON_SUCCESS = "false"
ALERT_ON_FAILURE = "true"
```

---

## 📖 Recovery Procedures

### Full Database Restore

```bash
# 1. Download the backup
curl -o restore.sql https://backups.grove.place/download/2024-12-08/groveauth

# 2. Review the file (important!)
head -100 restore.sql
tail -20 restore.sql

# 3. Execute against D1
wrangler d1 execute groveauth --file=restore.sql

# 4. Verify restoration
wrangler d1 execute groveauth --command="SELECT COUNT(*) FROM users"
```

### Using D1 Time Travel (Preferred for Recent Data)

D1 Time Travel is available for the last 30 days and is faster than SQL restore:

```bash
# Check available restore points
wrangler d1 time-travel info groveauth

# Restore to specific timestamp
wrangler d1 time-travel restore groveauth --timestamp="2024-12-08T10:00:00Z"

# Or restore to bookmark
wrangler d1 time-travel restore groveauth --bookmark="<bookmark-id>"
```

### Partial Restore (Single Table)

```bash
# 1. Download backup
curl https://backups.grove.place/download/2024-12-08/groveauth > full-backup.sql

# 2. Extract specific table (example: users table)
grep -A 1000 "-- Table: users" full-backup.sql | grep -B 1000 "-- Table:" > users-only.sql

# 3. Execute
wrangler d1 execute groveauth --file=users-only.sql
```

---

## 📁 Project Structure

```
packages/backups/
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
├── GROVEBACKUPS-SPEC.md         # Full technical specification
└── README.md                     # This file
```

---

## 🔔 Alerting

### Discord Notifications

Cache sends Discord webhook notifications for backup events:

**Success Notification** (if enabled):
```
✅ Cache Backup Completed
Databases: 9/9 successful
Total Size: 2.1 MB
Duration: 45s
```

**Failure Notification:**
```
⚠️ Cache Backup Partially Failed
Databases: 7/9 successful
Total Size: 1.8 MB
Duration: 52s

Failed:
• scout-db: Timeout after 30s
• grovemusic-db: Connection refused
```

### Configure Alerting

```bash
# Set webhook URL
wrangler secret put DISCORD_WEBHOOK_URL

# Configure alert preferences in wrangler.toml
[vars]
ALERT_ON_SUCCESS = "false"  # Only alert on failures
ALERT_ON_FAILURE = "true"
```

---

## 📊 Monitoring

### Key Metrics

- **Last successful backup:** Check `/status` endpoint
- **Backup size trends:** Monitor for dramatic changes (possible data loss)
- **Failure rate:** Alert if multiple consecutive failures
- **Storage usage:** Track total R2 storage consumption

### Integration with GroveMonitor

Once GroveMonitor is deployed, these metrics will be exposed:
- `backup_last_success_timestamp` - When last backup succeeded
- `backup_last_duration_ms` - How long it took
- `backup_total_size_bytes` - Current storage usage
- `backup_failures_24h` - Recent failure count

GroveMonitor can alert if:
- No successful backup in 8+ days
- Backup size changed dramatically
- Multiple consecutive failures

---

## 🧪 Testing

### Test Export Logic

```bash
# Test with smallest database first
wrangler dev
curl http://localhost:8787/trigger -X POST -d '{"databases": ["your-site-posts"]}'
```

### Verify Backup Integrity

```bash
# Download and inspect
curl https://backups.grove.place/download/2024-12-08/groveauth > test.sql

# Check format
head -50 test.sql
grep -c "INSERT INTO" test.sql
grep "Backup Complete" test.sql
```

### Test Restore

```bash
# Create test database
wrangler d1 create test-restore

# Restore backup
wrangler d1 execute test-restore --file=test.sql

# Verify data
wrangler d1 execute test-restore --command="SELECT COUNT(*) FROM users"
```

---

## 📝 Development

### Local Development

```bash
# Install dependencies
pnpm install

# Run migrations locally
wrangler d1 execute grove-backups-db --local --file=migrations/001_backup_metadata.sql

# Start dev server
pnpm dev

# Test endpoints
curl http://localhost:8787/status
curl -X POST http://localhost:8787/trigger
```

### Tech Stack

- **Language:** TypeScript
- **Framework:** Cloudflare Workers (Hono for routing)
- **Storage:** Cloudflare R2 (backup storage), D1 (metadata tracking)
- **Key Libraries:** hono, @cloudflare/workers-types
- **Package Manager:** pnpm
- **Deployment:** wrangler CLI

### Project Instructions

This project uses structured agent workflows. See:
- **`AGENT.md`** - Main project instructions and workflows
- **`GROVEBACKUPS-SPEC.md`** - Complete technical specification
- **`AgentUsage/`** - Detailed workflow guides and best practices

---

## 🔐 Security

- **No authentication required for read-only endpoints** (`/status`, `/list`)
- **Manual trigger endpoint** should be protected with Cloudflare Access or API keys (TODO)
- **Discord webhook URL** stored as Wrangler secret (not in code)
- **Backup downloads** include full database contents - protect the worker URL

### Recommended: Add Authentication

```toml
# wrangler.toml - Example Cloudflare Access configuration
[env.production]
routes = [
  { pattern = "backups.grove.place/*", zone_name = "grove.place" }
]

# Then configure Cloudflare Access rules for /trigger and /download endpoints
```

---

## 📋 Implementation Checklist

- [ ] Phase 1: Core Infrastructure
  - [ ] Create R2 bucket `grove-backups`
  - [ ] Create D1 database `grove-backups-db`
  - [ ] Run migrations
  - [ ] Set up project structure

- [ ] Phase 2: Export Logic
  - [ ] Implement SQL dump exporter
  - [ ] Handle all data types correctly
  - [ ] Add batch processing for large tables
  - [ ] Include metadata headers

- [ ] Phase 3: Scheduled Handler
  - [ ] Implement cron handler
  - [ ] Iterate through all databases
  - [ ] Upload to R2 with date prefix
  - [ ] Log results to metadata DB

- [ ] Phase 4: API Endpoints
  - [ ] GET / (documentation)
  - [ ] GET /status
  - [ ] GET /list
  - [ ] POST /trigger
  - [ ] GET /download/:date/:db
  - [ ] GET /restore-guide/:db

- [ ] Phase 5: Cleanup & Alerting
  - [ ] Implement 12-week retention cleanup
  - [ ] Add Discord webhook support
  - [ ] Configure alert thresholds

- [ ] Phase 6: Testing & Docs
  - [ ] Test full backup cycle
  - [ ] Test restore process
  - [ ] Add to GroveEngine docs

---

## 📚 Additional Resources

- **Full Specification:** See [`GROVEBACKUPS-SPEC.md`](GROVEBACKUPS-SPEC.md) for complete technical details
- **Cloudflare Docs:** [D1 Database](https://developers.cloudflare.com/d1/) | [R2 Storage](https://developers.cloudflare.com/r2/) | [Workers](https://developers.cloudflare.com/workers/)
- **Agent Workflows:** See [`AgentUsage/`](AgentUsage/) for development guides

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

**Last Updated:** 2024-12-09
**Status:** Planning/Development
**Maintained by:** AutumnsGrove
