// src/lib/themes/wildflower.ts
// Wildflower theme - Colorful, playful

import type { Theme } from '../types.js';

export const wildflower: Theme = {
	id: 'wildflower',
	name: 'Wildflower',
	description: 'Colorful and playful — bloom in your own way',
	thumbnail: '/themes/wildflower-thumb.png',
	tier: 'sapling',

	colors: {
		background: '#fef7ff',
		surface: '#ffffff',
		foreground: '#581c87',
		foregroundMuted: '#a855f7',
		accent: '#ec4899',
		border: '#f5d0fe'
	},

	fonts: {
		heading: 'system-ui, sans-serif',
		body: 'system-ui, sans-serif',
		mono: 'ui-monospace, monospace'
	},

	layout: {
		type: 'sidebar',
		maxWidth: '1200px',
		spacing: 'comfortable'
	}
};
