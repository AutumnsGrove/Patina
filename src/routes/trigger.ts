/**
 * POST /trigger
 *
 * Manually triggers a backup job.
 */

import type { Context } from 'hono';
import type { Env, TriggerRequest, TriggerResponse } from '../types';

export async function triggerHandler(c: Context<{ Bindings: Env }>): Promise<Response> {
  // TODO: Implement trigger endpoint
  // 1. Parse request body (optional databases filter, reason)
  // 2. Generate job ID
  // 3. Start backup job asynchronously
  // 4. Return job ID and status

  const _body = await c.req.json<TriggerRequest>().catch(() => ({}));

  const response: TriggerResponse = {
    jobId: crypto.randomUUID(),
    status: 'started',
    databases: 9,
    message: 'Backup job started. Check /status for progress.',
  };

  return c.json(response);
}
