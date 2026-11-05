/**
 * サイト流入時のローディング演出の状態。
 * ヒーローの氏名の打ち込みなど、演出が終わってから始めたい処理はこれを待つ。
 */
class IntroState {
	/** ローディングの表示が終わった（または表示しなかった） */
	done = $state(false);

	finish() {
		this.done = true;
	}
}

export const intro = new IntroState();

/** 同じタブでの 2 回目以降の表示ではローディングを出さない（app.html の判定と同じキー） */
export const INTRO_SEEN_KEY = 'intro-seen';
