import { absoluteUrl } from '#lib/utils/seo.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
