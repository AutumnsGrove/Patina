<script lang="ts">
	// FontUploader.svelte
	// Custom font upload component (Evergreen tier)

	import type { CustomFont } from '../types.js';

	interface Props {
		existingFonts: CustomFont[];
		maxFonts?: number;
		maxSize?: number;
		onUpload?: (font: File) => void;
		onDelete?: (fontId: string) => void;
	}

	let { existingFonts, maxFonts = 4, maxSize = 512000, onUpload, onDelete }: Props = $props();

	// TODO: Implement font upload logic
</script>

<!-- TODO: Implement font uploader UI -->
<div class="font-uploader">
	<p>Font Uploader - Coming Soon (Evergreen Feature)</p>
</div>

<style>
	.font-uploader {
		/* TODO: Add styles */
	}
</style>
