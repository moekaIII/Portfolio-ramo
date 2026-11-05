<script lang="ts">
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/ibm-plex-mono/400.css';
	import { onMount, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { site } from '#lib/config/site.ts';
	import { intro } from '#lib/state/intro.svelte.ts';

	const name = site.author.name;
	// 初期値は全文（プリレンダリング / JS 無効時はそのまま読める）
	let typed = $state(name.length);
	let done = $state(true);
	let started = $state(false);

	let mounted = $state(false);
	onMount(() => (mounted = true));

	// ローディング演出が終わってから打ち込み始める（開始条件だけを追跡し、1 回だけ動かす）
	$effect(() => {
		if (!mounted || !intro.done) return;
		return untrack(startTyping);
	});

	function startTyping() {
		if (started) return;
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
	}
</script>

<!--
  ターミナルに入力したような氏名。スクリーンリーダーには常に全文を渡し、
  打ち込みのアニメーション部分は装飾として扱う。
-->
<div class={['font-terminal', !started && 'term-pending']}>
	<p class="mb-3 text-sm text-fg-muted" aria-hidden="true">
		<span class="text-accent-text">~/portfolio</span> <span>$</span> whoami
	</p>
	<h1
		id="hero-heading"
		class="flex items-baseline text-[clamp(2.2rem,0.8rem+5vw,6.25rem)] leading-none font-normal tracking-[-0.01em]"
	>
		<span class="sr-only">{name}</span>
		<span aria-hidden="true" class="whitespace-pre">{name.slice(0, typed)}</span>
		<span
			aria-hidden="true"
			class={[
				'term-caret ml-[0.08em] inline-block h-[0.95em] w-[max(2px,0.045em)] translate-y-[0.14em] bg-accent-text',
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
