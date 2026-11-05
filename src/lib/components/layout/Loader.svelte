<script lang="ts">
	import { onMount } from 'svelte';
	import { INTRO_SEEN_KEY, intro } from '#lib/state/intro.svelte.ts';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';

	/** 最低限見せる時間（数字が 0 → 100 まで進む時間） */
	const MIN_MS = 1300;
	/** 読み込みが遅くても、これ以上は待たせない */
	const MAX_MS = 3200;

	let gone = $state(false);
	let leaving = $state(false);
	let progress = $state(0);

	onMount(() => {
		// app.html で「表示しない」と判定済み（2 回目以降 / 視差効果を減らす設定）
		if (document.documentElement.classList.contains('no-loader')) {
			gone = true;
			intro.finish();
			return;
		}
		try {
			sessionStorage.setItem(INTRO_SEEN_KEY, '1');
		} catch {
			// 保存できなくても演出は続ける
		}
		smoothScroll.lock();

		// フォントとページの読み込みが終わったら 100 まで進める（それまでは 90 で待つ）
		let loaded = false;
		const ready = Promise.all([
			document.fonts.ready,
			document.readyState === 'complete'
				? Promise.resolve()
				: new Promise((r) => window.addEventListener('load', r, { once: true }))
		]).then(() => (loaded = true));
		void ready;

		const start = performance.now();
		let raf = 0;
		let exitTimer = 0;
		const tick = (now: number) => {
			const t = now - start;
			const timed = Math.min(1, t / MIN_MS);
			const eased = 1 - Math.pow(1 - timed, 3);
			const cap = loaded || t > MAX_MS ? 100 : 90;
			progress = Math.max(progress, Math.min(cap, Math.round(eased * 100)));
			if (progress >= 100) {
				leave();
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		function leave() {
			leaving = true;
			smoothScroll.unlock();
			// 境界が左から右へ抜けるのに合わせて、ヒーローの演出を始める
			exitTimer = window.setTimeout(() => intro.finish(), 250);
		}

		return () => {
			cancelAnimationFrame(raf);
			window.clearTimeout(exitTimer);
			smoothScroll.unlock();
		};
	});
</script>

<!--
  サイト流入時のローディング。ターミナル風のビルド表示から、
  ヒーローと同じ「境界」が左から右へ抜けて本編が現れる。
  JS 無効時・2 回目以降・視差効果を減らす設定では表示しない（layout.css / app.html）。
-->
{#if !gone}
	<div
		class={['site-loader', leaving && 'site-loader--leave']}
		aria-hidden="true"
		onanimationend={(e) => e.animationName.endsWith('loader-wipe') && (gone = true)}
	>
		<div class="loader-body font-mono">
			<p class="text-sm text-fg-muted">
				<span class="text-accent-text">~/portfolio</span> $ design --build
			</p>
			<div class="mt-6 flex items-end justify-between gap-6">
				<p class="text-xs leading-relaxed text-fg-muted">
					<span class={progress >= 30 ? 'text-fg' : ''}>wireframe</span>
					<span class="mx-1.5">→</span>
					<span class={progress >= 65 ? 'text-fg' : ''}>material</span>
					<span class="mx-1.5">→</span>
					<span class={progress >= 100 ? 'text-fg' : ''}>ready</span>
				</p>
				<p
					class="text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-medium tracking-[-0.04em] tabular"
				>
					{String(progress).padStart(3, '0')}
				</p>
			</div>
			<div class="relative mt-5 h-px bg-line">
				<span class="absolute inset-y-0 left-0 bg-accent-text" style="width: {progress}%"></span>
			</div>
		</div>
		<!-- 抜けていく境界線 -->
		<span class="loader-edge"></span>
	</div>
{/if}

<style>
	.site-loader {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: none;
		align-items: flex-end;
		padding: 0 var(--gutter) clamp(2rem, 5vw, 3.5rem);
		background: var(--bg);
		color: var(--fg);
	}
	/* JS が有効で、表示する判定のときだけ出す（プリレンダリングした HTML に最初から含める） */
	:global(.js:not(.no-loader)) .site-loader {
		display: flex;
	}
	.loader-body {
		width: min(100%, 34rem);
		animation: loader-in var(--dur-slow) var(--ease-out) both;
	}
	.loader-edge {
		position: absolute;
		inset-block: 0;
		right: 0;
		width: 1px;
		background: var(--fg-muted);
		opacity: 0;
	}
	/* 退場: 画面の左から右へ境界が走り、その後ろから本編が現れる */
	.site-loader--leave {
		animation: loader-wipe 900ms var(--ease-in-out) forwards;
	}
	/* 切り取られていく端と同じ位置を走らせる（端のすぐ内側なので、切り取られずに見える） */
	.site-loader--leave .loader-edge {
		right: auto;
		opacity: 0.6;
		animation: loader-edge 900ms var(--ease-in-out) forwards;
	}
	@keyframes loader-edge {
		from {
			left: 0;
		}
		to {
			left: 100%;
		}
	}
	.site-loader--leave .loader-body {
		animation: loader-out 400ms var(--ease-out) forwards;
	}
	@keyframes loader-in {
		from {
			opacity: 0;
			translate: 0 12px;
		}
	}
	@keyframes loader-out {
		to {
			opacity: 0;
			translate: 0 -8px;
		}
	}
	@keyframes loader-wipe {
		from {
			clip-path: inset(0 0 0 0);
		}
		to {
			clip-path: inset(0 0 0 100%);
		}
	}
</style>
