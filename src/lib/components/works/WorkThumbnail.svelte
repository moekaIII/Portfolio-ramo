<script lang="ts">
	import { getThumbnail } from '#lib/content/thumbnails.ts';

	type Props = {
		src: string;
		alt: string;
		sizes: string;
		/** ファーストビューに入る画像のみ true */
		priority?: boolean;
		class?: string;
	};

	let { src, alt, sizes, priority = false, class: className = '' }: Props = $props();

	const picture = $derived(getThumbnail(src));
</script>

<div class={['overflow-hidden rounded-lg border border-line bg-surface', className]}>
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
