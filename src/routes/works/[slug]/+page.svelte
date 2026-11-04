<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';
	import Seo from '#lib/components/seo/Seo.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import CaseMeta from '#lib/components/works/CaseMeta.svelte';
	import ResultStat from '#lib/components/works/ResultStat.svelte';
	import TechList from '#lib/components/works/TechList.svelte';
	import WorkThumbnail from '#lib/components/works/WorkThumbnail.svelte';
	import CtaBand from '#lib/components/home/CtaBand.svelte';
	import { getThumbnail } from '#lib/content/thumbnails.ts';
	import { WORK_CATEGORIES } from '#lib/types/work.ts';
	import { creativeWorkJsonLd } from '#lib/utils/jsonld.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const work = $derived(data.work);
	const ogImage = $derived(getThumbnail(work.thumbnail).img.src);
</script>

<Seo
	title={work.title}
	description={work.summary}
	type="article"
	image={ogImage}
	imageAlt={work.thumbnailAlt}
	jsonLd={creativeWorkJsonLd(work)}
/>

<article>
	<Container as="header" class="pt-[calc(var(--header-h)+clamp(3rem,8vw,6rem))]">
		<nav aria-label="パンくずリスト" class="mb-10 text-sm text-fg-muted">
			<ol class="flex items-center gap-2">
				<li><a href={resolve('/works')} class="hover:text-fg">Works</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page" class="truncate text-fg">{work.title}</li>
			</ol>
		</nav>
		<p class="eyebrow mb-5">{WORK_CATEGORIES[work.category].en}</p>
		<h1 class="max-w-[18em] text-h1 font-semibold">{work.title}</h1>
		<p class="mt-8 max-w-[40em] text-lead text-fg-muted">{work.summary}</p>
		<div class="mt-14">
			<CaseMeta {work} />
		</div>
	</Container>

	<Container class="mt-14">
		<WorkThumbnail
			slug={work.slug}
			src={work.thumbnail}
			alt={work.thumbnailAlt}
			sizes="(min-width: 1440px) 1344px, 100vw"
			priority
		/>
	</Container>

	<Container as="section" class="py-section" aria-labelledby="results-heading">
		<div class="grid-12 gap-y-10">
			<h2 id="results-heading" class="col-span-full text-h2 font-semibold md:col-span-4">成果</h2>
			<dl class="col-span-full grid gap-x-(--grid-gap) gap-y-12 sm:grid-cols-3 md:col-span-8">
				{#each work.results as result (result.label)}
					<ResultStat {result} />
				{/each}
			</dl>
		</div>
	</Container>

	<Container class="pb-section">
		<div class="grid-12 gap-y-12 border-t border-line pt-16">
			<aside class="col-span-full md:col-span-4">
				<div class="md:sticky md:top-[calc(var(--header-h)+2rem)]">
					<TechList tags={work.tags} />
				</div>
			</aside>
			<div class="prose-site col-span-full md:col-span-8 lg:col-span-7">
				<data.Article />
			</div>
		</div>
	</Container>

	<Container as="nav" aria-label="ほかの実績" class="pb-section">
		<ul class="grid gap-(--grid-gap) border-t border-line pt-10 sm:grid-cols-2">
			<li>
				<a
					href={resolve('/works/[slug]', { slug: data.prev.slug })}
					class="group -m-4 flex flex-col gap-2 rounded-lg p-4 hover:bg-surface"
				>
					<span class="eyebrow flex items-center gap-2"
						><ArrowLeft size={14} aria-hidden="true" />前の実績</span
					>
					<span class="text-h3 font-semibold">{data.prev.title}</span>
				</a>
			</li>
			<li class="sm:text-right">
				<a
					href={resolve('/works/[slug]', { slug: data.next.slug })}
					class="group -m-4 flex flex-col gap-2 rounded-lg p-4 hover:bg-surface sm:items-end"
				>
					<span class="eyebrow flex items-center gap-2"
						>次の実績<ArrowRight size={14} aria-hidden="true" /></span
					>
					<span class="text-h3 font-semibold">{data.next.title}</span>
				</a>
			</li>
		</ul>
	</Container>
</article>

<CtaBand />
