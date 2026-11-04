<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import type { Service } from '#lib/content/services.ts';

	let { service, index }: { service: Service; index: number } = $props();
</script>

<article
	id={service.id}
	class="grid-12 scroll-mt-[calc(var(--header-h)+2rem)] gap-y-6 border-t border-line py-12 md:py-16"
>
	<p class="col-span-1 text-sm text-accent-text tabular" aria-hidden="true">0{index + 1}</p>
	<div class="col-span-3 md:col-span-5">
		<h3 class="text-h3 font-semibold">{service.title}</h3>
		<p class="eyebrow mt-2">{service.en}</p>
	</div>
	<div class="col-span-full md:col-span-6">
		<p class="text-fg-muted">{service.summary}</p>
		<h4 class="sr-only">主な内容</h4>
		<ul class="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
			{#each service.deliverables as item (item)}
				<li class="flex items-center gap-2">
					<Check size={14} aria-hidden="true" class="shrink-0 text-accent-text" />{item}
				</li>
			{/each}
		</ul>
	</div>
</article>
