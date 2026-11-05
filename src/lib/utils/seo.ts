import { site } from '#lib/config/site.ts';

/** ルート相対パスを本番の絶対 URL に変換（既に絶対 URL ならそのまま） */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//.test(path)) return path;
	const normalized = path === '/' ? '' : path.replace(/\/$/, '');
	const base = site.url.replace(/\/+$/, '');
	return `${base}${normalized.startsWith('/') || normalized === '' ? '' : '/'}${normalized}`;
}

/** JSON-LD を <script> として安全に埋め込める文字列にする */
export function serializeJsonLd(data: unknown): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
