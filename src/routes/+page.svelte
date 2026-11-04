<script lang="ts">
	import Seo from '#lib/components/seo/Seo.svelte';
	import Hero from '#lib/components/hero/Hero.svelte';
	import ValueSummary from '#lib/components/home/ValueSummary.svelte';
	import FeaturedWorks from '#lib/components/home/FeaturedWorks.svelte';
	import ServicesOverview from '#lib/components/home/ServicesOverview.svelte';
	import CtaBand from '#lib/components/home/CtaBand.svelte';
	import { personJsonLd, professionalServiceJsonLd } from '#lib/utils/jsonld.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo jsonLd={[personJsonLd(), professionalServiceJsonLd()]} type="profile" />

<Hero />
<ValueSummary />
<FeaturedWorks works={data.featured} />
<ServicesOverview />
<CtaBand />
