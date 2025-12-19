# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

---

## 🚀 Session Handoff Notes (2025-12-19 - Session 6)

### Quick Start for Next Agent
```bash
pnpm install      # Install deps (required first!)
pnpm build        # Build library to dist/
pnpm test --run   # Run tests (186 passing)
pnpm lint         # Run ESLint (0 errors, warnings only)
```

### What Was Completed This Session

**Font Uploader Server Functions** (`src/lib/server/font-uploader.ts`) - ✅ FULLY IMPLEMENTED:
- `uploadFont()` - Upload to R2 + register in D1, with rollback on failure
- `deleteFont()` - Remove from R2 + D1
- `listFonts()` - List all fonts for tenant
- `getFont()` - Get single font by ID
- `countFonts()` - Count fonts per tenant
- Full R2Bucket type declarations for Cloudflare Workers

**Community Themes Server Functions** (`src/lib/server/community-themes.ts`) - ✅ FULLY IMPLEMENTED:
- `createCommunityTheme()` - Create with auto UUID, defaults, timestamps
- `getCommunityTheme()` - Get single theme by ID
- `updateCommunityTheme()` - Dynamic partial updates
- `deleteCommunityTheme()` - Delete with creator ownership validation
- `listCommunityThemes()` - Flexible filtering (status, creator, pagination, ordering)
- `incrementDownloads()` - Atomic download counter
- `addRating()` - Add 1-5 star ratings
- `updateThemeStatus()` - Moderation status updates
- `getThemesByCreator()` - List themes by creator
- `getApprovedThemes()` - Get approved/featured sorted by downloads
- `getFeaturedThemes()` - Get featured themes only

**CommunityThemeBrowser Component** (`src/lib/components/CommunityThemeBrowser.svelte`) - ✅ FULLY IMPLEMENTED:
- Responsive grid layout (1-4 columns)
- Featured themes section with star badge
- Theme cards with color palette preview, ratings, downloads, tags
- Search by name/description/tags
- Filter by base theme and tags
- Sort by popular/rating/newest
- Tier gating for Oak+ users
- Full accessibility (ARIA, keyboard nav, focus states)
- Svelte 5 runes ($props, $state, $derived)

### Test Summary
- **186 tests passing** - All tests continue to pass
- Build compiles successfully to `dist/`
- ESLint: 0 errors, 27 warnings (mostly Svelte 5 migration hints)

### Actionable Next Steps (Priority Order)

**1. Wire up FontUploader to server functions** (Recommended First)
```typescript
// In your SvelteKit route (e.g., +server.ts):
import { uploadFont, deleteFont, listFonts } from '@autumnsgrove/patina/server/font-uploader';

// POST /api/fonts - Upload new font
// DELETE /api/fonts/:id - Delete font
// GET /api/fonts - List fonts for tenant
```
- Create `src/routes/api/fonts/+server.ts` with R2/D1 bindings
- Connect FontUploader's `onUpload` callback to POST endpoint
- Connect FontUploader's `onDelete` callback to DELETE endpoint

**2. Create theme thumbnails** (Design Task)
- Each theme needs a thumbnail at `/static/themes/{id}-thumb.png`
- Dimensions: 400x300px recommended
- 10 themes need thumbnails: grove, minimal, night-garden, moodboard, solarpunk, ocean, wildflower, zine, typewriter, cozy-cabin
- Can generate programmatically by rendering ThemePreview to canvas

**3. Complete Community Themes UI**
```typescript
// Components needed:
// - CommunityThemeSubmit.svelte - Form to submit new theme
// - ModerationQueue.svelte - Admin view for reviewing themes
// - ThemeRating.svelte - Star rating component
```
- Wire CommunityThemeBrowser to server functions via API routes
- Add theme sharing flow (POST /api/community-themes)
- Build moderation queue UI for admins
- Add theme import functionality

**4. Add integration tests for server functions**
```bash
# Create these test files:
# tests/font-uploader.test.ts - Mock R2/D1 and test all functions
# tests/community-themes.test.ts - Mock D1 and test CRUD operations
```

### Important Gotchas for Next Agent

1. **Svelte 5 Runes**: All components use `$props()`, `$state()`, `$derived()`, `$effect()` - NOT the old reactive syntax
2. **Tier system**: `UserTier = 'free' | 'seedling' | 'sapling' | 'oak' | 'evergreen'` - check `tier-access.ts`
3. **WCAG compliance**: All themes MUST pass `validateThemeContrast()` - 4.5:1 for body text
4. **D1 types**: Global `D1Database` declared in `theme-loader.ts` - don't redeclare
5. **R2 types**: Global `R2Bucket` declared in `font-uploader.ts` - don't redeclare
6. **Testing**: Run `pnpm test --run` before committing - all 186 tests must pass
7. **Build**: Run `pnpm build` to ensure library compiles to `dist/`

