<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '#lib/config/site.ts';
</script>

<a
	href={resolve('/')}
	class="inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold tracking-tight"
	aria-label="{site.name} ホーム"
>
	<svg viewBox="0 0 24 24" class="size-6" aria-hidden="true">
		<rect x="1" y="1" width="22" height="22" rx="6" class="fill-accent" />
		<path d="M7 16.5 12 7.5l5 9" class="fill-none stroke-on-accent" stroke-width="2.2" />
	</svg>
	<span>{site.name}</span>
</a>
