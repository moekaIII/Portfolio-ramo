import { skills } from './profile.ts';
import type { DeskGroup, DeskLabel } from '#lib/three/desk-physics.ts';

/** 机の各列（左から フロントエンド / デザイン / その他）。整列時に列の頭へ印字する */
export const deskGroups: DeskGroup[] = skills.map((g) => ({ label: g.deskLabel }));

/**
 * 3D の机に並べるスキル（profile.ts で `block` を指定したもの、profile.ts の並び順）。
 * 主力スキル（profile.ts の先頭）をアクセント色にする。
 * perGroup を指定すると、種類ごとに先頭 N 個だけにする（モバイルでも全種類が残るように）。
 */
export function getDeskLabels(perGroup = Infinity): DeskLabel[] {
	const primary = skills[0]?.items[0]?.name;
	return skills.flatMap((g, groupIndex) =>
		g.items
			.filter((s) => s.block)
			.slice(0, perGroup)
			.map((s) => ({ text: s.block as string, accent: s.name === primary, groupIndex }))
	);
}
