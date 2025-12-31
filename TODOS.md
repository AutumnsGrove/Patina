# Patina - Implementation TODO List

## Phase 1: Core Infrastructure
- [x] Create project directory structure
- [x] Set up TypeScript configuration
- [x] Create wrangler.toml with D1/R2 bindings
- [x] Create database migration file
- [ ] Create R2 bucket `grove-patina` (requires wrangler auth)
- [ ] Create D1 database `grove-patina-db` (requires wrangler auth)
- [ ] Run migrations on grove-patina-db
- [ ] Update wrangler.toml with actual grove-patina-db database_id

## Phase 2: Export Logic
- [ ] Implement SQL export in `exporter.ts`
  - [ ] Query sqlite_master for table schemas
  - [ ] Handle all SQLite data types correctly
  - [ ] Implement batch processing for large tables (1000 rows/batch)
  - [ ] Add proper SQL escaping for strings
  - [ ] Include header/footer metadata in dumps
  - [ ] Test with small database first (grove-domain-jobs)
- [ ] Create utility functions in `utils.ts`
  - [ ] formatSqlValue() for data type conversion
  - [ ] formatBytes() for human-readable sizes
  - [ ] generateJobId() for UUID generation

## Phase 3: Scheduled Handler
- [ ] Implement nightly cron handler in `scheduled.ts`
  - [ ] Iterate through all 6 databases from config
  - [ ] Call exporter for each database with concurrency=3
  - [ ] Upload SQL dumps to R2: `/daily/YYYY-MM-DD/db-name.sql`
  - [ ] Log results to metadata DB
  - [ ] Handle errors gracefully (continue on failure)
- [ ] Implement weekly meta-backup handler
  - [ ] Collect 7 daily backups from past week
  - [ ] Compress into archive: `/weekly/YYYY-Www.tar.gz`
  - [ ] Delete daily backups older than 7 days
  - [ ] Delete weekly archives older than 12 weeks
- [ ] Test with manual trigger first
- [ ] Verify cron schedules trigger correctly

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
  - [ ] Query expired daily backups (>7 days)
  - [ ] Query expired weekly archives (>12 weeks)
  - [ ] Delete from R2
  - [ ] Mark as deleted in inventory
  - [ ] Return cleanup statistics
- [ ] Implement alerting in `alerting.ts`
  - [ ] Format webhook messages
  - [ ] Send on failure (always)
  - [ ] Send on success (configurable)
  - [ ] Handle webhook errors gracefully
- [ ] Set webhook URL via wrangler secret
- [ ] Test webhook formatting

## Phase 6: Testing & Documentation
- [ ] Test full nightly backup cycle end-to-end
- [ ] Test weekly meta-backup and archive compression
- [ ] Test restore process with downloaded backup
- [ ] Test cleanup of old backups
- [ ] Test manual trigger endpoint
- [ ] Verify all 6 databases backup successfully
- [ ] Document deployment steps
- [ ] Add restore procedures documentation
- [ ] Add troubleshooting guide

## Phase 7: Monitoring & Integration
- [ ] Deploy to production
- [ ] Monitor first scheduled run
- [ ] Verify backups appear in R2 with correct paths
- [ ] Set up alerting channel
- [ ] Integrate with GroveMonitor
  - [ ] Expose backup metrics
  - [ ] Add health check endpoint
  - [ ] Configure alerts for backup failures

## Nice-to-Have Features (Future)
- [ ] Backup comparison (detect schema changes)
- [ ] Selective restore (single table)
- [ ] Backup encryption
- [ ] Differential backups (export only changed rows)
- [ ] Cross-region replication to secondary R2 bucket
- [ ] Web dashboard for backup history
- [ ] Backup validation (test restore in isolated environment)

---

**Priority**: Phase 1 → Phase 2 → Phase 3 (get backups working first!)
**Next Step**: Authenticate with wrangler and create R2 bucket + D1 database
