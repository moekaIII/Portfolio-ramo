<script lang="ts">
	import Braces from '@lucide/svelte/icons/braces';
	import CodeXml from '@lucide/svelte/icons/code-xml';
	import Database from '@lucide/svelte/icons/database';
	import Flame from '@lucide/svelte/icons/flame';
	import PenTool from '@lucide/svelte/icons/pen-tool';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Triangle from '@lucide/svelte/icons/triangle';
	import Workflow from '@lucide/svelte/icons/workflow';
	import { reveal } from '#lib/actions/reveal.ts';
	import {
		LEVEL_LABEL,
		type Skill,
		type SkillGroup,
		type SkillIcon
	} from '#lib/content/profile.ts';

	let { groups }: { groups: SkillGroup[] } = $props();

	const ICONS = {
		svelte: Flame,
		vue: Triangle,
		ts: Braces,
		motion: Sparkles,
		markup: CodeXml,
		cms: Database,
		platform: Workflow,
		design: PenTool
	} satisfies Record<SkillIcon, unknown>;

	/** リストとチャートで、いまカーソルが乗っている主軸スキル */
	let active: string | null = $state(null);

	/** レーダーの軸 = 主軸スキル（core の順に、上から時計回り） */
	const axes = $derived(
		groups
			.flatMap((g) => g.items)
			.filter((s): s is Skill & { core: number } => s.core !== undefined)
			.toSorted((a, b) => a.core - b.core)
	);
	/** 左のリスト: 得意な順（習熟度の高い順、同じなら軸の順） */
	const ranked = $derived(axes.toSorted((a, b) => b.level - a.level || a.core - b.core));
	/** そのほかのスキル（名前だけをチップで） */
	const others = $derived([
		...new Set(
			groups.flatMap((g) => g.items.filter((s) => s.core === undefined).map((s) => s.name))
		)
	]);

	// viewBox は中心が原点の -50〜50。1 単位 = 箱の 1%
	const R = 40; // 外周（= 習熟度 3）
	const LABEL_R = 46;
	const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
	const pt = (i: number, r: number) => [r * Math.cos(angle(i)), r * Math.sin(angle(i))] as const;
	const ring = (r: number) =>
		axes
			.map((_, i) =>
				pt(i, r)
					.map((v) => v.toFixed(2))
					.join(',')
			)
			.join(' ');
	const shape = $derived(
		axes
			.map((s, i) =>
				pt(i, (R * s.level) / 3)
					.map((v) => v.toFixed(2))
					.join(',')
			)
			.join(' ')
	);

	/** ラベルの置き方（円の外側へ寄せる） */
	function labelStyle(i: number) {
		const [x, y] = pt(i, LABEL_R);
		const c = Math.cos(angle(i));
		const s = Math.sin(angle(i));
		const tx = Math.abs(c) < 0.3 ? '-50%' : c > 0 ? '0%' : '-100%';
		const ty = Math.abs(s) < 0.3 ? '-50%' : s > 0 ? '0%' : '-100%';
		return `left: ${50 + x}%; top: ${50 + y}%; translate: ${tx} ${ty}; --i: ${i}`;
	}
	const fmt = (y: number) => (y < 1 ? '1年未満' : `${y}年`);
</script>

<!--
  スキル。左に得意な順のリスト（アイコン・名前・担当範囲・経験年数）、右にレーダーチャート。
  レーダーは外側ほど習熟度が高い（3 段階）。細い補助線は Hero の設計図、
  グラデーションの線は実績カード・強みの円と同じトーン。
  リストの行とチャートの軸は、カーソルを合わせると互いにハイライトする。
