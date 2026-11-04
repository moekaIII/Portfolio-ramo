import type { OnNavigate } from '$app/navigation';

/**
 * SvelteKit の onNavigate に渡すハンドラ。View Transitions API 対応ブラウザでのみ遷移を演出する。
 * reduced-motion 時は CSS 側でアニメーションを無効化している（layout.css）。
 */
export function viewTransition(navigation: OnNavigate) {
	if (!document.startViewTransition) return;
	// 同一ページ内（ハッシュ・クエリのみの変更）では演出しない
	if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

	return new Promise<void>((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
}
