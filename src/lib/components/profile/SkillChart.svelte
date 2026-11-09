<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { LEVEL_LABEL, type Skill, type SkillGroup } from '#lib/content/profile.ts';
	import type { WorkMeta } from '#lib/types/work.ts';

	let { groups, works }: { groups: SkillGroup[]; works: WorkMeta[] } = $props();

	const titles = $derived(Object.fromEntries(works.map((w) => [w.slug, w.title])));

	/** レーダーの軸 = 主軸スキル（core の順に、上から時計回り） */
	const axes = $derived(
		groups
			.flatMap((g) => g.items)
			.filter((s): s is Skill & { core: number } => s.core !== undefined)
			.toSorted((a, b) => a.core - b.core)
	);
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
  スキルのレーダーチャート。外側ほど習熟度が高い（3 段階）。
  細い補助線は Hero の設計図、グラデーションの線は実績カード・強みの円と同じトーン。
  ラベルにカーソルを合わせると、習熟度・実務年数・関連する実績が出る。
  スクリーンリーダーには同じ内容をリストで渡す。
-->
<div
	class="skill-chart grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,42rem)_1fr]"
	use:reveal
>
	<div class="radar-wrap">
		<div class="radar">
			<svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
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
						<line x1="0" y1="0" x2={x} y2={y} />
					{/each}
				</g>

				<!-- 習熟度の形 -->
				<polygon class="radar-shape" points={shape} />
				{#each axes as skill, i (skill.name)}
					{@const [x, y] = pt(i, (R * skill.level) / 3)}
					<circle class="radar-dot" cx={x} cy={y} r="1.1" style="--i: {i}" />
				{/each}
			</svg>

			{#each axes as skill, i (skill.name)}
				<div class="radar-label" style={labelStyle(i)} aria-hidden="true">
					<span class="radar-name">{skill.short ?? skill.name}</span>
					<span class="radar-tip">
						<span class="block font-semibold text-fg">{skill.name}</span>
						<span class="mt-1 block text-fg-muted">
							{LEVEL_LABEL[skill.level]} · 実務 {fmt(skill.years)}
						</span>
						{#each (skill.works ?? []).filter((s) => titles[s]) as slug (slug)}
							<span class="mt-1 block text-fg">{titles[slug]}</span>
						{/each}
					</span>
				</div>
			{/each}

			<!-- 輪の目盛り（上の軸に沿って、内側から 基礎 → 実務で自走 → リード・設計可能） -->
			{#each [1, 2, 3] as l (l)}
				<span
					class="radar-scale"
					style="left: calc(50% + 0.5rem); top: {50 - (R * l) / 3}%"
					aria-hidden="true">{LEVEL_LABEL[l as 1 | 2 | 3]}</span
				>
			{/each}
		</div>
	</div>

	<!-- 読み上げ用（チャートと同じ内容） -->
	<ul class="sr-only">
		{#each axes as skill (skill.name)}
			<li>{skill.name}: {LEVEL_LABEL[skill.level]}、実務 {fmt(skill.years)}</li>
		{/each}
	</ul>

	<div>
		<p class="eyebrow">Core skills</p>
		<p class="mt-4 text-lead leading-relaxed">Svelte・Vue.js を中心に、設計から演出の実装まで。</p>
		<p class="mt-3 text-xs text-fg-muted">
			外側ほど習熟度が高い（3 段階）。軸の名前にカーソルを合わせると、実務年数と実績が出ます。
		</p>

		<p class="eyebrow mt-12">Also</p>
		<ul class="mt-4 flex flex-wrap gap-1.5" aria-label="そのほかのスキル">
			{#each others as name (name)}
				<li class="tag-label">{name}</li>
			{/each}
		</ul>
	</div>
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
	}
	@media (min-width: 48rem) {
		.radar-label {
			font-size: 0.875rem;
		}
	}

	/* ツールチップ（マウスのとき） */
	.radar-tip {
		position: absolute;
		left: 50%;
		bottom: calc(100% + 0.25rem);
		z-index: 10;
		width: max-content;
		max-width: 16rem;
		translate: -50% 4px;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		background: var(--bg);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.6;
		white-space: normal;
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--dur-fast) var(--ease-out),
			translate var(--dur-fast) var(--ease-out),
			visibility 0s linear var(--dur-fast);
	}
	.radar-label:hover .radar-tip {
		opacity: 1;
		visibility: visible;
		translate: -50% 0;
		transition-delay: 0s;
	}
	.radar-label:hover .radar-name {
		text-decoration: underline;
		text-decoration-color: var(--edge-3);
		text-underline-offset: 0.3em;
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
		.radar-scale {
			transition: opacity 600ms var(--ease-out) 300ms;
		}
		.radar-label {
			transition: opacity 600ms var(--ease-out) calc(500ms + var(--i) * 60ms);
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
