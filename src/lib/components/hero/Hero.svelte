<script lang="ts">
	import { site } from '#lib/config/site.ts';
	import Container from '#lib/components/ui/Container.svelte';
	import SkillDeskPanel from './SkillDeskPanel.svelte';
</script>

<!-- メインビジュアル: 氏名・見出し・肩書きと、スキルの机だけに絞る -->
<section aria-labelledby="hero-heading" class="relative overflow-hidden">
	<Container
		class="grid-12 min-h-svh content-center items-center gap-y-12 pt-[calc(var(--header-h)+2.5rem)] pb-[clamp(3rem,7vw,5rem)]"
	>
		<div class="col-span-full md:col-span-6">
			<p class="mb-6 text-sm font-medium">
				{site.author.name}<span class="ml-3 text-fg-muted">{site.author.nameEn}</span>
			</p>
			<h1 id="hero-heading" class="text-h1 font-semibold">
				デザインと実装の<br />境界をなくす。
			</h1>
			<p class="mt-6 text-fg-muted">{site.author.jobTitle}</p>
		</div>

		<div class="col-span-full h-[21rem] md:col-span-6 md:h-[min(70svh,40rem)]">
			<SkillDeskPanel />
		</div>
	</Container>
</section>
