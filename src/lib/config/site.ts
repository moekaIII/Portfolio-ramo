/**
 * サイト全体の設定。氏名・URL・SNS・メールなどの差し替えはこのファイルだけで完結させる。
 * TODO(owner): 仮の値をすべて実際の情報に置き換える。
 */
const author = {
	name: 'Moeka Ihara',
	jobTitle: 'front-end Developer / UI・UX Designer',
	location: { locality: 'Tokyo', country: 'JP' }
} as const;

export const site = {
	/** 本番 URL（末尾スラッシュなし）。sitemap / canonical / OGP の絶対 URL に使用 */
	url: 'https://example.com',
	/** サイト名（ロゴ・OGP に表示） */
	name: author.name,
	author,
	/** 既定の title 接尾辞・description */
	titleTemplate: (title?: string) =>
		title ? `${title} — ${author.name}` : ` — ${author.jobTitle}`,
	description: `フロントエンドエンジニア / UI・UXデザイナー ${author.name}のポートフォリオ。TypeScript・Svelte・React・Figma を軸に、設計・デザイン・実装を横断してきた10年のスキルと経歴、実績をまとめています。`,
	locale: 'ja_JP',
	/** static/ 配下の既定 OGP 画像（1200x630） */
	ogImage: '/og/default.png',
	social: [
		{ label: 'GitHub', href: 'https://github.com/' },
		{ label: 'X', href: 'https://x.com/' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/' }
	]
} as const;

/** ページ内セクション（ヘッダーのナビゲーションとスクロール位置の判定に使用） */
export const sections = [
	{ id: 'skills', label: 'スキル', en: 'Skills' },
	{ id: 'career', label: '経歴', en: 'Career' },
	{ id: 'works', label: '実績', en: 'Works' },
	{ id: 'concept', label: 'コンセプト', en: 'Concept' }
] as const;

export type SectionId = (typeof sections)[number]['id'];
