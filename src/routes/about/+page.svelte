<script lang="ts">
	import Seo from '#lib/components/seo/Seo.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import SectionHeading from '#lib/components/ui/SectionHeading.svelte';
	import Timeline from '#lib/components/about/Timeline.svelte';
	import SkillMatrix from '#lib/components/about/SkillMatrix.svelte';
	import Principles from '#lib/components/about/Principles.svelte';
	import CtaBand from '#lib/components/home/CtaBand.svelte';
	import { site } from '#lib/config/site.ts';
	import { career, principles, skills } from '#lib/content/profile.ts';
	import { personJsonLd } from '#lib/utils/jsonld.ts';
</script>

<Seo
	title="わたしについて"
	description="{site.author.name}（{site.author
		.nameEn}）の経歴、スキルセット、仕事の考え方。デザインとエンジニアリングを横断し、事業成果につながるWebプロダクトをつくっています。"
	type="profile"
	jsonLd={personJsonLd()}
/>

<Container
	as="section"
	aria-labelledby="about-title"
	class="pt-[calc(var(--header-h)+clamp(4rem,10vw,8rem))] pb-section"
>
	<div class="grid-12 gap-y-12">
		<div class="col-span-full md:col-span-8">
			<p class="eyebrow mb-5 flex items-center gap-3">
				<span aria-hidden="true" class="h-px w-8 bg-accent-text"></span>About
			</p>
			<h1 id="about-title" class="text-h1 font-semibold">
				デザインの言葉と、<br />コードの言葉を話す。
			</h1>
		</div>
		<div class="col-span-full space-y-6 text-lead text-fg-muted md:col-span-7 md:col-start-6">
			<p>
				{site.author
					.name}です。Webデザイナーとしてキャリアを始め、実装の制約を知らないまま描いたデザインが現場で崩れていくもどかしさから、フロントエンドエンジニアリングを学びました。
			</p>
			<p>
				現在は、UXリサーチからUIデザイン、本番品質の実装、リリース後の改善までをひとりで横断しています。職種の境界で失われがちな「意図」を、最後まで守り抜くことが私の役割です。
			</p>
		</div>
	</div>
</Container>

<section aria-labelledby="principles-heading" class="border-t border-line py-section">
	<Container>
		<SectionHeading id="principles-heading" eyebrow="Principles" title="大切にしていること" />
		<div class="mt-16"><Principles items={principles} /></div>
	</Container>
</section>

<section aria-labelledby="skills-heading" class="border-t border-line bg-surface py-section">
	<Container>
		<SectionHeading
			id="skills-heading"
			eyebrow="Skills"
			title="スキルセット"
			lead="設計・デザイン・実装・品質の4領域を、ひとつのプロジェクトの中で行き来できることが強みです。"
		/>
		<div class="mt-16"><SkillMatrix groups={skills} /></div>
	</Container>
</section>

<Container as="section" aria-labelledby="career-heading" class="py-section">
	<div class="grid-12 gap-y-10">
		<h2 id="career-heading" class="col-span-full text-h2 font-semibold md:col-span-4">経歴</h2>
		<div class="col-span-full md:col-span-8"><Timeline items={career} /></div>
	</div>
</Container>

<CtaBand />
