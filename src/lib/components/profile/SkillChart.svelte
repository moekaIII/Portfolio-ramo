<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { LEVEL_LABEL, type Skill, type SkillGroup } from '#lib/content/profile.ts';
	import type { WorkMeta } from '#lib/types/work.ts';

	let { groups, works }: { groups: SkillGroup[]; works: WorkMeta[] } = $props();

	const titles = $derived(Object.fromEntries(works.map((w) => [w.slug, w.title])));
	const titleOf = (slug: string): string | undefined => titles[slug];

	/** 主軸スキル（core の数字の順） */
	const core = $derived(
		groups
			.flatMap((g) => g.items)
			.filter((s): s is Skill & { core: number } => s.core !== undefined)
			.toSorted((a, b) => a.core - b.core)
	);
	/** それ以外は分野ごとに、習熟度の高い順（同じなら経験の長い順） */
	const rest = $derived(
		groups
			.map((g) => ({
				...g,
				items: g.items
					.filter((s) => s.core === undefined)
					.toSorted((a, b) => b.level - a.level || b.years - a.years)
			}))
			.filter((g) => g.items.length)
	);

	const LEVELS = [1, 2, 3] as const;
	const fmt = (y: number) => (y < 1 ? '1年未満' : `${y}年`);
</script>

<!--
  スキル。グラフが表すのは「習熟度（3 段階）」で、経験年数は補足の文字にとどめる
  （年数の長さ＝得意、と読まれないように）。
  採用で見てほしい主軸スキルは上段に大きく、それ以外は分野ごとに小さく並べる。
-->
<div class="skill-chart" use:reveal>
	<h3 class="eyebrow">Core skills — 主軸スキル</h3>
	<ul class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each core as skill, i (skill.name)}
			<li class="core-tile flex flex-col rounded-lg border border-line bg-bg p-6" style="--i: {i}">
				<p class="text-xl leading-snug font-semibold">{skill.name}</p>
				<div class="meter meter--core mt-5" aria-hidden="true">
					{#each LEVELS as l (l)}
						<span class={['meter-seg', l <= skill.level && 'is-on']} style="--j: {l}"></span>
					{/each}
				</div>
				<p class="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
					<span class="font-semibold">{LEVEL_LABEL[skill.level]}</span>
					<span class="text-fg-muted tabular">実務 {fmt(skill.years)}</span>
				</p>
				{#if skill.works?.length}
					<ul class="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label="このスキルを使った実績">
						{#each skill.works.filter((s) => titleOf(s)) as slug (slug)}
							<li
								class="rounded-pill border border-line px-2.5 py-0.5 text-xs leading-relaxed text-fg-muted"
							>
								{titleOf(slug)}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>

	<div class="mt-14 grid gap-x-(--grid-gap) gap-y-10 md:grid-cols-3">
		{#each rest as group (group.id)}
			<section aria-labelledby="skill-{group.id}">
				<h3
					id="skill-{group.id}"
					class="flex flex-wrap items-baseline gap-x-3 border-b border-line pb-3"
				>
					<span class="font-semibold">{group.label}</span>
					<span class="eyebrow">{group.group}</span>
				</h3>
				<ul>
					{#each group.items as skill (skill.name)}
						<li class="flex items-center justify-between gap-4 border-b border-line py-3">
							<div class="min-w-0">
								<p class="text-[0.9375rem]">{skill.name}</p>
								<p class="mt-0.5 text-xs text-fg-muted">
									{`${LEVEL_LABEL[skill.level]} · 実務 ${fmt(skill.years)}`}
								</p>
							</div>
							<div class="meter meter--sm shrink-0" aria-hidden="true">
								{#each LEVELS as l (l)}
									<span class={['meter-seg', l <= skill.level && 'is-on']} style="--j: {l}"></span>
								{/each}
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>
<p class="mt-8 text-xs leading-relaxed text-fg-muted">
	メーターは習熟度を 3 段階（{LEVEL_LABEL[1]} / {LEVEL_LABEL[2]} / {LEVEL_LABEL[3]}）で示しています。年数は実務での使用期間です。
</p>

<style>
	/* 3 段階の習熟度メーター。主軸は太くアクセント色、その他は細く控えめに */
	.meter {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
	}
	.meter-seg {
		display: block;
		height: 100%;
		border-radius: 2px;
		background: var(--line);
		transform-origin: left center;
	}
	.meter--core {
		height: 0.5rem;
	}
	.meter--core .meter-seg.is-on {
		background: var(--chart-bar);
	}
	.meter--sm {
		width: 4.5rem;
		height: 0.375rem;
	}
	.meter--sm .meter-seg.is-on {
		background: var(--fg-muted);
	}

	/* 画面に入ったら、主軸のタイルから順にメーターが伸びる */
	@media (prefers-reduced-motion: no-preference) {
		.meter-seg {
			transition: scale 600ms var(--ease-out) calc(var(--i, 0) * 90ms + var(--j) * 120ms + 150ms);
		}
		:global(.js) .skill-chart:not([data-revealed]) .meter-seg.is-on {
			scale: 0 1;
		}
	}
</style>
