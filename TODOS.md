# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

---

## 🚀 Session Handoff Notes (2025-12-19 - Session 3)

### Quick Start for Next Agent
```bash
pnpm install      # Install deps (required first!)
pnpm build        # Build library to dist/
pnpm test --run   # Run tests (148 passing)
```

### What Was Completed This Session

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

### Test Summary
- **148 tests passing** (up from 109)
- 5 active test files, 3 skipped (future features)

### Actionable Next Steps (Priority Order)

**1. Build LayoutPanel component** (`src/lib/components/LayoutPanel.svelte`)
```bash
# Currently a placeholder - needs full implementation
# Reference: ColorPanel.svelte and TypographyPanel.svelte for patterns
```
Features needed:
- Layout type selector: `sidebar | no-sidebar | centered | full-width | grid | masonry`
- Max width input (with presets like 1000px, 1200px, 1400px)
- Spacing mode: `compact | comfortable | spacious`
- Live preview of layout changes

**2. Build ThemeCustomizer component** (`src/lib/components/ThemeCustomizer.svelte`)
```bash
# Currently a placeholder - this is the main customizer sidebar
```
Features needed:
- Combine ColorPanel, TypographyPanel, LayoutPanel in a tabbed/accordion UI
- Save button that calls `saveThemeSettings()` from `theme-saver.ts`
- Reset button that reverts to base theme defaults
- Live preview integration with ThemePreview component

**3. Implement CustomCSSEditor** (`src/lib/components/CustomCSSEditor.svelte`)
```bash
# Currently a placeholder - see tests/css-validator.test.ts for validation logic (skipped)
```
Features needed:
- Textarea for custom CSS input
- 10KB size limit validation
- Block dangerous properties (`@import`, `url()`, `expression()`)
- Live preview of CSS effects

**4. Create theme thumbnails**
- Each theme needs a `/themes/{id}-thumb.png`
- Could be generated programmatically or designed manually

### Component Patterns to Follow

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

See `ColorPanel.svelte` for the most comprehensive example with:
- Multiple color inputs with validation
- Preset palettes
- Reset functionality
- WCAG contrast checking

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
├── components/     # Svelte 5 components (6 implemented: AccentColorPicker, ThemeSelector, ThemePreview, ColorPanel, TypographyPanel)
├── server/         # D1 database functions (theme-loader.ts, theme-saver.ts - both implemented)
├── stores/         # Svelte stores (theme.ts for light/dark/system mode)
├── themes/         # Theme definitions (all 10 themes use token system, pass WCAG AA)
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
| `ColorPanel.svelte` | ✅ Fully implemented |
| `TypographyPanel.svelte` | ✅ Fully implemented |
| `LayoutPanel.svelte` | ⏳ Placeholder |
| `CustomCSSEditor.svelte` | ⏳ Placeholder |
| `ThemeCustomizer.svelte` | ⏳ Placeholder |
| `FontUploader.svelte` | ⏳ Placeholder |
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
| `zine.ts` | ✅ Uses tokens |
| `typewriter.ts` | ✅ Uses tokens |
| `cozy-cabin.ts` | ✅ Uses tokens |

### Important Gotchas

1. **Tier system**: Themes have `tier: 'seedling' | 'sapling'` - see `types.ts` for `UserTier`
2. **WCAG compliance**: All themes MUST pass `validateThemeContrast()` - 4.5:1 for body text
3. **D1 types**: Global `D1Database` declared in `theme-loader.ts` - don't redeclare
4. **CSS variables**: Use `color-mix()` for accent variations (see `css-vars.ts`)

### What's Next (Priority Order)

1. **LayoutPanel component** (`src/lib/components/LayoutPanel.svelte`)
   - Layout type selection (sidebar, centered, full-width, grid, masonry)
   - Max width control
   - Spacing mode (compact, comfortable, spacious)

2. **ThemeCustomizer component** (`src/lib/components/ThemeCustomizer.svelte`)
   - Sidebar UI combining ColorPanel, TypographyPanel, LayoutPanel
   - Live preview integration
   - Save/reset functionality

3. **CustomCSSEditor component** (`src/lib/components/CustomCSSEditor.svelte`)
   - CSS textarea with syntax highlighting (optional)
   - Validation (10KB limit, no dangerous properties)
   - Live preview of custom CSS

4. **FontUploader component** (Phase 5 - Evergreen)
   - WOFF2 file upload and validation
   - R2 storage integration

### Recommended Approach

For **LayoutPanel**, follow this pattern:
```svelte
<script lang="ts">
  interface Props {
    layout: ThemeLayout;
    onChange?: (layout: Partial<ThemeLayout>) => void;
  }
  let { layout, onChange }: Props = $props();
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

## Phase 4: Theme Customizer (Oak+)
- [ ] Build customizer sidebar UI (ThemeCustomizer.svelte)
- [ ] Implement live preview system
- [x] Build ColorPanel component - 6 color inputs with presets and WCAG validation
- [x] Build TypographyPanel component - font selectors with live preview
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

*Last updated: 2025-12-19 - Session 3: ColorPanel, TypographyPanel, theme tokens, integration tests. 148 tests passing.*
