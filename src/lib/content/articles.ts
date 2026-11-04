import type { Component } from 'svelte';

/** ケーススタディ本文（mdsvex）。1ページ構成のため全件をまとめて読み込む */
const modules = import.meta.glob<Component>('/src/content/works/*.md', {
	eager: true,
	import: 'default'
});

export function getArticle(slug: string): Component | undefined {
	return modules[`/src/content/works/${slug}.md`];
}
