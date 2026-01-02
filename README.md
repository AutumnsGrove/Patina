# Cache - Automated Database Backup System

> **Internal codename:** GroveBackups

**LIVE: Automated weekly backups of all Grove D1 databases to R2 storage**

*Squirrels cache acorns for winter — Cache runs weekly backups.*

[![Status](https://img.shields.io/badge/Status-LIVE-brightgreen)](https://grove-backups.m7jv4v7npb.workers.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Status: LIVE

**First successful backup:** January 2, 2026
**Worker URL:** https://grove-backups.m7jv4v7npb.workers.dev
**Schedule:** Every Sunday at 3:00 AM UTC

| Metric | Value |
|--------|-------|
| Databases backed up | 12/12 |
| Total backup size | ~1.1 MB |
| Backup duration | ~14 seconds |
| Retention period | 12 weeks |

---

## Overview

Cache is a Cloudflare Worker that automatically backs up all 12 Grove D1 databases to R2 storage every week. It provides SQL dump exports, 12-week retention, manual backup triggers, and disaster recovery tools.

**Key Features:**
- **Automated weekly backups** - Every Sunday at 3:00 AM UTC
- **12 D1 databases** - groveauth, scout-db, grove-engine, and 9 more
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
│  Cron Trigger: Every Sunday @ 3:00 AM UTC                       │
│  HTTP Endpoints: /status, /trigger, /download, /list            │
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
│ • groveauth     │  │ Backup Storage  │  │ Backup metadata │
│ • scout-db      │  │                 │  │ Job history     │
│ • grove-engine  │  │ /YYYY-MM-DD/    │  │ Inventory       │
│ • + 9 more      │  │   db-name.sql   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Backup Flow:**
1. Cron triggers at 3 AM UTC every Sunday
2. Worker iterates through all 12 databases
3. For each DB: export schema + data to SQL (batch processing)
4. Upload to R2 with date-prefixed path (`YYYY-MM-DD/database-name.sql`)
5. Log results to `grove-backups-db` metadata database
6. Clean up backups older than 12 weeks
7. Send Discord alert if any failures occur

---

## Backed Up Databases

| Database | Priority | Size | Tables | Rows | Description |
|----------|----------|------|--------|------|-------------|
| `library-enhancer-db` | Normal | 629 KB | 6 | 1184 | Library enhancer data |
| `autumnsgrove-git-stats` | Normal | 129 KB | 19 | 66 | Git statistics |
| `grove-engine-db` | High | 107 KB | 17 | 239 | Core engine, CDN files |
| `groveauth` | Critical | 103 KB | 15 | 267 | Auth, users, sessions |
| `autumnsgrove-posts` | High | 69 KB | 2 | 9 | Blog posts |
| `scout-db` | Critical | 33 KB | 18 | 26 | GroveScout searches |
| `amber` | Normal | 9.7 KB | 4 | 22 | Amber app data |
| `grove-domain-jobs` | Normal | 9.5 KB | 2 | 24 | Domain search jobs |
| `ivy-db` | Normal | 3.6 KB | 9 | 2 | Ivy app data |
| `grovemusic-db` | Normal | 3.6 KB | 5 | 0 | GroveMusic data |
| `mycelium-oauth` | High | 888 B | 1 | 0 | OAuth system |
| `your-site-posts` | Normal | 475 B | 0 | 0 | Site posts |

**Total:** ~1.1 MB per full backup
**Retention:** 12 weeks × 12 databases = 144 backup files

---

## API Endpoints

### `GET /`
Worker information and documentation.

### `POST /trigger`
Manually trigger a backup job.

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
crons = ["0 3 * * SUN"]  # Every Sunday at 3:00 AM UTC

[vars]
RETENTION_WEEKS = "12"
ALERT_ON_SUCCESS = "false"
ALERT_ON_FAILURE = "true"
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
- [ ] **Phase 6:** Documentation & polish
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
