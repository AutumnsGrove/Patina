/**
 * GET /list
 *
 * Lists all available backups with optional filtering.
 */

import type { Context } from 'hono';
import type { Env, ListResponse } from '../types';

export async function listHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  // TODO: Implement list endpoint
  // 1. Parse query parameters (database, date, limit)
  // 2. Query backup_inventory table with filters
  // 3. Format results
  // 4. Return paginated response

  const response: ListResponse = {
    backups: [],
    total: 0,
    filtered: 0,
  };

  return c.json(response);
}
