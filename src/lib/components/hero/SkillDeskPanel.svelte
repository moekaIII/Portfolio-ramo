<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import Shuffle from '@lucide/svelte/icons/shuffle';
	import { supportsWebGL } from '#lib/three/webgl.ts';
	import DeskFallback from './DeskFallback.svelte';

	type DeskCanvasProps = { arranged: boolean; ontoggle: () => void; onready?: () => void };

	let DeskCanvas = $state<Component<DeskCanvasProps> | null>(null);
	let ready = $state(false);
	let webgl = $state(true);
	let arranged = $state(false);

	// 3D はあくまで演出: reduced-motion / WebGL 非対応時は静的表示のまま
	const enabled = $derived(webgl && !prefersReducedMotion.current);
	const live = $derived(enabled && ready);

	onMount(() => {
		webgl = supportsWebGL();
		if (!webgl) return;

		// ページの読み込みと初回描画を優先する。three.js の読み込みと初期化は、
		// 最初の操作（マウス移動・スクロール・タップ・キー入力）か、読み込み完了の 3.5 秒後の早い方で始める。
		// それまでは整列済みの静的表示（DeskFallback）が見えている
		let cancelled = false;
		let started = false;
		const load = async () => {
			if (cancelled || started || prefersReducedMotion.current) return;
			started = true;
			// ラベルの文字幅を正しく測るため、欧文フォント（preload 済み）の読み込みを待つ
			await document.fonts.load('600 32px "Inter Variable"').catch(() => {});
			const m = await import('./DeskCanvas.svelte');
			if (!cancelled) DeskCanvas = m.default;
		};
		const triggers = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
		const onFirstInput = () => {
			for (const t of triggers) window.removeEventListener(t, onFirstInput);
			load();
		};
		for (const t of triggers) window.addEventListener(t, onFirstInput, { passive: true });

		let timer: number | undefined;
		const startTimer = () => (timer = window.setTimeout(load, 3500));
		if (document.readyState === 'complete') startTimer();
		else window.addEventListener('load', startTimer, { once: true });

		return () => {
			cancelled = true;
			for (const t of triggers) window.removeEventListener(t, onFirstInput);
			window.removeEventListener('load', startTimer);
			window.clearTimeout(timer);
		};
	});

	$effect(() => {
		if (!enabled) ready = false;
	});

	const toggle = () => (arranged = !arranged);
</script>

<div class="relative flex h-full flex-col">
	<div class="relative min-h-[18rem] flex-1 overflow-hidden">
		<!-- 装飾のため操作を受け取らない（透明になった後に下のボタンを塞がないように） -->
		<div
			class={[
				'pointer-events-none absolute inset-0 transition-opacity duration-700',
				live ? 'opacity-0' : 'opacity-100'
			]}
		>
			<DeskFallback />
		</div>
		{#if enabled && DeskCanvas}
			<div
				class={[
					'absolute inset-0 transition-opacity duration-700',
					ready ? 'opacity-100' : 'opacity-0'
				]}
			>
				<DeskCanvas {arranged} ontoggle={toggle} onready={() => (ready = true)} />
			</div>
		{/if}
	</div>

	{#if live}
		<div class="flex justify-center pt-2">
			<button
				type="button"
				onclick={toggle}
				class="inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong px-5 text-sm transition-colors hover:border-fg"
			>
				{#if arranged}
					<Shuffle size={16} aria-hidden="true" />散らかす
				{:else}
					<LayoutGrid size={16} aria-hidden="true" />スキルを整列する
				{/if}
			</button>
		</div>
	{/if}
</div>
