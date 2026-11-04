<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { resolve } from '$app/paths';
	import Button from '#lib/components/ui/Button.svelte';
	import Logo from './Logo.svelte';
	import Nav from './Nav.svelte';
	import MobileNav from './MobileNav.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let scrolled = $state(false);
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 8)} />

<header
	class={[
		'site-header fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
		scrolled ? 'border-line bg-(--header-bg) backdrop-blur-md' : 'border-transparent'
	]}
>
	<div class="mx-auto flex h-header w-full max-w-site items-center justify-between px-gutter">
		<Logo />
		<div class="hidden items-center gap-2 md:flex">
			<Nav />
			<ThemeToggle />
			<Button href={resolve('/contact')} class="ml-2">
				相談する
				{#snippet icon()}<ArrowUpRight size={16} />{/snippet}
			</Button>
		</div>
		<div class="md:hidden">
			<MobileNav />
		</div>
	</div>
</header>
