# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

---

## 🚀 Session Handoff Notes (2025-12-19)

### What Was Completed This Session

**Groveengine Integration:**
- Cloned groveengine repo to `/tmp/groveengine` for reference
- Extracted color tokens from `packages/engine/src/lib/ui/tokens/colors.ts`
- Created `src/lib/tokens/colors.ts` with grove (green), cream, bark color scales
- Created `src/lib/stores/theme.ts` for light/dark/system theme switching

**Contrast Utilities (fully implemented):**
- `getRelativeLuminance()` - WCAG 2.1 compliant luminance calculation
- `getContrastRatio()` - contrast ratio between two colors
- `meetsWCAGAA()` / `meetsWCAGAAA()` - accessibility checks
- `validateThemeContrast()` - validates all theme color combinations
- `suggestReadableColor()` - suggests readable fg color for any bg
- **41 tests passing** in `tests/contrast.test.ts`

**CSS Variable System (fully implemented):**
- `generateThemeVariables()` - generates CSS custom properties from theme
- `generateSettingsVariables()` - merges base theme with user overrides
- `applyThemeVariables()` - applies variables to DOM at runtime
- `generateAccentVariations()` - uses CSS `color-mix()` for accent shades

**Grove Theme Updated:**
- Now uses groveengine semantic colors
- Background: cream (#fefdfb), foreground: bark (#3d2914), accent: grove[600]

### Key Files Changed
```
src/lib/
├── stores/
│   ├── index.ts      (new - exports themeStore)
│   └── theme.ts      (new - light/dark/system store)
├── tokens/
│   ├── index.ts      (new - exports color tokens)
│   └── colors.ts     (new - grove/cream/bark/semantic colors)
├── themes/
│   └── grove.ts      (updated - uses token imports)
└── utils/
    ├── contrast.ts   (implemented - WCAG utilities)
    └── css-vars.ts   (implemented - CSS generation)
```

### What's Next (Priority Order)
1. **AccentColorPicker component** - UI for color selection with live preview
2. **Database integration** - `loadThemeSettings()` and `saveThemeSettings()`
3. **Update remaining themes** (Minimal, Night Garden) to use token system
4. **ESLint/Prettier setup** - code quality tooling

### Build Commands
```bash
pnpm install      # Install deps
pnpm build        # Build library to dist/
pnpm test         # Run all tests (41 contrast tests passing)
pnpm test --run   # Run tests once without watch
```

### Reference
- Groveengine colors: `/tmp/groveengine/packages/engine/src/lib/ui/tokens/colors.ts`
- Theme spec: `docs/specs/theme-system-spec.md`

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
- [ ] Test CSS variable generation

### Contrast Utilities ✅
- [x] Implement `getRelativeLuminance()` per WCAG spec
- [x] Implement `getContrastRatio()` calculation
- [x] Implement `meetsWCAGAA()` and `meetsWCAGAAA()` checks
- [x] Implement `validateThemeContrast()` for full theme validation
- [x] Implement `suggestReadableColor()` helper
- [x] Write tests for contrast utilities (41 tests passing)

### AccentColorPicker Component
- [ ] Design color picker UI
- [ ] Implement color selection logic
- [ ] Add live preview
- [ ] Add accessibility (keyboard navigation, labels)

### Database Integration
- [ ] Implement `loadThemeSettings()` in theme-loader.ts
- [ ] Implement `saveThemeSettings()` in theme-saver.ts
- [ ] Test with D1 database

---

## Phase 2: Curated Themes

### Theme Design
- [ ] Finalize Grove theme colors and styling
- [ ] Finalize Minimal theme
- [ ] Finalize Night Garden theme (dark mode)

### Components
- [ ] Build ThemeSelector component
- [ ] Build ThemePreview component
- [ ] Add tier gating logic to theme selection

### Testing
- [ ] Validate all themes meet WCAG AA contrast
- [ ] Test theme switching functionality
- [ ] Test tier-based access control

---

## Phase 3: Remaining Themes
- [ ] Implement Zine theme (bold, magazine-style)
- [ ] Implement Moodboard theme (Pinterest-style masonry)
- [ ] Implement Typewriter theme (retro, monospace)
- [ ] Implement Solarpunk theme (bright, optimistic)
- [ ] Implement Cozy Cabin theme (warm browns)
- [ ] Implement Ocean theme (cool blues)
- [ ] Implement Wildflower theme (colorful, playful)
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

*Last updated: Phase 1 foundation - groveengine integration, contrast utilities, CSS variable system*
