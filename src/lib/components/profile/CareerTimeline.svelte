<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';
	import type { CareerItem } from '#lib/content/profile.ts';

	let { items }: { items: CareerItem[] } = $props();

	/** ドットが点くときに散る粒の色（Hero の花と同じ色味） */
	const SPARKS = [
		'var(--edge-1)',
		'var(--edge-2)',
		'var(--edge-3)',
		'var(--accent-text)',
		'var(--edge-5)',
		'var(--edge-2)'
	];

	let root: HTMLOListElement | undefined = $state();

	/**
	 * スクロール連動の見せ場（サイト内で gsap を使うのはここだけ）。
	 * 進捗線がスクロールに合わせて伸び、線が到達した経歴の見出しとドットが強調される
	 * = 時間の流れ（いまどの時期を読んでいるか）を伝えるための動き。reduced-motion 時は静的表示。
	 */
	$effect(() => {
		const el = root;
		const lenis = smoothScroll.lenis;
		if (!el || prefersReducedMotion.current) return;

		let disposed = false;
		let cleanup = () => {};

		Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
			([{ gsap }, { ScrollTrigger }]) => {
				if (disposed) return;
				gsap.registerPlugin(ScrollTrigger);
				const offScroll = lenis?.on('scroll', ScrollTrigger.update);

				const ctx = gsap.context(() => {
					gsap.fromTo(
						'[data-process-line]',
						{ scaleY: 0 },
						{
							scaleY: 1,
							ease: 'none',
							scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 65%', scrub: 0.4 }
						}
					);
					for (const step of el.querySelectorAll<HTMLElement>('[data-process-step]')) {
						// 不透明度は変えない（未到達のステップも常に AA コントラストを保つ）
						const heading = step.querySelector('h3');
						if (heading)
							gsap.fromTo(
								heading,
								{ color: 'var(--fg-muted)' },
								{
									color: 'var(--fg)',
									duration: 0.4,
									ease: 'power2.out',
									scrollTrigger: {
										trigger: step,
										start: 'top 65%',
										toggleActions: 'play none none reverse'
									}
								}
							);
						// 線が届いたらドットをぽんっと弾ませ、輪と小さな粒を散らす（演出は CSS）
						const dot = step.querySelector('[data-process-dot]');
						if (dot)
							ScrollTrigger.create({
								trigger: step,
								start: 'top 65%',
								toggleClass: { targets: dot, className: 'is-on' }
							});
					}
				}, el);

				cleanup = () => {
					offScroll?.();
					ctx.revert();
				};
			}
		);

		return () => {
			disposed = true;
			cleanup();
		};
	});
</script>

<!-- data-process-* はスクロール連動（gsap）のフック。JS なしでも完結した表示になる -->
<ol bind:this={root} class="relative" data-process>
	<span
		aria-hidden="true"
		class="absolute top-2 bottom-2 left-[0.6875rem] w-px bg-line md:left-[calc(25%+0.6875rem)]"
	></span>
	<span
		aria-hidden="true"
		data-process-line
		class="absolute top-2 bottom-2 left-[0.6875rem] w-px origin-top bg-accent-text md:left-[calc(25%+0.6875rem)]"
	></span>
	{#each items as item (item.period)}
		<li
			class="relative grid gap-y-3 pb-16 pl-12 last:pb-0 md:grid-cols-4 md:pl-0"
			data-process-step
		>
			<div class="md:pr-10 md:text-right">
				<p class="text-sm font-medium tabular">{item.period}</p>
				<p class="mt-1 text-sm text-fg-muted">{item.org}</p>
			</div>
			<span
				aria-hidden="true"
				data-process-dot
				class="career-dot absolute top-1.5 left-1.5 size-3 md:left-[calc(25%+0.375rem)]"
			>
				<span class="career-dot-ring"></span>
				{#each SPARKS as c, k (k)}
					<span class="career-dot-spark" style="--a: {k * (360 / SPARKS.length) + 15}deg; --c: {c}"
					></span>
				{/each}
				<span class="career-dot-core"></span>
			</span>
			<div class="md:col-span-3 md:pl-16">
				<h3 class="text-h3 font-semibold">{item.title}</h3>
				<p class="mt-3 max-w-[40em] text-fg-muted">{item.summary}</p>
				<ul class="mt-5 space-y-2">
					{#each item.achievements as a (a)}
						<li
							class="relative pl-5 text-[0.9375rem] before:absolute before:top-[0.85em] before:left-0 before:h-px before:w-2.5 before:bg-accent-text"
						>
							{a}
						</li>
					{/each}
				</ul>
				<p class="sr-only">使用技術:</p>
				<ul class="mt-5 flex flex-wrap gap-2">
					{#each item.stack as tech (tech)}
						<li class="rounded-pill bg-surface-2 px-3 py-1.5 text-xs">{tech}</li>
					{/each}
				</ul>
			</div>
		</li>
	{/each}
</ol>

<style>
	/* 経歴のドット。未到達は線の丸、線が届くと塗りつぶされて弾む */
	.career-dot {
		display: block;
	}
	.career-dot > span {
		position: absolute;
		inset: 0;
		border-radius: 999px;
	}
	.career-dot-core {
		border: 2px solid var(--accent-text);
		background: var(--bg);
		transition: background-color 200ms var(--ease-out);
	}
	.career-dot:global(.is-on) .career-dot-core {
		background: var(--accent-text);
		scale: 1.25;
	}
	.career-dot-ring {
		border: 1.5px solid var(--accent-text);
		opacity: 0;
	}
	/* 小さな粒。中心から外へ散って消える */
	.career-dot-spark {
		inset: auto !important;
		left: 50%;
		top: 50%;
		width: 4px;
		height: 4px;
		margin: -2px 0 0 -2px;
		background: var(--c);
		opacity: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		/* ぷにっと縮んでから、ぽんっと弾んで落ち着く */
		.career-dot:global(.is-on) .career-dot-core {
			animation: career-pop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
		}
		.career-dot:global(.is-on) .career-dot-ring {
			animation: career-ring 900ms var(--ease-out) 80ms both;
		}
		.career-dot:global(.is-on) .career-dot-spark {
			animation: career-spark 800ms var(--ease-out) 60ms both;
		}
	}
	@keyframes career-pop {
		0% {
			scale: 1;
		}
		20% {
			scale: 0.7;
		}
		55% {
			scale: 1.6;
		}
		75% {
			scale: 1.1;
		}
		100% {
			scale: 1.25;
		}
	}
	@keyframes career-ring {
		0% {
			opacity: 0.7;
			scale: 1;
		}
		100% {
			opacity: 0;
			scale: 3.2;
		}
	}
	@keyframes career-spark {
		0% {
			opacity: 0;
			transform: rotate(var(--a)) translateX(0) scale(0.4);
		}
		25% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: rotate(var(--a)) translateX(1.4rem) scale(1);
		}
	}
</style>
