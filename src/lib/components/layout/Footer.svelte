<script lang="ts">
	import iconGithub from '#lib/assets/icon-github.svg';
	import { site } from '#lib/config/site.ts';

	const github = site.social.find((s) => s.label === 'GitHub');
</script>

<footer class="flex w-full items-center justify-center border-t border-line p-8">
	{#if github}
		<a
			href={github.href}
			rel="me external noopener"
			target="_blank"
			class="rounded-pill opacity-80 transition-opacity hover:opacity-100"
		>
			<img src={iconGithub} alt="GitHub（新しいタブで開きます）" class="w-10 dark:invert" />
		</a>
	{/if}
</footer>
