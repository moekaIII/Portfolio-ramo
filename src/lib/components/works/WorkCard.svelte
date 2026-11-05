<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { getArticle } from '#lib/content/articles.ts';
	import { WORK_CATEGORIES, type WorkMeta } from '#lib/types/work.ts';
	import { formatSigned } from '#lib/utils/format.ts';
	import ResultStat from './ResultStat.svelte';

	let { work, index }: { work: WorkMeta; index: number } = $props();

	const Article = $derived(getArticle(work.slug));
	const lead = $derived(work.results[0]);
	const panelId = $derived(`work-panel-${work.slug}`);
	let open = $state(false);
</script>

<!--
  テキストだけで見せる実績の 1 行。行全体がクリックでき、詳細（概要・全成果・プロセス）は開閉する。
  JS 無効時は詳細を開いたまま表示する（.js がないときは折りたたまない）。
-->
<article
	aria-labelledby="work-{work.slug}"
	class={['work-row border-t border-line', open && 'is-open']}
>
	<div class="work-head grid-12 relative gap-y-3 py-6 md:items-baseline md:py-7">
		<p
			class="col-span-full flex items-baseline gap-3 font-mono text-xs text-fg-muted md:col-span-2 md:flex-col md:gap-1"
		>
			<span class="text-accent-text tabular">{String(index + 1).padStart(2, '0')}</span>
			<span class="tabular">{work.period}</span>
		</p>

		<div class="col-span-full md:col-span-6">
			<p class="eyebrow mb-1.5">{WORK_CATEGORIES[work.category].en}</p>
			<h3 id="work-{work.slug}" class="text-lg leading-snug font-semibold md:text-xl">
				{work.title}
			</h3>
			<p class="mt-1.5 text-sm text-fg-muted">{work.client} ／ {work.role}</p>
			<p class="mt-2 font-mono text-xs leading-relaxed text-fg-muted">
				<span class="sr-only">使用技術: </span>{work.tags.join(' · ')}
			</p>
		</div>

		<div class="col-span-3 md:col-span-3">
			{#if lead}
				<p class="flex items-baseline gap-2 md:flex-col md:items-end md:gap-1 md:text-right">
					<span class="flex items-baseline gap-0.5 font-semibold tracking-tight">
						<span
							class="text-[clamp(1.6rem,1.2rem+1.2vw,2.25rem)] leading-none text-accent-text tabular"
							>{formatSigned(lead.value)}</span
						>
						{#if lead.unit}<span class="text-sm text-fg-muted">{lead.unit}</span>{/if}
					</span>
					<span class="text-xs text-fg-muted">{lead.label}</span>
				</p>
			{/if}
		</div>

		<div class="col-span-1 flex items-center justify-end">
			<!-- 行全体を覆う透明なボタン（クリック範囲を広く。アクセシブルネームは案件名） -->
			<button
				type="button"
				class="toggle inline-flex size-10 items-center justify-center rounded-pill border border-line-strong text-fg-muted transition-colors after:absolute after:inset-0 after:content-['']"
				aria-expanded={open}
				aria-controls={panelId}
				aria-label="{work.title}の詳細を{open ? '閉じる' : '開く'}"
				onclick={() => (open = !open)}
			>
				<Plus
					size={16}
					aria-hidden="true"
					class={['transition-transform duration-300 ease-out-expo', open && 'rotate-45']}
				/>
			</button>
		</div>
	</div>

	<div id={panelId} class="work-panel grid">
		<div class="overflow-hidden">
			<div class="grid-12 gap-y-8 pb-10">
				<div class="col-span-full md:col-span-10 md:col-start-3">
					<p class="max-w-[42em]">{work.summary}</p>
					<dl class="mt-8 grid max-w-3xl grid-cols-3 gap-x-(--grid-gap)">
						{#each work.results as result (result.label)}
							<ResultStat {result} compact />
						{/each}
					</dl>
				</div>
				{#if Article}
					<div class="prose-site work-prose col-span-full md:col-span-10 md:col-start-3">
						<Article />
					</div>
				{/if}
			</div>
		</div>
	</div>
</article>

<style>
	/* 高さ 0 ↔ 自動 を grid-template-rows で滑らかに開閉する */
	.work-panel {
		grid-template-rows: 1fr;
		transition: grid-template-rows var(--dur-slow) var(--ease-out);
	}
	:global(.js) .work-row:not(.is-open) .work-panel {
		grid-template-rows: 0fr;
		visibility: hidden;
		transition:
			grid-template-rows var(--dur-slow) var(--ease-out),
			visibility 0s var(--dur-slow);
	}
	.work-head {
		transition: background-color var(--dur-base);
	}
	.work-row:hover .work-head {
		background-color: color-mix(in oklch, var(--fg) 3%, transparent);
	}
	.work-row:hover .toggle {
		border-color: var(--fg);
		color: var(--fg);
	}
	/* 開いたときの本文は、広い画面では 2 段組にして縦に伸びすぎないようにする */
	@media (min-width: 64rem) {
		.work-prose {
			max-width: none;
			columns: 2;
			column-gap: var(--grid-gap);
		}
		.work-prose :global(h4) {
			margin-top: 0;
			break-after: avoid;
		}
		.work-prose :global(p),
		.work-prose :global(li) {
			break-inside: avoid;
		}
	}
</style>
