/** 実績カテゴリ。追加する場合は WORK_CATEGORIES にも追記する */
export const WORK_CATEGORIES = {
	development: { label: '開発', en: 'Development' },
	'ui-design': { label: 'UIデザイン', en: 'UI Design' },
	ux: { label: 'UX改善', en: 'UX' }
} as const;

export type WorkCategory = keyof typeof WORK_CATEGORIES;

/** ケーススタディ frontmatter のスキーマ */
export interface WorkMeta {
	title: string;
	slug: string;
	client: string;
	role: string;
	/** "YYYY.MM – YYYY.MM" または "YYYY.MM – 継続中" */
	period: string;
	/** 使用技術・手法 */
	tags: string[];
	category: WorkCategory;
	summary: string;
	/** トップページの注目実績に表示するか */
	featured: boolean;
}
