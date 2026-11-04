<script lang="ts">
	import { site } from '#lib/config/site.ts';
	import Container from '#lib/components/ui/Container.svelte';
	import HeroVisual from './HeroVisual.svelte';
</script>

<!--
  メインビジュアル: 3D を画面いっぱいに使い、文字は左下の氏名・肩書きだけ。
  「デザインと実装の境界をなくす」は、設計図（左）と実物（右）の境界を動かす 3D そのもので表現する。
-->
<section aria-labelledby="hero-heading" class="relative isolate min-h-svh overflow-hidden">
	<div class="absolute inset-0 -z-10">
		<HeroVisual />
	</div>
	<Container
		class="pointer-events-none flex min-h-svh flex-col justify-end pb-[clamp(2rem,5vw,3.5rem)]"
	>
		<h1 id="hero-heading" class="pointer-events-auto w-fit text-sm leading-relaxed">
			<span class="block font-semibold">
				{site.author.name}<span class="ml-3 font-normal text-fg-muted">{site.author.nameEn}</span>
			</span>
			<span class="block text-fg-muted">{site.author.jobTitle}</span>
		</h1>
	</Container>
</section>
