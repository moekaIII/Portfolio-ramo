/** 提供サービス・進め方・料金目安。TODO(owner): 実際の内容・金額に差し替える */

export interface Service {
	id: string;
	en: string;
	title: string;
	summary: string;
	deliverables: string[];
}

export const services: Service[] = [
	{
		id: 'ux',
		en: 'UX Strategy & Research',
		title: 'UX設計・リサーチ',
		summary:
			'アクセス解析とユーザーリサーチで課題の根っこを特定し、事業KPIにつながる体験を設計します。',
		deliverables: [
			'ユーザーインタビュー',
			'ユーザビリティテスト',
			'カスタマージャーニー',
			'情報設計',
			'A/Bテスト設計'
		]
	},
	{
		id: 'ui',
		en: 'UI Design & Design Systems',
		title: 'UIデザイン・デザインシステム',
		summary:
			'ブランドを体現しながら、迷わず使えるUIを。運用で崩れないよう、トークンとコンポーネントで仕組み化します。',
		deliverables: [
			'UIデザイン',
			'プロトタイプ',
			'デザイントークン',
			'Figmaライブラリ',
			'アクセシビリティ監査'
		]
	},
	{
		id: 'dev',
		en: 'Frontend Engineering',
		title: 'フロントエンド開発',
		summary:
			'デザインの意図を損なわず、速く、壊れにくいフロントエンドを実装します。既存プロダクトの段階的な移行も得意です。',
		deliverables: [
			'SvelteKit / Next.js',
			'TypeScript',
			'コンポーネント設計',
			'テスト・CI整備',
			'インタラクション実装'
		]
	},
	{
		id: 'perf',
		en: 'Performance & Quality',
		title: 'パフォーマンス・品質改善',
		summary:
			'Core Web Vitals、アクセシビリティ、SEOを計測可能な形で改善し、改善が続く仕組みまでを整えます。',
		deliverables: ['Web Vitals改善', 'RUM導入', 'WCAG 2.2 対応', 'テクニカルSEO', '品質の自動計測']
	}
];

export interface ProcessStep {
	en: string;
	title: string;
	duration: string;
	description: string;
	outputs: string[];
}

export const processSteps: ProcessStep[] = [
	{
		en: 'Hearing',
		title: 'ヒアリング',
		duration: '1〜2週間',
		description:
			'事業の目標、ユーザー、制約を伺い、解くべき課題を言語化します。必要に応じて既存データの分析やステークホルダーへのインタビューも行います。',
		outputs: ['課題定義書', '成功指標（KPI）の合意', '概算スケジュール']
	},
	{
		en: 'Design',
		title: '設計',
		duration: '2〜6週間',
		description:
			'情報設計からUIデザイン、技術選定までを並行して進めます。早い段階でプロトタイプを触っていただき、手戻りを最小限にします。',
		outputs: ['情報設計・画面遷移', 'UIデザイン / プロトタイプ', '技術設計書']
	},
	{
		en: 'Build',
		title: '実装',
		duration: '4〜12週間',
		description:
			'デザインと実装を同じ人間が担うため、意図のずれが起きません。週次でデモを共有し、優先度を一緒に調整しながら進めます。',
		outputs: ['本番品質のコード', 'コンポーネントライブラリ', 'テスト・CI']
	},
	{
		en: 'Improve',
		title: '改善',
		duration: '継続',
		description:
			'リリースはスタートです。計測結果をもとに改善サイクルを回し、チームが自走できるようドキュメントと仕組みを残します。',
		outputs: ['効果測定レポート', '改善ロードマップ', '運用ドキュメント']
	}
];

export interface Plan {
	name: string;
	price: string;
	unit: string;
	description: string;
	features: string[];
	recommended?: boolean;
}

export const plans: Plan[] = [
	{
		name: 'スポット診断',
		price: '30万円〜',
		unit: '/ 1案件',
		description:
			'現状のUX・パフォーマンス・アクセシビリティを診断し、改善の優先順位をご提案します。',
		features: ['2〜3週間', '診断レポート', '改善ロードマップ']
	},
	{
		name: 'プロジェクト',
		price: '150万円〜',
		unit: '/ 1案件',
		description: '新規開発やリニューアルを、ヒアリングから実装・リリースまで一貫してお受けします。',
		features: ['設計〜実装まで一貫', '週次デモ', 'リリース後1か月のサポート'],
		recommended: true
	},
	{
		name: '継続支援',
		price: '60万円〜',
		unit: '/ 月',
		description: 'プロダクトチームの一員として、改善の企画から実装までを継続的に担います。',
		features: ['月40時間〜', '定例ミーティング', '優先対応']
	}
];

export const faqs: { q: string; a: string }[] = [
	{
		q: '要件が固まっていなくても相談できますか？',
		a: 'はい、むしろ歓迎です。課題の整理から一緒に進めることで、作るべきものを正しく定められます。'
	},
	{
		q: 'デザインだけ、実装だけの依頼も可能ですか？',
		a: '可能です。ただし設計から実装まで一貫して担当する場合に、品質とスピードの面で最も価値を発揮できます。'
	},
	{
		q: '既存のチームや開発会社と一緒に進められますか？',
		a: 'はい。既存チームへの参画や、開発会社さまとの協業の実績も多数あります。コードレビューや設計支援だけのご依頼も承ります。'
	},
	{
		q: '契約形態や支払い条件を教えてください。',
		a: '準委任契約・請負契約のどちらにも対応しています。お支払いは月末締め翌月末払いが基本です。'
	}
];
