<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { resolve } from '$app/paths';
	import { site } from '#lib/config/site.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import HeroVisual from './HeroVisual.svelte';

	let section: HTMLElement | undefined = $state();
</script>

<section
	bind:this={section}
	aria-labelledby="hero-heading"
	class="relative isolate overflow-hidden"
>
	<div class="absolute inset-0 -z-10">
		<HeroVisual target={section} />
		<!-- テキスト側の可読性を確保するスクリム（3D の上に重ねる） -->
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-bg/70 to-transparent md:bg-linear-to-r md:from-bg md:via-bg/60"
		></div>
	</div>

	<Container
		class="flex min-h-svh flex-col justify-end pt-[calc(var(--header-h)+4rem)] pb-[clamp(2.5rem,6vw,4rem)]"
	>
		<p class="eyebrow mb-8 flex items-center gap-3">
			<span aria-hidden="true" class="h-px w-8 shrink-0 bg-accent-text"></span>
			<span>
				{#each site.author.jobTitle.split(' / ') as part, i (part)}
					<span class="inline-block">{i > 0 ? '/ ' : ''}{part}</span>{' '}
				{/each}
			</span>
		</p>
		<h1 id="hero-heading" class="max-w-[11em] text-display font-semibold">
			デザインと実装の<br />境界をなくす。
		</h1>
		<div class="grid-12 mt-10 gap-y-10">
			<p class="col-span-full max-w-[34em] text-lead text-fg-muted md:col-span-6">
				UI/UXデザインからフロントエンド実装まで、ひとりで横断。事業成果につながるWebプロダクトを、速く、美しく、使いやすくつくります。
			</p>
			<div class="col-span-full flex flex-wrap items-end gap-3 md:col-span-6 md:justify-end">
				<Button href={resolve('/contact')} size="lg">
					相談する
					{#snippet icon()}<ArrowUpRight size={18} />{/snippet}
				</Button>
				<Button href={resolve('/works')} size="lg" variant="secondary">実績を見る</Button>
			</div>
		</div>
		<a
			href="#value"
			class="mt-14 hidden w-fit items-center gap-3 text-sm text-fg-muted hover:text-fg md:inline-flex"
		>
			<span class="inline-flex size-9 items-center justify-center rounded-pill border border-line">
				<ArrowDown size={14} aria-hidden="true" />
			</span>
			スクロールして詳しく見る
		</a>
	</Container>
</section>
