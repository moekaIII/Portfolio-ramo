/**
 * スキル・要点・経歴・強み。トップページの各セクションはこのデータから生成される。
 * TODO(owner): 実際の内容に差し替える
 */

export type SkillLevel = 1 | 2 | 3;

export interface Skill {
	name: string;
	level: SkillLevel;
	/** 実務経験年数（0.5 年単位） */
	years: number;
	/** このスキルを使った実績の slug（src/content/works/<slug>.md）。ツールチップに表示する */
	works?: string[];
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
		label: 'フロントエンド実装',
		items: [
			{
				name: 'TypeScript / JavaScript',
				level: 3,
				years: 4,
				works: ['game-anime-site', 'gov-dashboard', 'maas-webapp']
			},
			{
				name: 'HTML / CSS・アクセシビリティ',
				level: 3,
				years: 4,
				works: ['maas-webapp', 'game-anime-site']
			},
			{
				name: 'Svelte / SvelteKit',
				level: 3,
				years: 2.5,
				works: ['dev-platform', 'game-anime-site', 'owned-media']
			},
			{ name: 'GSAP・SVG アニメーション', level: 3, years: 2.5, works: ['game-anime-site'] },
			{ name: 'Vue.js / Pinia', level: 2, years: 1.5, works: ['gov-dashboard', 'maas-webapp'] },
			{ name: 'データ可視化（Chart.js・地図 API）', level: 2, years: 1, works: ['gov-dashboard'] }
		]
	},
	{
		id: 'platform',
		group: 'Platform',
		label: '開発基盤・運用',
		items: [
			{
				name: '外部 API との連携',
				level: 2,
				years: 3,
				works: ['maas-webapp', 'gov-dashboard']
			},
			{
				name: 'ヘッドレス CMS（microCMS ほか）',
				level: 3,
				years: 2.5,
				works: ['owned-media', 'game-anime-site', 'dev-platform']
			},
			{ name: '開発基盤の設計・技術選定', level: 3, years: 2, works: ['dev-platform'] },
			{ name: 'GitHub Actions・運用の自動化', level: 3, years: 2, works: ['dev-platform'] },
			{
				name: '生成 AI の活用（Copilot / ChatGPT / Codex）',
				level: 2,
				years: 2,
				works: ['dev-platform', 'game-anime-site', 'owned-media']
			}
		]
	},
	{
		id: 'design',
		group: 'Design & Mobile',
		label: 'デザイン・モバイル・育成',
		items: [
			{
				name: 'UI 設計（Figma）',
				level: 2,
				years: 4,
				works: ['maas-webapp', 'owned-media', 'game-anime-site']
			},
			{ name: 'Swift / iOS アプリ開発', level: 2, years: 0.5, works: ['ios-app'] },
			{ name: '技術教材の制作・研修講師', level: 2, years: 0.5, works: ['ios-app'] }
		]
	}
];

/** ファーストビューに置く「一目でわかる」要約 */
export const glance: { term: string; value: string }[] = [
	{ term: '経験', value: 'Webサイト・アプリ開発 約5年' },
	{ term: '専門', value: 'フロントエンド開発 × 開発基盤づくり' },
	{ term: '主要技術', value: 'Svelte / Vue.js / TypeScript / GSAP' },
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

export interface Strength {
	title: string;
	body: string;
	/** 裏付けとなる実績の slug */
	proof: string[];
}

export const strengths: Strength[] = [
	{
		title: '課題を見つけ、仕組みにして解決する',
		body: 'チームに開発基盤がないと気づけば自ら提案し、技術選定から運用フローの自動化まで担いました。作って終わりにせず、チームが改善し続けられる状態をつくります。この取り組みで、2025年に全社のベストエンジニア賞を受賞しました。',
		proof: ['dev-platform']
	},
	{
		title: '表現力と品質を両立させる',
		body: 'ゲーム・アニメ公式サイトを10件以上手がけ、世界観を伝えるアニメーション演出と、アクセスが集中しても崩れない表示速度を両立してきました。アプリケーションでは、アクセシビリティにも細部まで配慮します。',
		proof: ['game-anime-site', 'maas-webapp']
	},
	{
		title: '職種や会社の垣根を越えて、合意をつくる',
		body: 'ディレクター・デザイナーから、他社のエンジニアや CMS 制作会社まで。仕様が固まる前から議論に加わり、要望と実装コストの両方を踏まえた代替案を出すことで、手戻りと摩擦を減らします。',
		proof: ['gov-dashboard', 'maas-webapp', 'owned-media']
	},
	{
		title: '知識を体系化し、チームに広げる',
		body: 'サブマネージャーとしてのコードレビューや、iOS の学習教材・研修づくりを通じて、相手の理解度に合わせて伝える力を培いました。個人に閉じた知見を、チーム全体の資産に変えていきます。',
		proof: ['dev-platform', 'gov-dashboard', 'ios-app']
	}
];
