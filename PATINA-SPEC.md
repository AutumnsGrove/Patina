# Patina - Automated Database Backup System: Complete Specification

## Project Overview

**Public Name:** Patina
**Internal Codename:** GrovePatina
**Repository:** AutumnsGrove/Patina
**URL:** patina.grove.place
**Purpose:** "Automated nightly backups of all Grove D1 databases to R2"
**Stack:** Cloudflare Workers + D1 + R2

The system embodies the philosophy: "Age as armor. Time as protection."

---

## Core Goals

1. Automated nightly backups of all 6 D1 databases
2. Weekly meta-backups compressing 7 daily backups into single archives
3. SQL dump format for portability and human readability
4. 12-week retention with automatic cleanup
5. Manual trigger capability for on-demand backups
6. Status dashboard showing backup history
7. Comprehensive restore documentation
8. Webhook-based alerting on failures

---

## Architecture

### System Components

The system operates through three interconnected services:

- **grove-patina (Worker):** Orchestrates backups via cron triggers and HTTP endpoints
- **grove-patina (R2 Bucket):** Stores SQL exports organized by date
- **grove-patina-db (D1):** Maintains metadata, job history, and alert configuration

### Backup Flows

**Nightly Backup (3:00 AM UTC):**
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

**Timing Dependencies:**
Nightly backup duration: 15-30 minutes for 6 databases. Meta-backup starts 1 hour later. System checks for running jobs before meta-backup; skips if nightly still executing with alert notification.

---

## Database Registry

### Supported Databases

| Name | Priority | Size | Purpose |
|------|----------|------|---------|
| groveauth | critical | 212 KB | Authentication, OAuth (Heartwood) |
| scout-db | critical | 364 KB | Searches, credits, referrals |
| grove-engine-db | critical | 180 KB | Core platform, multi-tenant data (Lattice) |
| autumnsgrove-posts | high | 118 KB | Blog posts |
| autumnsgrove-git-stats | normal | 335 KB | Git statistics |
| grove-domain-jobs | normal | 45 KB | Domain search jobs (Forage/Acorn) |

### Configuration

Each database has: name, UUID, Worker binding, description, priority level, estimated size.

The system supports dynamic expansion: add entries to DATABASES array, update wrangler.toml, verify via manual backup.

---

## Database Schema (grove-patina-db)

### backup_jobs
Tracks backup job execution with statuses (running, completed, failed), trigger type, database counts, sizes, and error messages.

### backup_results
Records individual database outcomes: success/failure status, R2 location, file size, table and row counts, duration, errors.

### backup_inventory
Maintains inventory of R2 backups including path, date, size, creation timestamp, and expiration date for cleanup tracking.

### alert_config
Stores webhook configuration: URL, enabled status, notification preferences (success/failure).

---

## SQL Export Format

Exports follow standard SQLite dump conventions:

```sql
-- Header with metadata (timestamp, job ID, table/row counts)
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
-- Per-table: DROP IF EXISTS, CREATE TABLE, INSERT statements
COMMIT;
PRAGMA foreign_keys=ON;
-- Footer with duration and size statistics
```

### Export Implementation

The `exportDatabase()` function:
- Queries sqlite_master for user tables (excludes Cloudflare internal tables)
- Exports schema creation statements
- Exports rows in 1000-row batches to manage Worker memory (128MB limit)
- Handles NULL values, numeric types, booleans, and binary data (hex encoding)
- Escapes string values for SQL safety
- Tracks table count, row count, size, and duration

---

## API Endpoints

### GET /
Root endpoint returning service information and status.

### GET /status
Returns current backup job status, including: active job metadata, last completed backup timestamp, next scheduled backup time.

### GET /list
Enumerates available backups organized by database and date, showing sizes and availability.

### POST /trigger
Initiates manual backup immediately for specified database or all databases.

### GET /download/:date/:db
Downloads SQL backup file for specific database and date.

### GET /restore-guide/:db
Returns markdown documentation with restore procedures for specified database.

---

## Alerting System

### Webhook Payloads

Sent to configured webhook URL on backup completion (success or failure).

**Structure:**
- Job ID and timestamp
- Status (success/failed)
- Database results with individual success/failure details
- Total statistics: duration, size, row counts
- Error messages if applicable

### Discord Format

Optional Discord-specific formatting for alerts including:
- Color coding (green=success, red=failure)
- Embedded fields for database results
- Expandable details for failures

---

## Cleanup Logic

### Metadata Reconciliation

Weekly cleanup process:

1. Query backup_inventory for expired backups (expires_at <= now)
2. Delete files from R2
3. Mark as deleted_at in inventory table
4. Remove orphaned backup_results entries
5. Compact indexes on metadata tables

Daily retention: 7 days of individual backups
Weekly retention: 12 weeks of archives

---

## wrangler.toml Configuration

Defines:
- Worker name and main script
- D1 database bindings (6 total + patina-db)
- R2 bucket binding (grove-patina)
- Cron triggers (nightly @ 3 AM, weekly @ 4 AM UTC)
- Environment variables for webhook URLs and configuration

---

## Deployment

