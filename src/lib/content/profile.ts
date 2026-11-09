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
	/** 主軸スキル。レーダーチャートの軸に、この数字の順（上から時計回り）で並べる */
	core?: number;
	/** レーダーチャートの軸に出す短い名前（省略時は name） */
	short?: string;
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
				name: '生成AI（Copilot / ChatGPT / Codex）',
				level: 2,
				years: 4,
				works: ['game-anime-site', 'dev-platform', 'owned-media']
			},
			{
				name: 'JavaScript',
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
				short: 'TypeScript'
			},
			{
				name: 'HTML / CSS・アクセシビリティ',
				level: 3,
				years: 8,
				works: ['maas-webapp', 'game-anime-site'],
				core: 5,
				short: 'HTML / CSS'
			},
			{
				name: 'Svelte / SvelteKit',
				level: 3,
				years: 2.5,
				works: ['dev-platform', 'game-anime-site', 'owned-media'],
				core: 1,
				short: 'Svelte'
			},
			{
				name: 'GSAP・SVG アニメーション',
				level: 3,
				years: 5.5,
				works: ['game-anime-site'],
				core: 4,
				short: 'GSAP・SVG'
			},
			{
				name: 'Vue.js / Pinia',
				level: 2,
				years: 3,
				works: ['gov-dashboard', 'maas-webapp'],
				core: 2,
				short: 'Vue.js'
			},
			{ name: 'データ可視化（Chart.js・地図 API）', level: 3, years: 1, works: ['gov-dashboard'] }
		]
	},
	{
		id: 'uiux',
		group: 'uiux',
		label: 'UI/UXデザイン',
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
				works: ['owned-media', 'game-anime-site', 'dev-platform'],
				core: 6,
				short: 'ヘッドレス CMS'
			},
			{
				name: '開発基盤の設計・技術選定',
				level: 3,
				years: 2,
				works: ['dev-platform'],
				core: 7,
				short: '開発基盤'
			},
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
				name: 'UI/UX 設計・デザイン（Figma / Adobe XD）',
				level: 2,
				years: 4,
				works: ['game-anime-site'],
				core: 8,
				short: 'UI/UX'
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
