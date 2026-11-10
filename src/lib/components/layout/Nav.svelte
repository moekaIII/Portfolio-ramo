<script lang="ts">
	import { sections } from '#lib/config/site.ts';
	import { activeSection } from '#lib/state/active-section.svelte.ts';
	import { scrollToSection } from '#lib/utils/scroll-to.ts';

	type Props = { variant?: 'bar' | 'menu'; onnavigate?: () => void };

	let { variant = 'bar', onnavigate }: Props = $props();

	function go(event: MouseEvent, id: string) {
		event.preventDefault();
		onnavigate?.();
		scrollToSection(id);
	}
</script>

{#if variant === 'bar'}
	<ul class="flex items-center gap-1">
		{#each sections as s (s.id)}
			{@const current = activeSection.current === s.id}
			<li>
				<a
					href="#{s.id}"
					onclick={(e) => go(e, s.id)}
					aria-current={current ? 'location' : undefined}
					class="relative inline-flex h-11 items-center rounded-pill px-4 text-sm text-fg-muted transition-colors hover:text-fg aria-[current=location]:text-fg"
				>
					{s.label}
					<span
						aria-hidden="true"
						class={[
							'absolute inset-x-4 bottom-2 h-px origin-left bg-accent-text transition-transform duration-300 ease-out-expo',
							current ? 'scale-x-100' : 'scale-x-0'
						]}
					></span>
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<ul class="divide-y divide-line border-y border-line">
		{#each sections as s (s.id)}
			<li>
				<a
					href="#{s.id}"
					onclick={(e) => go(e, s.id)}
					aria-current={activeSection.current === s.id ? 'location' : undefined}
					class="flex items-baseline justify-between py-5 aria-[current=location]:text-accent-text"
				>
					<span class="text-h3 font-semibold">{s.label}</span>
					<span class="text-sm text-fg-muted">{s.en}</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}
