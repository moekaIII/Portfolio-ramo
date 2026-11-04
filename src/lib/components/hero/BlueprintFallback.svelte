<script lang="ts">
	import { ribbons } from '#lib/content/hero-ribbons.ts';

	/** 3D 版と同じ角度・大きさの帯（横長の構図） */
	const rows = [
		{ y: 290, angle: -7, size: 112 },
		{ y: 500, angle: 5, size: 88 },
		{ y: 690, angle: -2.5, size: 72 }
	];
	const lines = ribbons.map((r, i) => ({
		...rows[i],
		accent: r.accent,
		label: r.label,
		words: r.words
	}));
</script>

<!--
  3D が使えない / reduced-motion 時の静的表示。
  3D 版と同じ「スキル名の帯」を、左は設計図（輪郭線の文字＋方眼）、右は実物（塗りの文字）で描く。
  同じ帯を CSS 変数を切り替えて 2 回描き、境界線の左右で切り抜いている。
-->
<svg
	aria-hidden="true"
	class="absolute inset-0 h-full w-full"
	viewBox="0 0 1600 900"
	preserveAspectRatio="xMidYMid slice"
>
	<defs>
		<pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
			<path d="M40 0H0V40" fill="none" stroke="var(--line-strong)" stroke-opacity=".25" />
		</pattern>
		<clipPath id="bp-left"><rect x="0" y="0" width="860" height="900" /></clipPath>
		<clipPath id="bp-right"><rect x="860" y="0" width="740" height="900" /></clipPath>
		<g id="bp-ribbons">
			{#each lines as line (line.label)}
				<g transform="rotate({line.angle} 800 {line.y})">
					<text
						x="-120"
						y={line.y}
						font-size={line.size}
						class="bp-word"
						style={line.accent
							? 'fill: var(--pa); stroke: var(--psa)'
							: 'fill: var(--pf); stroke: var(--ps)'}
					>
						<tspan font-size={line.size * 0.34} class="bp-label">{line.label}</tspan>
						{#each line.words as word (word)}
							<!-- 区切り記号は 3D 版の正八面体に合わせて小さく -->
							<tspan dx={line.size * 0.45} font-size={line.size * 0.32} dy={-line.size * 0.12}
								>◆</tspan
							>
							<tspan dx={line.size * 0.45} dy={line.size * 0.12}>{word}</tspan>
						{/each}
					</text>
				</g>
			{/each}
		</g>
	</defs>

	<!-- 設計図（左）: 方眼 + 輪郭線の文字 -->
	<g clip-path="url(#bp-left)" class="bp-wire">
		<rect width="1600" height="900" fill="url(#bp-grid)" />
		<use href="#bp-ribbons" />
	</g>
	<!-- 実物（右）: 塗りの文字 -->
	<g clip-path="url(#bp-right)" class="bp-solid">
		<use href="#bp-ribbons" />
	</g>
	<!-- 境界線とタグ -->
	<line x1="860" y1="0" x2="860" y2="900" stroke="var(--accent-text)" stroke-width="2" />
	<text x="840" y="120" text-anchor="end" class="bp-tag" fill="var(--fg-muted)">DESIGN</text>
	<text x="880" y="120" class="bp-tag" fill="var(--accent-text)">BUILD</text>
</svg>

<style>
	.bp-wire {
		--pf: none;
		--pa: none;
		--ps: var(--fg-muted);
		--psa: var(--accent-text);
		stroke-width: 1.5px;
		stroke-opacity: 0.85;
	}
	.bp-solid {
		--pf: var(--surface-2);
		--pa: var(--accent);
		--ps: var(--line-strong);
		--psa: none;
		stroke-width: 1px;
	}
	.bp-word {
		font-family: var(--font-sans);
		font-weight: 700;
		letter-spacing: -0.02em;
		paint-order: stroke;
	}
	.bp-label {
		letter-spacing: 0.14em;
		font-weight: 600;
	}
	.bp-tag {
		font: 600 22px var(--font-sans);
		letter-spacing: 0.16em;
	}
</style>
