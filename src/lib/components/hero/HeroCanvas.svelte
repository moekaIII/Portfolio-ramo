<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import { NoToneMapping, WebGLRenderer } from 'three';
	import GravityGrid from '#lib/components/three/GravityGrid.svelte';
	import { QUALITY, detectQuality } from '#lib/three/quality.ts';

	type Props = {
		/** ポインタイベントを受け取る要素 */
		target: HTMLElement;
		/** 初回フレームの描画後に呼ばれる（フォールバックからのクロスフェード用） */
		onready?: () => void;
	};

	let { target, onready }: Props = $props();

	const settings = QUALITY[detectQuality()];

	let container: HTMLDivElement | undefined = $state();
	let inView = $state(true);
	let pageVisible = $state(true);
	const active = $derived(inView && pageVisible);

	onMount(() => {
		// 画面外では描画を止める
		const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), {
			rootMargin: '0px'
		});
		if (container) io.observe(container);

		const onVisibility = () => (pageVisible = document.visibilityState === 'visible');
		document.addEventListener('visibilitychange', onVisibility);

		// 初回描画の完了を待ってから表示する
		const raf = requestAnimationFrame(() => requestAnimationFrame(() => onready?.()));

		return () => {
			io.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			cancelAnimationFrame(raf);
		};
	});

	function createRenderer(canvas: HTMLCanvasElement) {
		return new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: settings.antialias,
			powerPreference: 'low-power',
			stencil: false
		});
	}
</script>

<div bind:this={container} aria-hidden="true" class="absolute inset-0">
	<Canvas
		{createRenderer}
		dpr={[1, settings.maxDpr]}
		renderMode="on-demand"
		toneMapping={NoToneMapping}
		colorManagementEnabled={false}
	>
		<GravityGrid {settings} {active} {target} />
	</Canvas>
</div>
