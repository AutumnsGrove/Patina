// src/lib/themes/zine.ts
// Zine theme - Bold, magazine-style

import type { Theme } from '../types.js';

export const zine: Theme = {
	id: 'zine',
	name: 'Zine',
	description: 'Bold and magazine-style — make a statement',
	thumbnail: '/themes/zine-thumb.png',
	tier: 'sapling',

	colors: {
		background: '#fffef5',
		surface: '#ffffff',
		foreground: '#000000',
		foregroundMuted: '#555555',
		accent: '#ff3366',
		border: '#000000'
	},

	fonts: {
		heading: 'Impact, sans-serif',
		body: 'Georgia, serif',
		mono: 'ui-monospace, monospace'
	},

	layout: {
		type: 'grid',
		maxWidth: '1400px',
		spacing: 'compact'
	}
};
