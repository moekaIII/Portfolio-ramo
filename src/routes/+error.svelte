<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Seo from '#lib/components/seo/Seo.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Container from '#lib/components/ui/Container.svelte';

	const notFound = $derived(page.status === 404);
</script>

<Seo title={notFound ? 'ページが見つかりません' : 'エラー'} noindex />

<Container
	as="section"
	class="flex min-h-[80svh] flex-col justify-center pt-[calc(var(--header-h)+4rem)] pb-section"
>
	<p class="eyebrow mb-6 tabular">Error {page.status}</p>
	<h1 class="text-h1 font-semibold">
		{notFound ? 'お探しのページは見つかりませんでした。' : '問題が発生しました。'}
	</h1>
	<p class="mt-6 max-w-[36em] text-lead text-fg-muted">
		{notFound
			? 'このサイトは1ページ構成になりました。スキル・経歴・実績はすべてトップページにまとめています。'
			: '時間をおいて再度お試しください。'}
	</p>
	<div class="mt-10 flex flex-wrap gap-3">
		<Button href={resolve('/')}>
			トップページへ
			{#snippet icon()}<ArrowLeft size={16} />{/snippet}
		</Button>
	</div>
</Container>
