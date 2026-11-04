<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { supportsWebGL } from '#lib/three/webgl.ts';
	import BlueprintFallback from './BlueprintFallback.svelte';

	let BlueprintCanvas = $state<Component<{ onready?: () => void }> | null>(null);
	let ready = $state(false);
	let webgl = $state(true);

	// 3D はあくまで演出: reduced-motion / WebGL 非対応時は静的表示のまま
	const enabled = $derived(webgl && !prefersReducedMotion.current);
	const live = $derived(enabled && ready);

	onMount(() => {
		webgl = supportsWebGL();
		if (!webgl) return;

		// ページの読み込みと初回描画を優先する。three.js の読み込みと初期化は、
		// 最初の操作（マウス移動・スクロール・タップ・キー入力）か、読み込み完了の 3.5 秒後の早い方で始める。
		// それまでは同じ構図の静的表示（BlueprintFallback）が見えている
		let cancelled = false;
		let started = false;
		const load = async () => {
			if (cancelled || started || prefersReducedMotion.current) return;
			started = true;
			const m = await import('./BlueprintCanvas.svelte');
			if (!cancelled) BlueprintCanvas = m.default;
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
</script>

<!-- 装飾のため操作を受け取らない（透明になった後も下の要素を塞がないように） -->
<div
	class={[
		'pointer-events-none absolute inset-0 transition-opacity duration-700',
		live ? 'opacity-0' : 'opacity-100'
	]}
>
	<BlueprintFallback />
</div>
{#if enabled && BlueprintCanvas}
	<div
		class={[
			'absolute inset-0 transition-opacity duration-700',
			ready ? 'opacity-100' : 'opacity-0'
		]}
	>
		<BlueprintCanvas onready={() => (ready = true)} />
	</div>
{/if}
