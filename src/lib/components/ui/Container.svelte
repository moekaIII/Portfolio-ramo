<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		as?: 'div' | 'section' | 'header' | 'footer' | 'article' | 'nav';
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	};

	let { as = 'div', class: className = '', children, ...rest }: Props = $props();
</script>

<svelte:element this={as} class={['mx-auto w-full max-w-site px-gutter', className]} {...rest}>
	{@render children()}
</svelte:element>
