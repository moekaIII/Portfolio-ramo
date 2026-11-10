<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { strengths } from '#lib/content/profile.ts';

	let list: HTMLOListElement | undefined = $state();
	/** 丸の中心を貫く縦線の位置（最初の丸の上端 〜 最後の丸の下端 を、さらに上下へはみ出させる）。レイアウトに合わせて測る */
	let stem = $state<{ top: number; height: number; left: number } | null>(null);

	$effect(() => {
		const el = list;
		if (!el) return;
		const measure = () => {
			const rings = el.querySelectorAll<SVGElement>('.strength-ring');
			if (rings.length === 0) return;
			const box = el.getBoundingClientRect();
			const first = rings[0].getBoundingClientRect();
			const last = rings[rings.length - 1].getBoundingClientRect();
			stem = {
				top: first.top - box.top,
				height: last.bottom - first.top,
				left: first.left - box.left + first.width / 2
			};
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	});
</script>

<!--
  強み。3 つを縦に並べ、ページの中央に寄せる。各ブロックは 見出し → 詳細文 で、左横に大きな線の丸を置く。
  丸は行の高さより少し大きく、上下の丸どうしが少し重なる。
  画面に入ると、上の丸から順に線が一周して完成し、続けて文字が浮かぶ。
  最後に、すべての丸の中心を貫く緑の線（Hero の花の茎の色）が上から下へ通る。
-->
<ol class="strengths" use:reveal bind:this={list} style="--n: {strengths.length}">
	{#if stem}
		<li
			class="strength-stem"
			role="presentation"
			aria-hidden="true"
			style="top: {stem.top}px; height: {stem.height}px; left: {stem.left}px"
		>
			<!-- 茎の色のグラデーション。下に向かって消える -->
			<svg width="100%" height="100%" focusable="false">
				<defs>
					<linearGradient id="stem-color" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" style="stop-color: var(--stem-top)" />
						<stop offset="0.5" style="stop-color: var(--stem)" />
						<stop offset="1" style="stop-color: var(--stem-bottom)" />
					</linearGradient>
					<linearGradient id="stem-fade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stop-color="#fff" />
						<stop offset="0.55" stop-color="#fff" />
						<stop offset="1" stop-color="#fff" stop-opacity="0" />
					</linearGradient>
					<mask id="stem-mask" maskContentUnits="objectBoundingBox">
						<rect width="1" height="1" fill="url(#stem-fade)" />
					</mask>
				</defs>
				<g mask="url(#stem-mask)">
					<rect
						x="50%"
						y="0"
						width="3"
						height="100%"
						rx="1.5"
						transform="translate(-1.5 0)"
						fill="url(#stem-color)"
					/>
				</g>
			</svg>
		</li>
	{/if}
	{#each strengths as item, i (item.title)}
		<li class="strength" style="--i: {i}">
			<svg class="strength-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
				<defs>
					<linearGradient id="strength-ring-{i}" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" style="stop-color: var(--edge-1)" />
						<stop offset="0.35" style="stop-color: var(--edge-2)" />
						<stop offset="0.6" style="stop-color: var(--edge-3)" />
						<stop offset="0.8" style="stop-color: var(--edge-4)" />
						<stop offset="1" style="stop-color: var(--edge-5)" />
					</linearGradient>
				</defs>
				<!-- 12 時の位置から時計回りに描く -->
				<circle
					cx="50"
					cy="50"
					r="49"
					pathLength="100"
					stroke="url(#strength-ring-{i})"
					transform="rotate(-90 50 50)"
				/>
			</svg>
			<div class="strength-content">
				<h3 class="strength-title text-h3 leading-snug font-semibold">{item.title}</h3>
				<p
					class="strength-body mt-3 max-w-160 text-[0.9375rem] leading-relaxed text-fg-muted md:text-base"
				>
					{item.body}
				</p>
			</div>
		</li>
	{/each}
</ol>

<style>
	/*
	  --d: 丸の直径 / --overlap: 上下の丸の重なり。
	  行の高さを「直径 − 重なり」にして、丸を行からはみ出させることで重ねる
	  （本文が長くて行が高くなったときは、重ならずに並ぶ）
	*/
	.strengths {
		--d: 4.5rem;
		--overlap: 0rem;
		--gap: 1.25rem;
		display: grid;
		gap: 3.5rem;
		max-width: 52rem;
		margin-inline: auto;
	}
	@media (min-width: 48rem) {
		.strengths {
			--d: 11rem;
			--overlap: 1.5rem;
			--gap: 2.5rem;
			gap: 0;
			/* 上へはみ出す丸と緑の線が、セクションタイトルに近づきすぎないように */
			padding-top: 3rem;
		}
	}
	.strengths {
		position: relative;
	}
	.strength {
		position: relative;
		display: flex;
		align-items: center;
		min-height: calc(var(--d) - var(--overlap));
		padding-left: calc(var(--d) + var(--gap));
	}
	@media (max-width: 47.99rem) {
		/* スマホ: 丸は見出しの横に小さく */
		.strength {
			align-items: flex-start;
			min-height: 0;
		}
	}

	/* 線の丸 */
	.strength-ring {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--d);
		height: var(--d);
		overflow: visible;
		pointer-events: none;
	}
	@media (min-width: 48rem) {
		/* 行の中央に丸の中心を合わせ、はみ出した分が上下の丸と重なる */
		.strength-ring {
			top: 50%;
			translate: 0 -50%;
		}
	}
	.strength-ring circle {
		fill: none;
		/* viewBox 100 に対する太さ（直径 11rem で約 1.4px、スマホ 4.5rem で約 1.1px） */
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-dasharray: 100;
		stroke-dashoffset: 0;
	}
	@media (min-width: 48rem) {
		.strength-ring circle {
			stroke-width: 0.8;
		}
	}

	/*
	  丸の中心を貫く緑の線（Hero の花の茎の色）。
	  上下の丸の枠から --over だけはみ出させ、下はグラデーションで消える。
	*/
	.strength-stem {
		/* 上へのはみ出し / 下へのはみ出し（下は長めに伸ばして、ゆっくり消える） */
		--over: 2.5rem;
		--over-bottom: 3rem;
		--stem: #7f9a68;
		--stem-top: #a0965f;
		--stem-bottom: #5c7c6a;
		position: absolute;
		width: 20px;
		margin-top: calc(var(--over) * -1);
		padding-bottom: calc(var(--over) + var(--over-bottom));
		box-sizing: content-box;
		translate: -50% 0;
		pointer-events: none;
	}
	@media (min-width: 48rem) {
		.strength-stem {
			--over-bottom: 5rem;
		}
	}
	.strength-stem svg {
		position: absolute;
		inset: 0;
		display: block;
		overflow: visible;
	}
	:global([data-theme='dark']) .strength-stem {
		--stem: #8aa673;
		--stem-top: #b0a46a;
		--stem-bottom: #6f9282;
	}

	/* 共通の reveal（全体のフェード）は使わず、丸ごとの演出にする */
	:global(.js) .strengths:global([data-reveal]) {
		opacity: 1;
		translate: none;
	}
	/*
	  上の丸から順に: 線が一周して丸が完成 → 見出し → 詳細文。
	  JS 無効時・視差効果を減らす設定のときは最初から完成した状態で表示する。
	*/
	@media (prefers-reduced-motion: no-preference) {
		.strength {
			--delay: calc(var(--i) * 550ms);
		}
		.strength-ring circle {
			transition: stroke-dashoffset 900ms var(--ease-in-out) var(--delay);
		}
		.strength-title,
		.strength-body {
			transition:
				opacity 700ms var(--ease-out) calc(var(--delay) + 450ms),
				translate 700ms var(--ease-out) calc(var(--delay) + 450ms);
		}
		.strength-body {
			transition-delay: calc(var(--delay) + 580ms);
		}
		/*
		  3 つ目の丸が描き終わったあとに、上から下へ。下に向かうほどゆっくり（強い ease-out）。
		  拡大ではなく切り抜きで見せる（下端のグラデーションが伸びない）
		*/
		.strength-stem {
			clip-path: inset(0 -50% 0 -50%);
			transition: clip-path 2200ms cubic-bezier(0.2, 0.7, 0.1, 1) calc(var(--n) * 550ms + 400ms);
		}
		:global(.js) .strengths:not([data-revealed]) .strength-stem {
			clip-path: inset(0 -50% 100% -50%);
		}
		:global(.js) .strengths:not([data-revealed]) .strength-ring circle {
			stroke-dashoffset: 100;
		}
		:global(.js) .strengths:not([data-revealed]) .strength-title,
		:global(.js) .strengths:not([data-revealed]) .strength-body {
			opacity: 0;
			translate: 0 10px;
		}
	}
</style>
