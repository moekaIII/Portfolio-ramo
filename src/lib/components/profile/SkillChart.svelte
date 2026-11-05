<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { LEVEL_LABEL, type SkillGroup } from '#lib/content/profile.ts';
	import type { WorkMeta } from '#lib/types/work.ts';

	let { groups, works }: { groups: SkillGroup[]; works: WorkMeta[] } = $props();

	/** 全グループ共通の目盛り（年）。最長のバーが右端に届く */
	const max = $derived(
		Math.max(1, Math.ceil(Math.max(...groups.flatMap((g) => g.items.map((s) => s.years)))))
	);
	const ticks = $derived(Array.from({ length: max + 1 }, (_, i) => i));
	const titles = $derived(Object.fromEntries(works.map((w) => [w.slug, w.title])));
	const titleOf = { get: (slug: string): string | undefined => titles[slug] };
	const fmt = (y: number) => (y < 1 ? '1年未満' : `${y}年`);
</script>

<!--
  スキルの横棒グラフ。バーの長さ = 実務経験年数（全グループで同じ目盛り）、名前の横に習熟度。
  値はすべて文字でも出しているので、ツールチップ（関連する実績）は補足。
-->
<div class="skill-chart" use:reveal style="--max: {max}">
	{#each groups as group, gi (group.id)}
		<section aria-labelledby="skill-{group.id}" class={[gi > 0 && 'mt-12']}>
			<h3
				id="skill-{group.id}"
				class="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3"
			>
				<span class="text-lg font-semibold">{group.label}</span>
				<span class="eyebrow">{group.group}</span>
			</h3>
			<ul>
				{#each group.items.toSorted((a, b) => b.years - a.years) as skill, i (skill.name)}
					{@const pct = (skill.years / max) * 100}
					{@const tipId = `skill-tip-${group.id}-${i}`}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<li
						class="skill-row"
						tabindex="0"
						aria-describedby={skill.works?.length ? tipId : undefined}
					>
						<p class="skill-name">
							<span class="text-[0.9375rem]">{skill.name}</span>
							<span class="text-xs text-fg-muted">{LEVEL_LABEL[skill.level]}</span>
						</p>
						<div class="skill-track" aria-hidden="true">
							<span class="skill-bar" style="width: {pct}%; --i: {gi * 6 + i}"></span>
							{#if skill.works?.length}
								<span class="skill-tip" style="left: {Math.min(pct, 82)}%">
									<span class="block font-semibold text-fg tabular">
										{fmt(skill.years)} · {LEVEL_LABEL[skill.level]}
									</span>
									<span class="mt-1.5 block text-fg-muted">関連する実績</span>
									{#each skill.works as slug (slug)}
										{#if titleOf.get(slug)}
											<span class="block text-fg">{titleOf.get(slug)}</span>
										{/if}
									{/each}
								</span>
							{/if}
						</div>
						<span class="skill-value tabular">{fmt(skill.years)}</span>
						{#if skill.works?.length}
							<span id={tipId} class="sr-only">
								関連する実績: {skill.works
									.map((s) => titleOf.get(s))
									.filter(Boolean)
									.join('、')}
							</span>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<!-- 目盛り（全グループ共通） -->
	<div class="skill-axis mt-3" aria-hidden="true">
		<span></span>
		<div class="relative h-4 font-mono text-[0.6875rem] text-fg-muted">
			{#each ticks as t (t)}
				<span class="absolute -translate-x-1/2 tabular" style="left: {(t / max) * 100}%">{t}</span>
			{/each}
		</div>
		<span class="font-mono text-[0.6875rem] text-fg-muted">年</span>
	</div>
</div>
<p class="mt-8 text-xs leading-relaxed text-fg-muted">
	バーの長さは実務経験年数、スキル名の横は習熟度（{LEVEL_LABEL[1]} / {LEVEL_LABEL[2]} /
	{LEVEL_LABEL[3]}）です。バーにカーソルを合わせる（またはフォーカスする）と、そのスキルを使った実績が表示されます。
</p>

<style>
	/* 名前 | バー | 値。スマホでは名前を上の行に置く */
	.skill-row,
	.skill-axis {
		display: grid;
		grid-template-columns: 1fr 4.5rem;
		column-gap: 1rem;
		align-items: center;
	}
	.skill-row {
		position: relative;
		padding-block: 0.625rem 0.25rem;
		border-radius: 0.375rem;
		outline-offset: 2px;
		transition: background-color var(--dur-fast) var(--ease-out);
	}
	.skill-name {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: 0.75rem;
	}
	.skill-axis > span:first-child {
		display: none;
	}
	@media (min-width: 48rem) {
		.skill-row,
		.skill-axis {
			grid-template-columns: minmax(16rem, 27rem) 1fr 4.5rem;
			column-gap: 1.5rem;
		}
		.skill-row {
			padding-block: 0;
		}
		.skill-name {
			grid-column: auto;
			justify-content: space-between;
			padding-block: 0.6875rem;
		}
		.skill-axis > span:first-child {
			display: block;
		}
	}
	.skill-row:hover,
	.skill-row:focus-visible {
		background-color: var(--surface-2);
	}

	/* 1 年ごとの目盛り線（行をまたいで連続して見える） */
	.skill-track {
		position: relative;
		align-self: stretch;
		min-height: 2rem;
		display: flex;
		align-items: center;
		background-image: linear-gradient(to right, var(--line) 1px, transparent 1px);
		background-size: calc(100% / var(--max)) 100%;
		box-shadow: inset -1px 0 0 var(--line);
	}
	/* 細いバー。付け根は四角、先端だけ 4px 丸める */
	.skill-bar {
		display: block;
		height: 0.625rem;
		border-radius: 0 4px 4px 0;
		background: var(--chart-bar);
		transform-origin: left center;
		transition: filter var(--dur-fast) var(--ease-out);
	}
	.skill-row:hover .skill-bar,
	.skill-row:focus-visible .skill-bar {
		filter: brightness(1.12) saturate(1.1);
	}
	.skill-value {
		text-align: right;
		font-size: 0.875rem;
	}

	/* スクロールで画面に入ったら、上から順にバーが伸びる */
	@media (prefers-reduced-motion: no-preference) {
		:global(.js) .skill-chart:not([data-revealed]) .skill-bar {
			scale: 0 1;
		}
		.skill-bar {
			transition:
				scale 900ms var(--ease-out) calc(var(--i) * 45ms + 150ms),
				filter var(--dur-fast) var(--ease-out);
		}
	}

	/* ツールチップ: 値が先、関連する実績が後 */
	.skill-tip {
		position: absolute;
		bottom: calc(100% - 0.25rem);
		z-index: 10;
		width: max-content;
		max-width: 18rem;
		translate: -50% 4px;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		background: var(--bg);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
		font-size: 0.75rem;
		line-height: 1.6;
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--dur-fast) var(--ease-out),
			translate var(--dur-fast) var(--ease-out),
			visibility 0s linear var(--dur-fast);
	}
	.skill-row:hover .skill-tip,
	.skill-row:focus-visible .skill-tip {
		opacity: 1;
		visibility: visible;
		translate: -50% 0;
		transition-delay: 0s;
	}
</style>
