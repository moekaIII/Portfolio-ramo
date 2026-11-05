<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '#lib/components/seo/Seo.svelte';
	import Hero from '#lib/components/hero/Hero.svelte';
	import Section from '#lib/components/sections/Section.svelte';
	import Concept from '#lib/components/sections/Concept.svelte';
	import Strengths from '#lib/components/sections/Strengths.svelte';
	import Glance from '#lib/components/profile/Glance.svelte';
	import SkillChart from '#lib/components/profile/SkillChart.svelte';
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

<Section id="strengths" eyebrow="Strengths" title="強み" lead="">
	<Strengths works={data.works} />
</Section>

<Section id="skills" eyebrow="Skills" title="スキル" lead="" tone="surface">
	<!-- <Glance /> -->
	<div class="mt-14">
		<SkillChart groups={skills} works={data.works} />
	</div>
</Section>

<Section
	id="career"
	eyebrow="Career"
	title="経歴"
	lead="iOS アプリ開発から始まり、Web の受託開発、フリーランスでの開発基盤づくりへと領域を広げてきました。"
>
	<CareerTimeline items={career} />
</Section>

<Section id="concept" eyebrow="Concept" title="このサイトについて" tone="surface">
	<Concept />
</Section>
