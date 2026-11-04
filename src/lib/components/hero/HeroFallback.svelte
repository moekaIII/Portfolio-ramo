<!--
  3D が使えない / reduced-motion 時の静的ビジュアル。
  3D 版（精密グリッドの重力場）と同じ「整列したドット格子 + アクセントの焦点」の見た目にそろえる。
-->
<div aria-hidden="true" class="absolute inset-0 overflow-hidden">
	<div class="dots absolute inset-0"></div>
	<div class="focus absolute"></div>
</div>

<style>
	.dots {
		background-image: radial-gradient(
			circle at center,
			color-mix(in oklch, var(--fg) 34%, transparent) 1px,
			transparent 1.6px
		);
		background-size: 28px 28px;
		background-position: center;
		mask-image: radial-gradient(ellipse 70% 65% at 68% 45%, #000 20%, transparent 75%);
	}
	.focus {
		left: 68%;
		top: 45%;
		width: min(48vw, 560px);
		aspect-ratio: 1;
		translate: -50% -50%;
		border-radius: 50%;
		background-image: radial-gradient(circle at center, var(--accent) 1.4px, transparent 2px);
		background-size: 28px 28px;
		background-position: center;
		mask-image: radial-gradient(circle at center, #000 0%, transparent 62%);
		opacity: 0.9;
	}
</style>
