<script lang="ts">
	import { skillChips } from '#lib/content/hero-skills.ts';

	/**
	 * 3D 版と同じ「大きなガラスの器に、スキル名のタイルが詰まっている」構図。
	 * タイルは器の底から積み重ねる（決定論的に少しずつ傾ける）
	 */
	const BOX = { x: 760, y: 140, size: 620 };
	const TILE_H = 46;
	const fills = ['var(--pa)', 'var(--pg)', 'var(--pl)'];
	const inks = ['var(--pi-dark)', 'var(--pi-light)', 'var(--pi-dark)'];

	type Tile = { x: number; y: number; w: number; angle: number; text: string; group: number };
	const tiles: Tile[] = [];
	{
		const pad = 26;
		let x = BOX.x + pad;
		let y = BOX.y + BOX.size - pad - TILE_H;
		skillChips.forEach((chip, i) => {
			const w = chip.text.length * 13.5 + 36;
			if (x + w > BOX.x + BOX.size - pad) {
				x = BOX.x + pad + ((i * 37) % 40);
				y -= TILE_H + 8;
			}
			tiles.push({ x, y, w, angle: ((i * 53) % 13) - 6, text: chip.text, group: chip.group });
			x += w + 10;
		});
	}
</script>

<!--
  3D が使えない / reduced-motion 時の静的表示。左は設計図（線）、右は実物（面）。
  同じ器とタイルを CSS 変数を切り替えて 2 回描き、境界線の左右で切り抜いている。
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
		<clipPath id="bp-left"><rect x="0" y="0" width="1000" height="900" /></clipPath>
		<clipPath id="bp-right"><rect x="1000" y="0" width="600" height="900" /></clipPath>
		<g id="bp-jar">
			{#each tiles as t (t.text)}
				<g transform="rotate({t.angle} {t.x + t.w / 2} {t.y + TILE_H / 2})">
					<rect
						x={t.x}
						y={t.y}
						width={t.w}
						height={TILE_H}
						rx="10"
						style="fill: {fills[t.group]}; stroke: var(--ps)"
					/>
					<text
						x={t.x + t.w / 2}
						y={t.y + TILE_H / 2 + 7}
						text-anchor="middle"
						class="bp-text"
						style="fill: {inks[t.group]}; stroke: var(--pts)">{t.text}</text
					>
				</g>
			{/each}
			<!-- 器（ガラスの角丸キューブ） -->
			<rect
				x={BOX.x}
				y={BOX.y}
				width={BOX.size}
				height={BOX.size}
				rx="56"
				style="fill: var(--pglass); stroke: var(--pjar)"
				stroke-width="2"
			/>
			<rect
				x={BOX.x + 40}
				y={BOX.y + 40}
				width={BOX.size - 80}
				height={BOX.size - 80}
				rx="40"
				fill="none"
				style="stroke: var(--pjar)"
				stroke-opacity=".35"
			/>
		</g>
	</defs>

	<g clip-path="url(#bp-left)" class="bp-wire">
		<rect width="1600" height="900" fill="url(#bp-grid)" />
		<use href="#bp-jar" />
	</g>
	<g clip-path="url(#bp-right)" class="bp-solid">
		<use href="#bp-jar" />
	</g>
	<line x1="1000" y1="0" x2="1000" y2="900" stroke="var(--accent-text)" stroke-width="2" />
	<text x="980" y="110" text-anchor="end" class="bp-tag" fill="var(--fg-muted)">DESIGN</text>
	<text x="1020" y="110" class="bp-tag" fill="var(--accent-text)">BUILD</text>
</svg>

<style>
	.bp-wire {
		--pa: none;
		--pg: none;
		--pl: none;
		--pi-dark: none;
		--pi-light: none;
		--ps: var(--fg-muted);
		--pts: var(--fg-muted);
		--pglass: none;
		--pjar: var(--accent-text);
		stroke-width: 1.2px;
	}
	.bp-solid {
		--pa: var(--accent);
		--pg: var(--surface-2);
		--pl: var(--fg-muted);
		--pi-dark: var(--on-accent);
		--pi-light: var(--fg);
		--ps: var(--line);
		--pts: none;
		--pglass: color-mix(in oklch, var(--fg) 5%, transparent);
		--pjar: var(--line-strong);
	}
	.bp-text {
		font: 700 22px var(--font-sans);
		letter-spacing: -0.01em;
		stroke-width: 0.8px;
	}
	.bp-tag {
		font: 600 22px var(--font-sans);
		letter-spacing: 0.16em;
	}
</style>
