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
- **API key authentication** - Protected endpoints require authorization
- **12 D1 databases** - groveauth, grove-engine-db, scout-db, and 9 more
- **SQL dump format** - Portable, human-readable, easy to restore
- **12-week retention** - Automatic cleanup of old backups
- **Manual triggers** - On-demand backups via API
- **Health monitoring** - `/health` endpoint for uptime checks

---

## Authentication

Protected endpoints require an API key in the `Authorization` header:

```bash
curl -H "Authorization: Bearer <API_KEY>" https://grove-backups.m7jv4v7npb.workers.dev/status
```

### Setting Up API Key

Generate and set a secure API key:

```bash
# Generate secure key (same method as GroveAuth)
API_KEY=$(openssl rand -base64 32)
echo $API_KEY  # Save this!

# Set as Cloudflare secret
echo $API_KEY | wrangler secret put API_KEY
```

### Endpoint Access

| Endpoint | Auth Required |
|----------|---------------|
| `GET /` | No |
| `GET /health` | No |
| `GET /status` | **Yes** |
| `GET /list` | **Yes** |
| `POST /trigger` | **Yes** |
| `GET /download/:date/:db` | **Yes** |
| `GET /restore-guide/:db` | **Yes** |

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
│  HTTP Endpoints: /, /health, /status, /list, /trigger, /download │
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

---

## Backed Up Databases

| Database | Schedule | Size | Tables | Description |
|----------|----------|------|--------|-------------|
| `groveauth` | **Daily** | 103 KB | 15 | Auth, users, sessions |
| `grove-engine-db` | **Daily** | 107 KB | 17 | Core engine, CDN files |
| `scout-db` | Weekly | 33 KB | 18 | GroveScout searches |
| `library-enhancer-db` | Weekly | 629 KB | 6 | Library enhancer data |
| `autumnsgrove-git-stats` | Weekly | 129 KB | 19 | Git statistics |
| `autumnsgrove-posts` | Weekly | 69 KB | 2 | Blog posts |
| `amber` | Weekly | 9.7 KB | 4 | Amber app data |
| `grove-domain-jobs` | Weekly | 9.5 KB | 2 | Domain search jobs |
| `ivy-db` | Weekly | 3.6 KB | 9 | Ivy app data |
| `grovemusic-db` | Weekly | 3.6 KB | 5 | GroveMusic data |
| `mycelium-oauth` | Weekly | 888 B | 1 | OAuth system |
| `your-site-posts` | Weekly | 475 B | 0 | Site posts |

**Total:** ~1.1 MB per full backup | **Retention:** 12 weeks

---

## API Endpoints

### Public Endpoints

#### `GET /`
Worker information and documentation.

#### `GET /health`
Health check for monitoring. Returns worker, DB, and R2 status.

```bash
curl https://grove-backups.m7jv4v7npb.workers.dev/health
```

### Protected Endpoints

All protected endpoints require: `Authorization: Bearer <API_KEY>`

#### `GET /status`
Current backup status, last backup info, and recent job history.

```bash
curl -H "Authorization: Bearer $API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/status
```

#### `GET /list`
List all available backups with optional filtering.

```bash
# List all backups
curl -H "Authorization: Bearer $API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/list

# Filter by database
curl -H "Authorization: Bearer $API_KEY" \
  "https://grove-backups.m7jv4v7npb.workers.dev/list?database=groveauth"

# Filter by date
curl -H "Authorization: Bearer $API_KEY" \
  "https://grove-backups.m7jv4v7npb.workers.dev/list?date=2026-01-02"
```

#### `POST /trigger`
Manually trigger a full backup job.

```bash
curl -X POST -H "Authorization: Bearer $API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/trigger
```

#### `GET /download/:date/:db`
Download a specific backup file.

```bash
curl -H "Authorization: Bearer $API_KEY" \
  -o groveauth-backup.sql \
  https://grove-backups.m7jv4v7npb.workers.dev/download/2026-01-02/groveauth
```

#### `GET /restore-guide/:db`
Get restore instructions and available backups for a database.

```bash
curl -H "Authorization: Bearer $API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/restore-guide/groveauth
```

---

## Quick Start

### Check System Health
```bash
curl https://grove-backups.m7jv4v7npb.workers.dev/health
```

### View Backup Status
```bash
curl -H "Authorization: Bearer $API_KEY" \
  https://grove-backups.m7jv4v7npb.workers.dev/status
```

### Download a Backup
```bash
curl -H "Authorization: Bearer $API_KEY" \
  -o groveauth-backup.sql \
  https://grove-backups.m7jv4v7npb.workers.dev/download/2026-01-02/groveauth
```

### Restore from Backup
```bash
# 1. Download backup
curl -H "Authorization: Bearer $API_KEY" \
  -o restore.sql \
  https://grove-backups.m7jv4v7npb.workers.dev/download/2026-01-02/groveauth

# 2. Review the SQL file (recommended)
head -50 restore.sql

# 3. Restore to D1 (WARNING: replaces all data!)
wrangler d1 execute groveauth --file=restore.sql

# 4. Verify
wrangler d1 execute groveauth --command="SELECT COUNT(*) FROM users"
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

### Secrets
```bash
# API key for endpoint authentication (required)
wrangler secret put API_KEY

# Discord webhook for failure alerts (optional)
wrangler secret put DISCORD_WEBHOOK_URL
```

### Adding Daily Backups
Edit `src/lib/databases.ts` and add `dailyBackup: true`:

```typescript
{
  name: 'groveauth',
  binding: 'GROVEAUTH_DB',
  dailyBackup: true,  // ← Enable daily backups
},
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
- [x] **Phase 5:** Cleanup & alerting (12-week retention)
- [x] **Phase 6:** Daily priority backups (groveauth, grove-engine-db)
- [x] **Phase 7:** Full API (/status, /list, /restore-guide, /health) + Auth
- [ ] **Future:** R2 bucket backups
- [ ] **Future:** Durable Objects backups

---

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **Language:** TypeScript
- **Storage:** R2 (backups), D1 (metadata)
- **Auth:** API key (Bearer token)
- **Package Manager:** pnpm

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Last Updated:** 2026-01-02
**Status:** LIVE
**Maintained by:** AutumnsGrove