### What's Fully Implemented

| Component | Status |
|-----------|--------|
| `AccentColorPicker.svelte` | ✅ Complete |
| `ThemeSelector.svelte` | ✅ Complete |
| `ThemePreview.svelte` | ✅ Complete |
| `ColorPanel.svelte` | ✅ Complete |
| `CommunityThemeBrowser.svelte` | ✅ Complete |
| `TypographyPanel.svelte` | ✅ Complete |
| `LayoutPanel.svelte` | ✅ Complete |
| `CustomCSSEditor.svelte` | ✅ Complete |
| `ThemeCustomizer.svelte` | ✅ Complete |
| `FontUploader.svelte` | ✅ Complete |
| `theme-loader.ts` | ✅ Complete |
| `theme-saver.ts` | ✅ Complete |
| `font-uploader.ts` | ✅ Complete (R2 + D1) |
| `community-themes.ts` | ✅ Complete (Full CRUD) |
| `font-validator.ts` | ✅ Complete |
| `css-validator.ts` | ✅ Complete |
| `contrast.ts` | ✅ Complete |
| `css-vars.ts` | ✅ Complete |
| `registry.ts` | ✅ Complete |

### Reference Files

- **Spec**: `docs/specs/theme-system-spec.md` - Full feature requirements
- **Types**: `src/lib/types.ts` - All TypeScript interfaces
- **Migrations**: `migrations/*.sql` - Database schema
- **Token Colors**: `src/lib/tokens/colors.ts` - grove, bark, cream scales

### Component Patterns (Svelte 5 Runes)

All components use Svelte 5 runes:
```typescript
// Props with defaults
let { value = defaultValue, onChange }: Props = $props();

// Local state
let localState = $state(value);

// Derived values
let computed = $derived(someCalculation(localState));

// Side effects
$effect(() => {
  // React to changes
});
```

See `ThemeCustomizer.svelte` for a comprehensive example combining multiple panels with:
- Tabbed navigation with keyboard support
- State management across multiple panels
- Save/reset functionality
- Unsaved changes detection

---

## Previous Session Work (Session 4)

**LayoutPanel, ThemeCustomizer, CustomCSSEditor** - See git history for details.

---

## Previous Session Work (Session 3)

**ColorPanel Component** (`src/lib/components/ColorPanel.svelte`):
- Color inputs for all ThemeColors properties (background, surface, foreground, foregroundMuted, accent, border)
- Native color picker + hex input with validation
- Live WCAG AA contrast checking for text colors
- 6 preset color palettes (Light, Dark, Sepia, Forest, Ocean, Sunset)
- Reset buttons (individual and "Reset All")
- Full accessibility (ARIA labels, keyboard nav, focus states)

**TypographyPanel Component** (`src/lib/components/TypographyPanel.svelte`):
- Font family selectors for heading, body, and mono fonts
- System font stacks (System UI, Arial, Georgia, Times New Roman, etc.)
- Monospace font options (UI Monospace, Courier New, Monaco, Consolas)
- Live font previews for each font role
- Custom fonts section (for Evergreen tier)
- Full accessibility with proper ARIA labels

**Theme Token System Updates**:
- Updated Zine theme to use bark/cream tokens (warm alternative to pure black)
- Updated Typewriter theme to use cream[300] background, bark tokens for text
- Updated Cozy Cabin theme (dark theme) with bark[950]/[900] backgrounds, cream foreground

**Integration Tests**:
- `tests/theme-switching.test.ts` (17 tests): Theme retrieval, CSS variable generation, settings overrides
- `tests/tier-access.test.ts` (22 tests): Tier hierarchy, theme access per tier, feature gating

---

## Previous Session Work (Session 2)

**ThemeSelector Component** (`src/lib/components/ThemeSelector.svelte`):
- Responsive grid layout (1-4 columns based on viewport)
- Theme cards with color palette preview, name, description
- Tier badges (Seedling = green, Sapling = blue)
- Lock overlay with icon for inaccessible themes
- Selected state with checkmark indicator
- Full accessibility (ARIA radiogroup, keyboard nav)
- Tier-based access control

**ThemePreview Component** (`src/lib/components/ThemePreview.svelte`):
- Live preview of theme colors and fonts
- Sample blog post layout (heading, body, link, code)
- Supports accent color override prop
- Spacing derived from theme layout settings
- Self-contained with inline styles

