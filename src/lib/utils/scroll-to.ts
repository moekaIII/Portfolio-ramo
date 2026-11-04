import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';

/**
 * ページ内セクションへ移動し、キーボード利用者のためにフォーカスも移す。
 * Lenis 有効時はスムーズに、reduced-motion 時は即座に移動する。
 */
export function scrollToSection(id: string) {
	const el = document.getElementById(id);
	if (!el) return;
	const lenis = smoothScroll.lenis;
	if (lenis) {
		// Lenis は html の scroll-padding-top（固定ヘッダー分）を考慮して止まる
		lenis.scrollTo(el);
	} else {
		el.scrollIntoView({ block: 'start' });
	}
	el.focus({ preventScroll: true });
}
