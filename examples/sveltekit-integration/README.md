# SvelteKit Integration Example

This directory demonstrates how to integrate Foliage server functions into a SvelteKit application with Cloudflare Workers and D1 database.

## Quick Start

### 1. Install Foliage

```bash
pnpm add @autumnsgrove/foliage
```

### 2. Configure Cloudflare Bindings

Update `wrangler.toml` with D1 and R2 bindings:

```toml
[[d1_databases]]
binding = "DB"
database_name = "foliage-db"
database_id = "your-database-id"

[[r2_buckets]]
binding = "R2"
bucket_name = "foliage-fonts"
```

Get your D1 database ID:
```bash
wrangler d1 list
```

### 3. Apply Database Migrations

```bash
# Create base tables
wrangler d1 execute foliage-db --file=node_modules/@autumnsgrove/foliage/migrations/001_initial.sql

# Create community themes table
wrangler d1 execute foliage-db --file=node_modules/@autumnsgrove/foliage/migrations/002_community_themes.sql
```

### 4. Copy API Routes

```bash
cp -r src/routes/api/fonts your-app/src/routes/api/
cp -r src/routes/api/community-themes your-app/src/routes/api/
```

### 5. Update Authentication

Search for `TODO` comments in routes and implement your auth system:

```typescript
// Before
const tenantId = 'example-tenant-id';

// After (using real auth)
const tenantId = locals.user?.tenantId;
if (!tenantId) {
  return json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 6. Run Locally

```bash
wrangler dev
```

## Platform Bindings

All routes access Cloudflare bindings via `platform.env`:

```typescript
const { DB, R2 } = platform.env;
```

Requires `@sveltejs/adapter-cloudflare` in `svelte.config.js`.

---

## API Reference

### Community Themes

#### POST /api/community-themes
**Create a new community theme**

Theme is created in `pending` status for moderation.

**Request Body:**
```json
{
  "name": "Midnight Purple",
  "description": "A sleek dark theme with vibrant purple accents",
  "tags": ["dark", "purple", "modern"],
  "baseTheme": "night-garden",
  "customColors": {
    "accent": "#9333ea",
    "background": "#0f0f0f"
  },
  "customTypography": {
    "headingFont": "Inter",
    "bodyFont": "Roboto"
  },
  "customLayout": {
    "type": "sidebar",
    "maxWidth": "1200px",
    "spacing": "comfortable"
  },
  "customCSS": "body { letter-spacing: 0.5px; }",
  "thumbnailPath": "r2://thumbnails/midnight-purple.png"
}
```

**Validation:**
- `name`: Required, 1-200 characters, non-empty after trim
- `baseTheme`: Required, must exist in system
- `tags`: Optional, max 10 tags, each max 50 characters
- `description`: Optional, trimmed when provided
- All custom* fields: Optional, must be valid types if provided

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "creatorTenantId": "user-123",
  "name": "Midnight Purple",
  "description": "A sleek dark theme...",
  "tags": ["dark", "purple", "modern"],
  "baseTheme": "night-garden",
  "customColors": { "accent": "#9333ea" },
  "downloads": 0,
  "ratingSum": 0,
  "ratingCount": 0,
  "status": "pending",
  "createdAt": 1703001600,
  "updatedAt": 1703001600
}
```

**Error Responses:**
- `400 Bad Request` - Invalid field values
- `401 Unauthorized` - No authentication
- `500 Internal Server Error` - Database error

---

#### GET /api/community-themes
**List themes with filtering, sorting, and pagination**

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | `pending`, `approved`, `featured`, `rejected`, `changes_requested`, `draft`, `in_review`, `removed` |
| `creatorTenantId` | string | - | Filter by creator |
| `limit` | number | 20 | Results per page (1-100) |
| `offset` | number | 0 | Pagination offset |
| `orderBy` | string | `created_at` | `downloads`, `rating`, `created_at`, `updated_at` |
| `orderDir` | string | `desc` | `asc`, `desc` |

**Examples:**

```bash
# Latest themes
GET /api/community-themes?orderBy=created_at&orderDir=desc&limit=20

# Most downloaded approved themes
GET /api/community-themes?status=approved&orderBy=downloads&orderDir=desc&limit=10

# Highest rated (with pagination)
GET /api/community-themes?status=approved&orderBy=rating&orderDir=desc&limit=20&offset=20

# By creator
GET /api/community-themes?creatorTenantId=user-123&limit=50

# Featured only
GET /api/community-themes?status=featured&limit=5
```

**Response:** `200 OK`
```json
{
  "themes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "creatorTenantId": "user-123",
      "name": "Midnight Purple",
      "status": "approved",
      "downloads": 234,
      "ratingSum": 47,
      "ratingCount": 10,
      "createdAt": 1703001600,
      "updatedAt": 1703089600
    }
  ],
  "count": 1,
  "limit": 20,
  "offset": 0
}
```

