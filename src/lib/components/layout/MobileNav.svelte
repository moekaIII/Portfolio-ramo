<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import { site } from '#lib/config/site.ts';
	import { smoothScroll } from '#lib/state/smooth-scroll.svelte.ts';
	import Nav from './Nav.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let dialog: HTMLDialogElement | undefined = $state();
	let open = $state(false);

	function show() {
		dialog?.showModal();
		open = true;
		smoothScroll.lock();
	}
	function close() {
		// close イベントを待たずに解除する（直後のページ内スクロールを止めないため）
		smoothScroll.unlock();
		dialog?.close();
	}
</script>

<button
	type="button"
	class="inline-flex size-11 items-center justify-center rounded-pill text-fg transition-colors hover:bg-surface-2"
	aria-label="メニューを開く"
	aria-haspopup="dialog"
	aria-expanded={open}
	aria-controls="mobile-nav"
	onclick={show}
>
	<Menu size={20} aria-hidden="true" />
</button>

<dialog
	bind:this={dialog}
	id="mobile-nav"
	aria-label="メニュー"
	data-lenis-prevent
	class="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-fg backdrop:bg-transparent"
	onclose={() => {
		open = false;
		smoothScroll.unlock();
	}}
>
	<div class="flex h-full flex-col px-gutter pb-10">
		<div class="flex h-header items-center justify-between">
			<span class="text-[0.9375rem] font-semibold tracking-tight">{site.name}</span>
			<div class="flex items-center gap-1">
				<ThemeToggle />
				<button
					type="button"
					class="inline-flex size-11 items-center justify-center rounded-pill hover:bg-surface-2"
					aria-label="メニューを閉じる"
					onclick={close}
				>
					<X size={20} aria-hidden="true" />
				</button>
			</div>
		</div>
		<nav aria-label="ページ内（モバイル）" class="mt-10 flex-1">
			<Nav variant="menu" onnavigate={close} />
		</nav>
	</div>
</dialog>
