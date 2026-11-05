<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import X from '@lucide/svelte/icons/x';
	import { getArticle } from '#lib/content/articles.ts';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';
	import { WORK_CATEGORIES, type WorkMeta } from '#lib/types/work.ts';

	let { work, index, total }: { work: WorkMeta; index: number; total: number } = $props();

	const Article = $derived(getArticle(work.slug));
	const num = $derived(String(index + 1).padStart(2, '0'));
	let dialog: HTMLDialogElement | undefined = $state();

	function show() {
		dialog?.showModal();
		smoothScroll.lock();
	}
	function close() {
		smoothScroll.unlock();
		dialog?.close();
	}
</script>

<!--
  実績カード（テキストのみ）。番号を上、内容を下に置き、間を余白として見せる。
  カード全体がボタンになり、ケーススタディ全文はモーダルで開く。
-->
<article
	aria-labelledby="work-{work.slug}"
	class="work-card group relative flex h-full flex-col rounded-lg border border-line bg-bg p-7 transition-[border-color,translate] duration-300 ease-out-expo hover:-translate-y-1 hover:border-fg-muted md:p-9"
>
	<div class="flex items-start justify-between font-mono text-xs text-fg-muted">
		<span>
			<span class="text-accent-text tabular">{num}</span><span>
				/ {String(total).padStart(2, '0')}</span
			>
		</span>
		<span class="tabular">{work.period}</span>
	</div>

	<!-- 余白: 内容は下に寄せる -->
	<div class="mt-auto pt-16">
		<p class="eyebrow">{WORK_CATEGORIES[work.category].en}</p>
		<h3 id="work-{work.slug}" class="mt-3 text-h3 leading-snug font-semibold">{work.title}</h3>
		<p class="mt-2 text-sm text-fg-muted">{work.client}</p>
		<p class="mt-6 line-clamp-4 text-[0.9375rem] leading-relaxed">{work.summary}</p>
	</div>

	<div class="mt-8 flex items-end justify-between gap-6 border-t border-line pt-5">
		<p class="font-mono text-xs leading-relaxed text-fg-muted">
			<span class="sr-only">使用技術: </span>{work.tags.join(' · ')}
		</p>
		<button
			type="button"
			class="shrink-0 rounded-pill border border-line-strong p-2.5 text-fg-muted transition-colors group-hover:border-fg group-hover:text-fg after:absolute after:inset-0 after:rounded-lg after:content-['']"
			aria-haspopup="dialog"
			aria-label="{work.title}の詳細を見る"
			onclick={show}
		>
			<ArrowUpRight
				size={16}
				aria-hidden="true"
				class="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			/>
		</button>
	</div>
</article>

<dialog
	bind:this={dialog}
	aria-labelledby="work-dialog-{work.slug}"
	data-lenis-prevent
	class="work-dialog m-auto max-h-[min(88dvh,60rem)] w-[min(92vw,56rem)] overflow-y-auto rounded-lg border border-line bg-bg p-0 text-fg backdrop:bg-black/40 backdrop:backdrop-blur-sm"
	onclose={() => smoothScroll.unlock()}
	onclick={(e) => e.target === dialog && close()}
>
	<div class="p-7 md:p-12">
		<div class="flex items-start justify-between gap-6">
			<div>
				<p class="font-mono text-xs text-fg-muted">
					<span class="text-accent-text">{num}</span> · <span class="tabular">{work.period}</span>
				</p>
				<p class="eyebrow mt-4">{WORK_CATEGORIES[work.category].en}</p>
				<h3 id="work-dialog-{work.slug}" class="mt-2 text-h2 font-semibold">{work.title}</h3>
				<p class="mt-3 text-sm text-fg-muted">{work.client} ／ {work.role}</p>
			</div>
			<button
				type="button"
				class="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-line-strong hover:border-fg"
				aria-label="閉じる"
				onclick={close}
			>
				<X size={18} aria-hidden="true" />
			</button>
		</div>
		<p class="mt-8 max-w-[42em] text-lead">{work.summary}</p>
		<p class="mt-6 font-mono text-xs text-fg-muted">{work.tags.join(' · ')}</p>
		{#if Article}
			<div class="prose-site mt-10 max-w-none border-t border-line pt-4">
				<Article />
			</div>
		{/if}
	</div>
</dialog>

<style>
	.work-dialog[open] {
		animation: dialog-in var(--dur-base) var(--ease-out);
	}
	@keyframes dialog-in {
		from {
			opacity: 0;
			translate: 0 12px;
		}
	}
</style>
