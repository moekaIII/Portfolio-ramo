<script lang="ts">
	import Tag from '#lib/components/ui/Tag.svelte';

	let { tags, label = '使用技術' }: { tags: string[]; label?: string } = $props();
</script>

<div>
	<h2 class="eyebrow mb-4">{label}</h2>
	<ul class="flex flex-wrap gap-2">
		{#each tags as tag (tag)}
			<li><Tag>{tag}</Tag></li>
		{/each}
	</ul>
</div>
