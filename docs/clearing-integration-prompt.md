# Clearing Integration Prompt: Backup Reliability Display

> **Handoff prompt for integrating Patina backup status into the Clearing status page**

---

## Context

**Patina** is Grove's automated database backup system that backs up all 12 D1 databases to R2 storage. It runs:
- **Daily at 3 AM UTC** for priority databases (groveauth, grove-engine-db)
- **Weekly on Sundays at 4 AM UTC** for all 12 databases

The backup system has been running since January 2, 2026 with a 90%+ reliability score. We want to showcase this on the Clearing status page to build user trust.

**Clearing** is Grove's public status page at `status.grove.place`, built with SvelteKit 2 + Svelte 5 + Tailwind CSS, using glassmorphism design patterns.

---

## Task

Add a **"Data Backups"** section to the Clearing status page that displays:
1. Overall backup health status
2. Recent backup history (last 7 days)
3. Reliability score with visual indicator
4. Total backups and storage stats

This section should appear **after the System Status grid** and **before the 90-Day Uptime History**.

---

## Data Source

### Option A: Cross-Database Query (Recommended)

Clearing already connects to `grove-engine-db`. Add a second D1 binding for `grove-backups-db`:

**In `clearing/wrangler.toml`, add:**
```toml
[[d1_databases]]
binding = "BACKUPS_DB"
database_name = "grove-backups-db"
database_id = "4ad25abc-f972-4159-ac81-578806709275"
```

### Backup Database Schema

```sql
-- Backup inventory (what's stored in R2)
CREATE TABLE backup_inventory (
  id INTEGER PRIMARY KEY,
  r2_key TEXT UNIQUE NOT NULL,
  database_name TEXT NOT NULL,
  backup_date TEXT NOT NULL,        -- YYYY-MM-DD
  size_bytes INTEGER NOT NULL,
  table_count INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  deleted_at INTEGER                -- NULL if still exists
);

-- Job history
CREATE TABLE backup_jobs (
  id INTEGER PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  started_at INTEGER NOT NULL,      -- Unix timestamp
  completed_at INTEGER,
  status TEXT NOT NULL,             -- 'running', 'completed', 'failed'
  trigger_type TEXT NOT NULL,       -- 'scheduled', 'manual'
  total_databases INTEGER NOT NULL,
  successful_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  total_size_bytes INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT
);
```

### Queries to Use

**Summary stats:**
```sql
SELECT
  COUNT(*) as total_backups,
  COUNT(DISTINCT backup_date) as unique_days,
  SUM(size_bytes) as total_bytes,
  MAX(backup_date) as last_backup
FROM backup_inventory
WHERE deleted_at IS NULL
```

**Daily history (last 7 days):**
```sql
SELECT
  backup_date,
  COUNT(*) as backup_count,
  SUM(size_bytes) as total_size
FROM backup_inventory
WHERE deleted_at IS NULL
GROUP BY backup_date
ORDER BY backup_date DESC
LIMIT 7
```

**Reliability score (last 10 jobs):**
```sql
SELECT
  status,
  successful_count,
  failed_count,
  datetime(started_at, 'unixepoch') as started
FROM backup_jobs
ORDER BY started_at DESC
LIMIT 10
```

---

## Implementation Steps

### 1. Add Database Binding

Update `clearing/wrangler.toml`:
```toml
[[d1_databases]]
binding = "BACKUPS_DB"
database_name = "grove-backups-db"
database_id = "4ad25abc-f972-4159-ac81-578806709275"
```

Update `clearing/src/app.d.ts` to include the new binding:
```typescript
interface Platform {
  env: {
    DB: D1Database;
    BACKUPS_DB: D1Database;  // Add this
  };
}
```

### 2. Create Data Fetching Functions

Create `clearing/src/lib/server/backups.ts`:

