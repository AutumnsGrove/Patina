import type { RequestHandler } from './$types';
import { createCommunityTheme, listCommunityThemes } from '@autumnsgrove/foliage/server';
import { json } from '@sveltejs/kit';
import type { CommunityTheme, CommunityThemeStatus } from '@autumnsgrove/foliage';

/**
 * POST /api/community-themes
 * Create a new community theme
 *
 * Required fields in request body:
 * - name: string (1-200 characters)
 * - baseTheme: string (must match an existing base theme)
 *
 * Optional fields:
 * - description: string
 * - tags: string[] (max 10 tags, each 50 chars)
 * - customColors: Partial<ThemeColors>
 * - customTypography: Partial<ThemeFonts>
 * - customLayout: Partial<ThemeLayout>
 * - customCSS: string
 * - thumbnailPath: string (path to R2 thumbnail)
 */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	try {
		// Access D1 database from Cloudflare platform bindings
		const { DB } = platform!.env;

		// TODO: Get tenantId from your auth system
		// Example with SvelteKit session/hooks:
		// const tenantId = locals.user?.tenantId;
		// if (!tenantId) {
		//   return json({ error: 'Unauthorized' }, { status: 401 });
		// }
		const tenantId = 'example-tenant-id';

		const data = await request.json() as Partial<CommunityTheme>;

		// Validate required fields
		if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
			return json(
				{ error: 'Invalid name: must be a non-empty string' },
				{ status: 400 }
			);
		}

		if (!data.baseTheme || typeof data.baseTheme !== 'string') {
			return json(
				{ error: 'Invalid baseTheme: must be a valid base theme ID' },
				{ status: 400 }
			);
		}

		// Validate optional fields
		if (data.name.length > 200) {
			return json(
				{ error: 'Theme name must be less than 200 characters' },
				{ status: 400 }
			);
		}

		if (data.tags && Array.isArray(data.tags)) {
			if (data.tags.length > 10) {
				return json(
					{ error: 'Maximum 10 tags allowed' },
					{ status: 400 }
				);
			}
			if (data.tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
				return json(
					{ error: 'Each tag must be a string with max 50 characters' },
					{ status: 400 }
				);
			}
		}

		const theme = await createCommunityTheme(DB, {
			creatorTenantId: tenantId,
			name: data.name.trim(),
			description: data.description ? data.description.trim() : undefined,
			tags: data.tags,
			baseTheme: data.baseTheme,
			customColors: data.customColors,
			customTypography: data.customTypography,
			customLayout: data.customLayout,
			customCSS: data.customCSS,
			thumbnailPath: data.thumbnailPath
		});

		return json(theme, { status: 201 });
	} catch (error) {
		console.error('Community theme creation error:', error);
		return json(
			{
				error: 'Failed to create community theme',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * GET /api/community-themes
 * List community themes with filtering, sorting, and pagination
 *
 * Query Parameters:
 * - status: CommunityThemeStatus (pending|approved|featured|rejected|changes_requested|draft|in_review|removed)
 * - creatorTenantId: string (filter by creator)
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0, for pagination)
 * - orderBy: 'downloads'|'rating'|'created_at'|'updated_at' (default: created_at)
 * - orderDir: 'asc'|'desc' (default: desc)
 *
 * Examples:
 * GET /api/community-themes?status=approved&limit=20
 * GET /api/community-themes?orderBy=downloads&orderDir=desc&limit=10
 * GET /api/community-themes?creatorTenantId=tenant-123
 * GET /api/community-themes?status=featured&limit=5
 * GET /api/community-themes?orderBy=rating&orderDir=desc&limit=20&offset=20
 */
export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		const { DB } = platform!.env;

		// Parse and validate query parameters
		const status = url.searchParams.get('status') as CommunityThemeStatus | null;
		const creatorTenantId = url.searchParams.get('creatorTenantId');

		// Parse limit with bounds checking
		let limit: number | undefined;
		const limitParam = url.searchParams.get('limit');
		if (limitParam) {
			const parsed = parseInt(limitParam, 10);
			if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
				limit = parsed;
			}
		}

		// Parse offset for pagination
		let offset: number | undefined;
		const offsetParam = url.searchParams.get('offset');
		if (offsetParam) {
			const parsed = parseInt(offsetParam, 10);
			if (!isNaN(parsed) && parsed >= 0) {
				offset = parsed;
			}
		}

		// Parse and validate ordering
		const orderByParam = url.searchParams.get('orderBy');
		const orderBy = ['downloads', 'rating', 'created_at', 'updated_at'].includes(orderByParam || '')
			? (orderByParam as 'downloads' | 'rating' | 'created_at' | 'updated_at')
			: undefined;

		const orderDirParam = url.searchParams.get('orderDir');
		const orderDir = orderDirParam === 'asc' ? 'asc' : 'desc';

		// Call database function with validated parameters
		const themes = await listCommunityThemes(DB, {
			status: status ?? undefined,
			creatorTenantId: creatorTenantId ?? undefined,
			limit,
			offset,
			orderBy: orderBy ?? undefined,
			orderDir
		});

		// Return themes array (empty if none found)
		return json({
			themes,
			count: themes.length,
			limit,
			offset
		});
	} catch (error) {
		console.error('Community theme list error:', error);
		return json(
			{
				error: 'Failed to list community themes',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
