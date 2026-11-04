<script lang="ts">
	import { deskLabels } from '#lib/content/desk-labels.ts';
</script>

<!--
  3D が使えない / reduced-motion 時の静的表示。
  3D 版の「整列したあと」の状態を HTML で再現する（スキル一覧は #skills にあるため装飾扱い）。
-->
<div aria-hidden="true" class="absolute inset-0 flex items-center justify-center p-6">
	<ul class="flex max-w-[28rem] flex-wrap justify-center gap-2.5">
		{#each deskLabels as label (label.text)}
			<li
				class={[
					'rounded-md px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_-8px_rgb(0_0_0/0.45)]',
					label.accent ? 'bg-accent text-on-accent' : 'border border-line bg-surface-2 text-fg'
				]}
			>
				{label.text}
			</li>
		{/each}
	</ul>
</div>
