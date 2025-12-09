/**
 * GET /restore-guide/:db
 *
 * Returns restore instructions for a specific database.
 */

import type { Context } from 'hono';
import type { Env, RestoreGuideResponse } from '../types';
import { DATABASES } from '../lib/databases';

export async function restoreGuideHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  // TODO: Implement restore guide endpoint
  // 1. Parse database name from URL param
  // 2. Find database config
  // 3. Get available backups from inventory
  // 4. Return formatted restore instructions

  const dbName = c.req.param('db');
  const dbConfig = DATABASES.find((d) => d.name === dbName);

  if (!dbConfig) {
    return c.json({ error: 'Database not found' }, 404);
  }

  const response: RestoreGuideResponse = {
    database: dbConfig.name,
    databaseId: dbConfig.id,
    description: dbConfig.description,
    priority: dbConfig.priority,
    availableBackups: [],
    restoreInstructions: {
      method1_wrangler: {
        name: 'Wrangler CLI (Recommended)',
        steps: [
          `1. Download backup: curl -o ${dbConfig.name}-backup.sql https://backups.grove.place/download/YYYY-MM-DD/${dbConfig.name}`,
          "2. Review the SQL file to ensure it's correct",
          `3. Execute: wrangler d1 execute ${dbConfig.name} --file=${dbConfig.name}-backup.sql`,
          `4. Verify: wrangler d1 execute ${dbConfig.name} --command="SELECT COUNT(*) FROM sqlite_master WHERE type='table'"`,
        ],
        warning: 'This will DROP and recreate tables. All existing data will be replaced.',
      },
      method2_timetravel: {
        name: 'D1 Time Travel (Last 30 days)',
        steps: [
          `1. Get available restore points: wrangler d1 time-travel info ${dbConfig.name}`,
          `2. Restore to timestamp: wrangler d1 time-travel restore ${dbConfig.name} --timestamp="YYYY-MM-DDTHH:MM:SSZ"`,
          '3. Verify restoration',
        ],
        note: "Time Travel is faster and doesn't require downloading files.",
      },
    },
  };

  return c.json(response);
}
