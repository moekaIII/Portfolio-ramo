import { skills } from './profile.ts';

/** ヒーローの 3D の器に詰めるスキル（profile.ts の `tag` から生成） */
export interface SkillChip {
	text: string;
	/** 0: フロントエンド / 1: デザイン / 2: UX・品質（色分けに使う） */
	group: number;
}

export const skillChips: SkillChip[] = skills.flatMap((g, group) =>
	g.items.flatMap((s) => (s.tag ? [{ text: s.tag, group }] : []))
);

/** 凡例（静的表示用） */
export const skillGroups = skills.map((g) => g.group.toUpperCase());
