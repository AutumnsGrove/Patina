// src/lib/themes/solarpunk.ts
// Solarpunk theme - Bright, optimistic

import type { Theme } from '../types.js';

export const solarpunk: Theme = {
	id: 'solarpunk',
	name: 'Solarpunk',
	description: 'Bright and optimistic — a hopeful future',
	thumbnail: '/themes/solarpunk-thumb.png',
	tier: 'sapling',

	colors: {
		background: '#f0fdf4',
		surface: '#ffffff',
		foreground: '#166534',
		foregroundMuted: '#4ade80',
		accent: '#fbbf24',
		border: '#bbf7d0'
	},

	fonts: {
		heading: 'system-ui, sans-serif',
		body: 'system-ui, sans-serif',
		mono: 'ui-monospace, monospace'
	},

	layout: {
		type: 'full-width',
		maxWidth: '100%',
		spacing: 'comfortable'
	}
};
