# GroveBackups - Implementation TODO List

## Phase 1: Core Infrastructure ✅ (Scaffolding Complete)
- [x] Create project directory structure
- [x] Set up TypeScript configuration
- [x] Create wrangler.toml with D1/R2 bindings
- [x] Create database migration file
- [ ] Create R2 bucket `grove-backups` (requires wrangler auth)
- [ ] Create D1 database `grove-backups-db` (requires wrangler auth)
- [ ] Run migrations on grove-backups-db
- [ ] Update wrangler.toml with actual grove-backups-db database_id

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
  - [ ] Iterate through all 9 databases from config
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
- [ ] Verify all 9 databases backup successfully
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

---

**Priority**: Phase 1 → Phase 2 → Phase 3 (get backups working first!)
**Next Step**: Authenticate with wrangler and create R2 bucket + D1 database
