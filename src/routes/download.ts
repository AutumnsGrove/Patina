/**
 * GET /download/:date/:db
 *
 * Downloads a specific backup file from R2.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Context } from 'hono';
import type { Env } from '../types';

export async function downloadHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  // TODO: Implement download endpoint
  // 1. Parse date and database name from URL params
  // 2. Construct R2 key (YYYY-MM-DD/database-name.sql)
  // 3. Fetch from R2
  // 4. Return as downloadable file with proper headers

  const _date = c.req.param('date');
  const _db = c.req.param('db');

  return new Response('Not implemented', { status: 501 });
}
