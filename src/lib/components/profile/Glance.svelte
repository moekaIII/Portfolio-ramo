<script lang="ts">
	import { glance } from '#lib/content/profile.ts';
</script>

<!-- 経験・専門・主要技術・働き方の要約（スキルセクションの冒頭） -->
<dl
	class="grid gap-x-(--grid-gap) gap-y-6 border-b border-line pb-12 sm:grid-cols-2 lg:grid-cols-4"
>
	{#each glance as item (item.term)}
		<div>
			<dt class="eyebrow">{item.term}</dt>
			<dd class="mt-2 text-[0.9375rem] leading-relaxed">{item.value}</dd>
		</div>
	{/each}
</dl>
