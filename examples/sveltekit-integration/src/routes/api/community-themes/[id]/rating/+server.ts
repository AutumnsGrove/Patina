import type { RequestHandler } from './$types';
import { addRating, getCommunityTheme } from '@autumnsgrove/foliage/server';
import { json } from '@sveltejs/kit';

/**
 * POST /api/community-themes/[id]/rating
 * Add a rating to a community theme
 *
 * Path Parameters:
 * - id: string (UUID of the theme)
 *
 * Request Body:
 * {
 *   "rating": 1 | 2 | 3 | 4 | 5  (required)
 * }
 *
 * Features:
 * - Ratings are cumulative (each user can rate, total is summed)
 * - Rating is used to calculate average rating (ratingSum / ratingCount)
 * - No duplicate checking by default (can be implemented per app)
 *
 * TODO: Implement per-user rate limiting
 * Consider adding a user_ratings table to track which users have rated
 * which themes to prevent duplicate ratings from the same user.
 *
 * Example implementation:
 * ```typescript
 * const tenantId = locals.user?.tenantId;
 * const existing = await db
 *   .prepare('SELECT id FROM user_ratings WHERE theme_id = ? AND tenant_id = ?')
 *   .bind(params.id, tenantId)
 *   .first();
 *
 * if (existing) {
 *   return json({ error: 'You have already rated this theme' }, { status: 409 });
 * }
 *
 * await addRating(DB, params.id, rating);
 * await db.prepare('INSERT INTO user_ratings (theme_id, tenant_id) VALUES (?, ?)')
 *   .bind(params.id, tenantId)
 *   .run();
 * ```
 *
 * Response:
 * - 200: Updated theme object with new rating counts
 * - 400: Invalid rating value
 * - 404: Theme not found
 */
export const POST: RequestHandler = async ({ params, request, platform, locals }) => {
	try {
		const { DB } = platform!.env;

		// Validate theme ID
		if (!params.id || params.id.trim().length === 0) {
			return json({ error: 'Invalid theme ID' }, { status: 400 });
		}

		// Parse and validate request body
		const body = await request.json() as Record<string, unknown>;
		const rating = body.rating;

		// Validate rating is an integer between 1 and 5
		if (
			typeof rating !== 'number' ||
			!Number.isInteger(rating) ||
			rating < 1 ||
			rating > 5
		) {
			return json(
				{
					error: 'Invalid rating value',
					message: 'Rating must be an integer between 1 and 5',
					received: rating
				},
				{ status: 400 }
			);
		}

		// TODO: Implement per-user rate limiting
		// Get tenant ID from auth system and check if user already rated
		// const tenantId = locals.user?.tenantId;
		// if (!tenantId) {
		//   return json({ error: 'Unauthorized' }, { status: 401 });
		// }
		//
		// const hasRated = await checkUserRating(DB, params.id, tenantId);
		// if (hasRated) {
		//   return json(
		//     { error: 'You have already rated this theme' },
		//     { status: 409 }
		//   );
		// }

		// Add the rating
		const success = await addRating(DB, params.id.trim(), rating as 1 | 2 | 3 | 4 | 5);

		if (!success) {
			return json({ error: 'Theme not found' }, { status: 404 });
		}

		// Fetch and return updated theme with new rating stats
		const theme = await getCommunityTheme(DB, params.id.trim());

		if (!theme) {
			return json({ error: 'Theme not found after rating update' }, { status: 404 });
		}

		// Calculate and include average rating in response
		const averageRating = theme.ratingCount > 0 ? theme.ratingSum / theme.ratingCount : null;

		return json({
			...theme,
			averageRating
		});
	} catch (error) {
		console.error('Rating add error:', error);
		return json(
			{
				error: 'Failed to add rating',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
