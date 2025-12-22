// src/lib/themes/night-garden.ts
// Night Garden theme - Dark mode, gentle greens

import type { Theme } from '../types.js';
import { grove } from '../tokens/colors.js';

// Night Garden builds a dark palette around grove greens
// for a calming, nature-inspired dark mode
const night = {
	// Deep greens with hints of grove color
	background: '#0f1612',
	surface: '#1a2420',
	// Light foregrounds tinted with grove
	foreground: grove[50], // #f0fdf4 - very light green-tinted white
	foregroundMuted: '#8fa898', // Muted sage green
	// Bright accent from grove palette
	accent: grove[300], // #86efac - vibrant but gentle green
	border: '#2d3d35'
} as const;

export const nightGarden: Theme = {
	id: 'night-garden',
	name: 'Night Garden',
	description: 'Dark mode with gentle greens — peaceful nighttime reading',
	thumbnail: '/themes/night-garden-thumb.png',
	tier: 'seedling',

	colors: {
		background: night.background,
		surface: night.surface,
		foreground: night.foreground,
		foregroundMuted: night.foregroundMuted,
		accent: night.accent,
		border: night.border
	},

	fonts: {
		heading: 'Manrope, system-ui, sans-serif',
		body: 'Manrope, system-ui, sans-serif',
		mono: 'IBM Plex Mono, ui-monospace, monospace'
	},

	layout: {
		type: 'sidebar',
		maxWidth: '1200px',
		spacing: 'comfortable'
	}
};
