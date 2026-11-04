<script lang="ts">
	import { getThumbnail } from '#lib/content/thumbnails.ts';

	type Props = {
		slug: string;
		src: string;
		alt: string;
		sizes: string;
		/** ファーストビューに入る画像のみ true */
		priority?: boolean;
		class?: string;
	};

	let { slug, src, alt, sizes, priority = false, class: className = '' }: Props = $props();

	const picture = $derived(getThumbnail(src));
</script>

<!-- view-transition-name で一覧 ⇄ 詳細の共有要素遷移を行う -->
<div
	class={['overflow-hidden rounded-lg border border-line bg-surface', className]}
	style:view-transition-name="work-{slug}"
>
	<enhanced:img
		src={picture}
		{alt}
		{sizes}
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
		class="aspect-[16/10] h-auto w-full object-cover"
	/>
</div>
