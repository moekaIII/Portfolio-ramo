<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		eyebrow?: string;
		title: string;
		lead?: string;
		level?: 1 | 2 | 3;
		id?: string;
		size?: 'h1' | 'h2';
		class?: string;
		actions?: Snippet;
	};

	let {
		eyebrow,
		title,
		lead,
		level = 2,
		id,
		size = level === 1 ? 'h1' : 'h2',
		class: className = '',
		actions
	}: Props = $props();
</script>

<div class={['grid-12 gap-y-6', className]}>
	<div class="col-span-full md:col-span-8">
		{#if eyebrow}
			<p class="eyebrow mb-5 flex items-center gap-3">
				<span aria-hidden="true" class="h-px w-8 bg-accent-text"></span>{eyebrow}
			</p>
		{/if}
		<svelte:element
			this={`h${level}`}
			{id}
			class={[size === 'h1' ? 'text-h1' : 'text-h2', 'font-semibold']}
		>
			{title}
		</svelte:element>
		{#if lead}
			<p class="mt-6 max-w-[40em] text-lead text-fg-muted">{lead}</p>
		{/if}
	</div>
	{#if actions}
		<div class="col-span-full flex items-end md:col-span-4 md:justify-end">
			{@render actions()}
		</div>
	{/if}
</div>
