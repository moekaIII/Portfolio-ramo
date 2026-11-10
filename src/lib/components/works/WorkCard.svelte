<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import X from '@lucide/svelte/icons/x';
	import { getArticle } from '#lib/content/articles.ts';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';
	import { WORK_CATEGORIES, type WorkMeta } from '#lib/types/work.ts';

	let { work }: { work: WorkMeta } = $props();

	const Article = $derived(getArticle(work.slug));
	let dialog: HTMLDialogElement | undefined = $state();

	/** カーソル位置（カード内の %）を CSS 変数に渡す。色のにじみが追従する */
	function track(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		const el = e.currentTarget as HTMLElement;
		const r = el.getBoundingClientRect();
		el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
		el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
	}

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
  タグは下端に寄せる。ホバーでヒーローと同じ淡い背景になり、淡いオレンジがカーソルについてくる。
  カード全体がボタンになり、ケーススタディ全文はモーダルで開く。
-->
<article
	aria-labelledby="work-{work.slug}"
	onpointermove={track}
	class="work-card group relative isolate flex h-full cursor-pointer flex-col rounded-lg border border-line bg-bg p-7 transition-colors duration-500 ease-out-expo focus-within:border-transparent hover:border-transparent md:p-9"
>
	<p class="font-mono text-xs text-fg-muted tabular">{work.period}</p>

	<!-- 余白のあとに内容。上から積むので、タイトルの位置は全カードで揃う -->
	<div class="pt-10">
		<h3 id="work-{work.slug}" class="text-h3 leading-snug font-semibold">{work.title}</h3>
		<p class="mt-2 text-sm text-fg-muted">{work.client}</p>
		<p class="mt-6 line-clamp-6 text-[0.9375rem] leading-relaxed md:line-clamp-4">{work.summary}</p>
	</div>

	<div class="mt-auto flex items-end justify-between gap-6 pt-10">
		<ul class="flex flex-wrap gap-1.5" aria-label="使用技術">
			{#each work.tags as tag (tag)}
				<li class="tag-label">{tag}</li>
			{/each}
		</ul>
		<button
			type="button"
			class="button-arrow shrink-0 cursor-pointer rounded-pill text-fg-muted group-hover:text-fg after:absolute after:inset-0 after:rounded-lg after:content-['']"
			aria-haspopup="dialog"
			aria-label="{work.title}の詳細を見る"
			onclick={show}
		>
			<!-- 拡大は内側の円だけに掛ける（ボタン自体を変形すると、カード全体のクリック範囲が縮むため） -->
			<span
				class="work-arrow relative block rounded-pill border border-line-strong p-2.5 transition-[border-color,scale] duration-300 ease-out-expo group-focus-within:border-transparent group-hover:scale-125"
			>
				<svg width="0" height="0" class="absolute" aria-hidden="true" focusable="false">
					<linearGradient id="work-arrow-{work.slug}" x1="0" y1="1" x2="1" y2="0">
						<stop offset="0" stop-color="var(--edge-1)" />
						<stop offset="0.4" stop-color="var(--edge-2)" />
						<stop offset="0.7" stop-color="var(--edge-3)" />
						<stop offset="1" stop-color="var(--edge-5)" />
					</linearGradient>
				</svg>
				<ArrowUpRight
					size={16}
					aria-hidden="true"
					style="--arrow-grad: url(#work-arrow-{work.slug})"
				/>
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
	/*
	  ホバーでヒーローと同じ淡い背景を敷き、淡いオレンジのにじみをカーソル位置（--mx / --my）に置く。
	  位置は @property で型を登録してあり、少し遅れてなめらかに追従する。
	*/
	.work-card {
		--mx: 50%;
		--my: 50%;
		transition-property: border-color, --mx, --my;
		transition-duration: 500ms, 900ms, 900ms;
	}
	.button-arrow:hover {
		background-color: #ffffff;
	}
	.work-card::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		z-index: -1;
		background:
			radial-gradient(100% 100% at var(--mx) var(--my), var(--wash-glow), transparent 100%),
			var(--hero-wash);
		opacity: 0;
		transition: opacity 500ms var(--ease-out);
	}
	.work-card:hover::before,
	.work-card:focus-within::before {
		opacity: 0.5; /* 淡く重ねる */
	}
	/* 枠線もグラデーションに（1px の縁だけを残すマスク） */
	.work-card::after {
		content: '';
		position: absolute;
		inset: -1px;
		border: 1px solid transparent;
		border-radius: inherit;
		background: var(--hero-edge) border-box;
		mask:
			linear-gradient(#000 0 0) padding-box exclude,
			linear-gradient(#000 0 0) border-box;
		pointer-events: none;
		opacity: 0;
		transition: opacity 500ms var(--ease-out);
	}
	.work-card:hover::after,
	.work-card:focus-within::after {
		opacity: 1;
	}
	/* 矢印の円と線も、枠線と同じグラデーションに */
	.work-arrow::before {
		content: '';
		position: absolute;
		inset: -1px;
		border: 1px solid transparent;
		border-radius: inherit;
		/* background: var(--hero-edge) border-box; */
		/* background-color: white; */
		/* mask:
			linear-gradient(#000 0 0) padding-box exclude,
			linear-gradient(#000 0 0) border-box; */
		/* opacity: 0; */
		/* transition: opacity 300ms var(--ease-out); */
	}
	:global(.work-card:is(:hover, :focus-within)) .work-arrow::before {
		opacity: 1;
	}
	:global(.work-card:is(:hover, :focus-within)) .work-arrow :global(svg:not([width='0'])) {
		/* stroke: var(--arrow-grad); */
	}
	@media (prefers-reduced-motion: reduce) {
		.work-card {
			transition-duration: 500ms, 0s, 0s;
		}
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
