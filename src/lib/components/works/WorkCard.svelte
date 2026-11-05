<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import X from '@lucide/svelte/icons/x';
	import { getArticle } from '#lib/content/articles.ts';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';
	import { WORK_CATEGORIES, type WorkMeta } from '#lib/types/work.ts';

	let { work }: { work: WorkMeta } = $props();

	const Article = $derived(getArticle(work.slug));
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
  実績カード（テキストのみ）。期間の下に余白を取り、タイトルの位置は全カードで揃える。
  タグは下端に寄せる。ホバーでヒーローの背景の色味が浮かぶ。
  カード全体がボタンになり、ケーススタディ全文はモーダルで開く。
-->
<article
	aria-labelledby="work-{work.slug}"
	class="work-card group relative isolate flex h-full flex-col overflow-hidden rounded-lg border border-line bg-bg p-7 transition-colors duration-500 ease-out-expo hover:border-line-strong md:p-9"
>
	<p class="font-mono text-xs text-fg-muted tabular">{work.period}</p>

	<!-- 余白のあとに内容。上から積むので、タイトルの位置は全カードで揃う -->
	<div class="pt-16">
		<h3 id="work-{work.slug}" class="text-h3 leading-snug font-semibold">{work.title}</h3>
		<p class="mt-2 text-sm text-fg-muted">{work.client}</p>
		<p class="mt-6 line-clamp-4 text-[0.9375rem] leading-relaxed">{work.summary}</p>
	</div>

	<div class="mt-auto flex items-end justify-between gap-6 pt-10">
		<ul class="flex flex-wrap gap-1.5" aria-label="使用技術">
			{#each work.tags as tag (tag)}
				<li class="tag-label">{tag}</li>
			{/each}
		</ul>
		<button
			type="button"
			class="shrink-0 rounded-pill text-fg-muted group-hover:text-fg after:absolute after:inset-0 after:rounded-lg after:content-['']"
			aria-haspopup="dialog"
			aria-label="{work.title}の詳細を見る"
			onclick={show}
		>
			<!-- 拡大は内側の円だけに掛ける（ボタン自体を変形すると、カード全体のクリック範囲が縮むため） -->
			<span
				class="block rounded-pill border border-line-strong p-2.5 transition-[border-color,scale] duration-300 ease-out-expo group-hover:scale-125 group-hover:border-fg"
			>
				<ArrowUpRight size={16} aria-hidden="true" />
			</span>
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
					<span class="tabular">{work.period}</span>
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
		<ul class="mt-6 flex flex-wrap gap-1.5" aria-label="使用技術">
			{#each work.tags as tag (tag)}
				<li class="tag-label">{tag}</li>
			{/each}
		</ul>
		{#if Article}
			<div class="prose-site mt-10 max-w-none border-t border-line pt-4">
				<Article />
			</div>
		{/if}
	</div>
</dialog>

<style>
	/* ホバーでヒーローの背景の色味を重ねる（グラデーションは遷移できないので不透明度で） */
	.work-card::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: var(--hero-wash);
		opacity: 0;
		transition: opacity 500ms var(--ease-out);
	}
	.work-card:hover::before,
	.work-card:focus-within::before {
		opacity: 0.55;
	}
	.tag-label {
		border: 1px solid var(--line);
		border-radius: 999px;
		background: color-mix(in oklab, var(--surface-2) 70%, transparent);
		padding: 0.25rem 0.625rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		line-height: 1.4;
		color: var(--fg-muted);
		white-space: nowrap;
	}
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
