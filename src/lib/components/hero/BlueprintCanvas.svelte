<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import { NoToneMapping, WebGLRenderer } from 'three';
	import BlueprintScene from '#lib/components/three/BlueprintScene.svelte';
	import { QUALITY, detectQuality } from '#lib/three/quality.ts';

	let { onready }: { onready?: () => void } = $props();

	const settings = QUALITY[detectQuality()];

	let container: HTMLDivElement | undefined = $state();
	let inView = $state(true);
	let pageVisible = $state(true);
	const active = $derived(inView && pageVisible);

	onMount(() => {
		// 画面外・タブ非表示の間は描画を止める
		const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
		if (container) io.observe(container);
		const onVisibility = () => (pageVisible = document.visibilityState === 'visible');
		document.addEventListener('visibilitychange', onVisibility);
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

<div bind:this={container} aria-hidden="true" class="absolute inset-0 touch-pan-y">
	<Canvas
		{createRenderer}
		dpr={[1, settings.maxDpr]}
		renderMode="on-demand"
		toneMapping={NoToneMapping}
	>
		<BlueprintScene {settings} {active} />
	</Canvas>
</div>
