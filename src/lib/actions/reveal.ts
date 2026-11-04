import type { Action } from 'svelte/action';

/**
 * 要素がビューポートに入ったら data-revealed を付与する（1回のみ）。
 * 見た目は layout.css の [data-reveal] で定義。JS 無効時・reduced-motion 時は常に表示される。
 */
export const reveal: Action<HTMLElement, { delay?: number } | undefined> = (node, options) => {
	node.dataset.reveal = '';
	if (options?.delay) node.style.setProperty('--reveal-delay', `${options.delay}ms`);

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.dataset.revealed = '';
					observer.disconnect();
				}
			}
		},
		{ rootMargin: '0px 0px -10% 0px' }
	);
	observer.observe(node);

	return { destroy: () => observer.disconnect() };
};
