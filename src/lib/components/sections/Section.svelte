<script lang="ts">
	import type { Snippet } from 'svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import SectionHeading from '#lib/components/ui/SectionHeading.svelte';

	type Props = {
		id: string;
		eyebrow: string;
		title: string;
		lead?: string;
		tone?: 'default' | 'surface';
		children: Snippet;
	};

	let { id, eyebrow, title, lead, tone = 'default', children }: Props = $props();
</script>

<!-- tabindex="-1": ページ内ナビゲーションで移動したとき、フォーカスもここへ移す -->
<section
	{id}
	tabindex="-1"
	aria-labelledby="{id}-heading"
	class={['border-t border-line py-section outline-none', tone === 'surface' && 'bg-surface']}
>
	<Container>
		<SectionHeading id="{id}-heading" {eyebrow} {title} {lead} />
		<div class="mt-10">
			{@render children()}
		</div>
	</Container>
</section>
