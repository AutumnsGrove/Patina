// src/lib/themes/typewriter.ts
// Typewriter theme - Retro, monospace, paper

import type { Theme } from '../types.js';

export const typewriter: Theme = {
	id: 'typewriter',
	name: 'Typewriter',
	description: 'Retro and monospace — like typing on paper',
	thumbnail: '/themes/typewriter-thumb.png',
	tier: 'sapling',

	colors: {
		background: '#f4f1ea',
		surface: '#faf8f5',
		foreground: '#2d2d2d',
		foregroundMuted: '#666666',
		accent: '#8b4513',
		border: '#d4cfc5'
	},

	fonts: {
		heading: 'Courier New, monospace',
		body: 'Courier New, monospace',
		mono: 'Courier New, monospace'
	},

	layout: {
		type: 'centered',
		maxWidth: '600px',
		spacing: 'spacious'
	}
};
