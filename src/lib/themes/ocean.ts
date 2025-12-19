// src/lib/themes/ocean.ts
// Ocean theme - Cool blues, calm

import type { Theme } from '../types.js';

// Ocean uses serene blues inspired by the sea
const palette = {
	background: '#f0f9ff', // Very light blue tint
	surface: '#ffffff', // White surface
	foreground: '#0c4a6e', // Deep ocean blue text
	foregroundMuted: '#075985', // Darker blue for muted (meets 4.5:1 contrast)
	accent: '#0ea5e9', // Bright sky blue accent
	border: '#bae6fd' // Light blue border
} as const;

export const ocean: Theme = {
	id: 'ocean',
	name: 'Ocean',
	description: 'Cool blues and calm — serene like the sea',
	thumbnail: '/themes/ocean-thumb.png',
	tier: 'sapling',

	colors: {
		background: palette.background,
		surface: palette.surface,
		foreground: palette.foreground,
		foregroundMuted: palette.foregroundMuted,
		accent: palette.accent,
		border: palette.border
	},

	fonts: {
		heading: 'system-ui, sans-serif',
		body: 'system-ui, sans-serif',
		mono: 'ui-monospace, monospace'
	},

	layout: {
		type: 'no-sidebar',
		maxWidth: '800px',
		spacing: 'spacious'
	}
};
