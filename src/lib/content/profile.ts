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
	/** 大きく表示するスキル。この数字の順にリストの先頭へ並べる（6 つまで） */
	core?: number;
	/** 小さく表示するスキルの並び順（core のないもの） */
	order?: number;
	/** 小さく表示するときの短い名前（省略時は name） */
	short?: string;
	/** 属する領域（レーダーチャートの軸）。リストとチャートのハイライト連動に使う */
	area?: SkillAreaId | SkillAreaId[];
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
	| 'teach'
	| 'review';

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

export type SkillAreaId = 'frontend' | 'ai' | 'platform' | 'management' | 'mentoring' | 'design';

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
	4: '自走可能',
	3: '補助が必要',
	2: '学習中',
	1: '触れた程度'
};

export const skillAreas: SkillArea[] = [
	{ id: 'frontend', label: 'フロントエンド実装', score: 5 },
	{ id: 'ai', label: '生成AI', score: 4 },
	{ id: 'platform', label: '開発基盤・仕組み化', score: 5 },
	{ id: 'management', label: 'マネジメント', score: 4 },
	{ id: 'mentoring', label: '育成・教材', score: 4 },
	{ id: 'design', label: 'UI/UX デザイン', score: 4 }
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
				scope: '設計・コード生成・レビュー補助・ドキュメント作成に使用',
				icon: 'ai',
				area: ['ai'],
				level: 2,
				years: 4,
				works: ['game-anime-site', 'dev-platform', 'owned-media']
			},
			{
				name: 'JavaScript',
				order: 1,
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
				scope: '型設計・既存 JS の移行'
			},
			{
				name: 'HTML / CSS・アクセシビリティ',
				order: 5,
				level: 3,
				years: 8,
				works: ['maas-webapp', 'game-anime-site'],
				short: 'HTML / CSS',
				icon: 'markup',
				area: 'frontend',
				scope: 'ピクセルパーフェクト・完全レスポンシブ・アクセシビリティ強化'
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
				scope: 'チームの開発基盤 / Webサイト / Webアプリケーションの実装'
			},
			{
				name: 'GSAP・SVG アニメーション',
				order: 4,
				level: 3,
				years: 5.5,
				works: ['game-anime-site'],
				short: 'GSAP・SVG アニメーション',
				icon: 'motion',
				area: 'frontend',
				scope: '演出設計・スクロール連動・高度なSVG アニメーションの実装'
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
				scope: 'Webアプリケーションの画面実装・Pinia による状態管理'
			},
			{
				name: 'データ可視化（Chart.js・地図 API）',
				order: 3,
				short: 'データ可視化（Chart.js・地図 API）',
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
				order: 2,
				icon: 'api',
				area: 'frontend',
				level: 2,
				years: 3,
				works: ['maas-webapp', 'gov-dashboard']
			},
			{
				name: 'Headless CMS',
				core: 6,
				scope: 'microCMS / Kuroco / NILTO の設計・フロント繋ぎ込み',
				icon: 'cms',
				area: 'frontend',
				level: 3,
				years: 2.5,
				works: ['owned-media', 'game-anime-site', 'dev-platform']
			},
			{
				name: 'GitHub Actions・運用の自動化',
				order: 6,
				short: 'GitHub Actions',
				level: 3,
				years: 2,
				works: ['dev-platform'],
				icon: 'ci',
				area: 'platform'
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
				scope: '画面設計・ワイヤーフレーム・プロトタイプ・画面デザイン作成'
			},
			{
				name: 'Swift / iOS アプリ開発',
				order: 7,
				level: 2,
				years: 1.5,
				works: ['ios-app'],
				icon: 'mobile',
				area: 'frontend'
			},
			{
				name: '技術教材の制作・研修講師',
				order: 8,
				level: 2,
				years: 1.5,
				works: ['ios-app'],
				icon: 'teach',
				area: 'mentoring'
			},
			{
				name: 'コードレビュー',
				order: 9,
				icon: 'review',
				area: 'management',
				level: 3,
				years: 3,
				works: ['gov-dashboard', 'maas-webapp']
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
	/** 所属（学歴など、ないものは省略） */
	org?: string;
	summary?: string;
	achievements?: string[];
	stack?: string[];
}

export const career: CareerItem[] = [
	{
		period: '2024.01 — 現在',
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
		period: '2019.08 — 2020.09',
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
	},
	{
		period: '2019.07',
		title: '大学（経済学部）退学',
		summary:
			'大学と並行して学んでいたプログラミングの道に進むことを決め、インターン先の会社に就職しました。'
	},
	{
		period: '2018.05 — 2018.11',
		title: 'DIVE INTO CODE 卒業',
		org: 'プログラミングスクール',
		summary:
			'Ruby on Rails の即戦力コースで、Web の基礎から Rails を使用した Web アプリケーションの公開までを学びました。',
		stack: ['Ruby', 'Ruby on Rails']
	},
	{
		period: '2018.04',
		title: '大学進学（経済学部）'
	},
	{
		period: '2015.04 — 2018.03',
		title: '公立高校',
		summary: '空手道部で心身ともに鍛え、県の準強化選手に抜擢されました。'
	},
	{
		period: '2012.04 — 2015.03',
		title: '公立中学校',
		summary: '剣道部に入り、武道の精神を学びました。'
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
		title: 'コミュニケーション',
		body: '相手の立場や専門領域の違いを尊重し、職種の垣根を越えて、チーム一丸となってより良いものを作り上げるためのコミュニケーションを大切にしています。',
		proof: ['gov-dashboard', 'owned-media', 'ios-app']
	},
	{
		title: '課題発見・解決・仕組み化',
		body: '自分の担当範囲にとらわれず、メンバーの状況やチーム全体の成果を見据えた改善提案・課題提起を行い、自動化や仕組み化を試行錯誤しながら実現してきました。',
		proof: ['dev-platform']
	},
	{
		title: '表現と品質の両立',
		body: '作品やサービスの世界観を伝える演出表現と、表示速度・アクセシビリティなどの実装品質を両立したWebサイト・アプリの制作に取り組んできました。',
		proof: ['game-anime-site', 'maas-webapp']
	}
];
