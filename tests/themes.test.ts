// tests/themes.test.ts
// Theme tests

import { describe, it, expect } from 'vitest';

describe('Themes', () => {
	describe('Theme Registry', () => {
		it.todo('should export all 10 themes');
		it.todo('should return theme by ID');
		it.todo('should return undefined for unknown theme ID');
	});

	describe('Theme Structure', () => {
		it.todo('should have required properties on all themes');
		it.todo('should have valid tier values');
		it.todo('should have valid layout types');
	});

	describe('Tier Access', () => {
		it.todo('should return 3 themes for seedling tier');
		it.todo('should return all 10 themes for sapling+ tiers');
		it.todo('should return 0 themes for free tier');
	});
});
