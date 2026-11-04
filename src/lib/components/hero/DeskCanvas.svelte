<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import { NoToneMapping, WebGLRenderer } from 'three';
	import SkillDesk from '#lib/components/three/SkillDesk.svelte';
	import { deskLabels } from '#lib/content/desk-labels.ts';
	import { QUALITY, detectQuality } from '#lib/three/quality.ts';

	type Props = {
		arranged: boolean;
		ontoggle: () => void;
		/** 初回フレームの描画後に呼ばれる（フォールバックからのクロスフェード用） */
		onready?: () => void;
	};

	let { arranged, ontoggle, onready }: Props = $props();

	const settings = QUALITY[detectQuality()];
	const labels = deskLabels.slice(0, settings.maxBlocks);

	let container: HTMLDivElement | undefined = $state();
	let inView = $state(true);
	let pageVisible = $state(true);
	const active = $derived(inView && pageVisible);

	onMount(() => {
		// 画面外・タブ非表示の間は物理演算も描画も止める
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

<!-- 縦スクロールはブラウザに任せ、横方向の操作だけをブロックを押す動作に使う -->
<div bind:this={container} aria-hidden="true" class="absolute inset-0 cursor-pointer touch-pan-y">
	<Canvas
		{createRenderer}
		dpr={[1, settings.maxDpr]}
		renderMode="on-demand"
		toneMapping={NoToneMapping}
	>
		<SkillDesk {labels} {arranged} {active} {ontoggle} />
	</Canvas>
</div>
