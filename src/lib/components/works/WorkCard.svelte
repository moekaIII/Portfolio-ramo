<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { resolve } from '$app/paths';
	import { WORK_CATEGORIES, type WorkMeta } from '#lib/types/work.ts';
	import { formatSigned } from '#lib/utils/format.ts';
	import WorkThumbnail from './WorkThumbnail.svelte';

	type Props = {
		work: WorkMeta;
		headingLevel?: 2 | 3;
		sizes?: string;
	};

	let {
		work,
		headingLevel = 3,
		sizes = '(min-width: 1440px) 680px, (min-width: 768px) 50vw, 100vw'
	}: Props = $props();

	const highlight = $derived(work.results[0]);
</script>

<!-- カード全体をクリック可能にしつつ、リンクのアクセシブルネームはタイトルのみにする -->
<article class="group relative flex flex-col">
	<WorkThumbnail
		slug={work.slug}
		src={work.thumbnail}
		alt={work.thumbnailAlt}
		{sizes}
		class="transition-[border-color] duration-300 group-hover:border-line-strong [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out-expo group-hover:[&_img]:scale-[1.03]"
	/>
	<div class="mt-6 flex items-center justify-between gap-4 text-sm text-fg-muted">
		<span class="eyebrow">{WORK_CATEGORIES[work.category].en}</span>
		<span class="tabular">{work.period}</span>
	</div>
	<svelte:element this={`h${headingLevel}`} class="mt-3 text-h3 font-semibold">
		<a
			href={resolve('/works/[slug]', { slug: work.slug })}
			class="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
		>
			{work.title}
		</a>
	</svelte:element>
	<p class="mt-3 line-clamp-2 text-fg-muted">{work.summary}</p>
	<div class="mt-5 flex items-center justify-between border-t border-line pt-4">
		<p class="text-sm">
			<span class="text-fg-muted">{highlight.label}</span>
			<span class="ml-2 font-semibold text-accent-text tabular"
				>{formatSigned(highlight.value)}{highlight.unit}</span
			>
		</p>
		<ArrowUpRight
			size={20}
			aria-hidden="true"
			class="text-fg-muted transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
		/>
	</div>
	<!-- 疑似要素のリンク領域にフォーカスリングを表示 -->
	<span
		aria-hidden="true"
		class="pointer-events-none absolute -inset-3 rounded-lg outline-focus group-has-[a:focus-visible]:outline-2"
	></span>
</article>
