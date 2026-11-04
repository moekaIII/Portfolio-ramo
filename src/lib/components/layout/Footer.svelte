<script lang="ts">
	import { site } from '#lib/config/site.ts';
	import Container from '#lib/components/ui/Container.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-line">
	<Container
		class="flex flex-col gap-4 py-10 text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between"
	>
		<p>{site.author.jobTitle}</p>
		<p><small class="text-[length:inherit]">&copy; {year} {site.author.nameEn}</small></p>
	</Container>
</footer>
