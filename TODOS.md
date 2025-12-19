# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

---

## 🚀 Session Handoff Notes (2025-12-19 - Session 4)

### Quick Start for Next Agent
```bash
pnpm install      # Install deps (required first!)
pnpm build        # Build library to dist/
pnpm test --run   # Run tests (167 passing)
```

### What Was Completed This Session

**LayoutPanel Component** (`src/lib/components/LayoutPanel.svelte`):
- Layout type selector with 6 options: sidebar, no-sidebar, centered, full-width, grid, masonry
- Visual preview diagrams for each layout type
- Max width input with presets (1000px, 1200px, 1400px, 1600px) + custom CSS validation
- Spacing mode selection: compact, comfortable, spacious
- Reset buttons for individual fields and "Reset All"
- Full accessibility (ARIA labels, keyboard navigation, focus states)

**ThemeCustomizer Component** (`src/lib/components/ThemeCustomizer.svelte`):
- Tabbed UI with 4 sections: Colors, Typography, Layout, Custom CSS
- Integrates ColorPanel, TypographyPanel, LayoutPanel, CustomCSSEditor
- State management for all customizations with unsaved changes detection
- Save button (calls onSave with updated ThemeSettings)
- Reset to Default and Cancel buttons
- Exports `effectiveTheme` for live preview integration
- Keyboard navigation between tabs (arrow keys)
- Full accessibility with ARIA roles and labels

**CustomCSSEditor Component** (`src/lib/components/CustomCSSEditor.svelte`):
- Large textarea with dark code editor aesthetic
- 10KB size limit with visual progress bar
- Security validation blocking dangerous patterns:
  - `@import` statements
  - `javascript:` URLs
  - `expression()` (IE vulnerability)
  - `behavior:` (IE vulnerability)
  - `-moz-binding` (Firefox vulnerability)
  - `<script>` tags
  - External URLs in `url()`
- Real-time validation feedback with error/warning display
- CSS variable hints section
- Character, line, and byte count display
- Clear button

**CSS Validator Tests** (`tests/css-validator.test.ts`):
- 19 tests for CSS validation logic
- Size limit tests (under limit, over limit, warning threshold)
- Blocked patterns tests (all 8 dangerous patterns)
- URL validation tests (CSS variables, data URIs, relative URLs)
- Valid CSS tests (custom properties, animations, gradients)

### Test Summary
- **167 tests passing** (up from 148)
- 6 active test files, 2 skipped (future features: customizer integration, font validator)

### Actionable Next Steps (Priority Order)

**1. Create theme thumbnails**
- Each theme needs a `/themes/{id}-thumb.png`
- Could be generated programmatically or designed manually
- 10 themes need thumbnails: grove, minimal, night-garden, moodboard, solarpunk, ocean, wildflower, zine, typewriter, cozy-cabin

**2. Build FontUploader component** (`src/lib/components/FontUploader.svelte`)
```bash
# Currently a placeholder - Phase 5 (Evergreen tier)
# Reference: CustomCSSEditor.svelte for validation patterns
```
Features needed:
- WOFF2 file upload with drag-and-drop
- File size validation (500KB limit)
- Magic bytes validation for WOFF2 (`0x774F4632`)
- R2 storage integration (see `AgentUsage/cloudflare_guide.md`)
- Font limit enforcement (10 per tenant)
- Progress indicator during upload
- Preview of uploaded font

**3. Implement Customizer Integration Tests** (`tests/customizer.test.ts`)
- Currently skipped - needs component testing setup
- Test CSS variable generation, settings merge, tier gating

### Reference Files

- **Spec**: `docs/specs/theme-system-spec.md` - Full feature requirements
- **Types**: `src/lib/types.ts` - All TypeScript interfaces
- **Migrations**: `migrations/*.sql` - Database schema
- **Token Colors**: `src/lib/tokens/colors.ts` - grove, bark, cream scales

### Recommended Approach for FontUploader

Follow the CustomCSSEditor pattern:
```svelte
<script lang="ts">
  interface Props {
    tenantId: string;
    existingFonts?: CustomFont[];
    maxFonts?: number;
    maxSize?: number;
    onUpload?: (font: CustomFont) => void;
    onError?: (error: string) => void;
  }
  let { tenantId, existingFonts = [], maxFonts = 10, maxSize = 512000, onUpload, onError }: Props = $props();

  // Validate WOFF2 magic bytes
  function isValidWOFF2(buffer: ArrayBuffer): boolean {
    const view = new DataView(buffer);
    return view.getUint32(0) === 0x774F4632; // 'wOF2'
  }
</script>
```

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

See `ThemeCustomizer.svelte` for a comprehensive example combining multiple panels with:
- Tabbed navigation with keyboard support
- State management across multiple panels
- Save/reset functionality
- Unsaved changes detection

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
| `FontUploader.svelte` | ⏳ Placeholder |
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

*Last updated: 2025-12-19 - Session 4: LayoutPanel, ThemeCustomizer, CustomCSSEditor, CSS validator tests. 167 tests passing.*
