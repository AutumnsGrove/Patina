// src/lib/themes/grove.ts
// Grove theme - Warm, earthy, cozy (Default theme)

import type { Theme } from '../types.js';

export const grove: Theme = {
	id: 'grove',
	name: 'Grove',
	description: 'Warm, earthy, and cozy — the default Grove experience',
	thumbnail: '/themes/grove-thumb.png',
	tier: 'seedling',

	colors: {
		background: '#faf8f5',
		surface: '#ffffff',
		foreground: '#1a1a1a',
		foregroundMuted: '#6b6b6b',
		accent: '#4f46e5',
		border: '#e5e5e5'
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
