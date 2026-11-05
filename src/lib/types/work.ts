/** 実績カテゴリ。追加する場合は WORK_CATEGORIES にも追記する */
export const WORK_CATEGORIES = {
	development: { label: '開発', en: 'Development' },
	'ui-design': { label: 'UIデザイン', en: 'UI Design' },
	ux: { label: 'UX改善', en: 'UX' }
} as const;

export type WorkCategory = keyof typeof WORK_CATEGORIES;

/** 数値成果。value は "+38" や "2.4" のように表示用の文字列で持つ */
export interface WorkResult {
	label: string;
	value: string;
	unit?: string;
	/** 計測条件など（例: "導入前3か月との比較"） */
	note?: string;
}

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
	results: WorkResult[];
	/** トップページの注目実績に表示するか */
	featured: boolean;
}
