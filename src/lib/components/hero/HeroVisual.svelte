<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { supportsWebGL } from '#lib/three/webgl.ts';
	import HeroFallback from './HeroFallback.svelte';

	type HeroCanvasProps = { target: HTMLElement; onready?: () => void };

	let { target }: { target: HTMLElement | undefined } = $props();

	let HeroCanvas = $state<Component<HeroCanvasProps> | null>(null);
	let ready = $state(false);
	let webgl = $state(true);

	// 3D はあくまで演出: reduced-motion / WebGL 非対応時は静的表示のまま
	const enabled = $derived(webgl && !prefersReducedMotion.current);

	onMount(() => {
		webgl = supportsWebGL();
		if (!webgl) return;

		// ヒーローのテキスト描画とページ読み込みを優先し、アイドル時に three.js を遅延ロード
		let cancelled = false;
		const load = () => {
			if (cancelled || prefersReducedMotion.current) return;
			import('./HeroCanvas.svelte').then((m) => {
				if (!cancelled) HeroCanvas = m.default;
			});
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

	// reduced-motion が途中で有効になったら 3D を破棄（dispose）してフォールバックへ
	$effect(() => {
		if (!enabled) ready = false;
	});
</script>

<div
	class={[
		'absolute inset-0 transition-opacity duration-1000',
		ready && enabled ? 'opacity-0' : 'opacity-100'
	]}
>
	<HeroFallback />
</div>

{#if enabled && HeroCanvas && target}
	<div
		class={[
			'absolute inset-0 transition-opacity duration-1000',
			ready ? 'opacity-100' : 'opacity-0'
		]}
	>
		<HeroCanvas {target} onready={() => (ready = true)} />
	</div>
{/if}
