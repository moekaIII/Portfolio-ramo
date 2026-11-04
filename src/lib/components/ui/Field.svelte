<script lang="ts">
	import type { Snippet } from 'svelte';

	type ControlProps = { id: string; describedBy: string | undefined; invalid: boolean };

	type Props = {
		id: string;
		label: string;
		required?: boolean;
		hint?: string;
		error?: string;
		class?: string;
		children: Snippet<[ControlProps]>;
	};

	let {
		id,
		label,
		required = false,
		hint,
		error,
		class: className = '',
		children
	}: Props = $props();

	const hintId = $derived(hint ? `${id}-hint` : undefined);
	const errorId = $derived(error ? `${id}-error` : undefined);
	const describedBy = $derived([hintId, errorId].filter(Boolean).join(' ') || undefined);
</script>

<div class={['flex flex-col gap-2', className]}>
	<label for={id} class="flex items-center gap-2 text-sm font-medium">
		{label}
		{#if required}
			<span class="text-xs font-normal text-accent-text">必須</span>
		{:else}
			<span class="text-xs font-normal text-fg-muted">任意</span>
		{/if}
	</label>
	{@render children({ id, describedBy, invalid: Boolean(error) })}
	{#if hint}<p id={hintId} class="text-xs text-fg-muted">{hint}</p>{/if}
	{#if error}
		<p id={errorId} class="text-sm text-error">{error}</p>
	{/if}
</div>
