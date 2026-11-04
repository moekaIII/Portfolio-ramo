<script lang="ts">
	import Seo from '#lib/components/seo/Seo.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import SectionHeading from '#lib/components/ui/SectionHeading.svelte';
	import ServiceDetail from '#lib/components/services/ServiceDetail.svelte';
	import ProcessTimeline from '#lib/components/services/ProcessTimeline.svelte';
	import PlanCard from '#lib/components/services/PlanCard.svelte';
	import Faq from '#lib/components/services/Faq.svelte';
	import CtaBand from '#lib/components/home/CtaBand.svelte';
	import { faqs, plans, processSteps, services } from '#lib/content/services.ts';

	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((f) => ({
			'@type': 'Question',
			name: f.q,
			acceptedAnswer: { '@type': 'Answer', text: f.a }
		}))
	};
</script>

<Seo
	title="サービスと進め方"
	description="UX設計・UIデザイン・フロントエンド開発・パフォーマンス改善を一貫して提供。ヒアリングから設計、実装、改善までの進め方と料金の目安をご紹介します。"
	jsonLd={faqJsonLd}
/>

<Container
	as="section"
	class="pt-[calc(var(--header-h)+clamp(4rem,10vw,8rem))] pb-section"
	aria-labelledby="services-title"
>
	<SectionHeading
		level={1}
		id="services-title"
		eyebrow="Services"
		title="課題の発見から、改善が続く仕組みまで。"
		lead="4つの領域を横断して支援します。プロジェクトの一部だけを切り出したご依頼も歓迎です。"
	/>
	<h2 class="sr-only">提供サービス</h2>
	<div class="mt-20 border-b border-line">
		{#each services as service, i (service.id)}
			<ServiceDetail {service} index={i} />
		{/each}
	</div>
</Container>

<section aria-labelledby="process-heading" class="border-t border-line bg-surface py-section">
	<Container>
		<SectionHeading
			id="process-heading"
			eyebrow="Process"
			title="進め方"
			lead="小さく確かめながら、確実に前へ。各ステップの終わりに成果物を共有し、合意してから次へ進みます。"
		/>
		<div class="mt-20">
			<ProcessTimeline steps={processSteps} />
		</div>
	</Container>
</section>

<Container as="section" aria-labelledby="plans-heading" class="py-section">
	<SectionHeading
		id="plans-heading"
		eyebrow="Pricing"
		title="料金の目安"
		lead="内容や期間によって変動します。ご予算に合わせた進め方もご提案しますので、お気軽にご相談ください。（表示はすべて税別）"
	/>
	<ul class="mt-16 grid gap-(--grid-gap) md:grid-cols-3">
		{#each plans as plan (plan.name)}
			<li><PlanCard {plan} /></li>
		{/each}
	</ul>
</Container>

<Container as="section" aria-labelledby="faq-heading" class="pb-section">
	<div class="grid-12 gap-y-10">
		<h2 id="faq-heading" class="col-span-full text-h2 font-semibold md:col-span-4">よくある質問</h2>
		<div class="col-span-full md:col-span-8">
			<Faq items={faqs} />
		</div>
	</div>
</Container>

<CtaBand />
