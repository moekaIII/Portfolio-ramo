<script lang="ts">
	import type { skills } from '#lib/content/profile.ts';

	let { groups }: { groups: typeof skills } = $props();

	const levelLabel = { 1: '基礎', 2: '実務', 3: 'リード可能' } as const;
</script>

<div class="grid gap-x-(--grid-gap) gap-y-14 md:grid-cols-3">
	{#each groups as group (group.group)}
		<section aria-labelledby="skill-{group.group}">
			<h3 id="skill-{group.group}" class="eyebrow border-b border-line pb-4">{group.group}</h3>
			<ul class="divide-y divide-line">
				{#each group.items as skill (skill.name)}
					<li class="flex items-center justify-between gap-4 py-3.5 text-sm">
						<span>{skill.name}</span>
						<span
							class="flex items-center gap-1"
							role="img"
							aria-label="習熟度: {levelLabel[skill.level]}"
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
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
<p class="mt-8 text-xs text-fg-muted">
	バーの数は習熟度を表します（1: 基礎 / 2: 実務 / 3: リード可能）。
</p>
