<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { site } from '#lib/config/site.ts';

	let copied = $state(false);
	let timer: number | undefined;

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(site.author.email);
			copied = true;
			window.clearTimeout(timer);
			timer = window.setTimeout(() => (copied = false), 2000);
		} catch {
			/* clipboard unavailable: メールリンクで代替できる */
		}
	}
</script>

<div class="grid-12 gap-y-12">
	<div class="col-span-full md:col-span-7">
		<p class="text-sm text-fg-muted">メール</p>
		<div class="mt-3 flex flex-wrap items-center gap-4">
			<a
				href="mailto:{site.author.email}"
				class="text-h2 font-semibold break-all underline decoration-accent-text decoration-2 underline-offset-[0.2em] hover:decoration-fg"
			>
				{site.author.email}
			</a>
			<button
				type="button"
				onclick={copyEmail}
				class="inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong px-4 text-sm transition-colors hover:border-fg"
			>
				{#if copied}
					<Check size={16} aria-hidden="true" class="text-accent-text" />コピーしました
				{:else}
					<Copy size={16} aria-hidden="true" />アドレスをコピー
				{/if}
			</button>
			<span class="sr-only" aria-live="polite"
				>{copied ? 'メールアドレスをコピーしました' : ''}</span
			>
		</div>
		<p class="mt-6 max-w-[36em] text-fg-muted">
			採用・業務委託のどちらのご連絡も歓迎しています。2営業日以内にお返事します。
		</p>
	</div>

	<div class="col-span-full md:col-span-4 md:col-start-9">
		<p class="text-sm text-fg-muted">SNS</p>
		<ul class="mt-3 divide-y divide-line border-y border-line">
			{#each site.social as s (s.href)}
				<li>
					<a
						href={s.href}
						rel="me external noopener"
						target="_blank"
						class="group flex items-center justify-between py-4 hover:text-accent-text"
					>
						{s.label}<span class="sr-only">（新しいタブで開きます）</span>
						<ArrowUpRight
							size={18}
							aria-hidden="true"
							class="text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						/>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>
