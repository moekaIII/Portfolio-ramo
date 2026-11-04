<script lang="ts">
	import { site } from '#lib/config/site.ts';
	import { glance } from '#lib/content/profile.ts';
	import Container from '#lib/components/ui/Container.svelte';
	import SkillDeskPanel from './SkillDeskPanel.svelte';
</script>

<section aria-labelledby="hero-heading" class="relative overflow-hidden">
	<Container
		class="grid-12 min-h-svh content-center items-center gap-y-12 pt-[calc(var(--header-h)+2.5rem)] pb-[clamp(3rem,7vw,5rem)]"
	>
		<div class="col-span-full md:col-span-6">
			<p class="eyebrow mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
				<span aria-hidden="true" class="h-px w-8 shrink-0 bg-accent-text"></span>
				<span class="text-fg normal-case">{site.author.name}</span>
				<span>{site.author.nameEn}</span>
			</p>
			<h1 id="hero-heading" class="text-h1 font-semibold">
				デザインと実装の<br />境界をなくす。
			</h1>
			<p class="mt-6 max-w-[32em] text-lead text-fg-muted">
				{site.author
					.jobTitle}。UIデザインからフロントエンド実装まで、ひとりで横断して事業成果につながるWebプロダクトをつくってきました。
			</p>

			<dl class="mt-10 grid gap-x-(--grid-gap) gap-y-5 border-t border-line pt-8 sm:grid-cols-2">
				{#each glance as item (item.term)}
					<div>
						<dt class="eyebrow">{item.term}</dt>
						<dd class="mt-1.5 text-[0.9375rem] leading-relaxed">{item.value}</dd>
					</div>
				{/each}
			</dl>
		</div>

		<div class="col-span-full h-[24rem] md:col-span-6 md:h-[min(68svh,38rem)]">
			<SkillDeskPanel />
		</div>
	</Container>
</section>
