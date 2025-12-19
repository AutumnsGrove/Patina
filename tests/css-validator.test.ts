// tests/css-validator.test.ts
// Custom CSS validation tests

import { describe, it, expect } from 'vitest';

describe('CSS Validator', () => {
	describe('Size Limits', () => {
		it.todo('should accept CSS under 10KB');
		it.todo('should reject CSS over 10KB');
	});

	describe('Blocked Patterns', () => {
		it.todo('should reject @import statements');
		it.todo('should reject javascript: URLs');
		it.todo('should reject expression() (IE)');
		it.todo('should reject behavior: (IE)');
		it.todo('should reject -moz-binding');
		it.todo('should reject script tags');
	});

	describe('URL Validation', () => {
		it.todo('should allow Google Fonts URLs');
		it.todo('should allow small data URIs');
		it.todo('should warn on large data URIs');
		it.todo('should reject arbitrary external URLs');
	});

	describe('Sanitization', () => {
		it.todo('should remove blocked patterns');
		it.todo('should preserve valid CSS');
	});
});
