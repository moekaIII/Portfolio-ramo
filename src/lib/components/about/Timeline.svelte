<script lang="ts">
	import type { career } from '#lib/content/profile.ts';

	let { items }: { items: typeof career } = $props();
</script>

<ol class="border-b border-line">
	{#each items as item (item.period)}
		<li class="grid-12 gap-y-3 border-t border-line py-8">
			<p class="col-span-full text-sm text-fg-muted tabular md:col-span-3">{item.period}</p>
			<div class="col-span-full md:col-span-9">
				<h3 class="text-lg font-semibold">{item.title}</h3>
				<p class="mt-1 text-sm text-fg-muted">{item.org}</p>
				<p class="mt-3 text-fg-muted">{item.description}</p>
			</div>
		</li>
	{/each}
</ol>
