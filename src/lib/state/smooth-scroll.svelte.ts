import type Lenis from 'lenis';

/** サイト全体で1つの Lenis インスタンス（reduced-motion 時は null） */
class SmoothScrollState {
	lenis = $state.raw<Lenis | null>(null);

	/** モーダル表示中など、背面のスクロールを止める */
	lock() {
		this.lenis?.stop();
		document.documentElement.style.overflow = 'hidden';
	}

	unlock() {
		document.documentElement.style.overflow = '';
		this.lenis?.start();
	}
}

export const smoothScroll = new SmoothScrollState();
