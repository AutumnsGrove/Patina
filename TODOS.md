# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

---

## 🚀 Session Handoff Notes (2025-12-19)

### What Was Completed This Session

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

### Key Files Changed
```
src/lib/
├── components/
│   └── AccentColorPicker.svelte  (implemented - full color picker UI)
├── server/
│   ├── theme-loader.ts           (implemented - D1 queries)
│   └── theme-saver.ts            (implemented - D1 upserts)
├── themes/
│   ├── minimal.ts                (updated - uses bark tokens)
│   └── night-garden.ts           (updated - uses grove tokens)
```

### What's Next (Priority Order)
1. **ESLint/Prettier setup** - code quality tooling
2. **Test CSS variable generation** - write tests for css-vars.ts
3. **ThemeSelector component** - UI for choosing themes
4. **ThemePreview component** - visual theme preview

### Build Commands
```bash
pnpm install      # Install deps
pnpm build        # Build library to dist/
pnpm test         # Run all tests (41 contrast tests passing)
pnpm test --run   # Run tests once without watch
```

### Reference
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

*Last updated: Phase 1 complete - AccentColorPicker, database integration, theme token updates*
