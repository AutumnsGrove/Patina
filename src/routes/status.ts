/**
 * GET /status
 *
 * Returns current backup status and recent history.
 */

import type { Context } from 'hono';
import type { Env, StatusResponse } from '../types';

export async function statusHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  // TODO: Implement status endpoint
  // 1. Check if a backup is currently running
  // 2. Get last backup job details
  // 3. Get recent jobs (last 10)
  // 4. Calculate storage statistics
  // 5. Return formatted response

  const response: StatusResponse = {
    currentStatus: 'idle',
    lastBackup: null,
    nextScheduled: '2024-12-15T03:00:00Z', // Calculate from cron
    recentJobs: [],
    storage: {
      totalBackups: 0,
      totalSize: '0 B',
      oldestBackup: '',
      newestBackup: '',
    },
  };

  return c.json(response);
}
