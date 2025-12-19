// src/lib/themes/registry.ts
// Theme registry for lookups and tier-based filtering

import type { Theme, UserTier } from '../types.js';
import { grove } from './grove.js';
import { minimal } from './minimal.js';
import { nightGarden } from './night-garden.js';
import { zine } from './zine.js';
import { moodboard } from './moodboard.js';
import { typewriter } from './typewriter.js';
import { solarpunk } from './solarpunk.js';
import { cozyCabin } from './cozy-cabin.js';
import { ocean } from './ocean.js';
import { wildflower } from './wildflower.js';

/**
 * All available themes indexed by ID
 */
export const themes: Record<string, Theme> = {
	grove,
	minimal,
	'night-garden': nightGarden,
	zine,
	moodboard,
	typewriter,
	solarpunk,
	'cozy-cabin': cozyCabin,
	ocean,
	wildflower
};

/**
 * Get a theme by ID
 */
export function getTheme(id: string): Theme | undefined {
	return themes[id];
}

/**
 * Get themes available for a given user tier
 * - Seedling: grove, minimal, night-garden
 * - Sapling+: all themes
 */
export function getThemesForTier(tier: UserTier): Theme[] {
	// TODO: Implement tier filtering logic
	return Object.values(themes);
}
