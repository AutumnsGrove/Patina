# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

---

## 🚀 Session Handoff Notes (2025-12-19)

### Quick Start for Next Agent
```bash
pnpm install      # Install deps (required first!)
pnpm build        # Build library to dist/
pnpm test --run   # Run tests (109 passing)
```

### Architecture Overview

**This is a SvelteKit library** (`svelte-package`), not a full app. It exports:
- Components (Svelte 5 with runes: `$props()`, `$state()`, `$derived()`)
- Server functions (for Cloudflare D1 database)
- Utilities (contrast checking, CSS variable generation)
- Theme definitions

**Key directories:**
```
src/lib/
├── components/     # Svelte 5 components (AccentColorPicker done, others are placeholders)
├── server/         # D1 database functions (theme-loader.ts, theme-saver.ts - both implemented)
├── stores/         # Svelte stores (theme.ts for light/dark/system mode)
├── themes/         # Theme definitions (grove, minimal, night-garden use tokens)
├── tokens/         # Color tokens from groveengine (grove, cream, bark scales)
├── utils/          # Utilities (contrast.ts, css-vars.ts - both implemented)
└── types.ts        # TypeScript interfaces
```

### Token System Explained

Instead of hardcoding hex colors, we import from `src/lib/tokens/colors.ts`:

```typescript
import { grove, bark, cream, semantic } from '../tokens/colors.js';

// Color scales (50=lightest, 950=darkest)
grove[600]  // '#16a34a' - primary green
bark[900]   // '#3d2914' - primary brown
cream[50]   // '#fefdfb' - primary cream

// Semantic colors (named by purpose)
semantic.background  // cream.DEFAULT
semantic.foreground  // bark.DEFAULT
```

**When adding new themes**, import tokens and create a local palette object:
```typescript
const myPalette = {
  background: cream[50],
  accent: grove[600],
  // custom colors as needed
} as const;
```

### Patterns to Follow

**Svelte 5 Runes** (NOT Svelte 4 syntax):
```typescript
// Props
let { value, onChange }: Props = $props();

// State
let hexInput = $state(value);

// Derived
let contrastRatio = $derived(getContrastRatio(value, bg));

// Effects
$effect(() => { /* runs when dependencies change */ });
```

**Database functions** use Cloudflare D1:
```typescript
const row = await db
  .prepare('SELECT * FROM theme_settings WHERE tenant_id = ?')
  .bind(tenantId)
  .first<ThemeSettingsRow>();
```

### What's Implemented vs Placeholder

| File | Status |
|------|--------|
| `AccentColorPicker.svelte` | ✅ Fully implemented |
| `ThemeSelector.svelte` | ✅ Fully implemented |
| `ThemePreview.svelte` | ✅ Fully implemented |
| `ColorPanel.svelte` | ⏳ Placeholder |
| `theme-loader.ts` | ✅ Fully implemented |
| `theme-saver.ts` | ✅ Fully implemented |
| `contrast.ts` | ✅ Fully implemented (41 tests) |
| `css-vars.ts` | ✅ Fully implemented (38 tests) |
| `registry.ts` | ✅ Tier filtering implemented |
| `grove.ts` | ✅ Uses tokens |
| `minimal.ts` | ✅ Uses tokens |
| `night-garden.ts` | ✅ Uses tokens |
| `moodboard.ts` | ✅ WCAG fixed |
| `solarpunk.ts` | ✅ WCAG fixed |
| `ocean.ts` | ✅ WCAG fixed |
| `wildflower.ts` | ✅ WCAG fixed |
| Other themes | ⏳ Placeholder |

### Important Gotchas

1. **Tier system**: Themes have `tier: 'seedling' | 'sapling'` - see `types.ts` for `UserTier`
2. **WCAG compliance**: All themes MUST pass `validateThemeContrast()` - 4.5:1 for body text
3. **D1 types**: Global `D1Database` declared in `theme-loader.ts` - don't redeclare
4. **CSS variables**: Use `color-mix()` for accent variations (see `css-vars.ts`)

### What's Next (Priority Order)

1. **ColorPanel component** - For theme customizer color editing
2. **TypographyPanel component** - Font customization UI
3. **Test theme switching** - Integration tests for theme selection
4. **Implement remaining themes** - Zine, Typewriter, Cozy Cabin need styling

### Reference Files

- **Spec**: `docs/specs/theme-system-spec.md` - Full feature requirements
- **Types**: `src/lib/types.ts` - All TypeScript interfaces
- **Migrations**: `migrations/*.sql` - Database schema

---

## What Was Completed This Session

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

**Theme Token System Updates:**
- Minimal theme now uses `bark` tokens for warm text colors
- Night Garden theme now uses `grove` tokens for accent and foreground

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

## Phase 1: Foundation (Current Phase)

### Core Setup
- [x] Run `pnpm install` to install dependencies
- [x] Verify TypeScript and Vitest configuration
- [ ] Set up ESLint and Prettier
- [ ] Configure svelte-check

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

## Phase 2: Curated Themes

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
- [ ] Test theme switching functionality
- [ ] Test tier-based access control

---

## Phase 3: Remaining Themes
- [ ] Implement Zine theme (bold, magazine-style)
- [x] Fix Moodboard theme WCAG contrast (foregroundMuted → #666666)
- [ ] Implement Typewriter theme (retro, monospace)
- [x] Fix Solarpunk theme WCAG contrast (foregroundMuted → grove[700])
- [ ] Implement Cozy Cabin theme (warm browns)
- [x] Fix Ocean theme WCAG contrast (foregroundMuted → #075985)
- [x] Fix Wildflower theme WCAG contrast (foregroundMuted → #6d28d9)
- [ ] Create theme thumbnails
- [ ] Complete theme preview functionality

---

## Phase 4: Theme Customizer (Oak+)
- [ ] Build customizer sidebar UI
- [ ] Implement live preview system
- [ ] Build ColorPanel component
- [ ] Build TypographyPanel component
- [ ] Build LayoutPanel component
- [ ] Implement CustomCSSEditor with validation
- [ ] Add reset to default functionality

---

## Phase 5: Custom Fonts (Evergreen)
- [ ] Build FontUploader component
- [ ] Implement WOFF2 validation (magic bytes, parsing)
- [ ] Add R2 storage integration
- [ ] Add font limit enforcement (10 per tenant)

---

## Phase 6: Community Themes (Oak+)
- [ ] Build theme sharing flow
- [ ] Create community theme browser
- [ ] Implement theme import
- [ ] Build moderation queue
- [ ] Add rating and download tracking

---

## Notes
- All themes must meet WCAG 2.1 AA contrast (4.5:1 for body text)
- Custom CSS max size: 10KB
- Custom font max size: 500KB per file
- Maximum 10 custom fonts per tenant

---

*Last updated: Phase 1 complete - AccentColorPicker, database integration, theme token updates*
