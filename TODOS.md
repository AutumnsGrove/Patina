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

## Phase 2: Export Logic
- [ ] Implement SQL export in `exporter.ts`
  - [ ] Query sqlite_master for table schemas
  - [ ] Handle all SQLite data types correctly
  - [ ] Implement batch processing for large tables (1000 rows/batch)
  - [ ] Add proper SQL escaping for strings
  - [ ] Include header/footer metadata in dumps
  - [ ] Test with small database first (your-site-posts)
- [ ] Create utility functions in `utils.ts`
  - [ ] formatSqlValue() for data type conversion
  - [ ] formatBytes() for human-readable sizes
  - [ ] generateJobId() for UUID generation

## Phase 3: Scheduled Handler
- [ ] Implement cron handler in `scheduled.ts`
  - [ ] Iterate through all 12 databases from config
  - [ ] Call exporter for each database
  - [ ] Upload SQL dumps to R2 with date prefix
  - [ ] Log results to metadata DB
  - [ ] Handle errors gracefully (continue on failure)
  - [ ] Run cleanup after all backups complete
- [ ] Test with manual trigger first
- [ ] Verify cron schedule triggers correctly

## Phase 4: API Endpoints
- [ ] Implement route handlers:
  - [ ] GET / - Worker info and documentation
  - [ ] GET /status - Current status and recent history
  - [ ] GET /list - List all available backups with filtering
  - [ ] POST /trigger - Manual backup trigger
  - [ ] GET /download/:date/:db - Download specific backup
  - [ ] GET /restore-guide/:db - Restore instructions
- [ ] Add request validation
- [ ] Add proper error responses
- [ ] Test all endpoints

## Phase 5: Cleanup & Alerting
- [ ] Implement cleanup logic in `cleanup.ts`
  - [ ] Query backups older than 12 weeks
  - [ ] Delete from R2
  - [ ] Mark as deleted in inventory
  - [ ] Return cleanup statistics
- [ ] Implement alerting in `alerting.ts`
  - [ ] Format Discord webhook messages
  - [ ] Send on failure (always)
  - [ ] Send on success (configurable)
  - [ ] Handle webhook errors gracefully
- [ ] Set Discord webhook URL via wrangler secret
- [ ] Test webhook formatting

## Phase 6: Testing & Documentation
- [ ] Test full backup cycle end-to-end
- [ ] Test restore process with downloaded backup
- [ ] Test cleanup of old backups
- [ ] Test manual trigger endpoint
- [ ] Verify all 12 databases backup successfully
- [ ] Write project README.md
- [ ] Document deployment steps
- [ ] Add restore procedures documentation
- [ ] Add troubleshooting guide

## Phase 7: Monitoring & Integration
- [ ] Deploy to production
- [ ] Monitor first scheduled run
- [ ] Verify backups appear in R2
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

**Priority**: Phase 2 → Phase 3 → Phase 4-5 (get D1 backups working first, then R2, then DOs)
**Next Step**: Implement SQL export logic in `exporter.ts`
