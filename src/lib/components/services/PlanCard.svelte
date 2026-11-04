<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import type { Plan } from '#lib/content/services.ts';

	let { plan }: { plan: Plan } = $props();
</script>

<article
	class={[
		'flex h-full flex-col rounded-lg border p-8',
		plan.recommended ? 'border-accent-text bg-surface' : 'border-line'
	]}
>
	<div class="flex items-center justify-between gap-4">
		<h3 class="text-lg font-semibold">{plan.name}</h3>
		{#if plan.recommended}
			<span class="rounded-pill bg-accent px-3 py-1 text-xs font-medium text-on-accent"
				>おすすめ</span
			>
		{/if}
	</div>
	<p class="mt-6 flex items-baseline gap-2">
		<span class="text-h2 font-semibold tabular">{plan.price}</span>
		<span class="text-sm text-fg-muted">{plan.unit}</span>
	</p>
	<p class="mt-4 text-sm text-fg-muted">{plan.description}</p>
	<ul class="mt-8 space-y-2 border-t border-line pt-6 text-sm">
		{#each plan.features as feature (feature)}
			<li class="flex items-center gap-2">
				<Check size={14} aria-hidden="true" class="shrink-0 text-accent-text" />{feature}
			</li>
		{/each}
	</ul>
</article>
