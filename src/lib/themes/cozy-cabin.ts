// src/lib/themes/cozy-cabin.ts
// Cozy Cabin theme - Warm browns, intimate

import type { Theme } from '../types.js';
import { bark, cream, status } from '../tokens/colors.js';

export const cozyCabin: Theme = {
	id: 'cozy-cabin',
	name: 'Cozy Cabin',
	description: 'Warm browns and intimate feel — like a fireside chat',
	thumbnail: '/themes/cozy-cabin-thumb.png',
	tier: 'sapling',

	colors: {
		background: bark[950],
		surface: bark[900],
		foreground: cream[100],
		foregroundMuted: bark[300],
		accent: status.warning.DEFAULT,
		border: bark[800]
	},

	fonts: {
		heading: 'Lora, Georgia, serif',
		body: 'Lora, Georgia, serif',
		mono: 'IBM Plex Mono, ui-monospace, monospace'
	},

	layout: {
		type: 'sidebar',
		maxWidth: '1000px',
		spacing: 'comfortable'
	}
};