-->
<div class="skill-chart" use:reveal>
	<div class="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
		<ol class="skill-list" aria-label="主軸スキル（得意な順）">
			{#each ranked as skill, i (skill.name)}
				{@const Icon = ICONS[skill.icon ?? 'markup']}
				<li
					class="skill-row"
					class:is-active={active === skill.name}
					style="--i: {i}"
					onpointerenter={() => (active = skill.name)}
					onpointerleave={() => (active = null)}
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

		<div class="radar-wrap" aria-hidden="true">
			<div class="radar">
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

					<!-- 設計図の補助線: 3 段階の輪と、中心からの軸 -->
					<g class="radar-grid">
						{#each [1, 2, 3] as l (l)}
							<polygon points={ring((R * l) / 3)} />
						{/each}
						{#each axes as skill, i (skill.name)}
							{@const [x, y] = pt(i, R)}
							<line x1="0" y1="0" x2={x} y2={y} class:is-active={active === skill.name} />
						{/each}
					</g>

					<!-- 習熟度の形 -->
					<polygon class="radar-shape" points={shape} />
					{#each axes as skill, i (skill.name)}
						{@const [x, y] = pt(i, (R * skill.level) / 3)}
						<circle
							class="radar-dot"
							class:is-active={active === skill.name}
							cx={x}
							cy={y}
							r="1.1"
							style="--i: {i}"
						/>
					{/each}
				</svg>

				{#each axes as skill, i (skill.name)}
					<!-- 見た目だけの連動（チャートごと aria-hidden。同じ内容は左のリストにある） -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span
						class="radar-label"
						class:is-active={active === skill.name}
						style={labelStyle(i)}
						onpointerenter={() => (active = skill.name)}
						onpointerleave={() => (active = null)}>{skill.short ?? skill.name}</span
					>
				{/each}

				<!-- 輪の目盛り（上の軸に沿って、内側から 基礎 → 実務で自走 → リード・設計可能） -->
				{#each [1, 2, 3] as l (l)}
					<span class="radar-scale" style="left: calc(50% + 0.5rem); top: {50 - (R * l) / 3}%"
						>{LEVEL_LABEL[l as 1 | 2 | 3]}</span
					>
				{/each}
			</div>
			<p class="mt-6 text-center text-xs text-fg-muted">外側ほど習熟度が高い（3 段階）</p>
		</div>
	</div>

	{#if others.length}
		<div class="mt-16">
			<p class="eyebrow">Also</p>
			<ul class="mt-4 flex flex-wrap gap-1.5" aria-label="そのほかのスキル">
				{#each others as name (name)}
					<li class="tag-label">{name}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	/* ラベルが外にはみ出せるよう、チャートの周りに余白を取る */
	.radar-wrap {
		padding: 1.75rem 4rem;
	}
	@media (min-width: 48rem) {
		.radar-wrap {
			padding: 2.25rem 4.5rem;
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
	.skill-years {
		padding-top: 0.125rem;
		font-family: var(--font-terminal);
		font-size: 0.875rem;
		color: var(--fg-muted);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	/* 輪の目盛り。上の軸の右に小さく */
	.radar-scale {
		position: absolute;
		translate: 0 -115%;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		background: color-mix(in oklab, var(--bg) 85%, transparent);
		font-family: var(--font-terminal);
		font-size: 0.625rem;
		line-height: 1;
		color: var(--fg-muted);
		white-space: nowrap;
		pointer-events: none;
	}
	.tag-label {
		border: 1px solid var(--line);
		border-radius: 999px;
		background: color-mix(in oklab, var(--surface-2) 70%, transparent);
		padding: 0.25rem 0.625rem;
		font-size: 0.6875rem;
		line-height: 1.4;
		color: var(--fg-muted);
		white-space: nowrap;
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
		.radar-scale {
			transition: opacity 600ms var(--ease-out) 300ms;
		}
		.radar-label {
			transition: opacity 600ms var(--ease-out) calc(500ms + var(--i) * 60ms);
		}
		.skill-row {
			transition:
				opacity 600ms var(--ease-out) calc(var(--i) * 70ms),
				translate 600ms var(--ease-out) calc(var(--i) * 70ms),
				background-color var(--dur-fast) var(--ease-out);
		}
		:global(.js) .skill-chart:not([data-revealed]) .skill-row {
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
		:global(.js) .skill-chart:not([data-revealed]) .radar-scale,
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
