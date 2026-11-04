<script lang="ts">
	import Mail from '@lucide/svelte/icons/mail';
	import Seo from '#lib/components/seo/Seo.svelte';
	import Container from '#lib/components/ui/Container.svelte';
	import ContactForm from '#lib/components/contact/ContactForm.svelte';
	import { site } from '#lib/config/site.ts';

	const steps = [
		{ title: 'お問い合わせ', body: 'フォームまたはメールでご連絡ください。' },
		{ title: '2営業日以内にご返信', body: '内容を確認し、オンライン面談の候補日をお送りします。' },
		{ title: '無料相談（60分）', body: '課題を伺い、進め方と概算をその場でお伝えします。' },
		{ title: 'ご提案・お見積り', body: '1週間ほどで、提案書と正式なお見積りをお送りします。' }
	];
</script>

<Seo
	title="お問い合わせ"
	description="UI/UXデザイン・フロントエンド開発のご相談はこちらから。要件が固まっていない段階でもお気軽にどうぞ。2営業日以内にご返信します。"
/>

<Container
	as="section"
	aria-labelledby="contact-title"
	class="pt-[calc(var(--header-h)+clamp(4rem,10vw,8rem))] pb-section"
>
	<div class="grid-12 gap-y-16">
		<div class="col-span-full md:col-span-5">
			<p class="eyebrow mb-5 flex items-center gap-3">
				<span aria-hidden="true" class="h-px w-8 bg-accent-text"></span>Contact
			</p>
			<h1 id="contact-title" class="text-h1 font-semibold">ご相談・<br />お問い合わせ</h1>
			<p class="mt-8 text-lead text-fg-muted">
				要件が固まっていなくても大丈夫です。「何から始めればいいか分からない」という段階から、一緒に整理します。
			</p>

			<h2 class="eyebrow mt-16 mb-6">ご相談の流れ</h2>
			<ol class="space-y-6">
				{#each steps as step, i (step.title)}
					<li class="flex gap-5">
						<span class="text-sm text-accent-text tabular" aria-hidden="true">0{i + 1}</span>
						<div>
							<p class="font-medium">{step.title}</p>
							<p class="mt-1 text-sm text-fg-muted">{step.body}</p>
						</div>
					</li>
				{/each}
			</ol>

			<div class="mt-16 border-t border-line pt-8">
				<p class="text-sm text-fg-muted">メールでのご連絡</p>
				<a
					href="mailto:{site.author.email}"
					class="mt-2 inline-flex items-center gap-2 text-lg font-medium underline decoration-accent-text underline-offset-4"
				>
					<Mail size={18} aria-hidden="true" />{site.author.email}
				</a>
			</div>
		</div>

		<div class="col-span-full md:col-span-7 lg:col-span-6 lg:col-start-7">
			<h2 class="sr-only">お問い合わせフォーム</h2>
			<ContactForm />
		</div>
	</div>
</Container>
