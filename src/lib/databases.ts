/**
 * Database Configuration
 *
 * Registry of all Grove D1 databases that need to be backed up.
 * Part of the Patina backup system.
 */

import type { DatabaseConfig } from '../types';

export const DATABASES: DatabaseConfig[] = [
  {
    name: 'groveauth',
    id: '45eae4c7-8ae7-4078-9218-8e1677a4360f',
    binding: 'GROVEAUTH_DB',
    description: 'Authentication, OAuth (Heartwood)',
    priority: 'critical',
    estimatedSize: '212 KB',
  },
  {
    name: 'scout-db',
    id: '6a289378-c662-4c6a-9f1b-fa5296e03fa2',
    binding: 'SCOUT_DB',
    description: 'Searches, credits, referrals',
    priority: 'critical',
    estimatedSize: '364 KB',
  },
  {
    name: 'grove-engine-db',
    id: 'a6394da2-b7a6-48ce-b7fe-b1eb3e730e68',
    binding: 'GROVE_ENGINE_DB',
    description: 'Core platform, multi-tenant data (Lattice)',
    priority: 'critical',
    estimatedSize: '180 KB',
  },
  {
    name: 'autumnsgrove-posts',
    id: '510badf3-457a-4892-bf2a-45d4bfd7a7bb',
    binding: 'AUTUMNSGROVE_POSTS_DB',
    description: 'Blog posts',
    priority: 'high',
    estimatedSize: '118 KB',
  },
  {
    name: 'autumnsgrove-git-stats',
    id: '0ca4036f-93f7-4c8a-98a5-5353263acd44',
    binding: 'AUTUMNSGROVE_GIT_STATS_DB',
    description: 'Git statistics',
    priority: 'normal',
    estimatedSize: '335 KB',
  },
  {
    name: 'grove-domain-jobs',
    id: 'cd493112-a901-4f6d-aadf-a5ca78929557',
    binding: 'GROVE_DOMAIN_JOBS_DB',
    description: 'Domain search jobs (Forage/Acorn)',
    priority: 'normal',
    estimatedSize: '45 KB',
  },
];

// Backup schedule and retention
export const BACKUP_CONFIG = {
  // Cron schedules
  nightlySchedule: '0 3 * * *', // Every day at 3:00 AM UTC
  weeklySchedule: '0 4 * * 0', // Every Sunday at 4:00 AM UTC

  // Retention
  dailyRetentionDays: 7,
  weeklyRetentionWeeks: 12,

  // R2 bucket name
  bucketName: 'grove-patina',

  // R2 path prefixes
  dailyPrefix: 'daily',
  weeklyPrefix: 'weekly',

  // Max concurrent database exports
  concurrency: 3,

  // Timeout per database export (ms)
  exportTimeout: 30000,
};
