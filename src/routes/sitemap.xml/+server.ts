import { getWorks } from '#lib/server/works.ts';
import { absoluteUrl } from '#lib/utils/seo.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

const staticPages = [
	{ path: '/', priority: '1.0' },
	{ path: '/works', priority: '0.9' },
	{ path: '/services', priority: '0.8' },
	{ path: '/about', priority: '0.7' },
	{ path: '/contact', priority: '0.6' }
];

export const GET: RequestHandler = () => {
	const urls = [
		...staticPages,
		...getWorks().map((w) => ({ path: `/works/${w.slug}`, priority: '0.8' }))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `	<url>
		<loc>${absoluteUrl(u.path)}</loc>
		<priority>${u.priority}</priority>
	</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
};