```typescript
import type { D1Database } from '@cloudflare/workers-types';

export interface BackupSummary {
  totalBackups: number;
  uniqueDays: number;
  totalBytes: number;
  lastBackup: string | null;
}

export interface DailyBackup {
  date: string;
  count: number;
  size: number;
  type: 'daily' | 'weekly';
}

export interface BackupReliability {
  score: number;
  perfectJobs: number;
  partialJobs: number;
  totalJobs: number;
}

export interface BackupStatus {
  summary: BackupSummary;
  dailyHistory: DailyBackup[];
  reliability: BackupReliability;
  isHealthy: boolean;
}

export async function getBackupStatus(db: D1Database): Promise<BackupStatus> {
  // Get summary
  const summaryResult = await db.prepare(`
    SELECT
      COUNT(*) as total_backups,
      COUNT(DISTINCT backup_date) as unique_days,
      SUM(size_bytes) as total_bytes,
      MAX(backup_date) as last_backup
    FROM backup_inventory
    WHERE deleted_at IS NULL
  `).first<{
    total_backups: number;
    unique_days: number;
    total_bytes: number;
    last_backup: string | null;
  }>();

  // Get daily history
  const dailyResult = await db.prepare(`
    SELECT
      backup_date,
      COUNT(*) as backup_count,
      SUM(size_bytes) as total_size
    FROM backup_inventory
    WHERE deleted_at IS NULL
    GROUP BY backup_date
    ORDER BY backup_date DESC
    LIMIT 7
  `).all<{
    backup_date: string;
    backup_count: number;
    total_size: number;
  }>();

  // Get job reliability
  const jobsResult = await db.prepare(`
    SELECT
      status,
      successful_count,
      failed_count
    FROM backup_jobs
    ORDER BY started_at DESC
    LIMIT 10
  `).all<{
    status: string;
    successful_count: number;
    failed_count: number;
  }>();

  // Calculate reliability
  const jobs = jobsResult.results || [];
  const perfectJobs = jobs.filter(j => j.status === 'completed' && j.failed_count === 0).length;
  const partialJobs = jobs.filter(j => j.status === 'completed' && j.failed_count > 0).length;
  const score = jobs.length > 0 ? (perfectJobs / jobs.length) * 100 : 0;

  // Map daily history
  const dailyHistory: DailyBackup[] = (dailyResult.results || []).map(d => ({
    date: d.backup_date,
    count: d.backup_count,
    size: d.total_size,
    type: d.backup_count >= 10 ? 'weekly' : 'daily'
  }));

  // Check health (has backup in last 2 days)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isHealthy = dailyHistory.some(d => d.date === today || d.date === yesterday);

  return {
    summary: {
      totalBackups: summaryResult?.total_backups || 0,
      uniqueDays: summaryResult?.unique_days || 0,
      totalBytes: summaryResult?.total_bytes || 0,
      lastBackup: summaryResult?.last_backup || null
    },
    dailyHistory,
    reliability: {
      score,
      perfectJobs,
      partialJobs,
      totalJobs: jobs.length
    },
    isHealthy
  };
}

// Mock data for development
export function getMockBackupStatus(): BackupStatus {
  const today = new Date();
  const dailyHistory: DailyBackup[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const isSunday = date.getDay() === 0;

    dailyHistory.push({
      date: dateStr,
      count: isSunday ? 12 : 2,
      size: isSunday ? 1200000 : 300000,
      type: isSunday ? 'weekly' : 'daily'
    });
  }

  return {
    summary: {
      totalBackups: 54,
      uniqueDays: 12,
      totalBytes: 5740000,
      lastBackup: today.toISOString().split('T')[0]
    },
    dailyHistory,
    reliability: {
      score: 90,
      perfectJobs: 9,
      partialJobs: 1,
      totalJobs: 10
    },
    isHealthy: true
  };
}
```

### 3. Update Page Server Load

In `clearing/src/routes/+page.server.ts`, add:

```typescript
import { getBackupStatus, getMockBackupStatus, type BackupStatus } from '$lib/server/backups';

// In the load function, add:
let backupStatus: BackupStatus;
try {
  if (platform?.env?.BACKUPS_DB) {
    backupStatus = await getBackupStatus(platform.env.BACKUPS_DB);
  } else {
    backupStatus = getMockBackupStatus();
  }
} catch (error) {
  console.error('Failed to fetch backup status:', error);
  backupStatus = getMockBackupStatus();
}

// Add to return object:
return {
  // ... existing data
  backupStatus,
};
```

### 4. Create Backup Status Component

Create `clearing/src/lib/components/GlassBackupStatus.svelte`:

