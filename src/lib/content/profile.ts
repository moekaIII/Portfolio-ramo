/**
 * スキル・経歴・強み。トップページの全セクションと 3D ヒーローのブロックはこのデータから生成される。
 * TODO(owner): 実際の内容に差し替える
 */

export type SkillLevel = 1 | 2 | 3;

export interface Skill {
	name: string;
	/** 3D ブロックに表示する短い名前（未指定なら 3D には出さない） */
	block?: string;
	level: SkillLevel;
	/** 実務経験年数 */
	years: number;
}

export interface SkillGroup {
	id: string;
	group: string;
	label: string;
	items: Skill[];
}

export const LEVEL_LABEL: Record<SkillLevel, string> = {
	1: '基礎',
	2: '実務で自走',
	3: 'リード・設計可能'
};

export const skills: SkillGroup[] = [
	{
		id: 'frontend',
		group: 'Frontend',
		label: 'フロントエンド',
		items: [
			{ name: 'TypeScript', block: 'TypeScript', level: 3, years: 7 },
			{ name: 'Svelte / SvelteKit', block: 'Svelte', level: 3, years: 5 },
			{ name: 'React / Next.js', block: 'React', level: 3, years: 6 },
			{ name: 'HTML / CSS（設計・アクセシブルな実装）', block: 'CSS', level: 3, years: 10 },
			{ name: 'Three.js / WebGL', block: 'WebGL', level: 2, years: 3 },
			{ name: 'Node.js', block: 'Node.js', level: 2, years: 5 }
		]
	},
	{
		id: 'design',
		group: 'Design',
		label: 'UIデザイン',
		items: [
			{ name: 'UIデザイン（Figma）', block: 'Figma', level: 3, years: 9 },
			{ name: 'デザインシステム構築', block: 'Design System', level: 3, years: 5 },
			{ name: 'プロトタイピング', level: 3, years: 8 },
			{ name: 'モーションデザイン', block: 'Motion', level: 2, years: 4 }
		]
	},
	{
		id: 'ux',
		group: 'UX & Quality',
		label: 'UX・品質',
		items: [
			{ name: 'ユーザーリサーチ・ユーザビリティテスト', block: 'UX Research', level: 3, years: 6 },
			{ name: 'アクセシビリティ（WCAG 2.2）', block: 'a11y', level: 3, years: 6 },
			{ name: 'Webパフォーマンス（Core Web Vitals）', block: 'Web Perf', level: 3, years: 5 },
			{ name: 'テスト自動化（Vitest / Playwright）', block: 'Testing', level: 2, years: 4 },
			{ name: 'アクセス解析・A/Bテスト', level: 2, years: 5 }
		]
	}
];

/** ファーストビューに置く「一目でわかる」要約 */
export const glance: { term: string; value: string }[] = [
	{ term: '経験', value: 'Web制作・開発 10年（うちリード 4年）' },
	{ term: '専門', value: 'フロントエンド開発 × UI/UXデザイン' },
	{ term: '主要技術', value: 'TypeScript / Svelte / React / Figma' },
	{ term: '働き方', value: '正社員・業務委託ともに相談可 / フルリモート可' }
];

export interface CareerItem {
	period: string;
	title: string;
	org: string;
	summary: string;
	achievements: string[];
	stack: string[];
}

export const career: CareerItem[] = [
	{
		period: '2022 — 現在',
		title: 'フリーランス（フロントエンド / UI・UXデザイン）',
		org: '独立',
		summary: 'スタートアップから大手企業まで、設計・デザイン・実装を一貫して支援。',
		achievements: [
			'BtoB SaaS のダッシュボード刷新で LCP を 4.1秒 → 1.3秒に改善',
			'3ブランド横断のデザインシステムを構築し、UI実装工数を 35% 削減',
			'EC の購入フロー改善で CVR を 38% 向上'
		],
		stack: ['SvelteKit', 'Next.js', 'TypeScript', 'Figma']
	},
	{
		period: '2018 — 2022',
		title: 'シニアフロントエンドエンジニア / デザインリード',
		org: 'SaaS スタートアップ',
		summary: 'プロダクトのフロントエンド基盤とデザインシステムを立ち上げ、5名のチームをリード。',
		achievements: [
			'jQuery から React + TypeScript への段階的移行を設計・完遂',
			'デザイナーとエンジニアの共通言語としてトークン駆動の UI ライブラリを整備',
			'採用面接と育成を担当し、チームを 2名 → 5名に拡大'
		],
		stack: ['React', 'TypeScript', 'Storybook', 'Figma']
	},
	{
		period: '2015 — 2018',
		title: 'Webデザイナー / マークアップエンジニア',
		org: 'Web制作会社',
		summary: 'コーポレートサイトやキャンペーンサイトのデザインと実装を年間20件以上担当。',
		achievements: [
			'社内のコーディングガイドラインとアクセシビリティチェックリストを策定',
			'デザインからマークアップまでを一人で担当する体制を確立'
		],
		stack: ['HTML / CSS', 'JavaScript', 'Photoshop', 'Sketch']
	}
];

export const strengths: { title: string; body: string }[] = [
	{
		title: 'デザインと実装の間で、意図を落とさない',
		body: '同じ人間がデザインと実装を担うため、職種間の「伝言ゲーム」が起きません。細部の品質を保ったまま、意思決定も速くなります。'
	},
	{
		title: '見た目ではなく、数字で成果を語る',
		body: 'KPIの設計から効果測定まで。リリースして終わりにせず、事業の数字が動いたかどうかを確かめるところまでを仕事と考えています。'
	},
	{
		title: 'チームが自走できる仕組みを残す',
		body: 'デザインシステム、ドキュメント、テストと計測の自動化。自分がいなくなっても品質が保たれる状態をつくります。'
	}
];
