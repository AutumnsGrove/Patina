# GroveBackups - Implementation TODO List

## Phase 1: Core Infrastructure ✅ (Complete)
- [x] Create project directory structure
- [x] Set up TypeScript configuration
- [x] Create wrangler.toml with D1/R2 bindings
- [x] Create database migration file
- [x] Create R2 bucket `grove-backups`
- [x] Create D1 database `grove-backups-db` (ID: 4ad25abc-f972-4159-ac81-578806709275)
- [x] Run migrations on grove-backups-db (4 tables: backup_jobs, backup_results, backup_inventory, alert_config)
- [x] Update wrangler.toml with database_id
- [x] Add 3 new databases to backup config (amber, mycelium-oauth, ivy-db) - now 12 total

## Phase 2: Export Logic ✅ (Complete)
- [x] Implement SQL export in `exporter.ts`
  - [x] Query sqlite_master for table schemas
  - [x] Handle all SQLite data types correctly
  - [x] Implement batch processing for large tables (1000 rows/batch)
  - [x] Add proper SQL escaping for strings
  - [x] Include header/footer metadata in dumps
  - [x] Test with small database first (your-site-posts)
- [x] Create utility functions in `utils.ts`
  - [x] formatSqlValue() for data type conversion
  - [x] formatBytes() for human-readable sizes
  - [x] generateJobId() for UUID generation

## Phase 3: Scheduled Handler ✅ (Complete)
- [x] Implement cron handler in `scheduled.ts`
  - [x] Iterate through all 12 databases from config
  - [x] Call exporter for each database
  - [x] Upload SQL dumps to R2 with date prefix
  - [x] Log results to metadata DB
  - [x] Handle errors gracefully (continue on failure)
  - [x] Run cleanup after all backups complete
- [x] Test with manual trigger first
- [x] Verify cron schedule triggers correctly

## Phase 4: API Endpoints ✅ (Partial - Core Complete)
- [x] Implement route handlers:
  - [x] GET / - Worker info and documentation
  - [ ] GET /status - Current status and recent history (stub)
  - [ ] GET /list - List all available backups with filtering (stub)
  - [x] POST /trigger - Manual backup trigger
  - [x] GET /download/:date/:db - Download specific backup
  - [ ] GET /restore-guide/:db - Restore instructions (stub)
- [x] Add request validation
- [x] Add proper error responses
- [ ] Test all endpoints

## Phase 5: Cleanup & Alerting ✅ (Complete)
- [x] Implement cleanup logic in `cleanup.ts`
  - [x] Query backups older than 12 weeks
  - [x] Delete from R2
  - [x] Mark as deleted in inventory
  - [x] Return cleanup statistics
- [x] Implement alerting in `alerting.ts`
  - [x] Format Discord webhook messages
  - [x] Send on failure (always)
  - [x] Send on success (configurable)
  - [x] Handle webhook errors gracefully
- [ ] Set Discord webhook URL via wrangler secret
- [ ] Test webhook formatting

## Phase 6: Testing & Documentation
- [x] Test full backup cycle end-to-end
- [ ] Test restore process with downloaded backup
- [ ] Test cleanup of old backups
- [x] Test manual trigger endpoint
- [x] Verify all 12 databases backup successfully
- [ ] Write project README.md
- [ ] Document deployment steps
- [ ] Add restore procedures documentation
- [ ] Add troubleshooting guide

## Phase 7: Monitoring & Integration
- [x] Deploy to production
- [ ] Monitor first scheduled run
- [x] Verify backups appear in R2
- [ ] Set up alerting channel (Discord)
- [ ] Plan GroveMonitor integration
  - [ ] Expose backup metrics
  - [ ] Add health check endpoint
  - [ ] Configure alerts for backup failures

## Nice-to-Have Features (Future)
- [ ] Backup comparison (detect schema changes)
- [ ] Selective restore (single table)
- [ ] Backup encryption
- [ ] Compression for large backups
- [ ] Email notifications (in addition to Discord)
- [ ] Web dashboard for backup history
- [ ] Backup validation (test restore in isolated environment)

## Future: R2 Bucket Backups
**Critical R2 buckets to back up:** `grove-media`, `grove-storage`, `ivy-storage`, `autumnsgrove-images`

- [ ] Identify which R2 buckets need backup (critical vs regenerable cache)
- [ ] Add R2 source bucket bindings to wrangler.toml (read-only)
- [ ] Implement R2-to-R2 copy logic in `src/lib/r2-backup.ts`
  - [ ] List objects in source bucket
  - [ ] Copy to grove-backups with path: `r2/YYYY-MM-DD/bucket-name/original-key`
  - [ ] Handle large buckets with batching (Worker CPU limits)
- [ ] Add R2 backup results to metadata tracking
- [ ] Update scheduled handler to include R2 backups
- [ ] Consider retention policy for R2 backups (larger storage footprint)

## Future: Durable Objects Backups
- [ ] Document which workers use Durable Objects and what data they store
- [ ] Identify critical DO data that needs backup
- [ ] Implement export endpoints in each DO class
- [ ] Add DO backup integration to Cache worker
- [ ] Design recovery procedures for DO data

---

**Status**: Core D1 backup system is LIVE and working!
**First successful backup**: 2026-01-02 - 12/12 databases, ~1.1 MB total
**Next Step**: Complete remaining API endpoints (/status, /list, /restore-guide)
