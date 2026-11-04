import { skills } from './profile.ts';
import type { DeskLabel } from '#lib/three/desk-physics.ts';

/** 3D の机に並べるスキル（profile.ts の `block` を持つもの）。先頭の主力スキルをアクセント色にする */
export const deskLabels: DeskLabel[] = skills
	.flatMap((g) => g.items)
	.filter((s) => s.block)
	.map((s, i) => ({ text: s.block as string, accent: i === 0 }));
