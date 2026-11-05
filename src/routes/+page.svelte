<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '#lib/components/seo/Seo.svelte';
	import Hero from '#lib/components/hero/Hero.svelte';
	import Section from '#lib/components/sections/Section.svelte';
	import Strengths from '#lib/components/sections/Strengths.svelte';
	import Glance from '#lib/components/profile/Glance.svelte';
	import SkillMatrix from '#lib/components/profile/SkillMatrix.svelte';
	import CareerTimeline from '#lib/components/profile/CareerTimeline.svelte';
	import WorksCarousel from '#lib/components/works/WorksCarousel.svelte';
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
	id="works"
	eyebrow="Selected Projects"
	title="実績"
	lead="多様なプロジェクトにおける設計・開発・課題解決の取り組み。一部抜粋"
	tone="surface"
>
	<WorksCarousel works={data.works} />
</Section>

<Section id="strengths" eyebrow="Strengths" title="強み">
	<Strengths />
</Section>

<Section
	id="skills"
	eyebrow="Skills"
	title="スキル"
	lead="設計・デザイン・実装・品質の領域を、ひとつのプロジェクトの中で行き来できることが強みです。"
	tone="surface"
>
	<Glance />
	<div class="mt-14">
		<SkillMatrix groups={skills} />
	</div>
</Section>

<Section
	id="career"
	eyebrow="Career"
	title="経歴"
	lead="Webデザイナーとしてキャリアを始め、実装、チームのリード、独立と、領域を広げてきました。"
>
	<CareerTimeline items={career} />
</Section>
