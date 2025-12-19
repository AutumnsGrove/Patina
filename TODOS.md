# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

---

## 🚀 Session Handoff Notes (2025-12-19 - Session 2)

### Quick Start for Next Agent
```bash
pnpm install      # Install deps (required first!)
pnpm build        # Build library to dist/
pnpm test --run   # Run tests (109 passing)
```

### What Was Completed This Session

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
├── components/     # Svelte 5 components (AccentColorPicker, ThemeSelector, ThemePreview done)
├── server/         # D1 database functions (theme-loader.ts, theme-saver.ts - both implemented)
├── stores/         # Svelte stores (theme.ts for light/dark/system mode)
├── themes/         # Theme definitions (all 10 themes pass WCAG AA)
├── tokens/         # Color tokens from groveengine (grove, cream, bark scales)
├── utils/          # Utilities (contrast.ts, css-vars.ts - both implemented & tested)
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

1. **ColorPanel component** (`src/lib/components/ColorPanel.svelte`)
   - Color editing UI for theme customizer (Phase 4)
   - Should use AccentColorPicker as reference for patterns
   - Needs to edit all ThemeColors properties

2. **TypographyPanel component** (`src/lib/components/TypographyPanel.svelte`)
   - Font family selection for heading, body, mono
   - Font stack preview
   - System fonts + custom font support (Evergreen tier)

3. **Remaining theme styling** (Phase 3)
   - Zine: bold, magazine-style - needs unique fonts/colors
   - Typewriter: retro, monospace aesthetic
   - Cozy Cabin: warm browns (use bark tokens)
   - All must pass `validateThemeContrast()` - run tests!

4. **Integration tests**
   - Theme switching functionality
   - Tier-based access control in ThemeSelector

### Recommended Approach

For **ColorPanel**, follow this pattern from AccentColorPicker:
```svelte
<script lang="ts">
  interface Props {
    colors: ThemeColors;
    onChange?: (colors: Partial<ThemeColors>) => void;
  }
  let { colors, onChange }: Props = $props();
</script>
```

For **themes**, always validate after changes:
```bash
pnpm test tests/themes.test.ts
```

### Reference Files

- **Spec**: `docs/specs/theme-system-spec.md` - Full feature requirements
- **Types**: `src/lib/types.ts` - All TypeScript interfaces
- **Migrations**: `migrations/*.sql` - Database schema

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

*Last updated: 2025-12-19 - Phase 2 complete: ThemeSelector, ThemePreview, theme validation, 109 tests passing*
