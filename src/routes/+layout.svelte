<script lang="ts">
	import '@fontsource-variable/inter';
	import '@fontsource-variable/noto-sans-jp';
	import './layout.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import favicon from '#lib/assets/favicon.svg';
	import Header from '#lib/components/layout/Header.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';
	import { theme } from '#lib/state/theme.svelte.ts';
	import { viewTransition } from '#lib/utils/view-transition.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => theme.init());
	onNavigate(viewTransition);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SkipLink />
<Header />
<main id="main" tabindex="-1" class="outline-none">
	{@render children()}
</main>
<Footer />
