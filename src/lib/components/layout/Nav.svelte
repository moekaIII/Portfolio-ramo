<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { nav } from '#lib/config/site.ts';

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
</script>

<nav aria-label="メイン">
	<ul class="flex items-center gap-1">
		{#each nav.filter((item) => item.href !== '/contact') as item (item.href)}
			<li>
				<a
					href={resolve(item.href)}
					aria-current={isActive(item.href) ? 'page' : undefined}
					class="relative inline-flex h-11 items-center rounded-pill px-4 text-sm text-fg-muted transition-colors hover:text-fg aria-[current=page]:text-fg"
				>
					{item.en}
					<span
						aria-hidden="true"
						class={[
							'absolute inset-x-4 bottom-2 h-px origin-left bg-accent-text transition-transform duration-300 ease-out-expo',
							isActive(item.href) ? 'scale-x-100' : 'scale-x-0'
						]}
					></span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
