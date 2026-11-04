<script lang="ts">
	import Lenis from 'lenis';
	import { prefersReducedMotion } from 'svelte/motion';
	import { afterNavigate } from '$app/navigation';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';

	// reduced-motion の変更にも追従して生成 / 破棄する（$effect はクライアントでのみ実行）
	$effect(() => {
		if (prefersReducedMotion.current) return;
		const lenis = new Lenis({ autoRaf: true, lerp: 0.12, stopInertiaOnNavigate: true });
		smoothScroll.lenis = lenis;
		return () => {
			lenis.destroy();
			smoothScroll.lenis = null;
		};
	});

	// SvelteKit がスクロール位置を復元・リセットした後に Lenis の内部状態を同期
	afterNavigate(() => {
		const lenis = smoothScroll.lenis;
		if (!lenis) return;
		lenis.resize();
		lenis.scrollTo(window.scrollY, { immediate: true, force: true });
	});
</script>