```svelte
<script lang="ts">
  import { Database, CheckCircle, AlertTriangle, Calendar, HardDrive } from 'lucide-svelte';
  import type { BackupStatus } from '$lib/server/backups';

  let { backupStatus }: { backupStatus: BackupStatus } = $props();

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const statusConfig = $derived(backupStatus.isHealthy ? {
    icon: CheckCircle,
    label: 'Backups Healthy',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800'
  } : {
    icon: AlertTriangle,
    label: 'Backup Issue',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-800'
  });

  const reliabilityColor = $derived(
    backupStatus.reliability.score >= 90 ? 'bg-green-500' :
    backupStatus.reliability.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  );
</script>

<section class="glass-card p-6">
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg {statusConfig.bg}">
        <Database class="w-5 h-5 {statusConfig.color}" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Data Backups</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Automated database protection</p>
      </div>
    </div>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full {statusConfig.bg} {statusConfig.border} border">
      <svelte:component this={statusConfig.icon} class="w-4 h-4 {statusConfig.color}" />
      <span class="text-sm font-medium {statusConfig.color}">{statusConfig.label}</span>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{backupStatus.summary.totalBackups}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">Total Backups</div>
    </div>
    <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{backupStatus.summary.uniqueDays}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">Days Covered</div>
    </div>
    <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(backupStatus.summary.totalBytes)}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">Storage Used</div>
    </div>
    <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">12</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">Databases</div>
    </div>
  </div>

  <!-- Reliability Score -->
  <div class="mb-6">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Reliability Score</span>
      <span class="text-sm font-bold text-gray-900 dark:text-white">{backupStatus.reliability.score.toFixed(0)}%</span>
    </div>
    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full {reliabilityColor} transition-all duration-500"
        style="width: {backupStatus.reliability.score}%"
      ></div>
    </div>
    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
      <span class="flex items-center gap-1">
        <CheckCircle class="w-3 h-3 text-green-500" />
        {backupStatus.reliability.perfectJobs} perfect
      </span>
      <span class="flex items-center gap-1">
        <AlertTriangle class="w-3 h-3 text-yellow-500" />
        {backupStatus.reliability.partialJobs} partial
      </span>
      <span class="text-gray-400">Last {backupStatus.reliability.totalJobs} jobs</span>
    </div>
  </div>

  <!-- Recent Backups -->
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Backups</h3>
    <div class="space-y-2">
      {#each backupStatus.dailyHistory.slice(0, 5) as day}
        <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center gap-3">
            <Calendar class="w-4 h-4 text-gray-400" />
            <span class="text-sm font-medium text-gray-900 dark:text-white">{formatDate(day.date)}</span>
            {#if day.type === 'weekly'}
              <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Weekly Full
              </span>
            {:else}
              <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Daily
              </span>
            {/if}
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{day.count} files</span>
            <span class="flex items-center gap-1">
              <HardDrive class="w-3 h-3" />
              {formatBytes(day.size)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Footer -->
  <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
    <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
      Daily backups at 3 AM UTC (priority) • Weekly full backups Sunday 4 AM UTC • 12-week retention
    </p>
  </div>
</section>
```

### 5. Add to Main Page

In `clearing/src/routes/+page.svelte`, import and add the component:

```svelte
<script lang="ts">
  // Add import
  import GlassBackupStatus from '$lib/components/GlassBackupStatus.svelte';

  // ... existing code
</script>

<!-- Add after System Status grid, before Uptime History -->
{#if data.backupStatus}
  <GlassBackupStatus backupStatus={data.backupStatus} />
{/if}
```

### 6. Add Types Export

Update `clearing/src/lib/server/index.ts` (or create if doesn't exist):

```typescript
export * from './backups';
```

---

## Design Guidelines

### Match Existing Patterns

- Use `glass-card` class for container
- Use Lucide icons (already installed)
- Follow the green/yellow/red status color scheme
- Use `bg-gray-50 dark:bg-gray-800/50` for inner cards
- Keep spacing consistent with existing components (p-6, gap-4, mb-6)

### Responsive Design

- Stats grid: 2 columns on mobile, 4 on desktop
- Recent backups list should scroll if needed on mobile
- All text should be readable in both light and dark modes

### Accessibility

- Include proper ARIA labels
- Ensure color is not the only indicator of status
- Support reduced motion preferences

---

## Testing Checklist

- [ ] Component renders with mock data when BACKUPS_DB is not available
- [ ] Component renders with real data from grove-backups-db
- [ ] Reliability score bar animates smoothly
- [ ] Dark mode styling works correctly
- [ ] Mobile layout is responsive
- [ ] "Today" and "Yesterday" labels work correctly
- [ ] Weekly vs Daily badges display correctly based on backup count
- [ ] Health status correctly detects if backups are current

---

## Deployment

After implementation:

```bash
cd clearing
pnpm run build
pnpm run deploy
```

The backup status will automatically populate from the production `grove-backups-db` database.

---

## Reference Links

- **Patina Project:** `/Users/autumn/Documents/Projects/Patina`
- **Patina Status Script:** `/Users/autumn/Documents/Projects/Patina/scripts/status.sh`
- **Clearing Spec:** `/Users/autumn/Documents/Projects/GroveEngine/docs/specs/clearing-spec.md`
- **Clearing Implementation:** `/Users/autumn/Documents/Projects/GroveEngine/clearing`

---

*Generated by Claude Code for GroveEngine/Clearing integration*
