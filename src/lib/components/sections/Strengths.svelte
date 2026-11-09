<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { strengths } from '#lib/content/profile.ts';
</script>

<!--
  強み。3 つの円を上 1・下 2 に、真ん中が重なるように置く（スマホでは縦に並べ、少し重ねる）。
  画面に入ると、グラデーションの枠線を描きながら 1 つずつ現れる。
-->
<ol class="strengths" use:reveal>
	{#each strengths as item, i (item.title)}
		<li class="strength" style="--i: {i}">
			<svg class="strength-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
				<defs>
					<linearGradient
						id="strength-ring-{i}"
						x1="0"
						y1="0"
						x2="1"
						y2="1"
						gradientTransform="rotate({i * 120} 0.5 0.5)"
					>
						<stop offset="0" style="stop-color: var(--edge-1)" />
						<stop offset="0.35" style="stop-color: var(--edge-2)" />
						<stop offset="0.6" style="stop-color: var(--edge-3)" />
						<stop offset="0.8" style="stop-color: var(--edge-4)" />
						<stop offset="1" style="stop-color: var(--edge-5)" />
					</linearGradient>
				</defs>
				<circle
					cx="50"
					cy="50"
					r="49.8"
					pathLength="100"
					stroke="url(#strength-ring-{i})"
					transform="rotate(-90 50 50)"
				/>
			</svg>
			<div class="strength-body">
				<h3 class="text-lg leading-snug font-semibold">{item.title}</h3>
				<p class="mt-3 text-sm leading-relaxed text-fg-muted">{item.body}</p>
			</div>
		</li>
	{/each}
</ol>

<style>
	/* 円の直径・重なり。スマホは縦に並べて少し重ねる */
	.strengths {
		--d: min(21rem, 100%);
		display: grid;
		justify-items: center;
	}
	.strength {
		position: relative;
		display: grid;
		place-items: center;
		width: var(--d);
		aspect-ratio: 1;
		border-radius: 50%;
	}
	.strength + .strength {
		margin-top: -2rem;
	}
	.strength-body {
		position: relative;
		width: 76%;
		text-align: center;
	}

	/*
	  PC: ベン図のように、3 つの円の真ん中が重なる配置。
	  円の中心どうしの距離 --s を直径の 0.74 倍にして、中央に 3 つが小さく重なる領域をつくる。
	  文字は重なりを避けて、それぞれの円の外側寄り（重ならない部分）に置く。
	*/
	@media (min-width: 64rem) {
		.strengths {
			--d: 26rem;
			--s: calc(var(--d) * 0.74);
			position: relative;
			display: block;
			width: calc(var(--d) + var(--s));
			height: calc(var(--d) + var(--s) * 0.866);
			margin-inline: auto;
		}
		.strength {
			position: absolute;
			display: block;
		}
		.strength + .strength {
			margin-top: 0;
		}
		.strength:nth-child(1) {
			top: 0;
			left: calc(var(--s) / 2);
			--tx: 50%;
			--ty: 38%;
		}
		.strength:nth-child(2) {
			bottom: 0;
			left: 0;
			--tx: 39.6%;
			--ty: 56%;
		}
		.strength:nth-child(3) {
			bottom: 0;
			right: 0;
			--tx: 60.4%;
			--ty: 56%;
		}
		.strength-body {
			position: absolute;
			left: var(--tx);
			top: var(--ty);
			width: 46%;
			transform: translate(-50%, -50%);
		}
	}

	/* グラデーションの枠線（SVG の円。pathLength=100 で、描く長さを % で扱う） */
	.strength-ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;
	}
	.strength-ring circle {
		fill: none;
		/* viewBox 100 に対する太さ（直径 21〜23rem で約 1.3px） */
		stroke-width: 0.38;
		stroke-dasharray: 100;
		stroke-dashoffset: 0;
	}

	/*
	  スクロールで画面に入ったら、1 つずつ順に現れる:
	  円が少し縮んだ状態から広がり、枠線を描き、最後に中身が浮かぶ。
	  JS 無効時・視差効果を減らす設定のときは最初から表示する。
	*/
	/* 共通の reveal（全体のフェード）は使わず、円ごとの演出にする */
	:global(.js) .strengths:global([data-reveal]) {
		opacity: 1;
		translate: none;
	}
	@media (prefers-reduced-motion: no-preference) {
		.strength {
			--delay: calc(var(--i) * 420ms);
			transition:
				opacity 700ms var(--ease-out) var(--delay),
				scale 900ms var(--ease-out) var(--delay);
		}
		.strength-ring circle {
			transition: stroke-dashoffset 1400ms var(--ease-out) var(--delay);
		}
		.strength-body {
			transition:
				opacity 700ms var(--ease-out) calc(var(--delay) + 350ms),
				translate 700ms var(--ease-out) calc(var(--delay) + 350ms);
		}
		:global(.js) .strengths:not([data-revealed]) .strength {
			opacity: 0;
			scale: 0.88;
		}
		:global(.js) .strengths:not([data-revealed]) .strength-ring circle {
			stroke-dashoffset: 100;
		}
		:global(.js) .strengths:not([data-revealed]) .strength-body {
			opacity: 0;
			translate: 0 10px;
		}
	}
</style>
