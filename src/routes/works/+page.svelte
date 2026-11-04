<script lang="ts">
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Seo from '#lib/components/seo/Seo.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import SectionHeading from '#lib/components/ui/SectionHeading.svelte';
	import WorkCard from '#lib/components/works/WorkCard.svelte';
	import WorkFilter from '#lib/components/works/WorkFilter.svelte';
	import CtaBand from '#lib/components/home/CtaBand.svelte';
	import { WORK_CATEGORIES, type WorkCategory } from '#lib/types/work.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// プリレンダリング時は url.searchParams にアクセスできないため、マウント後に URL から復元する
	let active = $state<WorkCategory | null>(null);
	onMount(() => {
		const value = page.url.searchParams.get('category');
		if (value && value in WORK_CATEGORIES) active = value as WorkCategory;
	});

	const visible = $derived(active ? data.works.filter((w) => w.category === active) : data.works);

	const counts = $derived(
		Object.fromEntries([
			['all', data.works.length],
			...Object.keys(WORK_CATEGORIES).map((c) => [
				c,
				data.works.filter((w) => w.category === c).length
			])
		]) as Record<WorkCategory | 'all', number>
	);

	function select(category: WorkCategory | null) {
		active = category;
		// 共有・リロード用に URL だけ更新（ナビゲーションは発生させない）
		goto(category ? resolve(`/works?category=${category}`) : resolve('/works'), {
			replace: true,
			shallow: true
		});
	}

	const duration = $derived(prefersReducedMotion.current ? 0 : 400);
</script>

<Seo
	title="実績"
	description="フロントエンド開発・UIデザイン・UX改善の実績一覧。課題、プロセス、数値で示した成果までをケーススタディとして公開しています。"
/>

<Container as="section" class="pt-[calc(var(--header-h)+clamp(4rem,10vw,8rem))] pb-section">
	<SectionHeading
		level={1}
		eyebrow="Works"
		title="成果で語る、実績一覧。"
		lead="見た目の刷新だけでなく、事業の数字が動いたところまでを記録しています。気になる案件があれば、詳しい進め方もお話しできます。"
	/>

	<div
		class="mt-16 flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-center md:justify-between"
	>
		<WorkFilter {active} {counts} onchange={select} />
		<p class="text-sm text-fg-muted" aria-live="polite">
			<span class="tabular">{visible.length}</span> 件の実績を表示中
		</p>
	</div>

	<ul class="grid-12 mt-12 gap-y-20">
		{#each visible as work (work.slug)}
			<li
				class="col-span-full md:col-span-6"
				animate:flip={{ duration }}
				in:fade={{ duration: duration * 0.75 }}
			>
				<WorkCard {work} headingLevel={2} />
			</li>
		{/each}
	</ul>
</Container>

<CtaBand />
