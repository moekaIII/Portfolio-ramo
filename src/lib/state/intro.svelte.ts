/**
 * サイト流入時のローディング演出の状態。
 * ヒーローの氏名の打ち込みなど、演出が終わってから始めたい処理はこれを待つ。
 */
class IntroState {
	/** ローディングの表示が終わった（または表示しなかった） */
	done = $state(false);
	/** ヒーローの 3D を読み込む（ローディングはその準備ができるまで待つ） */
	waitHero = false;
	/** ヒーローの 3D の初回描画が終わった */
	heroReady = false;

	finish() {
		this.done = true;
	}
}

export const intro = new IntroState();