**Average Rating Calculation:**
```
averageRating = ratingSum / ratingCount
```
(Returns null if no ratings)

---

#### GET /api/community-themes/[id]
**Retrieve a single theme**

**Path Parameters:**
- `id` (string, UUID): Theme ID

**Response:** `200 OK` with full theme object

**Error Responses:**
- `400 Bad Request` - Invalid theme ID
- `404 Not Found` - Theme doesn't exist

---

#### PATCH /api/community-themes/[id]
**Update a theme (creator only)**

Only the original creator can modify their themes.

**Path Parameters:**
- `id` (string, UUID): Theme ID

**Request Body:** Partial theme object
```json
{
  "name": "Updated Theme Name",
  "description": "New description",
  "tags": ["updated", "tags"],
  "customColors": { "accent": "#ff00ff" }
}
```

**Immutable Fields:**
Cannot be modified:
- `id`
- `creatorTenantId`
- `createdAt`
- `downloads` (use `/download` endpoint)
- `ratingSum`, `ratingCount` (use `/rating` endpoint)

**Response:** `200 OK` with updated theme

**Error Responses:**
- `400 Bad Request` - Invalid values or immutable field modification
- `403 Forbidden` - Not the creator
- `404 Not Found` - Theme doesn't exist

---

#### DELETE /api/community-themes/[id]
**Delete a theme (creator only)**

Permanently delete a theme. Only the original creator can delete.

**Path Parameters:**
- `id` (string, UUID): Theme ID

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Error Responses:**
- `404 Not Found` - Theme doesn't exist or user is not creator

---

#### POST /api/community-themes/[id]/rating
**Add a rating to a theme**

Submit a rating (1-5 stars) for a theme. Ratings are cumulative.

**Path Parameters:**
- `id` (string, UUID): Theme ID

**Request Body:**
```json
{
  "rating": 5
}
```

**Validation:**
- Must be integer between 1 and 5 inclusive
- Decimal values are rejected

**Response:** `200 OK` with updated theme
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ratingSum": 47,
  "ratingCount": 10,
  "averageRating": 4.7,
  ...
}
```

**Error Responses:**
- `400 Bad Request` - Invalid rating (not 1-5 or not integer)
- `404 Not Found` - Theme doesn't exist

**Rate Limiting (TODO):**
Currently no per-user rate limiting. Implement to prevent multiple ratings from same user:

```typescript
// Check if user already rated
const existing = await db
  .prepare('SELECT id FROM user_ratings WHERE theme_id = ? AND tenant_id = ?')
  .bind(params.id, tenantId)
  .first();

if (existing) {
  return json({ error: 'You have already rated this theme' }, { status: 409 });
}

// Add rating
await addRating(DB, params.id, rating);

// Track rating
await db.prepare('INSERT INTO user_ratings (theme_id, tenant_id) VALUES (?, ?)')
  .bind(params.id, tenantId)
  .run();
```

---

#### POST /api/community-themes/[id]/download
**Increment download counter**

Track theme downloads for popularity metrics.

**Path Parameters:**
- `id` (string, UUID): Theme ID

**Request Body:** None (POST with empty body)

**Response:** `200 OK` with updated theme
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "downloads": 235,
  "message": "Download count incremented",
  ...
}
```

**Notes:**
- No authentication required (public operation)
- No duplicate detection by default
- Simple counter increments
- Used for popularity sorting

**Error Responses:**
- `404 Not Found` - Theme doesn't exist

**Download Tracking (TODO):**
Consider tracking per-user downloads to prevent spam:

```typescript
interface DownloadTrack {
  id: string;
  theme_id: string;
  tenant_id?: string;
  downloaded_at: number;
  ip_address?: string;
}

// Create table
CREATE TABLE theme_downloads (
  id TEXT PRIMARY KEY,
  theme_id TEXT NOT NULL,
  tenant_id TEXT,
  downloaded_at INTEGER NOT NULL,
  ip_address TEXT,
  FOREIGN KEY (theme_id) REFERENCES community_themes(id)
);

// Track download
const tenantId = locals.user?.tenantId;
const ipAddress = request.headers.get('x-forwarded-for');
await db.prepare(
  'INSERT INTO theme_downloads (id, theme_id, tenant_id, downloaded_at, ip_address) VALUES (?, ?, ?, ?, ?)'
).bind(
  crypto.randomUUID(),
  params.id,
  tenantId || null,
  Math.floor(Date.now() / 1000),
  ipAddress
).run();
```

---

### Font Management

- `POST /api/fonts` - Upload a new font
- `GET /api/fonts` - List fonts for tenant
- `GET /api/fonts/[id]` - Get single font
- `DELETE /api/fonts/[id]` - Delete font

See `src/routes/api/fonts/` for implementation.

---

## Types

Import types for type-safe development:

