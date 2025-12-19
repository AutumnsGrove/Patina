# Patina - TODOs

> Theme system for Grove — personal expression with modern guardrails

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
- [ ] Run `pnpm install` to install dependencies
- [ ] Verify TypeScript and Vitest configuration
- [ ] Set up ESLint and Prettier
- [ ] Configure svelte-check

### CSS Variable System
- [ ] Implement `generateThemeVariables()` in css-vars.ts
- [ ] Implement `applyThemeVariables()` for runtime application
- [ ] Implement `generateAccentVariations()` using color-mix
- [ ] Test CSS variable generation

### Contrast Utilities
- [ ] Implement `getRelativeLuminance()` per WCAG spec
- [ ] Implement `getContrastRatio()` calculation
- [ ] Implement `meetsWCAGAA()` and `meetsWCAGAAA()` checks
- [ ] Implement `validateThemeContrast()` for full theme validation
- [ ] Write tests for contrast utilities

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

*Last updated: Phase 0 scaffolding complete*
