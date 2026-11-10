<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';
	import type { CareerItem } from '#lib/content/profile.ts';

	let { items }: { items: CareerItem[] } = $props();

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
<ol bind:this={root} class="career relative" data-process>
	<span
		aria-hidden="true"
		class="career-rail absolute top-2 left-[0.6875rem] w-px bg-line md:left-[calc(25%+0.6875rem)]"
	></span>
	<span
		aria-hidden="true"
		data-process-line
		class="career-rail absolute top-2 left-[0.6875rem] w-px origin-top bg-(--career) md:left-[calc(25%+0.6875rem)]"
	></span>
	{#each items as item, i (item.period)}
		<li
			class="relative grid gap-y-3 pb-16 pl-12 last:pb-0 md:grid-cols-4 md:pl-0"
			data-process-step
		>
			<div class="md:pr-10 md:text-right">
				<p class="text-sm font-medium tabular">{item.period}</p>
				{#if item.org}
					<p class="mt-1 text-sm text-fg-muted">{item.org}</p>
				{/if}
			</div>
			<span
				aria-hidden="true"
				data-process-dot
				class="career-dot absolute top-1.5 left-1.5 size-3 md:left-[calc(25%+0.375rem)]"
			>
				<!-- 線が届くと、Hero・強みの丸と同じグラデーションの細い輪が 12 時から一周して描かれる -->
				<svg class="career-dot-ring" viewBox="0 0 32 32" focusable="false">
					<defs>
						<linearGradient id="career-ring-{i}" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" style="stop-color: var(--edge-1)" />
							<stop offset="0.35" style="stop-color: var(--edge-2)" />
							<stop offset="0.6" style="stop-color: var(--edge-3)" />
							<stop offset="0.8" style="stop-color: var(--edge-4)" />
							<stop offset="1" style="stop-color: var(--edge-5)" />
						</linearGradient>
					</defs>
					<circle
						cx="16"
						cy="16"
						r="15"
						pathLength="100"
						stroke="url(#career-ring-{i})"
						transform="rotate(-90 16 16)"
					/>
				</svg>
				<span class="career-dot-core"></span>
			</span>
			<div class="md:col-span-3 md:pl-16">
				<h3 class="text-h3 font-semibold">{item.title}</h3>
				{#if item.summary}
					<p class="mt-3 max-w-[40em] text-fg-muted">{item.summary}</p>
				{/if}
				{#if item.achievements?.length}
					<ul class="mt-5 space-y-2">
						{#each item.achievements as a (a)}
							<li
								class="relative pl-5 text-[0.9375rem] before:absolute before:top-[0.85em] before:left-0 before:h-px before:w-2.5 before:bg-(--career)"
							>
								{a}
							</li>
						{/each}
					</ul>
				{/if}
				{#if item.stack?.length}
					<p class="sr-only">使用技術:</p>
					<ul class="mt-5 flex flex-wrap gap-2">
						{#each item.stack as tech (tech)}
							<li class="rounded-pill bg-surface-2 px-3 py-1.5 text-xs">{tech}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</li>
	{/each}
</ol>

<style>
	/*
	  経歴のドット。未到達は線の丸、線が届くと静かに塗りつぶされ、
	  周りに細い輪が製図のように一周して描かれる（強みの丸と同じ描き方）
	*/
	/* 線・ドット・箇条書きの印は、強みの縦線やスキルのハイライトと同じ「茎」の緑 */
	.career {
		--career: #7f9a68;
	}
	:global([data-theme='dark']) .career {
		--career: #8aa673;
	}
	/* 縦線は最後の経歴より下まで伸ばし、先端をぼかして消す */
	.career-rail {
		bottom: -6rem;
		mask-image: linear-gradient(to bottom, #000 calc(100% - 10rem), transparent);
	}
	.career-dot {
		display: block;
	}
	.career-dot-core {
		position: absolute;
		inset: 0;
		border: 2px solid var(--career);
		border-radius: 999px;
		background: var(--bg);
	}
	.career-dot:global(.is-on) .career-dot-core {
		background: var(--career);
	}
	.career-dot-ring {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 2rem;
		max-width: none;
		height: 2rem;
		translate: -50% -50%;
		overflow: visible;
		pointer-events: none;
	}
	.career-dot-ring circle {
		fill: none;
		stroke-width: 1;
		stroke-linecap: round;
		stroke-dasharray: 100;
		stroke-dashoffset: 100;
	}
	.career-dot:global(.is-on) .career-dot-ring circle {
		stroke-dashoffset: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.career-dot-core {
			transition:
				background-color 400ms var(--ease-out),
				scale 400ms var(--ease-out);
		}
		.career-dot:global(.is-on) .career-dot-core {
			scale: 1.15;
		}
		.career-dot-ring circle {
			transition: stroke-dashoffset 900ms var(--ease-in-out) 120ms;
		}
	}
</style>
