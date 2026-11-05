<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { WorkMeta } from '#lib/types/work.ts';
	import WorkCard from './WorkCard.svelte';

	let { works }: { works: WorkMeta[] } = $props();

	let scroller: HTMLDivElement | undefined = $state();
	let progress = $state(0);
	let atStart = $state(true);
	let atEnd = $state(false);

	function update() {
		if (!scroller) return;
		const max = scroller.scrollWidth - scroller.clientWidth;
		progress = max > 0 ? scroller.scrollLeft / max : 1;
		atStart = scroller.scrollLeft <= 2;
		atEnd = scroller.scrollLeft >= max - 2;
	}

	/** 前後のカード 1 枚分だけ動かす */
	function go(dir: -1 | 1) {
		if (!scroller) return;
		const card = scroller.querySelector('li');
		const gap = parseFloat(getComputedStyle(scroller.querySelector('ul')!).columnGap) || 0;
		const step = (card?.getBoundingClientRect().width ?? 320) + gap;
		scroller.scrollBy({ left: dir * step, behavior: 'smooth' });
	}

	$effect(() => {
		update();
		const ro = new ResizeObserver(update);
		if (scroller) ro.observe(scroller);
		return () => ro.disconnect();
	});
</script>

<div>
	<!-- カード列は画面の右端まで流し、左端は本文の位置にそろえる -->
	<div
		bind:this={scroller}
		onscroll={update}
		class="works-scroller overflow-x-auto pb-6"
		role="region"
		tabindex="0"
		aria-label="実績（横にスクロールできます）"
	>
		<ul class="flex w-max gap-(--grid-gap)">
			{#each works as work (work.slug)}
				<li class="w-[min(84vw,26rem)] shrink-0 snap-start md:w-[min(42vw,28rem)]">
					<WorkCard {work} />
				</li>
			{/each}
		</ul>
	</div>

	<div class="mt-4 flex items-center gap-6">
		<div class="relative h-px flex-1 bg-line" aria-hidden="true">
			<span
				class="absolute inset-y-0 left-0 bg-fg transition-[width] duration-150"
				style:width="{Math.max(8, progress * 100)}%"
			></span>
		</div>
		<div class="flex gap-2">
			<button
				type="button"
				class="inline-flex size-11 items-center justify-center rounded-pill border border-line-strong transition-colors hover:border-fg disabled:opacity-30"
				aria-label="前の実績へ"
				disabled={atStart}
				onclick={() => go(-1)}
			>
				<ArrowLeft size={18} aria-hidden="true" />
			</button>
			<button
				type="button"
				class="inline-flex size-11 items-center justify-center rounded-pill border border-line-strong transition-colors hover:border-fg disabled:opacity-30"
				aria-label="次の実績へ"
				disabled={atEnd}
				onclick={() => go(1)}
			>
				<ArrowRight size={18} aria-hidden="true" />
			</button>
		</div>
	</div>
</div>

<style>
	/* 親（Container）の幅から画面端まではみ出させ、先頭カードは本文の左端にそろえる */
	.works-scroller {
		/* 本文の左端 = コンテナの外側の余白 + ガター（scroll-padding の % は自身の幅基準なので使わない） */
		--bleed: calc(max(0px, (100vw - var(--container)) / 2) + var(--gutter));
		margin-inline: calc(-1 * var(--bleed));
		padding-inline: var(--bleed);
		scroll-padding-inline: var(--bleed);
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}
	.works-scroller::-webkit-scrollbar {
		display: none;
	}
	.works-scroller:focus-visible {
		outline-offset: -2px;
	}
</style>
