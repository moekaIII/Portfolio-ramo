import type Lenis from 'lenis';

/** サイト全体で1つの Lenis インスタンス（reduced-motion 時は null） */
class SmoothScrollState {
	lenis = $state.raw<Lenis | null>(null);
	/** lock 中か。Lenis が後から生成されたときも、止めた状態で始めるために持つ */
	locked = false;

	/** ローディング・モーダル表示中など、背面のスクロールを止める */
	lock() {
		this.locked = true;
		this.lenis?.stop();
		document.documentElement.style.overflow = 'hidden';
	}

	unlock() {
		this.locked = false;
		document.documentElement.style.overflow = '';
		this.lenis?.start();
	}
}

export const smoothScroll = new SmoothScrollState();
