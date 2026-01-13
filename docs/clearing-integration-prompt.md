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

## CRITICAL: Grove UI Design Patterns

**Before implementing, read:** `/docs/design/grove-ui-patterns.md`

### Key Rules

1. **NEVER use emojis. ALWAYS use Lucide icons.**
   ```svelte
   // Good
   import { Database, CheckCircle, AlertTriangle, Calendar, HardDrive } from 'lucide-svelte';
   <Database class="w-4 h-4" />

   // Bad - NEVER do this
   // ❌ 🗄️ ✅ ⚠️ 📅
   ```

2. **Glass effects for readability** — Use the `glass-card` pattern for content cards
3. **Organic, welcoming feel** — Not corporate or rigid. Like a cozy status update.
4. **Dark mode required** — All components must support `.dark` class
5. **Lucide icon mapping:**
   | Concept | Icon |
   |---------|------|
   | Backups/Database | `Database` |
   | Success/Healthy | `CheckCircle` |
   | Warning/Partial | `AlertTriangle` |
   | Storage | `HardDrive` |
   | Date/Calendar | `Calendar` |
   | Shield/Protected | `Shield` |

### Glass Variants Reference

Clearing uses CSS-based glass cards (not the `<Glass>` component). Follow this pattern:
```css
.glass-card {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 0.75rem;
}
.dark .glass-card {
  background-color: rgba(30, 41, 59, 0.7);
  border-color: rgba(51, 65, 85, 0.5);
}
```

### Status Colors (Match Clearing)

| Status | Light Mode | Dark Mode |
|--------|------------|-----------|
| Operational/Healthy | `text-green-600` | `text-green-400` |
| Degraded/Warning | `text-yellow-600` | `text-yellow-400` |
| Partial | `text-orange-600` | `text-orange-400` |
| Outage/Error | `text-red-600` | `text-red-400` |
| Maintenance/Info | `text-blue-600` | `text-blue-400` |

---

## Task

Add a **"Data Protection"** section to the Clearing status page that displays:
1. Overall backup health status with Lucide icon
2. Recent backup history (last 7 days)
3. Reliability score with visual progress bar
4. Total backups and storage stats

This section should appear **after the System Status grid** and **before the 90-Day Uptime History**.

### Visual Wireframe (ASCII, no emojis)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Database icon]  Data Protection                               │
│  Automated backups keep your data safe         [CheckCircle] OK │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │    54    │ │    12    │ │  5.7 MB  │ │    12    │           │
│  │ Backups  │ │   Days   │ │ Storage  │ │ Databases│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  Reliability                                              90%   │
│  [████████████████████████████████████████░░░░░░░░]            │
│  [CheckCircle] 9 perfect  [AlertTriangle] 1 partial            │
│                                                                 │
│  Recent Backups                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Calendar] Today          Daily       2 files   311 KB  │   │
│  │ [Calendar] Yesterday      Daily       2 files   310 KB  │   │
│  │ [Calendar] Jan 11     Weekly Full    12 files   1.2 MB  │   │
│  │ [Calendar] Jan 10         Daily       2 files   294 KB  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Daily 3 AM UTC (priority) · Weekly Sunday 4 AM · 12-week hold │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Source

### Database Binding

Clearing connects to `grove-engine-db`. Add a second D1 binding for `grove-backups-db`:

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
  failed_count
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

// Mock data for development (when BACKUPS_DB not available)
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
  /**
   * GlassBackupStatus - Data protection status display
   *
   * Follows Grove UI patterns:
   * - Lucide icons only (no emojis)
   * - Glass card styling
   * - Dark mode support
   * - Organic, welcoming feel
   */
  import {
    Database,
    CheckCircle,
    AlertTriangle,
    Calendar,
    HardDrive,
    Shield
  } from 'lucide-svelte';
  import type { BackupStatus } from '$lib/server/backups';

  let { backupStatus }: { backupStatus: BackupStatus } = $props();

  // Format bytes to human-readable
  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  // Format date with friendly labels
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

  // Status configuration based on health
  const statusConfig = $derived(backupStatus.isHealthy ? {
    icon: CheckCircle,
    label: 'Protected',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  } : {
    icon: AlertTriangle,
    label: 'Attention Needed',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  });

  // Reliability bar color
  const reliabilityColor = $derived(
    backupStatus.reliability.score >= 90 ? 'bg-green-500 dark:bg-green-400' :
    backupStatus.reliability.score >= 70 ? 'bg-yellow-500 dark:bg-yellow-400' :
    'bg-red-500 dark:bg-red-400'
  );
</script>

