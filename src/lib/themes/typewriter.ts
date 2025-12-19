// src/lib/themes/typewriter.ts
// Typewriter theme - Retro, monospace, paper

import type { Theme } from '../types.js';
import { bark, cream } from '../tokens/colors.js';

export const typewriter: Theme = {
	id: 'typewriter',
	name: 'Typewriter',
	description: 'Retro and monospace — like typing on paper',
	thumbnail: '/themes/typewriter-thumb.png',
	tier: 'sapling',

	colors: {
		background: cream[300],
		surface: cream[200],
		foreground: bark[950],
		foregroundMuted: bark[700],
		accent: bark[600],
		border: cream[500]
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
