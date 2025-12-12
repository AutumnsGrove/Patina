/**
 * GroveBackups Worker - Main Entry Point
 *
 * Cloudflare Worker that handles:
 * - Scheduled cron jobs for automated backups
 * - HTTP endpoints for manual triggers and status
 */

import { Hono } from 'hono';
import type { Env } from './types';

// Route handlers
import { statusHandler } from './routes/status';
import { listHandler } from './routes/list';
import { triggerHandler } from './routes/trigger';
import { downloadHandler } from './routes/download';
import { restoreGuideHandler } from './routes/restore-guide';

// Scheduled handler
import { handleScheduled } from './scheduled';

const app = new Hono<{ Bindings: Env }>();

// ============================================
// Routes
// ============================================

// Root endpoint - documentation
app.get('/', (c) => {
  return c.json({
    name: 'Cache',
    version: '1.0.0',
    description: 'Automated D1 database backup system for Grove',
    schedule: 'Every Sunday at 3:00 AM UTC',
    retention: '12 weeks',
    databases: 9,
    endpoints: {
      'GET /': 'This documentation',
      'GET /status': 'Current backup status and recent history',
      'GET /list': 'List all available backups',
      'POST /trigger': 'Manually trigger a backup',
      'GET /download/:date/:db': 'Download a specific backup',
      'GET /restore-guide/:db': 'Get restore instructions for a database',
    },
  });
});

// Status endpoint
app.get('/status', statusHandler);

// List backups
app.get('/list', listHandler);

// Manual trigger
app.post('/trigger', triggerHandler);

// Download backup
app.get('/download/:date/:db', downloadHandler);

// Restore guide
app.get('/restore-guide/:db', restoreGuideHandler);

// ============================================
// Worker Export
// ============================================

export default {
  /**
   * Fetch handler - handles HTTP requests
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  /**
   * Scheduled handler - handles cron triggers
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(event, env));
  },
};
