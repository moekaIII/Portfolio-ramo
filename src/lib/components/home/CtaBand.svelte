<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { resolve } from '$app/paths';
	import { site } from '#lib/config/site.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import Container from '#lib/components/ui/Container.svelte';

	type Props = { title?: string; lead?: string };

	let {
		title = 'つくりたいものを、\nまずは聞かせてください。',
		lead = '要件が固まっていない段階でも大丈夫です。課題の整理から一緒に進めます。初回のご相談は無料、2営業日以内にお返事します。'
	}: Props = $props();
</script>

<section aria-labelledby="cta-heading" class="border-t border-line bg-surface">
	<Container class="grid-12 gap-y-10 py-section">
		<div class="col-span-full md:col-span-8">
			<p class="eyebrow mb-5">Contact</p>
			<h2 id="cta-heading" class="text-h2 font-semibold whitespace-pre-line">{title}</h2>
			<p class="mt-6 max-w-[36em] text-lead text-fg-muted">{lead}</p>
		</div>
		<div
			class="col-span-full flex flex-col items-start gap-4 md:col-span-4 md:items-end md:justify-end"
		>
			<Button href={resolve('/contact')} size="lg">
				相談する
				{#snippet icon()}<ArrowUpRight size={18} />{/snippet}
			</Button>
			<a
				href="mailto:{site.author.email}"
				class="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
				>{site.author.email}</a
			>
		</div>
	</Container>
</section>