**Theme Validation & Fixes**:
- Added 30 theme tests in `tests/themes.test.ts`
- Fixed 4 themes failing WCAG AA contrast:
  - moodboard: foregroundMuted → #666666
  - solarpunk: foregroundMuted → grove[700]
  - ocean: foregroundMuted → #075985
  - wildflower: foregroundMuted → #6d28d9

**CSS Variable Tests** (`tests/css-vars.test.ts`):
- 38 comprehensive tests for css-vars.ts utilities
- Tests for all spacing modes, color overrides, typography

**Registry Enhancement** (`src/lib/themes/registry.ts`):
- Implemented `getThemesForTier()` with proper tier hierarchy
- Free: 0 themes, Seedling: 3 themes, Sapling+: all 10

### Architecture Overview

**This is a SvelteKit library** (`svelte-package`), not a full app. It exports:
- Components (Svelte 5 with runes: `$props()`, `$state()`, `$derived()`)
- Server functions (for Cloudflare D1 database)
- Utilities (contrast checking, CSS variable generation)
- Theme definitions

**Key directories:**
```
src/lib/
├── components/     # Svelte 5 components (9 implemented)
├── server/         # D1 database functions (theme-loader.ts, theme-saver.ts)
├── stores/         # Svelte stores (theme.ts for light/dark/system mode)
├── themes/         # Theme definitions (all 10 themes use token system, pass WCAG AA)
├── tokens/         # Color tokens from groveengine (grove, cream, bark scales)
├── utils/          # Utilities (contrast.ts, css-vars.ts)
└── types.ts        # TypeScript interfaces
```

### What's Implemented vs Placeholder

| File | Status |
|------|--------|
| `AccentColorPicker.svelte` | ✅ Fully implemented |
| `ThemeSelector.svelte` | ✅ Fully implemented |
| `ThemePreview.svelte` | ✅ Fully implemented |
| `ColorPanel.svelte` | ✅ Fully implemented |
| `TypographyPanel.svelte` | ✅ Fully implemented |
| `LayoutPanel.svelte` | ✅ Fully implemented |
| `CustomCSSEditor.svelte` | ✅ Fully implemented |
| `ThemeCustomizer.svelte` | ✅ Fully implemented |
| `FontUploader.svelte` | ✅ Fully implemented |
| `theme-loader.ts` | ✅ Fully implemented |
| `theme-saver.ts` | ✅ Fully implemented |
| `contrast.ts` | ✅ Fully implemented (41 tests) |
| `css-vars.ts` | ✅ Fully implemented (38 tests) |
| `registry.ts` | ✅ Tier filtering implemented |

### Important Gotchas

1. **Tier system**: Themes have `tier: 'seedling' | 'sapling'` - see `types.ts` for `UserTier`
2. **WCAG compliance**: All themes MUST pass `validateThemeContrast()` - 4.5:1 for body text
3. **D1 types**: Global `D1Database` declared in `theme-loader.ts` - don't redeclare
4. **CSS variables**: Use `color-mix()` for accent variations (see `css-vars.ts`)

---

## Previous Session Work (Session 1)

**AccentColorPicker Component (fully implemented):**
- Color picker UI with native `<input type="color">` and hex input
- Preset color swatches using grove palette colors
- Live contrast preview against background color
- WCAG AA compliance indicator
- Full accessibility (keyboard navigation, ARIA labels)
- Syncs with external value changes

**Database Integration (fully implemented):**
- `loadThemeSettings()` - queries D1 for tenant settings
- `loadThemeSettingsWithDefaults()` - returns defaults if no settings exist
- `hasThemeSettings()` - checks if tenant has custom settings
- `saveThemeSettings()` - upserts full theme settings (INSERT ON CONFLICT)
- `updateAccentColor()` - updates just accent color
- `updateThemeId()` - updates just theme ID
- `updateCustomColors()` - updates custom color overrides
- `updateCustomCSS()` - updates custom CSS
- `setCustomizerEnabled()` - toggles customizer
- `resetThemeSettings()` - deletes settings to reset to defaults

---

## Phase 0: Project Scaffolding ✅
- [x] Initialize repository structure
- [x] Set up SvelteKit library mode configuration
- [x] Create directory structure per spec
- [x] Add placeholder files for all modules
- [x] Create database migrations
- [x] Set up test structure
- [x] Move spec to docs/

---

## Phase 1: Foundation ✅