```typescript
import type {
  CommunityTheme,
  CommunityThemeStatus,
  ThemeColors,
  ThemeFonts,
  ThemeLayout,
  CustomFont
} from '@autumnsgrove/foliage';

import {
  createCommunityTheme,
  getCommunityTheme,
  updateCommunityTheme,
  deleteCommunityTheme,
  listCommunityThemes,
  addRating,
  incrementDownloads,
  updateThemeStatus
} from '@autumnsgrove/foliage/server';
```

---

## Common Patterns

### Pagination

```typescript
const limit = 20;
const pageNum = 3;
const offset = (pageNum - 1) * limit;

GET /api/community-themes?limit=${limit}&offset=${offset}
```

### Sorting

```typescript
const orderBy = 'downloads'; // 'rating', 'created_at', 'updated_at'
const orderDir = 'desc'; // 'asc'

GET /api/community-themes?orderBy=${orderBy}&orderDir=${orderDir}
```

### Filtering

```typescript
const status = 'approved';
const creator = 'user-123';

GET /api/community-themes?status=${status}&creatorTenantId=${creator}
```

### Calculate Average Rating

```typescript
const average = theme.ratingCount > 0
  ? (theme.ratingSum / theme.ratingCount).toFixed(1)
  : 'No ratings';
```

---

## Error Handling

All routes follow consistent error patterns:

**Success:** `{ ...data }`

**Error:**
```json
{
  "error": "Human-readable message",
  "details": "Technical details (optional)",
  "received": "Invalid value (validation errors)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (e.g., duplicate rating)
- `500` - Internal server error

---

## Authentication

### With SvelteKit Hooks

Add to `src/hooks.server.ts`:

```typescript
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get user from session/JWT/etc
  const session = await getSession(event);

  if (session?.user) {
    event.locals.user = {
      id: session.user.id,
      tenantId: session.user.tenantId,
      email: session.user.email
    };
  }

  return resolve(event);
};
```

### In API Routes

```typescript
// Require auth
const tenantId = locals.user?.tenantId;
if (!tenantId) {
  return json({ error: 'Unauthorized' }, { status: 401 });
}

// Check ownership
if (existingTheme.creatorTenantId !== tenantId) {
  return json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Testing with cURL

### Create Theme

```bash
curl -X POST http://localhost:5173/api/community-themes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Theme",
    "baseTheme": "night-garden",
    "tags": ["test"]
  }'
```

### List Themes

```bash
curl "http://localhost:5173/api/community-themes?status=approved&limit=10"
```

### Get Theme

```bash
curl http://localhost:5173/api/community-themes/550e8400-e29b-41d4-a716-446655440000
```

### Update Theme

```bash
curl -X PATCH http://localhost:5173/api/community-themes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Rate Theme

```bash
curl -X POST http://localhost:5173/api/community-themes/550e8400-e29b-41d4-a716-446655440000/rating \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

### Increment Downloads

```bash
curl -X POST http://localhost:5173/api/community-themes/550e8400-e29b-41d4-a716-446655440000/download
```

---

## Best Practices

1. **Always validate input** - Check types, lengths, ranges
2. **Use proper status codes** - Helps client error handling
3. **Include detailed errors** - Aids debugging
4. **Check ownership** - Prevent unauthorized modifications
5. **Implement rate limiting** - Prevent abuse of rating/download endpoints
6. **Log errors** - Use `console.error()` for debugging
7. **Handle async properly** - Use try/catch blocks
8. **Return updated data** - Users expect fresh data after operations
9. **Use type safety** - Leverage TypeScript imports
10. **Scope to tenant** - Always filter by tenantId for data isolation

---

## Troubleshooting

### Platform Bindings Undefined

Ensure running with Wrangler and using `@sveltejs/adapter-cloudflare`:

```bash
# Correct
wrangler dev

# Won't work
node build/index.js
```

### Database Connection Errors

Verify wrangler.toml:
```toml
[[d1_databases]]
binding = "DB"
database_id = "your-correct-id"
```

### TypeScript Errors

Import types correctly:
```typescript
import type { RequestHandler } from './$types';
import type { CommunityTheme } from '@autumnsgrove/foliage';
```

### Migrations Not Applied

Check path and database:
```bash
# Find migration files
find node_modules -name "*.sql" | grep foliage

# Apply migrations
wrangler d1 execute foliage-db --file=node_modules/@autumnsgrove/foliage/migrations/001_initial.sql
```

---

## Next Steps

1. Implement authentication with your identity provider
2. Add rate limiting for rating/download endpoints
3. Set up theme moderation workflow for status changes
4. Implement download tracking table for analytics
5. Add user rating deduplication check
6. Set up monitoring and alerting
7. Implement thumbnail upload and storage
8. Add search functionality
9. Create theme review/moderation dashboard
10. Implement user preferences and saved themes
