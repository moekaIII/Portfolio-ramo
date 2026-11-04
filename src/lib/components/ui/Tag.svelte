<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<span
	class="inline-flex items-center rounded-pill border border-line px-3 py-1 text-xs leading-none text-fg-muted"
>
	{@render children()}
</span>
