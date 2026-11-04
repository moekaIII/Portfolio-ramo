<script lang="ts">
	import { skillChips } from '#lib/content/hero-skills.ts';

	/** 3D 版と同じフリージアの構図（弓なりの茎に、先端へ向かって小さくなる花） */
	const STEM = 'M520 860 C 560 560, 760 300, 1060 270 S 1440 330, 1500 470';
	type Bloom = { x: number; y: number; r: number; tone: number; text?: string };
	const pts = [
		[690, 430],
		[790, 340],
		[900, 290],
		[1010, 268],
		[1120, 268],
		[1225, 285],
		[1320, 318],
		[1400, 365],
		[1455, 420],
		[1490, 470]
	];
	const pairs: { tone: number; text: string }[] = skillChips.map((c) => ({
		tone: c.group,
		text: c.text
	}));
	const blooms: Bloom[] = pts.map(([x, y], i) => ({
		x,
		y,
		r: 62 - i * 4.2,
		tone: pairs[i * 2]?.tone ?? 1,
		text: pairs[i * 2]?.text
	}));
	const petalPath = (r: number) =>
		`M0 0 C ${r * 0.45} ${-r * 0.25}, ${r * 0.45} ${-r * 0.85}, 0 ${-r} C ${-r * 0.45} ${-r * 0.85}, ${-r * 0.45} ${-r * 0.25}, 0 0Z`;
</script>

<!--
  3D が使えない / reduced-motion 時の静的表示。左は設計図（線）、右は実物（面）。
  同じ花を CSS 変数を切り替えて 2 回描き、境界線の左右で切り抜いている。
-->
<svg
	aria-hidden="true"
	class="absolute inset-0 h-full w-full"
	viewBox="0 0 1600 900"
	preserveAspectRatio="xMidYMid slice"
>
	<defs>
		<pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
			<path d="M40 0H0V40" fill="none" stroke="var(--line-strong)" stroke-opacity=".2" />
		</pattern>
		<clipPath id="bp-left"><rect x="0" y="0" width="900" height="900" /></clipPath>
		<clipPath id="bp-right"><rect x="900" y="0" width="700" height="900" /></clipPath>
		<g id="bp-plant">
			<path
				d={STEM}
				fill="none"
				style="stroke: var(--pstem)"
				stroke-width="7"
				stroke-linecap="round"
			/>
			{#each blooms as b, i (i)}
				<g transform="translate({b.x} {b.y - b.r * 0.2})">
					{#each [0, 60, 120, 180, 240, 300] as a (a)}
						<path
							d={petalPath(b.r)}
							transform="rotate({a + i * 11})"
							style="fill: var(--p{b.tone}); stroke: var(--ps)"
						/>
					{/each}
					{#if b.text}
						<text
							y={-b.r * 0.55}
							text-anchor="middle"
							class="bp-text"
							style="fill: var(--pink{b.tone})">{b.text}</text
						>
					{/if}
				</g>
			{/each}
		</g>
	</defs>
	<g clip-path="url(#bp-left)" class="bp-wire">
		<rect width="1600" height="900" fill="url(#bp-grid)" />
		<use href="#bp-plant" />
	</g>
	<g clip-path="url(#bp-right)" class="bp-solid">
		<use href="#bp-plant" />
	</g>
	<line x1="900" y1="0" x2="900" y2="900" stroke="var(--accent-text)" stroke-width="2" />
	<text x="880" y="150" text-anchor="end" class="bp-tag" fill="var(--fg-muted)">DESIGN</text>
	<text x="920" y="150" class="bp-tag" fill="var(--accent-text)">BUILD</text>
</svg>

<style>
	.bp-wire {
		--p0: none;
		--p1: none;
		--p2: none;
		--pink0: none;
		--pink1: none;
		--pink2: none;
		--ps: var(--fg-muted);
		--pstem: var(--fg-muted);
		stroke-width: 1.2px;
	}
	.bp-solid {
		--p0: var(--accent);
		--p1: oklch(0.96 0.005 90);
		--p2: var(--fg-muted);
		--pink0: color-mix(in oklch, var(--on-accent) 55%, transparent);
		--pink1: oklch(0.5 0.01 90 / 0.6);
		--pink2: color-mix(in oklch, var(--bg) 60%, transparent);
		--ps: transparent;
		--pstem: var(--surface-2);
	}
	.bp-text {
		font: 600 11px var(--font-sans);
		letter-spacing: 0.04em;
	}
	.bp-tag {
		font: 600 22px var(--font-sans);
		letter-spacing: 0.16em;
	}
</style>
