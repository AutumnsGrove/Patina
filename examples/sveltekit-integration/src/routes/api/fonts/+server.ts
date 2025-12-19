import type { RequestHandler } from './$types';
import { uploadFont, listFonts, validateWoff2, MAX_FONT_SIZE } from '@autumnsgrove/foliage/server';
import { json } from '@sveltejs/kit';

/**
 * POST /api/fonts - Upload a new custom font
 *
 * Expected FormData:
 * - file: File (WOFF2 format, max 500KB)
 * - name: string (display name, e.g., "Inter Bold")
 * - family: string (CSS font-family, e.g., "Inter")
 * - category: 'sans-serif' | 'serif' | 'mono' | 'display'
 *
 * Response: 201 Created with CustomFont object or error
 */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	try {
		const { DB, R2 } = platform!.env;

		// TODO: Get tenantId from your auth system
		// Replace with: const tenantId = locals.user.tenantId;
		const tenantId = locals.user?.tenantId ?? 'example-tenant-id';

		const formData = await request.formData();
		const file = formData.get('file') as File;

		// Validate file exists
		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file is a WOFF2 font
		if (!file.type.includes('font') && !file.name.endsWith('.woff2')) {
			return json(
				{ error: 'File must be a WOFF2 font file' },
				{ status: 400 }
			);
		}

		// Validate file size
		if (file.size > MAX_FONT_SIZE) {
			return json(
				{ error: `File exceeds maximum size of ${MAX_FONT_SIZE / 1024}KB` },
				{ status: 400 }
			);
		}

		// Validate and extract metadata
		const metadata = {
			name: formData.get('name') as string,
			family: formData.get('family') as string,
			category: formData.get('category') as 'sans-serif' | 'serif' | 'mono' | 'display'
		};

		// Validate required metadata
		if (!metadata.name || !metadata.family || !metadata.category) {
			return json(
				{ error: 'Missing required metadata: name, family, category' },
				{ status: 400 }
			);
		}

		// Validate metadata values
		const validCategories = ['sans-serif', 'serif', 'mono', 'display'];
		if (!validCategories.includes(metadata.category)) {
			return json(
				{ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
				{ status: 400 }
			);
		}

		// Validate font format
		const arrayBuffer = await file.arrayBuffer();
		const validation = await validateWoff2(arrayBuffer);
		if (!validation.valid) {
			return json(
				{ error: validation.error ?? 'Invalid WOFF2 file format' },
				{ status: 400 }
			);
		}

		// Upload font to R2 and save metadata to D1
		const font = await uploadFont(R2, DB, tenantId, arrayBuffer, metadata);

		return json(font, { status: 201 });
	} catch (error) {
		console.error('Font upload error:', error);
		return json(
			{ error: 'Failed to upload font', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

/**
 * GET /api/fonts - List all custom fonts for the current tenant
 *
 * Response: Array of CustomFont objects
 */
export const GET: RequestHandler = async ({ platform, locals }) => {
	try {
		const { DB } = platform!.env;

		// TODO: Get tenantId from your auth system
		// Replace with: const tenantId = locals.user.tenantId;
		const tenantId = locals.user?.tenantId ?? 'example-tenant-id';

		const fonts = await listFonts(DB, tenantId);
		return json(fonts);
	} catch (error) {
		console.error('Font list error:', error);
		return json(
			{ error: 'Failed to list fonts', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
