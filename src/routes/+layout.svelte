<script lang="ts">
	import '@fontsource-variable/inter';
	import 'lenis/dist/lenis.css';
	import './layout.css';
	import { onMount } from 'svelte';
	import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
	import plexLatin from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?url';
	import favicon from '#lib/assets/favicon.png';
	import Header from '#lib/components/layout/Header.svelte';
	import Loader from '#lib/components/layout/Loader.svelte';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';
	import SmoothScroll from '#lib/components/layout/SmoothScroll.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { theme } from '#lib/state/theme.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		theme.init();
		// Noto Sans JP（数十ファイルに分割された和文フォント）は初回描画をブロックしないよう表示後に読み込む。
		// それまでは OS の和文フォント（ヒラギノ / Noto Sans CJK / 游ゴシック）で表示される。
		import('@fontsource-variable/noto-sans-jp');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- 欧文フォントは初回描画に間に合わせ、差し替えによるレイアウトシフトを防ぐ -->
	<link rel="preload" href={interLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<!-- ヒーローの氏名（ターミナル風）とローディングの文字 -->
	<link rel="preload" href={plexLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<Loader />
<SmoothScroll />
<SkipLink />
<Header />
<main id="main" tabindex="-1" class="outline-none">
	{@render children()}
</main>
<Footer />
