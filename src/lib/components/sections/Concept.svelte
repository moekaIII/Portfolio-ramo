<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';

	const points = [
		{
			title: '設計図と実物を、一輪の花で',
			body: 'ファーストビューの花は、左が設計図（ワイヤーフレーム）、右が実物です。カーソルを動かすと境界が移り、デザインが実装へ変わっていく過程を表しています。花びらの質感や色、背景も、画像を使わずコードで生成しています。'
		},
		{
			title: '演出と使いやすさを両立する',
			body: '3D の演出は、ページの表示を妨げないよう後から読み込みます。視差効果を減らす設定や WebGL に対応していない環境では、同じ構図の静的な表示に切り替えます。キーボード操作・スクリーンリーダー・ライト / ダークモードにも対応しています。'
		},
		{
			title: '実績と同じ技術でつくる',
			body: '実務で使っている Svelte 5 と SvelteKit で設計・実装し、すべてのページを事前に生成した静的サイトとして公開しています。デザインからコードまで、このサイト自体がひとつの実績です。'
		}
	];

	const stack = [
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'Three.js / Threlte',
		'Tailwind CSS',
		'GSAP',
		'Lenis',
		'mdsvex'
	];
</script>

<!-- このサイト自体のコンセプト。ステートメント → 3 つの考え方 → 使用技術 -->
<div>
	<p
		class="max-w-[22em] text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.35] font-semibold tracking-tight"
		use:reveal
	>
		デザインと実装の<span class="text-accent-text">境界</span>を、なくす。
	</p>

	<ol class="mt-16 grid gap-x-(--grid-gap) gap-y-12 md:grid-cols-3">
		{#each points as item, i (item.title)}
			<li class="border-t border-line pt-8" use:reveal={{ delay: i * 80 }}>
				<p class="font-mono text-xs text-accent-text tabular" aria-hidden="true">
					{String(i + 1).padStart(2, '0')}
				</p>
				<h3 class="mt-5 text-h3 leading-snug font-semibold">{item.title}</h3>
				<p class="mt-4 leading-relaxed text-fg-muted">{item.body}</p>
			</li>
		{/each}
	</ol>

	<div
		class="mt-16 flex flex-col gap-4 border-t border-line pt-8 md:flex-row md:items-baseline md:gap-10"
	>
		<h3 class="eyebrow shrink-0">Built with</h3>
		<ul class="flex flex-wrap gap-1.5" aria-label="このサイトの使用技術">
			{#each stack as tech (tech)}
				<li class="rounded-pill border border-line px-3 py-1 font-mono text-xs text-fg-muted">
					{tech}
				</li>
			{/each}
		</ul>
	</div>
</div>
