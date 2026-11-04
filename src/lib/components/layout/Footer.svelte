<script lang="ts">
	import { resolve } from '$app/paths';
	import { nav, site } from '#lib/config/site.ts';
	import Container from '#lib/components/ui/Container.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-line">
	<Container class="grid-12 gap-y-10 py-16">
		<div class="col-span-full md:col-span-5">
			<p class="text-h3 font-semibold">{site.name}</p>
			<p class="mt-3 max-w-[28em] text-sm text-fg-muted">{site.author.jobTitle}</p>
		</div>
		<nav aria-label="フッター" class="col-span-2 md:col-span-3 md:col-start-7">
			<p class="eyebrow mb-4">Sitemap</p>
			<ul class="space-y-2 text-sm">
				<li><a href={resolve('/')} class="hover:text-accent-text">Home</a></li>
				{#each nav as item (item.href)}
					<li><a href={resolve(item.href)} class="hover:text-accent-text">{item.en}</a></li>
				{/each}
			</ul>
		</nav>
		<div class="col-span-2 md:col-span-3">
			<p class="eyebrow mb-4">Social</p>
			<ul class="space-y-2 text-sm">
				{#each site.social as s (s.href)}
					<li>
						<a
							href={s.href}
							rel="me external noopener"
							target="_blank"
							class="hover:text-accent-text"
							>{s.label}<span class="sr-only">（新しいタブで開きます）</span></a
						>
					</li>
				{/each}
			</ul>
		</div>
		<p class="col-span-full border-t border-line pt-8 text-xs text-fg-muted">
			<small class="text-[length:inherit]"
				>&copy; {year} {site.author.nameEn}. All rights reserved.</small
			>
		</p>
	</Container>
</footer>
