<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';
	import Button from '#lib/components/ui/Button.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import SectionHeading from '#lib/components/ui/SectionHeading.svelte';
	import WorkCard from '#lib/components/works/WorkCard.svelte';
	import { reveal } from '#lib/actions/reveal.ts';
	import type { WorkMeta } from '#lib/types/work.ts';

	let { works }: { works: WorkMeta[] } = $props();
</script>

<section aria-labelledby="featured-heading" class="border-t border-line py-section">
	<Container>
		<SectionHeading
			id="featured-heading"
			eyebrow="Selected Works"
			title="注目の実績"
			lead="課題、プロセス、数値で示した成果まで。代表的な3つのプロジェクトです。"
		>
			{#snippet actions()}
				<Button href={resolve('/works')} variant="secondary">
					すべての実績
					{#snippet icon()}<ArrowRight size={16} />{/snippet}
				</Button>
			{/snippet}
		</SectionHeading>

		<ul class="grid-12 mt-16 gap-y-16">
			{#each works as work, i (work.slug)}
				<li class="col-span-full md:col-span-6 lg:col-span-4" use:reveal={{ delay: i * 80 }}>
					<WorkCard
						{work}
						sizes="(min-width: 1440px) 440px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
					/>
				</li>
			{/each}
		</ul>
	</Container>
</section>
