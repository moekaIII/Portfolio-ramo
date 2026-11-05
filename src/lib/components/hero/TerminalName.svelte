<script lang="ts">
	import '@fontsource-variable/jetbrains-mono';
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { site } from '#lib/config/site.ts';

	const name = site.author.name;
	// 初期値は全文（プリレンダリング / JS 無効時はそのまま読める）
	let typed = $state(name.length);
	let done = $state(true);
	let started = $state(false);

	onMount(() => {
		if (prefersReducedMotion.current) {
			started = true;
			return;
		}
		typed = 0;
		done = false;
		started = true;
		let timer: number;
		// 人が打つように、1 文字ごとに間隔を少し揺らす（スペースの後は少し長く）
		const step = () => {
			typed += 1;
			if (typed >= name.length) {
				done = true;
				return;
			}
			const pause = name[typed - 1] === ' ' ? 160 : 0;
			timer = window.setTimeout(step, 70 + Math.random() * 90 + pause);
		};
		timer = window.setTimeout(step, 600);
		return () => window.clearTimeout(timer);
	});
</script>

<!--
  ターミナルに入力したような氏名。スクリーンリーダーには常に全文を渡し、
  打ち込みのアニメーション部分は装飾として扱う。
-->
<div class={['font-mono', !started && 'term-pending']}>
	<p class="mb-3 text-sm text-fg-muted" aria-hidden="true">
		<span class="text-accent-text">~/portfolio</span> <span>$</span> whoami
	</p>
	<h1
		id="hero-heading"
		class="flex items-baseline text-[clamp(2.4rem,0.9rem+5.4vw,6.75rem)] leading-none font-medium tracking-[-0.04em]"
	>
		<span class="sr-only">{name}</span>
		<span aria-hidden="true" class="whitespace-pre">{name.slice(0, typed)}</span>
		<span
			aria-hidden="true"
			class={[
				'term-caret ml-[0.06em] inline-block h-[0.82em] w-[0.5em] translate-y-[0.08em] bg-accent-text',
				done && 'term-caret--blink'
			]}
		></span>
	</h1>
	<p
		class={[
			'mt-5 text-sm text-fg-muted transition-opacity duration-500',
			done ? 'opacity-100' : 'opacity-0'
		]}
	>
		<span aria-hidden="true">//&nbsp;</span>{site.author.jobTitle}
	</p>
</div>

<style>
	/* JS 有効時は、打ち込みが始まるまで全文を一瞬見せない（ちらつき防止） */
	:global(.js) .term-pending h1 > span[aria-hidden='true']:not(.term-caret) {
		visibility: hidden;
	}
	.term-caret--blink {
		animation: term-blink 1.05s steps(1) infinite;
	}
	@keyframes term-blink {
		50% {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.term-caret--blink {
			animation: none;
		}
	}
</style>
