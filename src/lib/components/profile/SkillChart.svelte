<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import SkillGlyph from './SkillGlyph.svelte';
	import {
		AREA_LEVEL_LABEL,
		AREA_MAX,
		LEVEL_LABEL,
		type SkillArea,
		type SkillAreaId,
		type Skill,
		type SkillGroup
	} from '#lib/content/profile.ts';

	let { groups, areas }: { groups: SkillGroup[]; areas: SkillArea[] } = $props();

	/**
	 * いま active なもの。スキル（行）か、領域（チャートの軸）のどちらか。
	 * - スキルが active: その行と、属する領域の軸（複数可）がハイライト
	 * - 領域が active: その軸と、その領域に属するスキルがすべてハイライト
	 */
	type Target = { skill: string } | { area: SkillAreaId };
	/** 何も操作していないときは「フロントエンド実装」を active にしておく */
	const DEFAULT: Target = { area: 'frontend' };
	let active: Target | null = $state(DEFAULT);
	const areasOf = (s: Skill): SkillAreaId[] => (s.area === undefined ? [] : [s.area].flat());
	const skillOn = (s: Skill) =>
		active !== null &&
		('skill' in active ? active.skill === s.name : areasOf(s).includes(active.area));
	/** active なスキルが属する領域（領域が active ならその 1 つ） */
	const activeAreas = $derived.by((): SkillAreaId[] => {
		if (active === null) return [];
		if ('area' in active) return [active.area];
		const name = active.skill;
		const skill = ranked.find((s) => s.name === name);
		return skill ? areasOf(skill) : [];
	});
	const areaOn = (id: SkillAreaId) => activeAreas.includes(id);
	const same = (a: Target | null, b: Target) => JSON.stringify(a) === JSON.stringify(b);

	// マウスはホバーで、タッチ（SP）はタップで active を切り替える
	const on = (t: Target) => (e: PointerEvent) => {
		if (e.pointerType === 'mouse') active = t;
	};
	const off = (e: PointerEvent) => {
		if (e.pointerType === 'mouse') active = DEFAULT;
	};
	/** 直前の操作がマウスか（click には pointerType が付かないブラウザがあるため、pointerdown で覚える） */
	let mouse = false;
	const down = (e: PointerEvent) => (mouse = e.pointerType === 'mouse');
	const tap = (t: Target) => () => {
		if (mouse) return;
		active = same(active, t) ? DEFAULT : t;
	};

	/**
	 * 左のリスト: skills の全項目。
	 * core のあるもの（core の順）を先頭に。残りは order の順 → 習熟度 → 経験年数の順
	 */
	const ranked = $derived(
		groups
			.flatMap((g) => g.items)
			.toSorted(
				(a, b) =>
					(a.core ?? Infinity) - (b.core ?? Infinity) ||
					(a.order ?? Infinity) - (b.order ?? Infinity) ||
					b.level - a.level ||
					b.years - a.years
			)
	);
	/** 大きく出すのは core のある 6 つまで。残りは下に小さく横並び（order の順） */
	const TOP = 6;
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
	<div
		class="grid items-center gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,42rem)]"
	>
		<ol class="skill-list" aria-label="主なスキル（得意な順）">
			{#each top as skill, i (skill.name)}
				<!-- タップでのハイライトは見た目の補助（同じ内容は文字で読める）。キーボード操作は不要 -->
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
				<li
					class="skill-row"
					class:is-active={skillOn(skill)}
					style="--i: {i}"
					onpointerenter={on({ skill: skill.name })}
					onpointerleave={off}
					onpointerdown={down}
					onclick={tap({ skill: skill.name })}
				>
					<span class="skill-icon" aria-hidden="true"
						><SkillGlyph icon={skill.icon ?? 'cms'} size={18} /></span
					>
					<div class="min-w-0">
						<h3 class="text-base leading-snug font-semibold">{skill.name}</h3>
						{#if skill.scope}
							<p class="mt-1 text-xs leading-relaxed text-fg-muted">{skill.scope}</p>
						{/if}
						<span class="sr-only">習熟度: {LEVEL_LABEL[skill.level]}</span>
					</div>
					<p class="skill-years">
						<span class="sr-only">経験</span>{fmt(skill.years)}
					</p>
				</li>
			{/each}
		</ol>

		<!-- SP では一番上に -->
		<figure class="radar-wrap order-first lg:order-none">
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
							<line x1="0" y1="0" x2={x} y2={y} class:is-active={areaOn(area.id)} />
						{/each}
					</g>
				</svg>

				<!--
				  領域ごとのバランス。表示時に中心から広がるよう、別の層にして HTML 要素ごと拡大する
				  （SVG 内の transform-origin はブラウザで基準がずれるため）
				-->
				<svg class="radar-layer" viewBox="-50 -50 100 100" focusable="false">
					<polygon class="radar-shape" points={shape} />
					{#each areas as area, i (area.id)}
						{@const [x, y] = pt(i, (R * area.score) / AREA_MAX)}
						<!-- active 時に頂点から広がる波紋 -->
						<circle class="radar-pulse" class:is-active={areaOn(area.id)} cx={x} cy={y} r="0.9" />
						<circle
							class="radar-dot"
							class:is-active={areaOn(area.id)}
							cx={x}
							cy={y}
							r="0.9"
							style="--i: {i}"
						/>
					{/each}
				</svg>

				{#each areas as area, i (area.id)}
					<!-- 見た目だけの連動（チャートごと aria-hidden。同じ内容は下の読み上げ用リストにある） -->
					<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
					<span
						class="radar-label"
						class:is-active={areaOn(area.id)}
						style={labelStyle(i)}
						onpointerenter={on({ area: area.id })}
						onpointerleave={off}
						onpointerdown={down}
						onclick={tap({ area: area.id })}
						>{#each area.label.split('・') as part, k (k)}<span class="block"
								>{part}{#if k < area.label.split('・').length - 1}・{/if}</span
							>{/each}</span
					>
				{/each}

				<!-- active の点の右横に、スコアの説明 -->
				{#each areas as area, i (area.id)}
					{@const [x, y] = pt(i, (R * area.score) / AREA_MAX)}
					<span
						class="radar-level"
						class:is-active={areaOn(area.id)}
						style="left: {50 + x}%; top: {50 + y}%"
						>Lv.{area.score} {AREA_LEVEL_LABEL[area.score]}</span
					>
				{/each}
			</div>
			<figcaption class="sr-only">
				領域ごとのバランス
				<ul>
					{#each areas as area (area.id)}
						<li>
							{area.label}: {AREA_MAX} 段階中 {area.score}（{AREA_LEVEL_LABEL[area.score]}）
						</li>
					{/each}
				</ul>
			</figcaption>
		</figure>
	</div>

	{#if rest.length}
		<ul class="skill-rest" aria-label="そのほかのスキル">
			{#each rest as skill, i (skill.name)}
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
				<li
					class="skill-chip"
					class:is-active={skillOn(skill)}
					style="--i: {TOP + i}"
					onpointerenter={on({ skill: skill.name })}
					onpointerleave={off}
					onpointerdown={down}
					onclick={tap({ skill: skill.name })}
				>
					<span class="skill-icon is-sm" aria-hidden="true"
						><SkillGlyph icon={skill.icon ?? 'cms'} size={14} /></span
					>
					<span class="min-w-0">
						<span class="text-sm font-semibold">{skill.short ?? skill.name}</span>
						<span class="sr-only">習熟度: {LEVEL_LABEL[skill.level]}、経験</span>
						<span class="skill-years ml-1.5 text-xs">{fmt(skill.years)}</span>
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	/* ラベルが外にはみ出せるよう、チャートの周りに余白を取る */
	/* 軸の名前が外にはみ出せるよう、チャートの周りに余白を取る（名前は「・」で 2 行に折る） */
	.radar-wrap {
		padding: 1.75rem 4.75rem;
	}
	@media (min-width: 48rem) {
		.radar-wrap {
			padding: 2.25rem 5.5rem;
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
	}
	.radar-layer {
		position: absolute;
		inset: 0;
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

	/*
	  ハイライト（active）のキーカラーは、Hero の花の茎の色（3D の茎テクスチャ・フォールバック SVG と同じ緑）。
	  ダークは 3D と同じく少し暗くする
	*/
	.skill-chart {
		--stem: #8aa673;
		--stem-tint: color-mix(in oklab, var(--stem) 10%, transparent);
	}
	:global([data-theme='light']) .skill-chart {
		--stem: #93b07a;
		--stem-tint: color-mix(in oklab, var(--stem) 8%, transparent);
	}

	/* 対応するリストの行にカーソルがあるとき */
	.radar-label.is-active {
		color: var(--fg);
		text-decoration: underline;
		text-decoration-color: var(--stem);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.3em;
	}
	.radar-grid line.is-active {
		stroke: var(--stem);
		stroke-opacity: 1;
		stroke-width: 0.4;
		stroke-dasharray: none;
	}
	/* active の点の右横に出す、スコアの説明 */
	.radar-level {
		position: absolute;
		z-index: 2;
		translate: 0.875rem -50%;
		padding: 0.25rem 0.5rem;
		border: 1px solid color-mix(in oklab, var(--stem) 55%, transparent);
		border-radius: 999px;
		background: var(--bg);
		font-family: var(--font-terminal);
		font-size: 0.6875rem;
		line-height: 1.2;
		color: var(--fg);
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transition:
			opacity var(--dur-fast) var(--ease-out),
			translate var(--dur-fast) var(--ease-out);
	}
	.radar-level.is-active {
		opacity: 1;
		translate: 1.125rem -50%;
	}

	/* active の頂点: 波紋が繰り返し広がり、点は少し弾んで大きくなる */
	.radar-pulse {
		fill: none;
		stroke: var(--stem);
		stroke-width: 0.5;
		opacity: 0;
		transform-box: fill-box;
		transform-origin: center;
		pointer-events: none;
	}
	@media (prefers-reduced-motion: no-preference) {
		.radar-pulse.is-active {
			animation: radar-pulse 1400ms var(--ease-out) infinite;
		}
		.radar-dot.is-active {
			animation: radar-pop 450ms var(--ease-out);
		}
	}
	@keyframes radar-pulse {
		from {
			opacity: 0.9;
			scale: 1;
		}
		to {
			opacity: 0;
			scale: 2.6;
		}
	}
	@keyframes radar-pop {
		0% {
			scale: 1;
		}
		50% {
			scale: 1.3;
		}
		100% {
			scale: 1;
		}
	}
	.radar-dot.is-active {
		fill: var(--stem);
		stroke: var(--stem);
		scale: 1;
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
		padding: 1rem 1rem;
		border-bottom: 1px solid var(--line);
		transition: background-color var(--dur-fast) var(--ease-out);
	}
	.skill-row.is-active {
		background: var(--stem-tint);
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
	/* active 時はアイコンの背景を白に（ダークでも白。アイコンの線は濃い色にして読めるように） */
	.is-active .skill-icon {
		background: #ffffff;
		color: #1c1917;
	}
	.skill-icon {
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
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
	/* 同じ幅の列に並べて、縦のツラ（左端）を揃える。長い名前は列の中で折り返す */
	.skill-rest {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem 1rem;
		margin-top: 2rem;
	}
	@media (min-width: 48rem) {
		.skill-rest {
			grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
			gap: 0.5rem 1.5rem;
		}
	}
	.skill-chip {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem 0.25rem 0.25rem;
		border-radius: 1.25rem;
		line-height: 1.4;
		transition: background-color var(--dur-fast) var(--ease-out);
	}
	.skill-chip.is-active {
		background: var(--stem-tint);
	}
	.skill-icon.is-sm {
		flex-shrink: 0;
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
		.radar-layer {
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
		:global(.js) .skill-chart:not([data-revealed]) .radar-layer {
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
