<script lang="ts">
	import { tick } from 'svelte';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Button from '#lib/components/ui/Button.svelte';
	import Field from '#lib/components/ui/Field.svelte';
	import { formConfig } from '#lib/config/form.ts';
	import { services } from '#lib/content/services.ts';

	type Status = 'idle' | 'submitting' | 'success' | 'error';

	const topics = [...services.map((s) => s.title), 'その他'];
	const budgets = ['〜100万円', '100〜300万円', '300〜500万円', '500万円〜', '未定・相談したい'];
	const timelines = ['すぐにでも', '1〜3か月以内', '3か月以降', '未定'];

	let form: HTMLFormElement | undefined = $state();
	let successHeading: HTMLHeadingElement | undefined = $state();
	let status = $state<Status>('idle');
	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});

	const inputClass =
		'w-full rounded-md border border-line-strong bg-bg px-4 py-3 text-base text-fg transition-colors placeholder:text-fg-muted/70 hover:border-fg-muted focus-visible:border-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 aria-[invalid=true]:border-error';

	/** ネイティブの制約検証（required / type / minlength）を日本語メッセージに変換 */
	function messageFor(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
		const v = el.validity;
		if (v.valid) return '';
		if (v.valueMissing) {
			if (el instanceof HTMLInputElement && el.type === 'checkbox') return '同意が必要です';
			return 'この項目は必須です';
		}
		if (v.typeMismatch) return 'メールアドレスの形式で入力してください（例: name@example.com）';
		if (v.tooShort) return `${(el as HTMLTextAreaElement).minLength}文字以上で入力してください`;
		return '入力内容を確認してください';
	}

	function validateField(el: EventTarget | null) {
		if (
			!(
				el instanceof HTMLInputElement ||
				el instanceof HTMLTextAreaElement ||
				el instanceof HTMLSelectElement
			) ||
			!el.name
		)
			return;
		const message = messageFor(el);
		if (message) errors[el.name] = message;
		else delete errors[el.name];
	}

	function onblur(event: FocusEvent) {
		const el = event.target as HTMLInputElement;
		if (!el.name) return;
		touched[el.name] = true;
		validateField(el);
	}

	function oninput(event: Event) {
		const el = event.target as HTMLInputElement;
		// 一度エラーになった項目だけ入力中に再検証する（入力途中で叱らない）
		if (touched[el.name]) validateField(el);
	}

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!form || status === 'submitting') return;

		const controls = [...form.elements].filter(
			(el): el is HTMLInputElement => 'validity' in el && Boolean((el as HTMLInputElement).name)
		);
		for (const el of controls) {
			touched[el.name] = true;
			validateField(el);
		}
		const firstInvalid = controls.find((el) => !el.validity.valid);
		if (firstInvalid) {
			firstInvalid.focus();
			return;
		}

		status = 'submitting';
		const data = new FormData(form);
		for (const [key, value] of Object.entries(formConfig.extraFields)) data.set(key, value);

		try {
			const res = await fetch(formConfig.endpoint, {
				method: 'POST',
				body: data,
				headers: { Accept: 'application/json' }
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			status = 'success';
			form.reset();
			await tick();
			successHeading?.focus();
		} catch {
			status = 'error';
		}
	}
</script>

{#if status === 'success'}
	<div class="rounded-lg border border-line bg-surface p-8 md:p-12" role="status">
		<CircleCheck size={32} aria-hidden="true" class="text-accent-text" />
		<h2 bind:this={successHeading} tabindex="-1" class="mt-6 text-h3 font-semibold outline-none">
			送信が完了しました。
		</h2>
		<p class="mt-4 text-fg-muted">
			お問い合わせありがとうございます。内容を確認のうえ、2営業日以内にご返信いたします。
		</p>
		<Button variant="secondary" class="mt-8" onclick={() => (status = 'idle')}>
			別の内容を送信する
		</Button>
	</div>
{:else}
	<!-- JS 無効時は action へのネイティブ POST で送信される -->
	<form
		bind:this={form}
		action={formConfig.endpoint}
		method="POST"
		novalidate
		{onsubmit}
		onfocusout={onblur}
		{oninput}
		onchange={oninput}
		class="grid gap-x-(--grid-gap) gap-y-8 md:grid-cols-2"
	>
		<!-- ハニーポット（スクリーンリーダー・キーボードからも到達しない） -->
		<div aria-hidden="true" class="absolute -left-[9999px]" inert>
			<label>
				入力しないでください
				<input type="text" name={formConfig.honeypotField} tabindex="-1" autocomplete="off" />
			</label>
		</div>

		<Field id="name" label="お名前" required error={errors.name}>
			{#snippet children({ id, describedBy, invalid })}
				<input
					{id}
					name="name"
					type="text"
					required
					autocomplete="name"
					class={inputClass}
					aria-describedby={describedBy}
					aria-invalid={invalid}
				/>
			{/snippet}
		</Field>

		<Field id="company" label="会社名・団体名" error={errors.company}>
			{#snippet children({ id, describedBy, invalid })}
				<input
					{id}
					name="company"
					type="text"
					autocomplete="organization"
					class={inputClass}
					aria-describedby={describedBy}
					aria-invalid={invalid}
				/>
			{/snippet}
		</Field>

		<Field id="email" label="メールアドレス" required error={errors.email} class="md:col-span-2">
			{#snippet children({ id, describedBy, invalid })}
				<input
					{id}
					name="email"
					type="email"
					required
					autocomplete="email"
					inputmode="email"
					class={inputClass}
					aria-describedby={describedBy}
					aria-invalid={invalid}
				/>
			{/snippet}
		</Field>

		<fieldset class="md:col-span-2">
			<legend class="mb-3 flex items-center gap-2 text-sm font-medium">
				ご相談の種類 <span class="text-xs font-normal text-fg-muted">任意・複数選択可</span>
			</legend>
			<div class="flex flex-wrap gap-2">
				{#each topics as topic (topic)}
					<label
						class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border border-line-strong px-4 text-sm transition-colors hover:border-fg has-checked:border-accent-text has-checked:bg-accent-soft has-focus-visible:ring-2 has-focus-visible:ring-focus"
					>
						<input
							type="checkbox"
							name="topic"
							value={topic}
							class="size-4 accent-(--accent-text)"
						/>
						{topic}
					</label>
				{/each}
			</div>
		</fieldset>

		<Field id="budget" label="ご予算感" error={errors.budget}>
			{#snippet children({ id, describedBy })}
				<select {id} name="budget" class={inputClass} aria-describedby={describedBy}>
					<option value="">選択してください</option>
					{#each budgets as b (b)}<option value={b}>{b}</option>{/each}
				</select>
			{/snippet}
		</Field>

		<Field id="timeline" label="ご希望の開始時期" error={errors.timeline}>
			{#snippet children({ id, describedBy })}
				<select {id} name="timeline" class={inputClass} aria-describedby={describedBy}>
					<option value="">選択してください</option>
					{#each timelines as t (t)}<option value={t}>{t}</option>{/each}
				</select>
			{/snippet}
		</Field>

		<Field
			id="message"
			label="ご相談内容"
			required
			hint="現状の課題、実現したいこと、参考URLなどをご自由にお書きください（20文字以上）。"
			error={errors.message}
			class="md:col-span-2"
		>
			{#snippet children({ id, describedBy, invalid })}
				<textarea
					{id}
					name="message"
					required
					minlength="20"
					rows="7"
					class={[inputClass, 'resize-y leading-relaxed']}
					aria-describedby={describedBy}
					aria-invalid={invalid}></textarea>
			{/snippet}
		</Field>

		<div class="md:col-span-2">
			<label class="inline-flex cursor-pointer items-start gap-3 text-sm">
				<input
					type="checkbox"
					name="consent"
					required
					class="mt-1 size-4 accent-(--accent-text)"
					aria-invalid={Boolean(errors.consent)}
					aria-describedby={errors.consent ? 'consent-error' : undefined}
				/>
				<span
					>送信内容をお問い合わせへの対応のみに利用することに同意します。<span
						class="ml-2 text-xs text-accent-text">必須</span
					></span
				>
			</label>
			{#if errors.consent}<p id="consent-error" class="mt-2 text-sm text-error">
					{errors.consent}
				</p>{/if}
		</div>

		<div class="flex flex-col items-start gap-4 md:col-span-2">
			<Button type="submit" size="lg" disabled={status === 'submitting'}>
				{status === 'submitting' ? '送信中…' : '送信する'}
				{#snippet icon()}
					{#if status === 'submitting'}
						<LoaderCircle size={18} class="animate-spin" />
					{:else}
						<ArrowUpRight size={18} />
					{/if}
				{/snippet}
			</Button>
			<p aria-live="polite" class="text-sm">
				{#if status === 'error'}
					<span class="text-error"
						>送信に失敗しました。時間をおいて再度お試しいただくか、メールでご連絡ください。</span
					>
				{:else if Object.keys(errors).length > 0}
					<span class="text-error">入力内容に{Object.keys(errors).length}件の不備があります。</span>
				{/if}
			</p>
		</div>
	</form>
{/if}
