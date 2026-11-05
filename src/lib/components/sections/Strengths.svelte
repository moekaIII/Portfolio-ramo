<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { strengths } from '#lib/content/profile.ts';
	import type { WorkMeta } from '#lib/types/work.ts';

	let { works }: { works: WorkMeta[] } = $props();

	const titles = $derived(Object.fromEntries(works.map((w) => [w.slug, w.title])));
</script>

<!-- 強み。短い説明と、裏付けとなる実績を添える -->
<ol class="grid gap-x-(--grid-gap) gap-y-10 md:grid-cols-3">
	{#each strengths as item, i (item.title)}
		<li class="flex flex-col border-t border-line pt-6" use:reveal={{ delay: i * 80 }}>
			<p class="font-mono text-xs text-accent-text tabular" aria-hidden="true">
				{String(i + 1).padStart(2, '0')}
			</p>
			<h3 class="mt-3 text-xl leading-snug font-semibold">{item.title}</h3>
			<p class="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{item.body}</p>
			<ul class="mt-5 flex flex-wrap gap-1.5" aria-label="裏付けとなる実績">
				{#each item.proof.filter((s) => titles[s]) as slug (slug)}
					<li class="rounded-pill border border-line px-2.5 py-0.5 text-xs leading-relaxed text-fg">
						{titles[slug]}
					</li>
				{/each}
			</ul>
		</li>
	{/each}
</ol>
