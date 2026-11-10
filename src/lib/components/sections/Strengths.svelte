<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { strengths } from '#lib/content/profile.ts';
</script>

<!--
  強み。3 つを縦に並べる（PC は 見出し｜本文 の 2 列、スマホは縦積み）。
  画面に入ると、上の罫線（Hero・実績カードと同じグラデーション）が左から引かれ、1 つずつ現れる。
-->
<ol class="strengths" use:reveal>
	{#each strengths as item, i (item.title)}
		<li class="strength" style="--i: {i}">
			<span class="strength-rule" aria-hidden="true"></span>
			<h3 class="strength-title text-h3 leading-snug font-semibold">{item.title}</h3>
			<p class="strength-body text-[0.9375rem] leading-relaxed text-fg-muted md:text-base">
				{item.body}
			</p>
		</li>
	{/each}
</ol>

<style>
	.strength {
		position: relative;
		display: grid;
		gap: 0.75rem;
		padding-block: 2rem 2.25rem;
	}
	.strength:last-child {
		border-bottom: 1px solid var(--line);
	}
	@media (min-width: 48rem) {
		.strength {
			grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
			gap: 3rem;
			align-items: baseline;
			padding-block: 2.5rem 2.75rem;
		}
	}
	@media (min-width: 64rem) {
		.strength {
			grid-template-columns: minmax(0, 22rem) minmax(0, 40rem);
		}
	}

	/* 上の罫線: 薄い線の上に、グラデーションの線を左から引く */
	.strength-rule {
		position: absolute;
		inset-inline: 0;
		top: 0;
		height: 1px;
		background: var(--line);
	}
	.strength-rule::after {
		content: '';
		position: absolute;
		inset: 0;
		/* Hero と同じ色を、線の向き（左→右）に沿って並べる */
		background: linear-gradient(
			90deg,
			var(--edge-1),
			var(--edge-2) 32%,
			var(--edge-3) 56%,
			var(--edge-4) 74%,
			var(--edge-5)
		);
		transform-origin: left center;
	}

	/* 共通の reveal（全体のフェード）は使わず、行ごとの演出にする */
	:global(.js) .strengths:global([data-reveal]) {
		opacity: 1;
		translate: none;
	}
	@media (prefers-reduced-motion: no-preference) {
		.strength {
			--delay: calc(var(--i) * 260ms);
		}
		.strength-rule::after {
			transition: scale 1100ms var(--ease-out) var(--delay);
		}
		.strength-title,
		.strength-body {
			transition:
				opacity 700ms var(--ease-out) calc(var(--delay) + 200ms),
				translate 700ms var(--ease-out) calc(var(--delay) + 200ms);
		}
		.strength-body {
			transition-delay: calc(var(--delay) + 320ms);
		}
		:global(.js) .strengths:not([data-revealed]) .strength-rule::after {
			scale: 0 1;
		}
		:global(.js) .strengths:not([data-revealed]) .strength-title,
		:global(.js) .strengths:not([data-revealed]) .strength-body {
			opacity: 0;
			translate: 0 12px;
		}
	}
</style>
