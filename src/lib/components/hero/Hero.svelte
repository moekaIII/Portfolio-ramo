<script lang="ts">
	import '@fontsource/instrument-serif/latin-400.css';
	import '@fontsource/instrument-serif/latin-400-italic.css';
	import { site } from '#lib/config/site.ts';
	import Container from '#lib/components/ui/Container.svelte';
	import HeroVisual from './HeroVisual.svelte';

	const [first, ...rest] = site.author.nameEn.split(' ');
	const last = rest.join(' ');
</script>

<!--
  メインビジュアル: 3D を画面いっぱいに使い、文字は左下の氏名（アルファベット）と肩書きだけ。
  「デザインと実装の境界をなくす」は、設計図（左）と実物（右）の境界を動かす 3D そのもので表現する。
-->
<section aria-labelledby="hero-heading" class="relative isolate min-h-svh overflow-hidden">
	<div class="absolute inset-0 -z-10">
		<HeroVisual />
	</div>
	<Container
		class="pointer-events-none flex min-h-svh flex-col justify-end pb-[clamp(2rem,5vw,3.5rem)]"
	>
		<div class="pointer-events-auto w-fit">
			<h1
				id="hero-heading"
				class="font-display text-[clamp(3.5rem,1.6rem+7.2vw,9rem)] leading-[0.9] font-normal tracking-[-0.015em]"
			>
				{first}{#if last}<br /><em class="italic">{last}</em>{/if}
			</h1>
			<p class="mt-5 text-sm tracking-[0.04em] text-fg-muted">{site.author.jobTitle}</p>
		</div>
	</Container>
</section>
