// src/lib/themes/moodboard.ts
// Moodboard theme - Pinterest-style masonry

import type { Theme } from '../types.js';

export const moodboard: Theme = {
	id: 'moodboard',
	name: 'Moodboard',
	description: 'Pinterest-style layout — curate your visual world',
	thumbnail: '/themes/moodboard-thumb.png',
	tier: 'sapling',

	colors: {
		background: '#f5f5f5',
		surface: '#ffffff',
		foreground: '#333333',
		foregroundMuted: '#888888',
		accent: '#e11d48',
		border: '#e0e0e0'
	},

	fonts: {
		heading: 'system-ui, sans-serif',
		body: 'system-ui, sans-serif',
		mono: 'ui-monospace, monospace'
	},

	layout: {
		type: 'masonry',
		maxWidth: '1600px',
		spacing: 'compact'
	}
};
