// src/lib/types.ts
// Theme system type definitions

export interface Theme {
	id: string;
	name: string;
	description: string;
	thumbnail: string;
	tier: 'seedling' | 'sapling';

	colors: ThemeColors;
	fonts: ThemeFonts;
	layout: ThemeLayout;
	customCSS?: string;
}

export interface ThemeColors {
	background: string;
	surface: string;
	foreground: string;
	foregroundMuted: string;
	accent: string;
	border: string;
}

export interface ThemeFonts {
	heading: string;
	body: string;
	mono: string;
}

export interface ThemeLayout {
	type: 'sidebar' | 'no-sidebar' | 'centered' | 'full-width' | 'grid' | 'masonry';
	maxWidth: string;
	spacing: 'compact' | 'comfortable' | 'spacious';
}

export interface ThemeSettings {
	tenantId: string;
	themeId: string;
	accentColor: string;
	customizerEnabled: boolean;
	customColors?: Partial<ThemeColors>;
	customTypography?: Partial<ThemeFonts>;
	customLayout?: Partial<ThemeLayout>;
	customCSS?: string;
	communityThemeId?: string;
}

export interface CustomFont {
	id: string;
	tenantId: string;
	name: string;
	family: string;
	category: 'sans-serif' | 'serif' | 'mono' | 'display';
	woff2Path: string;
	woffPath?: string;
	fileSize: number;
}

export type UserTier = 'free' | 'seedling' | 'sapling' | 'oak' | 'evergreen';

export interface ValidationResult {
	valid: boolean;
	error?: string;
	warnings?: string[];
}

export interface CommunityTheme {
	id: string;
	creatorTenantId: string;
	name: string;
	description?: string;
	tags?: string[];
	baseTheme: string;
	customColors?: Partial<ThemeColors>;
	customTypography?: Partial<ThemeFonts>;
	customLayout?: Partial<ThemeLayout>;
	customCSS?: string;
	thumbnailPath?: string;
	downloads: number;
	ratingSum: number;
	ratingCount: number;
	status: CommunityThemeStatus;
	reviewedAt?: number;
	createdAt: number;
	updatedAt: number;
}

export type CommunityThemeStatus =
	| 'draft'
	| 'pending'
	| 'in_review'
	| 'approved'
	| 'featured'
	| 'changes_requested'
	| 'rejected'
	| 'removed';
