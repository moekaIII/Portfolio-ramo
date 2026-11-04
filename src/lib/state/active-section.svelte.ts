import { sections, type SectionId } from '#lib/config/site.ts';

/** 画面上部 40% のラインを通過中のセクションを「現在地」とする */
class ActiveSectionState {
	current = $state<SectionId | null>(null);

	observe(): () => void {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) this.current = entry.target.id as SectionId;
					else if (this.current === entry.target.id) this.current = null;
				}
			},
			{ rootMargin: '-40% 0px -59% 0px' }
		);
		for (const { id } of sections) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}
}

export const activeSection = new ActiveSectionState();
