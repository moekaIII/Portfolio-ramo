<script lang="ts">
	import { WORK_CATEGORIES, type WorkMeta } from '#lib/types/work.ts';

	let { work }: { work: WorkMeta } = $props();

	const items = $derived([
		{ term: 'Client', value: work.client },
		{ term: 'Role', value: work.role },
		{ term: 'Period', value: work.period },
		{ term: 'Category', value: WORK_CATEGORIES[work.category].label }
	]);
</script>

<dl class="grid grid-cols-2 gap-x-(--grid-gap) gap-y-6 md:grid-cols-4">
	{#each items as item (item.term)}
		<div class="border-t border-line pt-4">
			<dt class="eyebrow">{item.term}</dt>
			<dd class="mt-2 text-sm leading-relaxed">{item.value}</dd>
		</div>
	{/each}
</dl>
