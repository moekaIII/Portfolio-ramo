<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';
	import type { ProcessStep } from '#lib/content/services.ts';

	let { steps }: { steps: ProcessStep[] } = $props();

	let root: HTMLOListElement | undefined = $state();

	/**
	 * スクロール連動の見せ場（サイト内で gsap を使うのはここだけ）。
	 * 進捗線がスクロールに合わせて伸び、線が到達したステップの見出しとドットが強調される
	 * =「いまどこまで進んだか」を伝えるための動き。reduced-motion 時は静的表示。
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
						const dot = step.querySelector('[data-process-dot]');
						if (dot)
							gsap.to(dot, {
								backgroundColor: 'var(--accent-text)',
								scale: 1.25,
								duration: 0.3,
								scrollTrigger: {
									trigger: step,
									start: 'top 65%',
									toggleActions: 'play none none reverse'
								}
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

<!-- data-process-* は Phase 6 のスクロール連動（gsap）のフック。JS なしでも完結した表示になる -->
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
	{#each steps as step, i (step.en)}
		<li
			class="relative grid gap-y-4 pb-16 pl-12 last:pb-0 md:grid-cols-4 md:pl-0"
			data-process-step
		>
			<div class="md:pr-10 md:text-right">
				<p class="eyebrow">Step 0{i + 1} — {step.en}</p>
				<p class="mt-2 text-sm text-fg-muted tabular">{step.duration}</p>
			</div>
			<span
				aria-hidden="true"
				data-process-dot
				class="absolute top-1.5 left-1.5 size-3 rounded-pill border-2 border-accent-text bg-bg md:left-[calc(25%+0.375rem)]"
			></span>
			<div class="md:col-span-3 md:pl-16">
				<h3 class="text-h3 font-semibold">{step.title}</h3>
				<p class="mt-4 max-w-[38em] text-fg-muted">{step.description}</p>
				<p class="sr-only">成果物:</p>
				<ul class="mt-6 flex flex-wrap gap-2">
					{#each step.outputs as output (output)}
						<li class="rounded-pill bg-surface-2 px-3 py-1.5 text-xs">{output}</li>
					{/each}
				</ul>
			</div>
		</li>
	{/each}
</ol>
