<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { supportsWebGL } from '#lib/three/webgl.ts';
	import { intro } from '#lib/state/intro.svelte.ts';
	import BlueprintFallback from './BlueprintFallback.svelte';

	let BlueprintCanvas = $state<Component<{ onready?: () => void }> | null>(null);
	let ready = $state(false);
	let webgl = $state(true);

	// 3D はあくまで演出: reduced-motion / WebGL 非対応時は静的表示のまま
	const enabled = $derived(webgl && !prefersReducedMotion.current);
	const live = $derived(enabled && ready);

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		webgl = supportsWebGL();
		if (!webgl || prefersReducedMotion.current) return;
		// ローディング演出の間に three.js を読み込み、初回描画まで済ませておく
		intro.waitHero = true;
		let cancelled = false;
		import('./BlueprintCanvas.svelte').then((m) => {
			if (!cancelled) BlueprintCanvas = m.default;
		});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!enabled) ready = false;
	});
</script>

<!-- 装飾のため操作を受け取らない（透明になった後も下の要素を塞がないように） -->
<div
	class={[
		'pointer-events-none absolute inset-0 transition-opacity duration-700',
		live ? 'opacity-0' : 'opacity-100'
	]}
>
	<!-- 花は 3D が使えないときだけ静的に描く（3D の読み込み中は背景だけ見せる） -->
	<BlueprintFallback flower={mounted && !enabled} />
</div>
{#if enabled && BlueprintCanvas}
	<div
		class={[
			'absolute inset-0 transition-opacity duration-700',
			ready ? 'opacity-100' : 'opacity-0'
		]}
	>
		<BlueprintCanvas
			onready={() => {
				ready = true;
				intro.heroReady = true;
			}}
		/>
	</div>
{/if}
