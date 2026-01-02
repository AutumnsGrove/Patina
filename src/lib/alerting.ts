/**
 * Alert and Notification Logic
 *
 * Sends webhook notifications for backup job completion or failures.
 */

import type { Env, BackupResult, DiscordWebhookPayload } from '../types';
import { formatBytes } from './utils';

interface BackupJobResult {
  jobId: string;
  triggerType: 'scheduled' | 'manual';
  startedAt: number;
  completedAt: number;
  successfulCount: number;
  failedCount: number;
  totalSizeBytes: number;
  durationMs: number;
  results: BackupResult[];
}

/**
 * Send alert webhook for backup job completion/failure
 */
export async function sendAlert(
  env: Env,
  result: BackupJobResult,
  alertType: 'success' | 'failure'
): Promise<void> {
  const webhookUrl = env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('No Discord webhook URL configured, skipping alert');
    return;
  }

  try {
    const payload = formatDiscordMessage(result, alertType);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    } else {
      console.log(`Discord alert sent: ${alertType}`);
    }
  } catch (error) {
    console.error('Failed to send Discord alert:', error);
  }
}

/**
 * Format backup result as Discord webhook message
 */
function formatDiscordMessage(result: BackupJobResult, alertType: 'success' | 'failure'): DiscordWebhookPayload {
  const isSuccess = alertType === 'success';
  const totalDatabases = result.successfulCount + result.failedCount;

  const fields = [
    {
      name: 'Databases',
      value: `${result.successfulCount}/${totalDatabases} successful`,
      inline: true,
    },
    {
      name: 'Total Size',
      value: formatBytes(result.totalSizeBytes),
      inline: true,
    },
    {
      name: 'Duration',
      value: `${(result.durationMs / 1000).toFixed(1)}s`,
      inline: true,
    },
    {
      name: 'Trigger',
      value: result.triggerType,
      inline: true,
    },
  ];

  // Add failure details if there are failures
  if (result.failedCount > 0) {
    const failedDbs = result.results
      .filter((r) => r.status === 'failed')
      .map((r) => `- ${r.database_name}: ${r.error_message || 'Unknown error'}`)
      .join('\n');

    fields.push({
      name: 'Failed Databases',
      value: failedDbs || 'None',
      inline: false,
    });
  }

  return {
    embeds: [
      {
        title: isSuccess ? '✅ Cache Backup Completed' : '⚠️ Cache Backup Failed',
        color: isSuccess ? 0x22c55e : 0xef4444,
        fields,
        footer: {
          text: `Job ID: ${result.jobId}`,
        },
        timestamp: new Date(result.completedAt * 1000).toISOString(),
      },
    ],
  };
}
