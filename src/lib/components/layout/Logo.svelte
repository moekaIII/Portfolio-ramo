<script lang="ts">
	import { site } from '#lib/config/site.ts';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';

	function toTop(event: MouseEvent) {
		event.preventDefault();
		if (smoothScroll.lenis) smoothScroll.lenis.scrollTo(0);
		else window.scrollTo({ top: 0 });
		document.getElementById('main')?.focus({ preventScroll: true });
	}
</script>

<a
	href="#main"
	onclick={toTop}
	class="inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold tracking-tight"
	aria-label="{site.name}（ページの先頭へ）"
>
	<svg viewBox="0 0 24 24" class="size-6" aria-hidden="true">
		<rect x="1" y="1" width="22" height="22" rx="6" class="fill-accent" />
		<path d="M7 16.5 12 7.5l5 9" class="fill-none stroke-on-accent" stroke-width="2.2" />
	</svg>
	<span>{site.name}</span>
</a>
