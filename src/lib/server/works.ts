import { parseWorkMeta } from '#lib/content/validate-work.ts';
import type { WorkMeta } from '#lib/types/work.ts';

/**
 * ビルド時（プリレンダリング）にのみ評価される。frontmatter だけを取り出し、
 * 記事本文のコンポーネントはクライアントのバンドルに含めない。
 */
const modules = import.meta.glob<Record<string, unknown>>('/src/content/works/*.md', {
	eager: true,
	import: 'metadata'
});

const works: WorkMeta[] = Object.entries(modules)
	.map(([file, metadata]) => parseWorkMeta(file, metadata))
	// 期間の開始年月で新しい順
	.sort((a, b) => b.period.localeCompare(a.period));

const slugs = new Set<string>();
for (const w of works) {
	if (slugs.has(w.slug)) throw new Error(`[works] slug "${w.slug}" が重複しています`);
	slugs.add(w.slug);
}

export function getWorks(): WorkMeta[] {
	return works;
}

export function getFeaturedWorks(limit = 3): WorkMeta[] {
	return works.filter((w) => w.featured).slice(0, limit);
}

export function getWork(slug: string) {
	const index = works.findIndex((w) => w.slug === slug);
	if (index === -1) return undefined;
	return {
		work: works[index],
		prev: works[index - 1] ?? works.at(-1),
		next: works[index + 1] ?? works[0]
	};
}
