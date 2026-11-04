<script lang="ts">
	import { LEVEL_LABEL, type SkillGroup } from '#lib/content/profile.ts';

	let { groups }: { groups: SkillGroup[] } = $props();
</script>

<div class="grid gap-x-(--grid-gap) gap-y-14 md:grid-cols-3">
	{#each groups as group (group.id)}
		<section aria-labelledby="skill-{group.id}">
			<h3
				id="skill-{group.id}"
				class="flex items-baseline justify-between border-b border-line pb-4"
			>
				<span class="text-lg font-semibold">{group.label}</span>
				<span class="eyebrow">{group.group}</span>
			</h3>
			<ul class="divide-y divide-line">
				{#each group.items as skill (skill.name)}
					<li class="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 py-3.5 text-sm">
						<span>{skill.name}</span>
						<span
							class="flex items-center gap-1"
							role="img"
							aria-label="習熟度: {LEVEL_LABEL[skill.level]}"
						>
							{#each [1, 2, 3] as n (n)}
								<span
									class={[
										'h-1.5 w-4 rounded-pill',
										n <= skill.level ? 'bg-accent-text' : 'bg-line-strong/50'
									]}
								></span>
							{/each}
						</span>
						<span class="w-10 text-right text-fg-muted tabular">{skill.years}年</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
<p class="mt-8 text-xs text-fg-muted">
	バーは習熟度（1: {LEVEL_LABEL[1]} / 2: {LEVEL_LABEL[2]} / 3: {LEVEL_LABEL[3]}）、右端の数字は実務経験年数です。
</p>
