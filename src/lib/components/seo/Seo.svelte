<script lang="ts">
	import { page } from '$app/state';
	import { site } from '#lib/config/site.ts';
	import { absoluteUrl, serializeJsonLd } from '#lib/utils/seo.ts';

	type Props = {
		/** ページ固有のタイトル（未指定ならサイト既定） */
		title?: string;
		description?: string;
		/** OGP 画像（ルート相対 or 絶対 URL） */
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article' | 'profile';
		noindex?: boolean;
		/** schema.org の JSON-LD（単体または配列） */
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	};

	let {
		title,
		description = site.description,
		image = site.ogImage,
		imageAlt = site.name,
		type = 'website',
		noindex = false,
		jsonLd
	}: Props = $props();

	const fullTitle = $derived(site.titleTemplate(title));
	const canonical = $derived(absoluteUrl(page.url.pathname));
	const ogImage = $derived(absoluteUrl(image));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}

	<meta property="og:site_name" content={site.name} />
	<meta property="og:locale" content={site.locale} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content={imageAlt} />
	<meta name="twitter:card" content="summary_large_image" />

	{#if jsonLd}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- serializeJsonLd escapes `<` so content cannot break out of the script element -->
		{@html serializeJsonLd(jsonLd)}
	{/if}
</svelte:head>
