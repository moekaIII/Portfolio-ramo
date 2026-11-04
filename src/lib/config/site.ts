/**
 * サイト全体の設定。氏名・URL・SNS・フォーム送信先などの差し替えはこのファイルだけで完結させる。
 * TODO(owner): 仮の値をすべて実際の情報に置き換える。
 */
export const site = {
	/** 本番 URL（末尾スラッシュなし）。sitemap / canonical / OGP の絶対 URL に使用 */
	url: 'https://example.com',
	/** 屋号・サイト名 */
	name: 'Studio Placeholder',
	/** 本人の表示名 */
	author: {
		name: '山田 太郎',
		nameEn: 'Taro Yamada',
		jobTitle: 'Frontend Engineer / UI・UX Designer',
		email: 'hello@example.com',
		location: { locality: 'Tokyo', country: 'JP' }
	},
	/** 既定の title 接尾辞・description */
	titleTemplate: (title?: string) =>
		title ? `${title} — Studio Placeholder` : 'Studio Placeholder — Frontend & UI/UX',
	description:
		'設計・デザイン・実装をひとりで横断するフロントエンドエンジニア / UI・UXデザイナー。事業成果につながるWebプロダクトを、速く、美しく、使いやすく。',
	locale: 'ja_JP',
	/** static/ 配下の既定 OGP 画像（1200x630） */
	ogImage: '/og/default.png',
	social: [
		{ label: 'GitHub', href: 'https://github.com/' },
		{ label: 'X', href: 'https://x.com/' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/' }
	],
	/**
	 * お問い合わせフォームの送信先。
	 * 既定値は環境変数 PUBLIC_FORM_ENDPOINT（src/env.ts）で上書きできる。
	 * Formspree / Web3Forms / Getform など、JSON または FormData の POST を受け付けるサービスを想定。
	 */
	form: {
		fallbackEndpoint: 'https://formspree.io/f/your-form-id',
		/** スパム対策のハニーポット項目名（Formspree: _gotcha / Web3Forms: botcheck） */
		honeypotField: '_gotcha',
		/** 追加で送るべき固定フィールド（Web3Forms の access_key など） */
		extraFields: {} as Record<string, string>
	}
} as const;

export type NavItem = {
	href: '/works' | '/services' | '/about' | '/contact';
	label: string;
	en: string;
};

export const nav: readonly NavItem[] = [
	{ href: '/works', label: '実績', en: 'Works' },
	{ href: '/services', label: 'サービス', en: 'Services' },
	{ href: '/about', label: 'わたしについて', en: 'About' },
	{ href: '/contact', label: 'お問い合わせ', en: 'Contact' }
];
