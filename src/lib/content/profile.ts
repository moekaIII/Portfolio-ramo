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
	/** このスキルを使った実績の slug（src/content/works/<slug>.md） */
	works?: string[];
	/** 大きく表示するスキル。この数字の順にリストの先頭へ並べる（5 つまで） */
	core?: number;
	/** リストの 6 つ目以降に出す短い名前（省略時は name） */
	short?: string;
	/** 属する領域（レーダーチャートの軸）。リストとチャートのハイライト連動に使う */
	area?: SkillAreaId;
	/** 主軸スキルのリストに出すアイコン */
	icon?: SkillIcon;
	/** 主軸スキルのリストに出す担当範囲 */
	scope?: string;
}

export type SkillIcon =
	| 'svelte'
	| 'vue'
	| 'ts'
	| 'js'
	| 'motion'
	| 'markup'
	| 'cms'
	| 'platform'
	| 'design'
	| 'ai'
	| 'chart'
	| 'api'
	| 'ci'
	| 'mobile'
	| 'teach';

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

export type SkillAreaId =
	'frontend' | 'motion' | 'platform' | 'management' | 'mentoring' | 'design';

/** 領域ごとのバランス（レーダーチャートの軸。上から時計回りにこの順で並ぶ） */
export interface SkillArea {
	id: SkillAreaId;
	label: string;
	/** 1〜5。外側ほど得意 */
	score: 1 | 2 | 3 | 4 | 5;
}

export const AREA_MAX = 5;

/** 領域のスコアの説明（チャートの active 時に、点の横に出す） */
export const AREA_LEVEL_LABEL: Record<SkillArea['score'], string> = {
	5: '専門・指導',
	4: '高度な実務',
	3: '自走可能',
	2: '補助が必要',
	1: '学習中'
};

export const skillAreas: SkillArea[] = [
	{ id: 'frontend', label: 'フロントエンド実装', score: 5 },
	{ id: 'motion', label: '演出・アニメーション', score: 4 },
	{ id: 'platform', label: '開発基盤・自動化', score: 4 },
	{ id: 'management', label: 'マネジメント', score: 3 },
	{ id: 'mentoring', label: '育成・教材', score: 3 },
	{ id: 'design', label: 'UI/UX デザイン', score: 3 }
];

export const skills: SkillGroup[] = [
	{
		id: 'frontend',
		group: 'Frontend',
		label: 'フロントエンド実装',
		items: [
			{
				name: '生成AI（Copilot / ChatGPT / Codex）',
				core: 2,
				short: '生成AI',
				scope: 'コード生成・レビュー補助・ドキュメント作成で開発を効率化',
				icon: 'ai',
				area: 'platform',
				level: 2,
				years: 4,
				works: ['game-anime-site', 'dev-platform', 'owned-media']
			},
			{
				name: 'JavaScript',
				icon: 'js',
				area: 'frontend',
				level: 3,
				years: 7,
				works: ['game-anime-site', 'gov-dashboard', 'maas-webapp']
			},
			{
				name: 'TypeScript',
				level: 3,
				years: 3,
				works: ['game-anime-site', 'gov-dashboard', 'maas-webapp'],
				core: 3,
				short: 'TypeScript',
				icon: 'ts',
				area: 'frontend',
				scope: '型設計・API レスポンスの型付け・既存 JS の移行'
			},
			{
				name: 'HTML / CSS・アクセシビリティ',
				level: 3,
				years: 8,
				works: ['maas-webapp', 'game-anime-site'],
				short: 'HTML / CSS',
				icon: 'markup',
				area: 'frontend',
				scope: 'ピクセルパーフェクト・完全レスポンシブ・WCAG AA 対応'
			},
			{
				name: 'Svelte / SvelteKit',
				level: 3,
				years: 2.5,
				works: ['dev-platform', 'game-anime-site', 'owned-media'],
				core: 1,
				short: 'Svelte',
				icon: 'svelte',
				area: 'frontend',
				scope: 'チームへの導入提案・共通コンポーネント設計・SSG 構築'
			},
			{
				name: 'GSAP・SVG アニメーション',
				level: 3,
				years: 5.5,
				works: ['game-anime-site'],
				short: 'GSAP・SVG',
				icon: 'motion',
				area: 'motion',
				scope: '演出設計・スクロール連動・SVG アニメーションの実装'
			},
			{
				name: 'Vue.js / Pinia',
				level: 2,
				years: 3,
				works: ['gov-dashboard', 'maas-webapp'],
				core: 4,
				short: 'Vue.js',
				icon: 'vue',
				area: 'frontend',
				scope: '業務アプリの画面実装・Pinia による状態管理'
			},
			{
				name: 'データ可視化（Chart.js・地図 API）',
				level: 3,
				years: 1,
				works: ['gov-dashboard'],
				icon: 'chart',
				area: 'frontend'
			}
		]
	},
	{
		id: 'uiux',
		group: 'uiux',
		label: 'UI/UXデザイン',
		items: [
			{
				name: '外部 API との連携',
				icon: 'api',
				area: 'frontend',
				level: 2,
				years: 3,
				works: ['maas-webapp', 'gov-dashboard']
			},
			{
				name: 'ヘッドレス CMS（microCMS ほか）',
				level: 3,
				years: 2.5,
				works: ['owned-media', 'game-anime-site', 'dev-platform'],
				short: 'ヘッドレス CMS',
				icon: 'cms',
				area: 'frontend',
				scope: 'コンテンツモデル設計・API 連携・入稿フローの整備'
			},
			{
				name: '開発基盤の設計・技術選定',
				level: 3,
				years: 2,
				works: ['dev-platform'],
				short: '開発基盤',
				icon: 'platform',
				area: 'platform',
				scope: '技術選定・GitHub Actions による自動化・運用ルールづくり'
			},
			{
				name: 'GitHub Actions・運用の自動化',
				level: 3,
				years: 2,
				works: ['dev-platform'],
				icon: 'ci',
				area: 'platform'
			},
			{
				name: '生成 AI の活用（Copilot / ChatGPT / Codex）',
				icon: 'ai',
				area: 'platform',
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
				name: 'UI/UX 設計・デザイン（Figma / Adobe XD）',
				level: 2,
				years: 4,
				works: ['game-anime-site'],
				core: 5,
				short: 'UI/UX',
				icon: 'design',
				area: 'design',
				scope: '画面設計・ワイヤーフレーム・プロトタイプ作成'
			},
			{
				name: 'Swift / iOS アプリ開発',
				level: 2,
				years: 1.5,
				works: ['ios-app'],
				icon: 'mobile',
				area: 'frontend'
			},
			{
				name: '技術教材の制作・研修講師',
				level: 2,
				years: 1.5,
				works: ['ios-app'],
				icon: 'teach',
				area: 'mentoring'
			}
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
		title: '課題を見つけ、仕組みで解決する',
		body: 'チームに足りない開発基盤を自ら提案し、技術選定から運用の自動化まで担当。2025年に全社のベストエンジニア賞を受賞しました。',
		proof: ['dev-platform']
	},
	{
		title: '表現力と品質を両立する',
		body: '公式サイト10件以上で、世界観を伝える演出と、表示速度・アクセシビリティを両立してきました。',
		proof: ['game-anime-site', 'maas-webapp']
	},
	{
		title: '職種や会社を越えてつなぐ',
		body: '仕様が固まる前から議論に加わり、代替案で手戻りを防ぎます。知見はレビューや教材でチームに広げます。',
		proof: ['gov-dashboard', 'owned-media', 'ios-app']
	}
];
