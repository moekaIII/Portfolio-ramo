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
				years: 5.5,
				works: ['game-anime-site', 'gov-dashboard', 'maas-webapp']
			},
			{
				name: 'HTML / CSS・アクセシビリティ',
				level: 3,
				years: 5.5,
				works: ['maas-webapp', 'game-anime-site']
			},
			{
				name: 'Svelte / SvelteKit',
				level: 3,
				years: 2.5,
				works: ['dev-platform', 'game-anime-site', 'owned-media']
			},
			{ name: 'GSAP・SVG アニメーション', level: 3, years: 5.5, works: ['game-anime-site'] },
			{ name: 'Vue.js / Pinia', level: 2, years: 3, works: ['gov-dashboard', 'maas-webapp'] },
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
			{ name: 'Swift / iOS アプリ開発', level: 2, years: 1.5, works: ['ios-app'] },
			{ name: '技術教材の制作・研修講師', level: 2, years: 1.5, works: ['ios-app'] }
		]
	}
];

/** ファーストビューに置く「一目でわかる」要約 */
export const glance: { term: string; value: string }[] = [
	{ term: '経験', value: 'iOS・Web 開発 約7年' },
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
		period: '2024.02 — 2026.06',
		title: 'フロントエンドエンジニア',
		org: 'フリーランス・個人事業主',
		summary:
			'ゲーム・TVアニメの公式サイト制作を担いながら、チームに Svelte の開発基盤を提案・導入。技術選定から運用の仕組み化まで一貫して担当しました。',
		achievements: [
			'ゲーム・TVアニメの公式サイト 10件以上を、ピクセルパーフェクト・完全レスポンシブで実装。GSAP などで高度なアニメーション表現を実現',
			'開発基盤のなかったチームに Svelte を提案・導入。汎用コンポーネントの拡充と手作業の自動化で、導入時の負担を軽減',
			'Enhanced Image を活用した独自コンポーネントで、大量の画像の軽量化・サイズ指定を自動化',
			'技術とチームのレギュレーションに合わせて改善し続けられる運用フローを、GitHub で整備'
		],
		stack: [
			'Svelte 5',
			'SvelteKit',
			'TypeScript',
			'GSAP',
			'Sass',
			'NILTO',
			'GitHub Copilot',
			'ChatGPT',
			'Codex',
			'Claude Code'
		]
	},
	{
		period: '2020.10 — 2023.12',
		title: 'フロントエンドエンジニア / サブマネージャー',
		org: 'Web 受託開発会社（約40名）',
		summary:
			'行政機関・企業向けの Web アプリケーションと Web サイトを開発。フロントエンド開発に加え、ディレクションやデザインのサポートにも幅広く携わりました。',
		achievements: [
			'人員不足のプロジェクトで、サブマネージャーとして実装支援・コードレビューを担いながら、難易度の高い機能を実装',
			'仕様が固まる前の打ち合わせから参加し、開発コストを踏まえた代替案を提案。手戻りと、ディレクター・エンジニア間の摩擦を軽減',
			'ディレクター・デザイナー・バックエンドエンジニアと連携し、双方の視点から解決策を導くコミュニケーション力を培った'
		],
		stack: ['Vue.js', 'JavaScript', 'TypeScript', 'Sass', 'Pug', 'GSAP']
	},
	{
		period: '2019.05 — 2020.09',
		title: 'iOS エンジニア / 教材制作',
		org: 'iOS アプリ開発・研修事業',
		summary: 'iOS アプリの企画・開発と、Swift の学習教材の制作を担当しました。',
		achievements: [
			'企画・仕様策定から参加し、UI パーツの配置や操作性を繰り返し検証。日常的に使ってもストレスのないアプリを実装',
			'Swift の基礎から App Store へのリリースまでを網羅した教材を、操作動画も交えて制作。他社向け研修の受注につながった',
			'Mac の基本操作からアプリのリリースまでを一貫して指導し、相手の理解度に合わせて伝える力を培った'
		],
		stack: [
			'Swift',
			'SwiftUI',
			'UIKit',
			'GitHub',
			'Firebase',
			'App Store Connect',
			'Adobe Premiere'
		]
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