### Prerequisites
- Cloudflare account with Workers enabled
- D1 databases created and IDs documented
- R2 bucket provisioned
- wrangler CLI installed

### Deploy Steps
1. Clone AutumnsGrove/Patina repository
2. Configure wrangler.toml with database IDs and R2 bucket
3. Run database migrations: `wrangler d1 migrations apply`
4. Deploy worker: `wrangler deploy`
5. Verify cron triggers and test manual backup endpoint

### Testing
- Trigger manual backup via POST /trigger
- Verify SQL export format in R2
- Check metadata database records
- Test download and restore endpoints
- Validate webhook alerts

---

## Implementation Checklist

**Phase 1: Core Infrastructure**
- Create metadata database schema
- Configure D1 bindings and R2 access
- Initialize Worker entry point

**Phase 2: Export Logic**
- Implement SQL exporter with batch processing
- Handle all SQLite data types
- Test with actual Grove databases

**Phase 3: Scheduled Handler**
- Build nightly cron handler with concurrent exports
- Implement weekly archive compression
- Add cleanup logic

**Phase 4: API Endpoints**
- Implement /status, /list, /trigger, /download endpoints
- Add authentication/authorization
- Return proper error responses

**Phase 5: Cleanup & Alerting**
- Implement R2 deletion and inventory reconciliation
- Add webhook notifications
- Build Discord formatter

**Phase 6: Testing & Documentation**
- Write comprehensive restore guides
- Create disaster recovery runbook
- Deploy to production with monitoring

---

## Recovery Procedures

### Full Database Restore
1. Download SQL backup from R2
2. Connect to target D1 database
3. Execute SQL statements in order
4. Verify row counts match backup metadata
5. Run application integration tests

### Partial Restore (Single Table)
1. Extract specific CREATE/INSERT statements from SQL
2. Drop corrupted table
3. Re-execute extracted statements
4. Validate foreign key consistency

### Using D1 Time Travel (Preferred for Recent Data)
Cloudflare D1 supports point-in-time recovery up to 7 days. Use this for corruption discovered within recent hours, as it's faster than SQL restore.

---

## Disaster Recovery Runbook (DEFCON 1)

### Severity Assessment
- **DEFCON 3:** Single database unavailable (restore from backup)
- **DEFCON 2:** Multiple databases corrupted (full restore from weekly archive)
- **DEFCON 1:** All backups corrupted or inaccessible (restore from external copies if available)

### Required Access
- Cloudflare dashboard access
- D1 database credentials
- R2 bucket access with delete permissions
- Webhook URL for alert notifications

### Full System Recovery Procedure

1. **Assessment:** Query backup_inventory for latest available backup
2. **Download:** Retrieve SQL from R2
3. **Validation:** Check backup header metadata, row counts
4. **Backup Current:** Export current (corrupted) state as emergency backup
5. **Restore:** Execute SQL in transaction, verify completion
6. **Verification:** Compare row counts, run data integrity checks
7. **Alert:** Notify stakeholders of recovery completion

### Expected Recovery Times
- Single database: 2-5 minutes
- All 6 databases: 15-30 minutes
- Full metadata reconstruction: 5-10 minutes

### If Backups Are Also Corrupted
1. Check for external copies (replicated to secondary storage)
2. Investigate backup job logs for corruption introduction time
3. Restore to version from before corruption timestamp
4. If no valid backup exists: rebuild from application source data (posts, stats) or accept data loss

---

## Integration with GroveMonitor

Patina alerts integrate with broader Grove monitoring via webhooks. GroveMonitor receives:
- Backup completion status
- Performance metrics (duration, size)
- Failure alerts with error details

### Alert Thresholds
- Notify on backup failures immediately
- Notify on duration exceeding 45 minutes
- Notify on backup size anomalies (>50% deviation from baseline)
- Daily summary of all backup activity

---

## Security Checklist

### Infrastructure Security
- R2 bucket: private access only
- D1 bindings: restricted to Worker IP
- Webhook URLs: encrypted in environment variables
- No backup data in Worker logs

### Operational Security
- SQL exports: exclude sensitive auth tokens (sanitize if needed)
- Backup retention: automatic deletion after 12 weeks
- Access logging: audit who downloads backups
- Encryption in transit: HTTPS for all downloads

### Incident Response
- Alert webhooks configured
- Recovery runbook documented
- Regular restore drills (monthly)
- Backup integrity verification (automatic checksums)

---

## Notes for Claude Code Implementation

1. **Memory Management:** Worker 128MB limit requires batched exports. Current batch size of 1,000 rows works for Grove tables; monitor if adding large JSON/blob columns.

2. **Concurrency Control:** 3 concurrent database exports prevents timeout. Adjust based on Worker CPU availability.

3. **Error Handling:** Comprehensive try-catch in each phase with rollback capability. Failed backups don't delete inventory entries.

4. **Testing Strategy:** Create test databases with known data. Verify export determinism (same data = same SQL).

5. **Monitoring:** Log all state changes to backup_jobs table. Query this for dashboards and alerting.

6. **Future Enhancements:** Differential backups (export only changed rows), compression ratio optimization, cross-region replication to secondary R2 bucket.
