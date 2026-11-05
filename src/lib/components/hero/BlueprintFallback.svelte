<script lang="ts">
	let { flower = true }: { flower?: boolean } = $props();
</script>

<!--
  3D が使えない / reduced-motion 時の静的表示。3D 版と同じ「光が透ける一輪の花」と、
  継ぎ目のないスタジオ背景を SVG で描く（左は無地の上に設計図の線、右はスタジオの背景に実物）。スキル名は #skills にあるため装飾扱い。
-->
<svg
	aria-hidden="true"
	class="absolute inset-0 h-full w-full"
	viewBox="0 0 1600 900"
	preserveAspectRatio="xMidYMid slice"
>
	<defs>
		<radialGradient id="sf-bg" cx="0.62" cy="0.45" r="0.8">
			<stop offset="0" style="stop-color: var(--sf-bg-center)" />
			<stop offset="1" style="stop-color: var(--sf-bg-edge)" />
		</radialGradient>
		<radialGradient id="sf-petal" cx="0.5" cy="1" r="1.1">
			<stop offset="0" stop-color="#f5852f" />
			<stop offset="0.45" stop-color="#fa9e7a" />
			<stop offset="1" stop-color="#fbcfcd" stop-opacity="0.55" />
		</radialGradient>
		<filter id="sf-soft" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="6" />
		</filter>
		<clipPath id="sf-left"><rect width="1000" height="900" /></clipPath>
		<clipPath id="sf-right"><rect x="1000" width="600" height="900" /></clipPath>
		<g id="sf-flower">
			<path
				d="M1180 470 C 1170 600, 1150 720, 1140 900"
				fill="none"
				style="stroke: var(--sf-stem)"
				stroke-width="6"
			/>
			<g transform="translate(1180 430)">
				{#each [-160, -95, -20, 50, 120] as a, i (a)}
					<path
						transform="rotate({a}) scale({0.95 + (i % 2) * 0.12})"
						d="M0 0 C 140 -30, 210 -220, 120 -330 C 60 -390, -60 -390, -120 -330 C -210 -220, -140 -30, 0 0Z"
						style="fill: var(--sf-fill); stroke: var(--sf-line)"
						opacity="0.75"
					/>
				{/each}
				<circle r="40" style="fill: var(--sf-center)" />
			</g>
		</g>
	</defs>

	<!-- スタジオの背景色は BUILD 側（右）だけ。設計図側（左）はページと同じ無地 -->
	<rect width="1600" height="900" fill="url(#sf-bg)" />
	<rect width="1000" height="900" style="fill: var(--bg)" />
	<g class={['sf-flowers', flower && 'is-on']}>
		<g clip-path="url(#sf-left)" class="sf-wire"><use href="#sf-flower" /></g>
		<g clip-path="url(#sf-right)" class="sf-solid" filter="url(#sf-soft)"
			><use href="#sf-flower" /></g
		>
	</g>
	<line x1="1000" y1="0" x2="1000" y2="900" stroke="var(--fg-muted)" stroke-opacity=".55" />
</svg>

<style>
	/* JS 有効時は、3D が使えないと分かるまで花を描かない（JS 無効時は常に描く） */
	:global(.js) .sf-flowers:not(.is-on) {
		display: none;
	}
	svg {
		--sf-bg-center: #faf6ee;
		--sf-bg-edge: #e2e2ea;
	}
	:global([data-theme='dark']) svg {
		--sf-bg-center: #3e302e;
		--sf-bg-edge: #16151a;
	}
	.sf-wire {
		--sf-fill: none;
		--sf-center: none;
		--sf-line: var(--fg-muted);
		--sf-stem: var(--fg-muted);
		stroke-width: 1.4px;
	}
	.sf-solid {
		--sf-fill: url(#sf-petal);
		--sf-center: #f0702a;
		--sf-line: none;
		--sf-stem: #7a8f66;
	}
</style>
