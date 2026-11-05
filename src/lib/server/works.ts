import { parseWorkMeta } from '#lib/content/validate-work.ts';
import type { WorkMeta } from '#lib/types/work.ts';

/** ビルド時（プリレンダリング）に frontmatter を検証して取り出す */
const modules = import.meta.glob<Record<string, unknown>>('/src/content/works/*.md', {
	eager: true,
	import: 'metadata'
});

const works: WorkMeta[] = Object.entries(modules)
	.map(([file, metadata]) => parseWorkMeta(file, metadata))
	// order の小さい順。order がないものはその後ろに、期間の開始年月で新しい順
	.sort(
		(a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || b.period.localeCompare(a.period)
	);

const slugs = new Set<string>();
for (const w of works) {
	if (slugs.has(w.slug)) throw new Error(`[works] slug "${w.slug}" が重複しています`);
	slugs.add(w.slug);
}

export function getWorks(): WorkMeta[] {
	return works;
}
