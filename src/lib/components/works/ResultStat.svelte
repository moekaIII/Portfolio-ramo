<script lang="ts">
	import type { WorkResult } from '#lib/types/work.ts';
	import { formatSigned } from '#lib/utils/format.ts';

	let { result, compact = false }: { result: WorkResult; compact?: boolean } = $props();
</script>

<div class={['flex flex-col border-t border-line', compact ? 'pt-4' : 'pt-6']}>
	<dt class={['order-2 text-fg', compact ? 'mt-2 text-xs leading-relaxed' : 'mt-3 text-sm']}>
		{result.label}
	</dt>
	<dd class="order-1 flex items-baseline gap-1 font-semibold tracking-tight">
		<span
			class={[
				'leading-none text-accent-text tabular',
				compact ? 'text-[clamp(2rem,1.6rem+1.4vw,2.75rem)]' : 'text-[clamp(3rem,2rem+3vw,4.5rem)]'
			]}>{formatSigned(result.value)}</span
		>
		{#if result.unit}
			<span class={[compact ? 'text-base' : 'text-h3', 'text-fg-muted']}>{result.unit}</span>
		{/if}
	</dd>
	{#if result.note}
		<dd class="order-3 mt-1 text-xs text-fg-muted">{result.note}</dd>
	{/if}
</div>
