// src/lib/themes/minimal.ts
// Minimal theme - Clean, typography-focused

import type { Theme } from '../types.js';

export const minimal: Theme = {
	id: 'minimal',
	name: 'Minimal',
	description: 'Clean and typography-focused — let your words shine',
	thumbnail: '/themes/minimal-thumb.png',
	tier: 'seedling',

	colors: {
		background: '#ffffff',
		surface: '#fafafa',
		foreground: '#111111',
		foregroundMuted: '#666666',
		accent: '#000000',
		border: '#eeeeee'
	},

	fonts: {
		heading: 'system-ui, sans-serif',
		body: 'Georgia, serif',
		mono: 'ui-monospace, monospace'
	},

	layout: {
		type: 'no-sidebar',
		maxWidth: '680px',
		spacing: 'spacious'
	}
};
