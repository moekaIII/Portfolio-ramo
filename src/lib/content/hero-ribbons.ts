import { skills } from './profile.ts';

/** ヒーローの 3D に流す帯（スキルの種類ごとに 1 本）。profile.ts の `tag` から生成する */
export interface Ribbon {
	/** 帯の先頭に小さく付く種類名（例: FRONTEND） */
	label: string;
	words: string[];
	/** 主力の帯（アクセント色で塗る） */
	accent: boolean;
}

export const ribbons: Ribbon[] = skills.map((g, i) => ({
	label: g.group.toUpperCase(),
	words: g.items.flatMap((s) => (s.tag ? [s.tag] : [])),
	accent: i === 0
}));
