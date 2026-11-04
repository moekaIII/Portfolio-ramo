<script lang="ts">
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import { theme } from '#lib/state/theme.svelte.ts';

	const label = $derived(
		theme.current === 'dark' ? 'ライトテーマに切り替える' : 'ダークテーマに切り替える'
	);
</script>

<button
	type="button"
	class="inline-flex size-11 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
	aria-label={label}
	title={label}
	onclick={() => theme.toggle()}
>
	{#if theme.current === 'dark'}
		<Sun size={18} aria-hidden="true" />
	{:else}
		<Moon size={18} aria-hidden="true" />
	{/if}
</button>
