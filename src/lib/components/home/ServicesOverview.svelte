<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';
	import Button from '#lib/components/ui/Button.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import SectionHeading from '#lib/components/ui/SectionHeading.svelte';
	import { services } from '#lib/content/services.ts';
</script>

<section aria-labelledby="services-heading" class="border-t border-line py-section">
	<Container>
		<SectionHeading
			id="services-heading"
			eyebrow="Services"
			title="提供サービス"
			lead="プロジェクトのどの段階からでも参加できます。必要な領域だけを切り出してのご依頼も可能です。"
		>
			{#snippet actions()}
				<Button href={resolve('/services')} variant="secondary">
					サービスと進め方
					{#snippet icon()}<ArrowRight size={16} />{/snippet}
				</Button>
			{/snippet}
		</SectionHeading>

		<ul class="mt-16 border-b border-line">
			{#each services as service, i (service.id)}
				<li>
					<a
						href={resolve(`/services#${service.id}`)}
						class="group grid-12 items-baseline gap-y-3 border-t border-line py-8 md:py-10"
					>
						<span class="col-span-1 text-sm text-fg-muted tabular" aria-hidden="true">0{i + 1}</span
						>
						<span class="col-span-3 md:col-span-5">
							<span
								class="block text-h3 font-semibold transition-colors group-hover:text-accent-text"
								>{service.title}</span
							>
							<span class="eyebrow mt-2 block">{service.en}</span>
						</span>
						<span class="col-span-full text-fg-muted md:col-span-5">{service.summary}</span>
						<ArrowRight
							size={20}
							aria-hidden="true"
							class="col-span-1 hidden justify-self-end text-fg-muted transition-transform duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-fg md:block"
						/>
					</a>
				</li>
			{/each}
		</ul>
	</Container>
</section>
