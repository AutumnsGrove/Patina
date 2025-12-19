// src/lib/themes/night-garden.ts
// Night Garden theme - Dark mode, gentle greens

import type { Theme } from '../types.js';

export const nightGarden: Theme = {
	id: 'night-garden',
	name: 'Night Garden',
	description: 'Dark mode with gentle greens — peaceful nighttime reading',
	thumbnail: '/themes/night-garden-thumb.png',
	tier: 'seedling',

	colors: {
		background: '#0f1612',
		surface: '#1a2420',
		foreground: '#e8f0ec',
		foregroundMuted: '#8fa898',
		accent: '#6ee7b7',
		border: '#2d3d35'
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
