<script lang="ts">
	import Database from '@lucide/svelte/icons/database';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import MessageSquareCode from '@lucide/svelte/icons/message-square-code';
	import Plug from '@lucide/svelte/icons/plug';
	import Workflow from '@lucide/svelte/icons/workflow';
	import {
		siChartdotjs,
		siFigma,
		siGithubactions,
		siGithubcopilot,
		siGsap,
		siHtml5,
		siJavascript,
		siSvelte,
		siSwift,
		siTypescript,
		siVuedotjs,
		type SimpleIcon
	} from 'simple-icons';
	import type { SkillIcon } from '#lib/content/profile.ts';

	let { icon, size = 18 }: { icon: SkillIcon; size?: number } = $props();

	/** 公式ロゴ（Simple Icons, CC0）があるものはそれを、ないものは線のアイコンを使う */
	const BRAND: Partial<Record<SkillIcon, SimpleIcon>> = {
		svelte: siSvelte,
		ts: siTypescript,
		vue: siVuedotjs,
		js: siJavascript,
		markup: siHtml5,
		motion: siGsap,
		ci: siGithubactions,
		mobile: siSwift,
		design: siFigma,
		ai: siGithubcopilot,
		chart: siChartdotjs
	};
	const LINE = {
		cms: Database,
		api: Plug,
		teach: GraduationCap,
		review: MessageSquareCode,
		platform: Workflow
	};

	const brand = $derived(BRAND[icon]);
	const Line = $derived(LINE[icon as keyof typeof LINE] ?? Database);
	/** 黒のロゴ（Copilot など）はダークで見えなくなるので、文字色に合わせる */
	const fill = $derived(brand && brand.hex !== '000000' ? `#${brand.hex}` : 'currentColor');
</script>

{#if brand}
	<svg
		viewBox="0 0 24 24"
		width={size * 0.9}
		height={size * 0.9}
		{fill}
		aria-hidden="true"
		focusable="false"><path d={brand.path} /></svg
	>
{:else}
	<Line {size} strokeWidth={1.6} aria-hidden="true" />
{/if}
