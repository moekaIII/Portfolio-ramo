<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '#lib/components/seo/Seo.svelte';
	import Hero from '#lib/components/hero/Hero.svelte';
	import Section from '#lib/components/sections/Section.svelte';
	import Strengths from '#lib/components/sections/Strengths.svelte';
	import ContactLinks from '#lib/components/sections/ContactLinks.svelte';
	import SkillMatrix from '#lib/components/profile/SkillMatrix.svelte';
	import CareerTimeline from '#lib/components/profile/CareerTimeline.svelte';
	import WorkCard from '#lib/components/works/WorkCard.svelte';
	import { career, skills } from '#lib/content/profile.ts';
	import { activeSection } from '#lib/state/active-section.svelte.ts';
	import { personJsonLd, professionalServiceJsonLd, worksJsonLd } from '#lib/utils/jsonld.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	onMount(() => activeSection.observe());
</script>

<Seo
	type="profile"
	jsonLd={[personJsonLd(), professionalServiceJsonLd(), ...worksJsonLd(data.works)]}
/>

<Hero />

<Section
	id="skills"
	eyebrow="Skills"
	title="スキル"
	lead="設計・デザイン・実装・品質の領域を、ひとつのプロジェクトの中で行き来できることが強みです。"
	tone="surface"
>
	<SkillMatrix groups={skills} />
</Section>

<Section
	id="career"
	eyebrow="Career"
	title="経歴"
	lead="Webデザイナーとしてキャリアを始め、実装、チームのリード、独立と、領域を広げてきました。"
>
	<CareerTimeline items={career} />
</Section>

<Section
	id="works"
	eyebrow="Works"
	title="実績"
	lead="見た目の刷新だけでなく、事業の数字が動いたところまでを記録しています。"
	tone="surface"
>
	<div class="-mt-12 border-b border-line md:-mt-16">
		{#each data.works as work (work.slug)}
			<WorkCard {work} />
		{/each}
	</div>
</Section>

<Section id="strengths" eyebrow="Strengths" title="強み">
	<Strengths />
</Section>

<Section id="contact" eyebrow="Contact" title="連絡先">
	<ContactLinks />
</Section>
