import type { RequestHandler } from './$types';
import { deleteFont, getFont } from '@autumnsgrove/foliage/server';
import { json } from '@sveltejs/kit';

/**
 * GET /api/fonts/[id] - Retrieve a single custom font by ID
 *
 * Path Parameters:
 * - id: string - Font ID (UUID)
 *
 * Response: CustomFont object or 404 if not found
 */
export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		const { DB } = platform!.env;
		const { id } = params;

		// Validate ID format (basic check)
		if (!id || typeof id !== 'string' || id.length === 0) {
			return json({ error: 'Invalid font ID' }, { status: 400 });
		}

		const font = await getFont(DB, id);

		if (!font) {
			return json({ error: 'Font not found' }, { status: 404 });
		}

		return json(font);
	} catch (error) {
		console.error('Font get error:', error);
		return json(
			{ error: 'Failed to get font', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/fonts/[id] - Delete a custom font
 *
 * Path Parameters:
 * - id: string - Font ID (UUID)
 *
 * Authorization: User must be the font's tenant (enforced via tenantId match)
 *
 * Response: { success: true } or error
 * - 403: Font doesn't belong to current tenant (Unauthorized)
 * - 404: Font not found
 * - 500: Deletion failed
 */
export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
	try {
		const { DB, R2 } = platform!.env;
		const { id } = params;

		// Validate ID format (basic check)
		if (!id || typeof id !== 'string' || id.length === 0) {
			return json({ error: 'Invalid font ID' }, { status: 400 });
		}

		// TODO: Get tenantId from your auth system
		// Replace with: const tenantId = locals.user.tenantId;
		const tenantId = locals.user?.tenantId ?? 'example-tenant-id';

		// First check if the font exists and belongs to this tenant
		const font = await getFont(DB, id);
		if (!font) {
			return json({ error: 'Font not found' }, { status: 404 });
		}

		// Verify ownership - only allow deletion by the font's tenant
		if (font.tenantId !== tenantId) {
			return json(
				{ error: 'Unauthorized: You do not own this font' },
				{ status: 403 }
			);
		}

		// Delete from R2 and D1
		const deleted = await deleteFont(R2, DB, id);

		if (!deleted) {
			return json({ error: 'Failed to delete font' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Font delete error:', error);
		return json(
			{ error: 'Failed to delete font', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
