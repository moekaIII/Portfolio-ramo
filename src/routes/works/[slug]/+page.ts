import type { Component } from 'svelte';
import type { PageLoad } from './$types';

// 記事本文（mdsvex）はページごとに遅延読み込みする
const articles = import.meta.glob<Component>('/src/content/works/*.md', { import: 'default' });

export const load: PageLoad = async ({ data }) => {
	const loader = articles[`/src/content/works/${data.work.slug}.md`];
	return { ...data, Article: await loader() };
};
