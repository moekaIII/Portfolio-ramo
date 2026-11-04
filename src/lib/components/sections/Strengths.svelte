<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { strengths } from '#lib/content/profile.ts';
</script>

<ol class="grid gap-x-(--grid-gap) gap-y-14 md:grid-cols-3">
	{#each strengths as item, i (item.title)}
		<li class="border-t border-line pt-8" use:reveal={{ delay: i * 80 }}>
			<p class="text-sm text-accent-text tabular" aria-hidden="true">0{i + 1}</p>
			<h3 class="mt-6 text-h3 font-semibold">{item.title}</h3>
			<p class="mt-4 text-fg-muted">{item.body}</p>
		</li>
	{/each}
</ol>