### Core Setup
- [x] Run `pnpm install` to install dependencies
- [x] Verify TypeScript and Vitest configuration
- [x] Set up ESLint and Prettier (Session 5: eslint.config.js with flat config)
- [x] Configure svelte-check (already in package.json scripts)

### Groveengine Integration ✅
- [x] Import color tokens from groveengine (grove, cream, bark scales)
- [x] Create `src/lib/tokens/colors.ts` with semantic colors
- [x] Create theme store for light/dark/system mode
- [x] Update Grove theme to use groveengine color tokens

### CSS Variable System ✅
- [x] Implement `generateThemeVariables()` in css-vars.ts
- [x] Implement `generateSettingsVariables()` for custom overrides
- [x] Implement `applyThemeVariables()` for runtime application
- [x] Implement `generateAccentVariations()` using color-mix
- [x] Test CSS variable generation (38 tests)

### Contrast Utilities ✅
- [x] Implement `getRelativeLuminance()` per WCAG spec
- [x] Implement `getContrastRatio()` calculation
- [x] Implement `meetsWCAGAA()` and `meetsWCAGAAA()` checks
- [x] Implement `validateThemeContrast()` for full theme validation
- [x] Implement `suggestReadableColor()` helper
- [x] Write tests for contrast utilities (41 tests passing)

### AccentColorPicker Component ✅
- [x] Design color picker UI
- [x] Implement color selection logic
- [x] Add live preview
- [x] Add accessibility (keyboard navigation, labels)

### Database Integration ✅
- [x] Implement `loadThemeSettings()` in theme-loader.ts
- [x] Implement `saveThemeSettings()` in theme-saver.ts
- [ ] Test with D1 database (requires deployed environment)

---

## Phase 2: Curated Themes ✅

### Theme Design
- [x] Finalize Grove theme colors and styling (uses token system)
- [x] Finalize Minimal theme (uses bark tokens)
- [x] Finalize Night Garden theme (uses grove tokens)

### Components
- [x] Build ThemeSelector component
- [x] Build ThemePreview component
- [x] Add tier gating logic to theme selection (registry.ts)

### Testing
- [x] Validate all themes meet WCAG AA contrast (30 tests)
- [x] Test theme switching functionality (17 tests in theme-switching.test.ts)
- [x] Test tier-based access control (22 tests in tier-access.test.ts)

---

## Phase 3: Remaining Themes ✅
- [x] Implement Zine theme (bold, magazine-style) - uses bark/cream tokens
- [x] Fix Moodboard theme WCAG contrast (foregroundMuted → #666666)
- [x] Implement Typewriter theme (retro, monospace) - uses cream[300], bark tokens
- [x] Fix Solarpunk theme WCAG contrast (foregroundMuted → grove[700])
- [x] Implement Cozy Cabin theme (warm browns) - dark theme with bark[950]/[900]
- [x] Fix Ocean theme WCAG contrast (foregroundMuted → #075985)
- [x] Fix Wildflower theme WCAG contrast (foregroundMuted → #6d28d9)
- [ ] Create theme thumbnails
- [x] Complete theme preview functionality (ThemePreview component)

---

## Phase 4: Theme Customizer (Oak+) ✅
- [x] Build customizer sidebar UI (ThemeCustomizer.svelte)
- [x] Implement live preview system (effectiveTheme export)
- [x] Build ColorPanel component - 6 color inputs with presets and WCAG validation
- [x] Build TypographyPanel component - font selectors with live preview
- [x] Build LayoutPanel component - layout type, max width, spacing mode
- [x] Implement CustomCSSEditor with validation - 10KB limit, security checks
- [x] Add reset to default functionality

---

## Phase 5: Custom Fonts (Evergreen)
- [x] Build FontUploader component
- [x] Implement WOFF2 validation (magic bytes, parsing)
- [x] Add R2 storage integration (font-uploader.ts server functions)
- [x] Add font limit enforcement (10 per tenant)

---

## Phase 6: Community Themes (Oak+)
- [ ] Build theme sharing flow
- [x] Create community theme browser (CommunityThemeBrowser.svelte)
- [x] Implement server CRUD functions (community-themes.ts)
- [ ] Implement theme import
- [ ] Build moderation queue
- [x] Add rating and download tracking (server functions)

---

## Notes
- All themes must meet WCAG 2.1 AA contrast (4.5:1 for body text)
- Custom CSS max size: 10KB
- Custom font max size: 500KB per file
- Maximum 10 custom fonts per tenant

---

*Last updated: 2025-12-19 - Session 6: font-uploader.ts, community-themes.ts, CommunityThemeBrowser.svelte. 186 tests passing.*
