/**
 * Generate Theme Thumbnails
 *
 * This script uses Playwright to capture 400x300px screenshots of each theme.
 * Run the dev server first: pnpm dev
 *
 * Usage: npx tsx scripts/generate-thumbnails.ts
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../static/themes');

// Theme IDs matching the registry
const THEMES = [
	'grove',
	'minimal',
	'night-garden',
	'zine',
	'moodboard',
	'typewriter',
	'solarpunk',
	'cozy-cabin',
	'ocean',
	'wildflower'
];

const DEV_SERVER_URL = 'http://localhost:5173';
const VIEWPORT = { width: 400, height: 300 };

async function waitForDevServer(maxRetries = 30): Promise<boolean> {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const response = await fetch(DEV_SERVER_URL);
			if (response.ok) return true;
		} catch {
			// Server not ready yet
		}
		await new Promise((r) => setTimeout(r, 1000));
		process.stdout.write('.');
	}
	return false;
}

async function generateThumbnails() {
	console.log('🎨 Foliage Theme Thumbnail Generator\n');

	// Ensure output directory exists
	await mkdir(OUTPUT_DIR, { recursive: true });

	// Check if dev server is running
	console.log('Checking dev server...');
	const serverReady = await waitForDevServer(5);

	if (!serverReady) {
		console.error('\n❌ Dev server not running. Please start it with: pnpm dev');
		process.exit(1);
	}
	console.log(' Ready!\n');

	// Launch browser
	const browser = await chromium.launch({
		headless: true
	});

	const context = await browser.newContext({
		viewport: VIEWPORT,
		deviceScaleFactor: 2 // Retina quality
	});

	const page = await context.newPage();

	// Wait for fonts to load
	await page.goto(DEV_SERVER_URL, { waitUntil: 'networkidle' });
	await page.waitForTimeout(2000); // Extra time for Google Fonts

	console.log(`Generating ${THEMES.length} thumbnails at ${VIEWPORT.width}x${VIEWPORT.height}px:\n`);

	for (const themeId of THEMES) {
		process.stdout.write(`  📸 ${themeId}...`);

		try {
			// Navigate to gallery page
			await page.goto(DEV_SERVER_URL, { waitUntil: 'networkidle' });

			// Find and click the theme card to open modal
			const themeCard = page.locator(`button.theme-card`, {
				has: page.locator(`.theme-name:text("${themeId}")`)
			});

			// Alternative: find by theme name in the card
			const cards = await page.locator('button.theme-card').all();
			let found = false;

			for (const card of cards) {
				const name = await card.locator('.theme-name').textContent();
				const normalizedName = name?.toLowerCase().replace(/\s+/g, '-');
				if (normalizedName === themeId || name?.toLowerCase() === themeId.replace(/-/g, ' ')) {
					await card.click();
					found = true;
					break;
				}
			}

			if (!found) {
				// Try clicking by index based on theme order
				const index = THEMES.indexOf(themeId);
				if (index >= 0) {
					await cards[index]?.click();
					found = true;
				}
			}

			if (!found) {
				console.log(' ⚠️  Not found, skipping');
				continue;
			}

			// Wait for modal to open
			await page.waitForSelector('.modal', { state: 'visible', timeout: 5000 });
			await page.waitForTimeout(500); // Let fonts render

			// Find the preview container in the modal
			const previewContainer = page.locator('.full-preview .theme-preview-container');

			// Take screenshot of just the preview
			const screenshot = await previewContainer.screenshot({
				type: 'png'
			});

			// Save to file
			const outputPath = join(OUTPUT_DIR, `${themeId}-thumb.png`);
			await writeFile(outputPath, screenshot);

			// Close modal
			await page.locator('.close-btn').click();
			await page.waitForSelector('.modal', { state: 'hidden', timeout: 3000 }).catch(() => {});

			console.log(' ✅');
		} catch (error) {
			console.log(` ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
		}
	}

	await browser.close();

	console.log(`\n✨ Done! Thumbnails saved to: ${OUTPUT_DIR}`);
}

generateThumbnails().catch(console.error);
