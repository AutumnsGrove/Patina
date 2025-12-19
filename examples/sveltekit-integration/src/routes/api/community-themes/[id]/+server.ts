import type { RequestHandler } from './$types';
import {
	getCommunityTheme,
	updateCommunityTheme,
	deleteCommunityTheme
} from '@autumnsgrove/foliage/server';
import { json } from '@sveltejs/kit';
import type { CommunityTheme } from '@autumnsgrove/foliage';

/**
 * GET /api/community-themes/[id]
 * Retrieve a single community theme by ID
 *
 * Path Parameters:
 * - id: string (UUID of the theme)
 *
 * Response:
 * - 200: Theme object
 * - 404: Theme not found
 */
export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		const { DB } = platform!.env;

		// Validate theme ID format (basic check)
		if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
			return json({ error: 'Invalid theme ID' }, { status: 400 });
		}

		const theme = await getCommunityTheme(DB, params.id.trim());

		if (!theme) {
			return json({ error: 'Theme not found' }, { status: 404 });
		}

		return json(theme);
	} catch (error) {
		console.error('Theme get error:', error);
		return json(
			{
				error: 'Failed to get theme',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * PATCH /api/community-themes/[id]
 * Update a community theme (creator only)
 *
 * Path Parameters:
 * - id: string (UUID of the theme)
 *
 * Request Body: Partial<CommunityTheme> with fields to update
 * - name?: string
 * - description?: string
 * - tags?: string[]
 * - baseTheme?: string
 * - customColors?: Partial<ThemeColors>
 * - customTypography?: Partial<ThemeFonts>
 * - customLayout?: Partial<ThemeLayout>
 * - customCSS?: string
 * - thumbnailPath?: string
 * - status?: CommunityThemeStatus (usually only for moderators)
 *
 * Note: creatorTenantId, id, and createdAt cannot be updated
 *
 * Response:
 * - 200: Updated theme object
 * - 403: Not authorized (not the creator)
 * - 404: Theme not found
 */
export const PATCH: RequestHandler = async ({ params, request, platform, locals }) => {
	try {
		const { DB } = platform!.env;

		// TODO: Get tenantId from your auth system
		// Example with SvelteKit hooks:
		// const tenantId = locals.user?.tenantId;
		// if (!tenantId) {
		//   return json({ error: 'Unauthorized' }, { status: 401 });
		// }
		const tenantId = 'example-tenant-id';

		// Validate theme ID
		if (!params.id || params.id.trim().length === 0) {
			return json({ error: 'Invalid theme ID' }, { status: 400 });
		}

		// Verify theme exists and user is the creator
		const existingTheme = await getCommunityTheme(DB, params.id.trim());
		if (!existingTheme) {
			return json({ error: 'Theme not found' }, { status: 404 });
		}

		// Check creator ownership
		if (existingTheme.creatorTenantId !== tenantId) {
			return json(
				{ error: 'Unauthorized: only the theme creator can update this theme' },
				{ status: 403 }
			);
		}

		// Parse and validate updates
		const updates = await request.json() as Partial<CommunityTheme>;

		// Prevent modification of immutable fields
		if ('id' in updates || 'creatorTenantId' in updates || 'createdAt' in updates) {
			return json(
				{ error: 'Cannot update immutable fields: id, creatorTenantId, createdAt' },
				{ status: 400 }
			);
		}

		// Validate name if provided
		if (updates.name !== undefined) {
			if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
				return json(
					{ error: 'Invalid name: must be a non-empty string' },
					{ status: 400 }
				);
			}
			if (updates.name.length > 200) {
				return json(
					{ error: 'Theme name must be less than 200 characters' },
					{ status: 400 }
				);
			}
		}

		// Validate tags if provided
		if (updates.tags !== undefined && updates.tags !== null) {
			if (!Array.isArray(updates.tags)) {
				return json(
					{ error: 'Tags must be an array of strings' },
					{ status: 400 }
				);
			}
			if (updates.tags.length > 10) {
				return json(
					{ error: 'Maximum 10 tags allowed' },
					{ status: 400 }
				);
			}
			if (updates.tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
				return json(
					{ error: 'Each tag must be a string with max 50 characters' },
					{ status: 400 }
				);
			}
		}

		// Perform update
		const success = await updateCommunityTheme(DB, params.id.trim(), updates);

		if (!success) {
			return json({ error: 'Failed to update theme' }, { status: 500 });
		}

		// Fetch and return updated theme
		const theme = await getCommunityTheme(DB, params.id.trim());
		return json(theme);
	} catch (error) {
		console.error('Theme update error:', error);
		return json(
			{
				error: 'Failed to update theme',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/community-themes/[id]
 * Delete a community theme (creator only)
 *
 * Path Parameters:
 * - id: string (UUID of the theme)
 *
 * Authorization:
 * - Only the original creator can delete a theme
 *
 * Response:
 * - 200: { success: true }
 * - 403: Not authorized (not the creator)
 * - 404: Theme not found
 */
export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
	try {
		const { DB } = platform!.env;

		// TODO: Get tenantId from your auth system
		// Example with SvelteKit hooks:
		// const tenantId = locals.user?.tenantId;
		// if (!tenantId) {
		//   return json({ error: 'Unauthorized' }, { status: 401 });
		// }
		const tenantId = 'example-tenant-id';

		// Validate theme ID
		if (!params.id || params.id.trim().length === 0) {
			return json({ error: 'Invalid theme ID' }, { status: 400 });
		}

		// Attempt delete (deleteCommunityTheme checks creator ownership)
		const deleted = await deleteCommunityTheme(DB, params.id.trim(), tenantId);

		if (!deleted) {
			return json(
				{ error: 'Theme not found or you are not authorized to delete it' },
				{ status: 404 }
			);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Theme delete error:', error);
		return json(
			{
				error: 'Failed to delete theme',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
