<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import Braces from '@lucide/svelte/icons/braces';
	import ChartLine from '@lucide/svelte/icons/chart-line';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Plug from '@lucide/svelte/icons/plug';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import SquareCode from '@lucide/svelte/icons/square-code';
	import CodeXml from '@lucide/svelte/icons/code-xml';
	import Database from '@lucide/svelte/icons/database';
	import Flame from '@lucide/svelte/icons/flame';
	import PenTool from '@lucide/svelte/icons/pen-tool';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Triangle from '@lucide/svelte/icons/triangle';
	import Workflow from '@lucide/svelte/icons/workflow';
	import { reveal } from '#lib/actions/reveal.ts';
	import {
		AREA_MAX,
		LEVEL_LABEL,
		type SkillArea,
		type SkillAreaId,
		type SkillGroup,
		type SkillIcon
	} from '#lib/content/profile.ts';

	let { groups, areas }: { groups: SkillGroup[]; areas: SkillArea[] } = $props();

	const ICONS = {
		svelte: Flame,
		vue: Triangle,
		ts: Braces,
		motion: Sparkles,
		markup: CodeXml,
		cms: Database,
		platform: Workflow,
		design: PenTool,
		js: SquareCode,
		ai: Bot,
		chart: ChartLine,
		api: Plug,
		ci: GitBranch,
		mobile: Smartphone,
		teach: GraduationCap
	} satisfies Record<SkillIcon, unknown>;

	/** いまカーソルが乗っている領域。リストの行とチャートの軸が連動してハイライトする */
	let active: SkillAreaId | null = $state(null);
	const on = (area: SkillAreaId | undefined) => () => (active = area ?? null);
	const off = () => (active = null);

	/**
	 * 左のリスト: skills の全項目。
	 * core のあるもの（core の順）を先頭に。残りは習熟度の高い順 → 経験年数の長い順
	 */
	const ranked = $derived(
		groups
			.flatMap((g) => g.items)
			.toSorted(
				(a, b) =>
					(a.core ?? Infinity) - (b.core ?? Infinity) || b.level - a.level || b.years - a.years
			)
	);
	/** 大きく出すのは上位 5 つまで。残りは下に小さく横並び */
	const TOP = 5;
	const top = $derived(ranked.slice(0, TOP));
	const rest = $derived(ranked.slice(TOP));

	// レーダー: 軸 = 領域（上から時計回り）。viewBox は中心が原点の -50〜50
	const R = 40; // 外周（= AREA_MAX）
	const LABEL_R = 46;
	const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / areas.length;
	const pt = (i: number, r: number) => [r * Math.cos(angle(i)), r * Math.sin(angle(i))] as const;
	const poly = (radius: (i: number) => number) =>
		areas
			.map((_, i) =>
				pt(i, radius(i))
					.map((v) => v.toFixed(2))
					.join(',')
			)
			.join(' ');
	const rings = Array.from({ length: AREA_MAX }, (_, k) => k + 1);
	const shape = $derived(poly((i) => (R * areas[i].score) / AREA_MAX));

	/** ラベルの置き方（円の外側へ寄せる） */
	function labelStyle(i: number) {
		const [x, y] = pt(i, LABEL_R);
		const c = Math.cos(angle(i));
		const s = Math.sin(angle(i));
		const tx = Math.abs(c) < 0.3 ? '-50%' : c > 0 ? '0%' : '-100%';
		const ty = Math.abs(s) < 0.3 ? '-50%' : s > 0 ? '0%' : '-100%';
		const align = Math.abs(c) < 0.3 ? 'center' : c > 0 ? 'left' : 'right';
		return `left: ${50 + x}%; top: ${50 + y}%; translate: ${tx} ${ty}; text-align: ${align}; --i: ${i}`;
	}
	const fmt = (y: number) => (y < 1 ? '1年未満' : `${y}年`);
</script>

<!--
  スキル。左に詳細なスキルを得意な順に（アイコン・名前・担当範囲・経験年数）、
  右に大きな領域ごとのバランスをレーダーチャートで。
  細い補助線は Hero の設計図、グラデーションの線は実績カード・強みの円と同じトーン。
  スキルとその領域は、カーソルを合わせると互いにハイライトする。
