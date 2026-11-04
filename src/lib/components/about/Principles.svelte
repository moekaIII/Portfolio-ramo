<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import type { principles } from '#lib/content/profile.ts';

	let { items }: { items: typeof principles } = $props();
</script>

<ol class="grid gap-x-(--grid-gap) gap-y-14 md:grid-cols-2">
	{#each items as item, i (item.title)}
		<li class="border-t border-line pt-8" use:reveal={{ delay: (i % 2) * 80 }}>
			<p class="text-sm text-accent-text tabular" aria-hidden="true">0{i + 1}</p>
			<h3 class="mt-6 text-h3 font-semibold">{item.title}</h3>
			<p class="mt-4 max-w-[34em] text-fg-muted">{item.body}</p>
		</li>
	{/each}
</ol>
