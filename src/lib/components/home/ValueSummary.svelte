<script lang="ts">
	import Container from '#lib/components/ui/Container.svelte';
	import SectionHeading from '#lib/components/ui/SectionHeading.svelte';
	import { reveal } from '#lib/actions/reveal.ts';
	import { stats } from '#lib/content/profile.ts';

	const values = [
		{
			title: '意図がずれない',
			body: 'デザインと実装を同じ人間が担うため、職種間の「伝言ゲーム」が起きません。細部の品質を落とさず、意思決定も速くなります。'
		},
		{
			title: '数字で語れる',
			body: 'KPIの設計から効果測定まで。見た目の刷新で終わらせず、事業の数字が動いたかどうかを一緒に確かめます。'
		},
		{
			title: '速く、長く使える',
			body: 'パフォーマンスとアクセシビリティを標準装備。チームが引き継いでも崩れない、保守しやすいコードと仕組みを残します。'
		}
	];
</script>

<Container as="section" id="value" aria-labelledby="value-heading" class="py-section">
	<SectionHeading
		id="value-heading"
		eyebrow="Value"
		title="ひとりで、設計から実装まで。"
		lead="デザイナーとエンジニアを別々に手配する必要はありません。課題の発見から、本番品質のコード、リリース後の改善まで、一貫して責任を持ちます。"
	/>

	<ol class="grid-12 mt-20 gap-y-14">
		{#each values as value, i (value.title)}
			<li
				class="col-span-full border-t border-line pt-8 md:col-span-4"
				use:reveal={{ delay: i * 80 }}
			>
				<p class="text-sm text-accent-text tabular" aria-hidden="true">0{i + 1}</p>
				<h3 class="mt-6 text-h3 font-semibold">{value.title}</h3>
				<p class="mt-4 text-fg-muted">{value.body}</p>
			</li>
		{/each}
	</ol>

	<dl class="grid-12 mt-24 gap-y-10">
		{#each stats as stat (stat.label)}
			<div class="col-span-2 flex flex-col md:col-span-4">
				<dt class="order-2 mt-2 text-sm text-fg-muted">{stat.label}</dt>
				<dd class="order-1 flex items-baseline gap-1 font-semibold tracking-tight">
					<span class="text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none tabular"
						>{stat.value}</span
					>
					<span class="text-h3 text-fg-muted">{stat.unit}</span>
				</dd>
			</div>
		{/each}
	</dl>
</Container>
