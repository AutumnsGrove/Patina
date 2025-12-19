<script lang="ts">
	// ThemeSelector.svelte
	// Component for selecting from available themes

	import type { Theme, UserTier } from '../types.js';

	interface Props {
		themes: Theme[];
		selectedThemeId: string;
		userTier: UserTier;
		onSelect?: (themeId: string) => void;
	}

	let { themes, selectedThemeId, userTier, onSelect }: Props = $props();

	// TODO: Implement theme selection logic
</script>

<!-- TODO: Implement theme selector UI -->
<div class="theme-selector">
	<p>Theme Selector - Coming Soon</p>
</div>

<style>
	.theme-selector {
		/* TODO: Add styles */
	}
</style>
