<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Common = {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'md' | 'lg';
		class?: string;
		children: Snippet;
		/** ラベル右側に置くアイコン（装飾扱い） */
		icon?: Snippet;
	};
	type AsLink = Common & HTMLAnchorAttributes & { href: string };
	type AsButton = Common & HTMLButtonAttributes & { href?: undefined };
	type Props = AsLink | AsButton;

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		children,
		icon,
		...rest
	}: Props = $props();

	const classes = $derived([
		'group inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap',
		'transition-[background-color,color,border-color,transform] duration-200 ease-out-expo',
		'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
		size === 'lg' ? 'h-14 px-7 text-base' : 'h-11 px-5 text-sm',
		variant === 'primary' && 'bg-accent text-on-accent hover:bg-fg hover:text-bg',
		variant === 'secondary' &&
			'border border-line-strong text-fg hover:border-fg hover:bg-fg hover:text-bg',
		variant === 'ghost' && 'text-fg underline-offset-4 hover:underline',
		className
	]);
</script>

{#snippet content()}
	<span>{@render children()}</span>
	{#if icon}
		<span
			aria-hidden="true"
			class="inline-flex transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5"
		>
			{@render icon()}
		</span>
	{/if}
{/snippet}

{#if rest.href !== undefined}
	<a class={classes} {...rest as HTMLAnchorAttributes}>{@render content()}</a>
{:else}
	<button type="button" class={classes} {...rest as HTMLButtonAttributes}
		>{@render content()}</button
	>
{/if}
