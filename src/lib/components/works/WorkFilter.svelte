<script lang="ts">
	import { WORK_CATEGORIES, type WorkCategory } from '#lib/types/work.ts';

	type Props = {
		active: WorkCategory | null;
		counts: Record<WorkCategory | 'all', number>;
		onchange: (category: WorkCategory | null) => void;
	};

	let { active, counts, onchange }: Props = $props();

	const options: { value: WorkCategory | null; label: string }[] = [
		{ value: null, label: 'すべて' },
		...(Object.entries(WORK_CATEGORIES) as [WorkCategory, { label: string }][]).map(
			([value, { label }]) => ({ value, label })
		)
	];
</script>

<div role="group" aria-label="カテゴリで絞り込む" class="flex flex-wrap gap-2">
	{#each options as option (option.value ?? 'all')}
		{@const pressed = active === option.value}
		{@const count = counts[option.value ?? 'all']}
		<button
			type="button"
			aria-pressed={pressed}
			disabled={count === 0}
			onclick={() => onchange(option.value)}
			class={[
				'inline-flex h-11 items-center gap-2 rounded-pill border px-5 text-sm transition-colors duration-200',
				'disabled:cursor-not-allowed disabled:opacity-40',
				pressed ? 'border-fg bg-fg text-bg' : 'border-line-strong text-fg hover:border-fg'
			]}
		>
			{option.label}
			<span class={['text-xs tabular', pressed ? 'text-bg/70' : 'text-fg-muted']}>{count}</span>
		</button>
	{/each}
</div>
