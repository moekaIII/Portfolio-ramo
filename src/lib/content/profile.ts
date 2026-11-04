/** 経歴・スキル・考え方。TODO(owner): 実際の内容に差し替える */

export const career: { period: string; title: string; org: string; description: string }[] = [
	{
		period: '2022 —',
		title: 'フリーランス / Studio Placeholder',
		org: '独立',
		description:
			'スタートアップから大手企業まで、UX設計・UIデザイン・フロントエンド開発を一貫して支援。'
	},
	{
		period: '2018 — 2022',
		title: 'シニアフロントエンドエンジニア / デザインリード',
		org: 'SaaS スタートアップ',
		description: 'プロダクトのフロントエンド基盤とデザインシステムを立ち上げ、5名のチームをリード。'
	},
	{
		period: '2015 — 2018',
		title: 'Webデザイナー / マークアップエンジニア',
		org: 'Web制作会社',
		description: 'コーポレートサイトやキャンペーンサイトのデザインと実装を年間20件以上担当。'
	}
];

export const skills: { group: string; items: { name: string; level: 1 | 2 | 3 }[] }[] = [
	{
		group: 'Engineering',
		items: [
			{ name: 'TypeScript', level: 3 },
			{ name: 'Svelte / SvelteKit', level: 3 },
			{ name: 'React / Next.js', level: 3 },
			{ name: 'Three.js / WebGL', level: 2 },
			{ name: 'Node.js', level: 2 },
			{ name: 'テスト自動化（Vitest / Playwright）', level: 2 }
		]
	},
	{
		group: 'Design',
		items: [
			{ name: 'UIデザイン（Figma）', level: 3 },
			{ name: 'デザインシステム', level: 3 },
			{ name: 'プロトタイピング', level: 3 },
			{ name: 'モーションデザイン', level: 2 },
			{ name: 'タイポグラフィ', level: 2 }
		]
	},
	{
		group: 'UX & Quality',
		items: [
			{ name: 'ユーザーリサーチ', level: 3 },
			{ name: '情報設計', level: 3 },
			{ name: 'アクセシビリティ（WCAG 2.2）', level: 3 },
			{ name: 'Web パフォーマンス', level: 3 },
			{ name: 'アクセス解析・A/Bテスト', level: 2 }
		]
	}
];

export const principles: { title: string; body: string }[] = [
	{
		title: '美しさは、機能の一部。',
		body: '整った余白や正確なタイポグラフィは、情報を速く正しく伝えるための道具です。装飾ではなく、伝わることのためにデザインします。'
	},
	{
		title: 'つくる前に、測る。',
		body: '感覚だけで判断せず、データとユーザーの声から始めます。改善の前後を数字で比較できる状態をつくることが、信頼の土台だと考えています。'
	},
	{
		title: '誰も取り残さない。',
		body: 'アクセシビリティとパフォーマンスは後から足すものではなく、最初から設計に含めるもの。すべての人に届くことが、事業の成長にもつながります。'
	},
	{
		title: '自走できる状態で渡す。',
		body: '納品して終わりではなく、チームが自分たちで改善を続けられるよう、仕組みとドキュメントを残します。'
	}
];

export const stats: { value: string; unit: string; label: string }[] = [
	{ value: '10', unit: '年+', label: 'Web制作・開発の経験' },
	{ value: '60', unit: '件+', label: '支援したプロジェクト' },
	{ value: '95', unit: '+', label: 'Lighthouse 全項目の目標値' }
];
