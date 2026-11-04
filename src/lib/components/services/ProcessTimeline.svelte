<script lang="ts">
	import type { ProcessStep } from '#lib/content/services.ts';

	let { steps }: { steps: ProcessStep[] } = $props();
</script>

<!-- data-process-* は Phase 6 のスクロール連動（gsap）のフック。JS なしでも完結した表示になる -->
<ol class="relative" data-process>
	<span
		aria-hidden="true"
		class="absolute top-2 bottom-2 left-[0.6875rem] w-px bg-line md:left-[calc(25%+0.6875rem)]"
	></span>
	<span
		aria-hidden="true"
		data-process-line
		class="absolute top-2 bottom-2 left-[0.6875rem] w-px origin-top bg-accent-text md:left-[calc(25%+0.6875rem)]"
	></span>
	{#each steps as step, i (step.en)}
		<li
			class="relative grid gap-y-4 pb-16 pl-12 last:pb-0 md:grid-cols-4 md:pl-0"
			data-process-step
		>
			<div class="md:pr-10 md:text-right">
				<p class="eyebrow">Step 0{i + 1} — {step.en}</p>
				<p class="mt-2 text-sm text-fg-muted tabular">{step.duration}</p>
			</div>
			<span
				aria-hidden="true"
				data-process-dot
				class="absolute top-1.5 left-1.5 size-3 rounded-pill border-2 border-accent-text bg-bg md:left-[calc(25%+0.375rem)]"
			></span>
			<div class="md:col-span-3 md:pl-16">
				<h3 class="text-h3 font-semibold">{step.title}</h3>
				<p class="mt-4 max-w-[38em] text-fg-muted">{step.description}</p>
				<p class="sr-only">成果物:</p>
				<ul class="mt-6 flex flex-wrap gap-2">
					{#each step.outputs as output (output)}
						<li class="rounded-pill bg-surface-2 px-3 py-1.5 text-xs">{output}</li>
					{/each}
				</ul>
			</div>
		</li>
	{/each}
</ol>
