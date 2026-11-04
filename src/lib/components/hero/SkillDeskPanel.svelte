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

		// ページの読み込みと初回描画を優先し、アイドル時に three.js を遅延ロード
		let cancelled = false;
		const load = async () => {
			if (cancelled || prefersReducedMotion.current) return;
			// ラベルの文字幅を正しく測るため、欧文フォント（preload 済み）の読み込みを待つ
			await document.fonts.load('600 32px "Inter Variable"').catch(() => {});
			const m = await import('./DeskCanvas.svelte');
			if (!cancelled) DeskCanvas = m.default;
		};
		const hasIdle = typeof requestIdleCallback === 'function';
		const schedule = () =>
			hasIdle ? requestIdleCallback(load, { timeout: 2500 }) : window.setTimeout(load, 1200);
		let handle: number;
		if (document.readyState === 'complete') handle = schedule();
		else window.addEventListener('load', () => (handle = schedule()), { once: true });

		return () => {
			cancelled = true;
			if (hasIdle) cancelIdleCallback(handle);
			else window.clearTimeout(handle);
		};
	});

	$effect(() => {
		if (!enabled) ready = false;
	});

	const toggle = () => (arranged = !arranged);
</script>

<div class="relative flex h-full flex-col">
	<div class="relative min-h-[18rem] flex-1">
		<div
			class={[
				'absolute inset-0 transition-opacity duration-700',
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
		<div class="flex items-center justify-center gap-3 pt-2">
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
			<p class="hidden text-xs text-fg-muted sm:block">机の上は触れます</p>
		</div>
	{/if}
</div>
