# Cache - Automated Database Backup System

> **Internal codename:** GroveBackups

**LIVE: Automated daily & weekly backups of all Grove D1 databases to R2 storage**

*Squirrels cache acorns for winter — Cache protects your data daily.*

[![Status](https://img.shields.io/badge/Status-LIVE-brightgreen)](https://grove-backups.m7jv4v7npb.workers.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Status: LIVE

**First successful backup:** January 2, 2026
**Worker URL:** https://grove-backups.m7jv4v7npb.workers.dev

| Metric | Value |
|--------|-------|
| Databases backed up | 12 |
| Daily backup databases | 2 (groveauth, grove-engine-db) |
| Total backup size | ~1.1 MB |
| Backup duration | ~14 seconds |
| Retention period | 12 weeks |

### Backup Schedule

| Schedule | Time (UTC) | Databases |
|----------|------------|-----------|
| **Daily** | 3:00 AM | groveauth, grove-engine-db |
| **Weekly** | Sunday 4:00 AM | All 12 databases |

---

## Overview

Cache is a Cloudflare Worker that automatically backs up Grove D1 databases to R2 storage. Priority databases (auth, core engine) are backed up daily, while all databases receive weekly full backups.

**Key Features:**
- **Daily priority backups** - Critical databases backed up every day at 3 AM UTC
- **Weekly full backups** - All 12 databases every Sunday at 4 AM UTC
- **12 D1 databases** - groveauth, grove-engine-db, scout-db, and 9 more
- **SQL dump format** - Portable, human-readable, easy to restore
- **12-week retention** - Automatic cleanup of old backups
- **Manual triggers** - On-demand backups via API
- **Discord alerts** - Notifications on backup failures
- **Download backups** - Direct SQL file downloads

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Cache System                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    grove-backups (Worker)                        │
│                                                                  │
│  Cron Triggers:                                                  │
│    • Daily @ 3:00 AM UTC  → Priority DBs (groveauth, grove-engine)│
│    • Sunday @ 4:00 AM UTC → All 12 databases                     │
│                                                                  │
│  HTTP Endpoints: /, /trigger, /download, /status, /list         │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   D1 Databases  │  │  grove-backups  │  │  grove-backups  │
│   (12 total)    │  │     (R2)        │  │     -db (D1)    │
│                 │  │                 │  │                 │
│ • groveauth  ⚡ │  │ Backup Storage  │  │ Backup metadata │
│ • grove-engine ⚡│  │                 │  │ Job history     │
│ • scout-db      │  │ /YYYY-MM-DD/    │  │ Inventory       │
│ • + 9 more      │  │   db-name.sql   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

⚡ = Daily backup enabled
```

**Backup Flow:**
1. Cron triggers (daily for priority DBs, weekly for all)
2. Worker determines which databases to back up based on trigger
3. For each DB: export schema + data to SQL (batch processing)
4. Upload to R2 with date-prefixed path (`YYYY-MM-DD/database-name.sql`)
5. Log results to `grove-backups-db` metadata database
6. Clean up backups older than 12 weeks
7. Send Discord alert if any failures occur

---

## Backed Up Databases

| Database | Schedule | Size | Tables | Rows | Description |
|----------|----------|------|--------|------|-------------|
| `groveauth` | **Daily** | 103 KB | 15 | 267 | Auth, users, sessions |
| `grove-engine-db` | **Daily** | 107 KB | 17 | 239 | Core engine, CDN files |
| `scout-db` | Weekly | 33 KB | 18 | 26 | GroveScout searches |
| `library-enhancer-db` | Weekly | 629 KB | 6 | 1184 | Library enhancer data |
| `autumnsgrove-git-stats` | Weekly | 129 KB | 19 | 66 | Git statistics |
| `autumnsgrove-posts` | Weekly | 69 KB | 2 | 9 | Blog posts |
| `amber` | Weekly | 9.7 KB | 4 | 22 | Amber app data |
| `grove-domain-jobs` | Weekly | 9.5 KB | 2 | 24 | Domain search jobs |
| `ivy-db` | Weekly | 3.6 KB | 9 | 2 | Ivy app data |
| `grovemusic-db` | Weekly | 3.6 KB | 5 | 0 | GroveMusic data |
| `mycelium-oauth` | Weekly | 888 B | 1 | 0 | OAuth system |
| `your-site-posts` | Weekly | 475 B | 0 | 0 | Site posts |

**Total:** ~1.1 MB per full backup
**Retention:** 12 weeks

To enable daily backups for a database, set `dailyBackup: true` in `src/lib/databases.ts`.

---

## API Endpoints

### `GET /`
Worker information and documentation.

### `POST /trigger`
Manually trigger a full backup job (all 12 databases).

```bash
curl -X POST https://grove-backups.m7jv4v7npb.workers.dev/trigger
```

Response:
```json
{
  "jobId": "d91fff2b-1497-425a-9d63-4b0e4bdb03fc",
  "status": "started",
  "databases": 12,
  "message": "Backup job started for 12 database(s). Check /status for progress."
}
```

### `GET /download/:date/:db`
Download a specific backup file.

```bash
curl -O https://grove-backups.m7jv4v7npb.workers.dev/download/2026-01-02/groveauth
```

Returns SQL file with proper headers for download.

### `GET /status`
Current backup status and recent history. *(stub - returns placeholder)*

### `GET /list`
List all available backups. *(stub - returns placeholder)*

---

## Quick Start

### Download a Backup
```bash
curl -o groveauth-backup.sql https://grove-backups.m7jv4v7npb.workers.dev/download/2026-01-02/groveauth
```

### Trigger Manual Backup
```bash
curl -X POST https://grove-backups.m7jv4v7npb.workers.dev/trigger
```

### Restore from Backup
```bash
# Download backup
curl -o restore.sql https://grove-backups.m7jv4v7npb.workers.dev/download/2026-01-02/groveauth

# Restore to D1
wrangler d1 execute groveauth --file=restore.sql

# Verify
wrangler d1 execute groveauth --command="SELECT COUNT(*) FROM users"
```

---

## SQL Dump Format

Backups are human-readable SQL files:

```sql
-- ================================================
-- Grove Backup: groveauth
-- Generated: 2026-01-02T14:00:10.660Z
-- Job ID: d91fff2b-1497-425a-9d63-4b0e4bdb03fc
-- Tables: 15
-- ================================================

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- Table: users
-- Rows: 150
DROP TABLE IF EXISTS "users";
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  ...
);

INSERT INTO "users" ("id", "email", ...) VALUES ('usr_123', 'user@example.com', ...);
...

COMMIT;
PRAGMA foreign_keys=ON;

-- ================================================
-- Backup Complete
-- Duration: 1.373s
-- Total Rows: 267
-- ================================================
```

---

## Configuration

### wrangler.toml
```toml
[triggers]
crons = ["0 3 * * *", "0 4 * * SUN"]  # Daily priority + Weekly full

[vars]
RETENTION_WEEKS = "12"
ALERT_ON_SUCCESS = "false"
ALERT_ON_FAILURE = "true"
```

### Adding Daily Backups
Edit `src/lib/databases.ts` and add `dailyBackup: true` to any database:

```typescript
{
  name: 'groveauth',
  id: '45eae4c7-...',
  binding: 'GROVEAUTH_DB',
  description: 'Authentication, users, sessions, OAuth',
  priority: 'critical',
  estimatedSize: '212 KB',
  dailyBackup: true,  // ← Enable daily backups
},
```

### Discord Alerts (Optional)
```bash
wrangler secret put DISCORD_WEBHOOK_URL
```

---

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm run typecheck

# Deploy
pnpm run deploy

# Tail logs
wrangler tail grove-backups
```

---

## Implementation Status

- [x] **Phase 1:** Infrastructure (R2 bucket, D1 metadata DB, migrations)
- [x] **Phase 2:** SQL exporter (batch processing, escaping, metadata)
- [x] **Phase 3:** Scheduled handler (full backup workflow)
- [x] **Phase 4:** Core API endpoints (/, /trigger, /download)
- [x] **Phase 5:** Cleanup & alerting (12-week retention, Discord)
- [x] **Phase 6:** Daily priority backups (groveauth, grove-engine-db)
- [ ] **Future:** Complete /status and /list endpoints
- [ ] **Future:** R2 bucket backups
- [ ] **Future:** Durable Objects backups

---

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **Language:** TypeScript
- **Storage:** R2 (backups), D1 (metadata)
- **Package Manager:** pnpm

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Last Updated:** 2026-01-02
**Status:** LIVE
**Maintained by:** AutumnsGrove