<section class="glass-card p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
        <Shield class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Data Protection
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Automated backups keep your data safe
        </p>
      </div>
    </div>

    <!-- Status badge -->
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border {statusConfig.bgColor} {statusConfig.borderColor}">
      <svelte:component this={statusConfig.icon} class="w-4 h-4 {statusConfig.color}" />
      <span class="text-sm font-medium {statusConfig.color}">{statusConfig.label}</span>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <div class="text-center p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/40">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {backupStatus.summary.totalBackups}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Backups</div>
    </div>
    <div class="text-center p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/40">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {backupStatus.summary.uniqueDays}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Days Covered</div>
    </div>
    <div class="text-center p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/40">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {formatBytes(backupStatus.summary.totalBytes)}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Storage Used</div>
    </div>
    <div class="text-center p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/40">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">12</div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Databases</div>
    </div>
  </div>

  <!-- Reliability Score -->
  <div class="mb-6">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Reliability
      </span>
      <span class="text-sm font-bold text-gray-900 dark:text-white">
        {backupStatus.reliability.score.toFixed(0)}%
      </span>
    </div>
    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full {reliabilityColor} transition-all duration-700 ease-out"
        style="width: {backupStatus.reliability.score}%"
      ></div>
    </div>
    <div class="flex items-center gap-4 mt-2.5 text-xs text-gray-500 dark:text-gray-400">
      <span class="flex items-center gap-1.5">
        <CheckCircle class="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
        {backupStatus.reliability.perfectJobs} perfect
      </span>
      <span class="flex items-center gap-1.5">
        <AlertTriangle class="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
        {backupStatus.reliability.partialJobs} partial
      </span>
      <span class="ml-auto text-gray-400 dark:text-gray-500">
        Last {backupStatus.reliability.totalJobs} jobs
      </span>
    </div>
  </div>

  <!-- Recent Backups -->
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Recent Backups
    </h3>
    <div class="space-y-2">
      {#each backupStatus.dailyHistory.slice(0, 5) as day}
        <div class="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/40 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors">
          <div class="flex items-center gap-3">
            <Calendar class="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span class="text-sm font-medium text-gray-900 dark:text-white min-w-[80px]">
              {formatDate(day.date)}
            </span>
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
            <span class="tabular-nums">{day.count} files</span>
            <span class="flex items-center gap-1.5 min-w-[70px] justify-end">
              <HardDrive class="w-3.5 h-3.5" />
              <span class="tabular-nums">{formatBytes(day.size)}</span>
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Footer info -->
  <div class="mt-5 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
    <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
      Daily 3 AM UTC (priority databases) · Weekly Sunday 4 AM UTC (full) · 12-week retention
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

<!-- Add after System Status grid, before Uptime History section -->
{#if data.backupStatus}
  <GlassBackupStatus backupStatus={data.backupStatus} />
{/if}
```

### 6. Export Types (if needed)

If Clearing has a barrel export in `clearing/src/lib/server/index.ts`:

```typescript
export * from './backups';
```

---

## Design Compliance Checklist

Before shipping, verify:

- [ ] **No emojis anywhere** — Only Lucide icons (`Database`, `CheckCircle`, etc.)
- [ ] **Glass card styling** — Uses `.glass-card` class with proper backdrop blur
- [ ] **Dark mode works** — All colors have `.dark:` variants
- [ ] **Hover states** — Cards have subtle hover transitions
- [ ] **Consistent spacing** — Uses p-6, gap-3/4, mb-6 patterns from other Clearing components
- [ ] **Status colors match** — Green/yellow/red match Clearing's existing palette
- [ ] **Mobile responsive** — Stats grid is 2-col on mobile, 4-col on desktop
- [ ] **Accessible** — Proper color contrast, no color-only indicators
- [ ] **Organic feel** — Rounded corners (rounded-xl), soft backgrounds, welcoming copy

---

## Testing Checklist

- [ ] Component renders with mock data when BACKUPS_DB not available
- [ ] Component renders with real data from grove-backups-db
- [ ] Reliability score bar animates smoothly (700ms ease-out)
- [ ] Dark mode styling matches Clearing's other glass cards
- [ ] Mobile layout stacks stats in 2x2 grid
- [ ] "Today" and "Yesterday" labels work correctly for dates
- [ ] Weekly vs Daily badges display correctly (count >= 10 = weekly)
- [ ] Health status correctly detects if backups are current (within 2 days)

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

- **Grove UI Patterns:** `/docs/design/grove-ui-patterns.md` (READ THIS FIRST)
- **Patina Project:** `/Users/autumn/Documents/Projects/Patina`
- **Patina Status Script:** `/Users/autumn/Documents/Projects/Patina/scripts/status.sh`
- **Clearing Spec:** `/docs/specs/clearing-spec.md`
- **Clearing Implementation:** `/clearing`

---

*Generated by Claude Code for GroveEngine/Clearing integration*
*Follows Grove UI patterns: Lucide icons only, glassmorphism, organic feel*
