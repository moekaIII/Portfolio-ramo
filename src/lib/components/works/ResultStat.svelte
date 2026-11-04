<script lang="ts">
	import type { WorkResult } from '#lib/types/work.ts';
	import { formatSigned } from '#lib/utils/format.ts';

	let { result }: { result: WorkResult } = $props();
</script>

<div class="flex flex-col border-t border-line pt-6">
	<dt class="order-2 mt-3 text-sm text-fg">{result.label}</dt>
	<dd class="order-1 flex items-baseline gap-1 font-semibold tracking-tight">
		<span class="text-[clamp(3rem,2rem+3vw,4.5rem)] leading-none text-accent-text tabular"
			>{formatSigned(result.value)}</span
		>
		{#if result.unit}<span class="text-h3 text-fg-muted">{result.unit}</span>{/if}
	</dd>
	{#if result.note}
		<dd class="order-3 mt-1 text-xs text-fg-muted">{result.note}</dd>
	{/if}
</div>
