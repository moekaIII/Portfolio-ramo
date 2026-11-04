<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { getArticle } from '#lib/content/articles.ts';
	import { WORK_CATEGORIES, type WorkMeta } from '#lib/types/work.ts';
	import Tag from '#lib/components/ui/Tag.svelte';
	import ResultStat from './ResultStat.svelte';
	import WorkThumbnail from './WorkThumbnail.svelte';

	let { work }: { work: WorkMeta } = $props();

	const Article = $derived(getArticle(work.slug));
</script>

<article
	aria-labelledby="work-{work.slug}"
	class="grid-12 gap-y-8 border-t border-line py-12 md:py-16"
>
	<div
		class="col-span-full md:sticky md:top-[calc(var(--header-h)+2rem)] md:col-span-5 md:self-start"
	>
		<WorkThumbnail
			src={work.thumbnail}
			alt={work.thumbnailAlt}
			sizes="(min-width: 1440px) 540px, (min-width: 768px) 40vw, 100vw"
		/>
	</div>

	<div class="col-span-full md:col-span-7 lg:col-span-6 lg:col-start-7">
		<p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
			<span class="eyebrow">{WORK_CATEGORIES[work.category].en}</span>
			<span class="tabular">{work.period}</span>
		</p>
		<h3 id="work-{work.slug}" class="mt-3 text-h3 font-semibold">{work.title}</h3>
		<p class="mt-2 text-sm text-fg-muted">{work.client} ／ 担当: {work.role}</p>
		<p class="mt-5">{work.summary}</p>

		<dl class="mt-8 grid grid-cols-3 gap-x-(--grid-gap)">
			{#each work.results as result (result.label)}
				<ResultStat {result} compact />
			{/each}
		</dl>

		<h4 class="sr-only">使用技術</h4>
		<ul class="mt-8 flex flex-wrap gap-2">
			{#each work.tags as tag (tag)}
				<li><Tag>{tag}</Tag></li>
			{/each}
		</ul>

		{#if Article}
			<details class="group mt-8 border-t border-line">
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-medium [&::-webkit-details-marker]:hidden"
				>
					課題・担当範囲・プロセスを読む
					<ChevronDown
						size={18}
						aria-hidden="true"
						class="shrink-0 text-fg-muted transition-transform duration-300 ease-out-expo group-open:rotate-180"
					/>
				</summary>
				<div class="prose-site pb-4">
					<Article />
				</div>
			</details>
		{/if}
	</div>
</article>