-->
<div class="skill-chart" use:reveal>
	<div class="grid items-center gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
		<ol class="skill-list" aria-label="主なスキル（得意な順）">
			{#each top as skill, i (skill.name)}
				{@const Icon = ICONS[skill.icon ?? 'markup']}
				<li
					class="skill-row"
					class:is-active={active !== null && skill.area === active}
					style="--i: {i}"
					onpointerenter={on(skill.area)}
					onpointerleave={off}
				>
					<span class="skill-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.6} /></span>
					<div class="min-w-0">
						<h3 class="text-base leading-snug font-semibold">{skill.name}</h3>
						{#if skill.scope}
							<p class="mt-1 text-sm leading-relaxed text-fg-muted">{skill.scope}</p>
						{/if}
						<span class="sr-only">習熟度: {LEVEL_LABEL[skill.level]}</span>
					</div>
					<p class="skill-years">
						<span class="sr-only">経験</span>{fmt(skill.years)}
					</p>
				</li>
			{/each}
		</ol>

		<figure class="radar-wrap">
			<div class="radar" aria-hidden="true">
				<svg viewBox="-50 -50 100 100" focusable="false">
					<defs>
						<linearGradient id="radar-stroke" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" style="stop-color: var(--edge-1)" />
							<stop offset="0.35" style="stop-color: var(--edge-2)" />
							<stop offset="0.6" style="stop-color: var(--edge-3)" />
							<stop offset="0.8" style="stop-color: var(--edge-4)" />
							<stop offset="1" style="stop-color: var(--edge-5)" />
						</linearGradient>
						<radialGradient id="radar-fill" cx="0.5" cy="0.5" r="0.6">
							<stop offset="0" style="stop-color: var(--edge-3); stop-opacity: 0.22" />
							<stop offset="0.6" style="stop-color: var(--edge-2); stop-opacity: 0.16" />
							<stop offset="1" style="stop-color: var(--edge-1); stop-opacity: 0.12" />
						</radialGradient>
					</defs>

					<!-- 設計図の補助線: 段階ごとの輪と、中心からの軸 -->
					<g class="radar-grid">
						{#each rings as l (l)}
							<polygon points={poly(() => (R * l) / AREA_MAX)} />
						{/each}
						{#each areas as area, i (area.id)}
							{@const [x, y] = pt(i, R)}
							<line x1="0" y1="0" x2={x} y2={y} class:is-active={active === area.id} />
						{/each}
					</g>

					<!-- 領域ごとのバランス -->
					<polygon class="radar-shape" points={shape} />
					{#each areas as area, i (area.id)}
						{@const [x, y] = pt(i, (R * area.score) / AREA_MAX)}
						<circle
							class="radar-dot"
							class:is-active={active === area.id}
							cx={x}
							cy={y}
							r="1.1"
							style="--i: {i}"
						/>
					{/each}
				</svg>

				{#each areas as area, i (area.id)}
					<!-- 見た目だけの連動（チャートごと aria-hidden。同じ内容は下の読み上げ用リストにある） -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span
						class="radar-label"
						class:is-active={active === area.id}
						style={labelStyle(i)}
						onpointerenter={on(area.id)}
						onpointerleave={off}
						>{#each area.label.split('・') as part, k (k)}<span class="block"
								>{part}{#if k < area.label.split('・').length - 1}・{/if}</span
							>{/each}</span
					>
				{/each}
			</div>
			<figcaption class="mt-6 text-center text-xs text-fg-muted">
				外側ほど得意
				<ul class="sr-only">
					{#each areas as area (area.id)}
						<li>{area.label}: {AREA_MAX} 段階中 {area.score}</li>
					{/each}
				</ul>
			</figcaption>
		</figure>
	</div>

	{#if rest.length}
		<ul class="skill-rest" aria-label="そのほかのスキル">
			{#each rest as skill, i (skill.name)}
				{@const Icon = ICONS[skill.icon ?? 'markup']}
				<li
					class="skill-chip"
					class:is-active={active !== null && skill.area === active}
					style="--i: {TOP + i}"
					onpointerenter={on(skill.area)}
					onpointerleave={off}
				>
					<span class="skill-icon is-sm" aria-hidden="true"
						><Icon size={14} strokeWidth={1.6} /></span
					>
					<span class="text-sm font-semibold">{skill.short ?? skill.name}</span>
					<span class="sr-only">習熟度: {LEVEL_LABEL[skill.level]}、経験</span>
					<span class="skill-years text-xs">{fmt(skill.years)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	/* ラベルが外にはみ出せるよう、チャートの周りに余白を取る */
	/* 軸の名前が外にはみ出せるよう、チャートの周りに余白を取る（名前は「・」で 2 行に折る） */
	.radar-wrap {
		padding: 2.25rem 4.75rem;
	}
	@media (min-width: 48rem) {
		.radar-wrap {
			padding: 2.75rem 5.5rem;
		}
	}
	.radar {
		position: relative;
		aspect-ratio: 1;
	}
	.radar svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.radar-grid polygon,
	.radar-grid line {
		fill: none;
		stroke: var(--line-strong);
		stroke-opacity: 0.45;
		stroke-width: 0.18;
	}
	.radar-grid line {
		stroke-dasharray: 0.8 0.8;
	}
	.radar-shape {
		fill: url(#radar-fill);
		stroke: url(#radar-stroke);
		stroke-width: 0.45;
		stroke-linejoin: round;
		transform-box: view-box;
		transform-origin: 50% 50%;
	}
	.radar-dot {
		fill: var(--bg);
		stroke: url(#radar-stroke);
		stroke-width: 0.45;
		transform-box: fill-box;
		transform-origin: center;
	}

	.radar-label {
		position: absolute;
		width: max-content;
		padding: 0.25rem 0.375rem;
		font-family: var(--font-terminal);
		font-size: 0.75rem;
		line-height: 1.3;
		white-space: nowrap;
		cursor: default;
		color: var(--fg-muted);
	}
	@media (min-width: 48rem) {
		.radar-label {
			font-size: 0.875rem;
		}
	}

	/* 対応するリストの行にカーソルがあるとき */
	.radar-label.is-active {
		color: var(--fg);
		text-decoration: underline;
		text-decoration-color: var(--edge-3);
		text-underline-offset: 0.3em;
	}
	.radar-grid line.is-active {
		stroke: url(#radar-stroke);
		stroke-opacity: 1;
		stroke-width: 0.35;
		stroke-dasharray: none;
	}
	.radar-dot.is-active {
		scale: 1.6;
	}

	/* 左のリスト。1 行 = アイコン・名前と担当範囲・年数 */
	.skill-list {
		border-top: 1px solid var(--line);
	}
	.skill-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: start;
		gap: 1rem;
		padding: 1rem 0.25rem;
		border-bottom: 1px solid var(--line);
		transition: background-color var(--dur-fast) var(--ease-out);
	}
	.skill-row.is-active {
		background: color-mix(in oklab, var(--surface-2) 60%, transparent);
	}
	/* アイコンの円。強み・実績と同じグラデーションの縁 */
	.skill-icon {
		position: relative;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		color: var(--fg);
	}
	.skill-icon::before {
		content: '';
		position: absolute;
		inset: 0;
		border: 1px solid transparent;
		border-radius: inherit;
		background: var(--hero-edge) border-box;
		mask:
			linear-gradient(#000 0 0) padding-box exclude,
			linear-gradient(#000 0 0) border-box;
	}
	/* 6 つ目以降: 小さく横並び */
	.skill-rest {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.75rem;
		margin-top: 2rem;
		padding-inline: 0.25rem;
	}
	.skill-chip {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem 0.25rem 0;
		border-radius: 999px;
		transition: background-color var(--dur-fast) var(--ease-out);
	}
	.skill-chip.is-active {
		background: color-mix(in oklab, var(--surface-2) 60%, transparent);
	}
	.skill-icon.is-sm {
		width: 1.75rem;
		height: 1.75rem;
	}
	.skill-years {
		padding-top: 0.125rem;
		font-family: var(--font-terminal);
		font-size: 0.875rem;
		color: var(--fg-muted);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	/* 画面に入ったら: 補助線 → 形が中心から広がる → 頂点が順に灯る */
	@media (prefers-reduced-motion: no-preference) {
		.radar-grid {
			transition: opacity 700ms var(--ease-out);
		}
		.radar-shape {
			transition:
				scale 1100ms var(--ease-out) 300ms,
				opacity 600ms var(--ease-out) 300ms;
		}
		.radar-dot {
			transition: scale 500ms var(--ease-out) calc(900ms + var(--i) * 70ms);
		}
		:global(.js) .skill-chart:global([data-revealed]) .radar-dot {
			transition-delay: 0s;
			transition-duration: 300ms;
		}
		.radar-label {
			transition: opacity 600ms var(--ease-out) calc(500ms + var(--i) * 60ms);
		}
		.skill-row,
		.skill-chip {
			transition:
				opacity 600ms var(--ease-out) calc(var(--i) * 70ms),
				translate 600ms var(--ease-out) calc(var(--i) * 70ms),
				background-color var(--dur-fast) var(--ease-out);
		}
		:global(.js) .skill-chart:not([data-revealed]) .skill-row,
		:global(.js) .skill-chart:not([data-revealed]) .skill-chip {
			opacity: 0;
			translate: 0 10px;
		}
		:global(.js) .skill-chart:not([data-revealed]) .radar-grid {
			opacity: 0;
		}
		:global(.js) .skill-chart:not([data-revealed]) .radar-shape {
			scale: 0;
			opacity: 0;
		}
		:global(.js) .skill-chart:not([data-revealed]) .radar-dot {
			scale: 0;
		}
		:global(.js) .skill-chart:not([data-revealed]) .radar-label {
			opacity: 0;
		}
	}
	/* 共通の reveal（全体のフェード）は使わない */
	:global(.js) .skill-chart:global([data-reveal]) {
		opacity: 1;
		translate: none;
	}
</style>
