// src/lib/themes/ocean.ts
// Ocean theme - Cool blues, calm

import type { Theme } from '../types.js';

export const ocean: Theme = {
	id: 'ocean',
	name: 'Ocean',
	description: 'Cool blues and calm — serene like the sea',
	thumbnail: '/themes/ocean-thumb.png',
	tier: 'sapling',

	colors: {
		background: '#f0f9ff',
		surface: '#ffffff',
		foreground: '#0c4a6e',
		foregroundMuted: '#0284c7',
		accent: '#0ea5e9',
		border: '#bae6fd'
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
