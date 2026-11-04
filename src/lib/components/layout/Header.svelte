<script lang="ts">
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
	<div class="mx-auto flex h-header w-full max-w-site items-center justify-end px-gutter">
		<div class="hidden items-center gap-1 md:flex">
			<nav aria-label="ページ内"><Nav /></nav>
			<ThemeToggle />
		</div>
		<div class="md:hidden">
			<MobileNav />
		</div>
	</div>
</header>
