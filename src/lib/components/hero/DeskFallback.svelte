<script lang="ts">
	import { deskGroups, getDeskLabels } from '#lib/content/desk-labels.ts';

	const labels = getDeskLabels();
	const columns = deskGroups.map((group, i) => ({
		group,
		items: labels.filter((l) => l.groupIndex === i)
	}));
</script>

<!--
  3D が使えない / reduced-motion 時の静的表示。
  3D 版の「整列したあと」の状態（左から フロントエンド / デザイン / その他、左揃えの縦並び）を HTML で再現する。
  スキルの一覧は #skills にもあるため、ここは装飾扱い（aria-hidden）。
-->
<div aria-hidden="true" class="absolute inset-0 flex items-center justify-center p-4">
	<div class="flex items-start gap-4 sm:gap-6">
		{#each columns as col (col.group.label)}
			<div class="flex flex-col items-start gap-2">
				<p class="mb-1 text-xs font-bold text-fg-muted">{col.group.label}</p>
				{#each col.items as label (label.text)}
					<span
						class={[
							'rounded-md px-3 py-2 text-[0.8125rem] leading-none font-semibold shadow-[2px_4px_12px_-4px_rgb(0_0_0/0.45)] sm:px-3.5',
							label.accent ? 'bg-accent text-on-accent' : 'border border-line bg-surface-2 text-fg'
						]}
					>
						{label.text}
					</span>
				{/each}
			</div>
		{/each}
	</div>
</div>
