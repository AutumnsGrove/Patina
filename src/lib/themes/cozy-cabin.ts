// src/lib/themes/cozy-cabin.ts
// Cozy Cabin theme - Warm browns, intimate

import type { Theme } from '../types.js';

export const cozyCabin: Theme = {
	id: 'cozy-cabin',
	name: 'Cozy Cabin',
	description: 'Warm browns and intimate feel — like a fireside chat',
	thumbnail: '/themes/cozy-cabin-thumb.png',
	tier: 'sapling',

	colors: {
		background: '#2c1810',
		surface: '#3d261c',
		foreground: '#f5e6d3',
		foregroundMuted: '#c9a88a',
		accent: '#f59e0b',
		border: '#5c4033'
	},

	fonts: {
		heading: 'Georgia, serif',
		body: 'Georgia, serif',
		mono: 'ui-monospace, monospace'
	},

	layout: {
		type: 'sidebar',
		maxWidth: '1000px',
		spacing: 'comfortable'
	}
};
