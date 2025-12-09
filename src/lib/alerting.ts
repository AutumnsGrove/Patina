/**
 * Alert and Notification Logic
 *
 * Sends webhook notifications for backup job completion or failures.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AlertPayload, DiscordWebhookPayload} from '../types';

/**
 * Send alert webhook for backup job completion/failure
 *
 * @param webhookUrl - Discord webhook URL
 * @param payload - Alert payload with job details
 */
export async function sendAlert(_webhookUrl: string, _payload: AlertPayload): Promise<void> {
  // TODO: Implement webhook sending
  // 1. Format payload for Discord
  // 2. Send POST request
  // 3. Handle errors gracefully
}

/**
 * Format alert payload as Discord webhook message
 *
 * @param payload - Alert payload
 * @returns Discord webhook formatted payload
 */
export function formatDiscordMessage(payload: AlertPayload): DiscordWebhookPayload {
  const isSuccess = payload.status === 'success';

  return {
    embeds: [
      {
        title: isSuccess ? '✅ Grove Backup Completed' : '⚠️ Grove Backup Partially Failed',
        color: isSuccess ? 0x22c55e : 0xef4444,
        fields: [
          {
            name: 'Databases',
            value: `${payload.summary.successful}/${payload.summary.successful + payload.summary.failed} successful`,
            inline: true,
          },
          {
            name: 'Total Size',
            value: payload.summary.totalSize,
            inline: true,
          },
          {
            name: 'Duration',
            value: payload.summary.duration,
            inline: true,
          },
        ],
        footer: {
          text: `Job ID: ${payload.jobId}`,
        },
        timestamp: payload.timestamp,
      },
    ],
  };
}
