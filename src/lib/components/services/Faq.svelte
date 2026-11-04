<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	let { items }: { items: { q: string; a: string }[] } = $props();
</script>

<div class="border-b border-line">
	{#each items as item (item.q)}
		<details class="group border-t border-line">
			<summary
				class="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium [&::-webkit-details-marker]:hidden"
			>
				{item.q}
				<Plus
					size={20}
					aria-hidden="true"
					class="shrink-0 text-fg-muted transition-transform duration-300 ease-out-expo group-open:rotate-45"
				/>
			</summary>
			<p class="max-w-[42em] pb-8 text-fg-muted">{item.a}</p>
		</details>
	{/each}
</div>
