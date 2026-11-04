export type Quality = 'high' | 'low';

export interface QualitySettings {
	/** devicePixelRatio の上限 */
	maxDpr: number;
	/** 種類ごとに机へ置くブロックの最大数 */
	blocksPerGroup: number;
	antialias: boolean;
}

export const QUALITY: Record<Quality, QualitySettings> = {
	high: { maxDpr: 2, blocksPerGroup: Infinity, antialias: true },
	low: { maxDpr: 2, blocksPerGroup: 3, antialias: true }
};

/**
 * モバイル・低スペック・省データ設定では、ブロック数を減らして負荷を下げる。
 * 文字の読みやすさを優先し、解像度（DPR 上限 2）とアンチエイリアスは下げない。
 * 静止時は再描画しないため、常時の負荷はほぼない。
 */
export function detectQuality(): Quality {
	const coarse = matchMedia('(pointer: coarse)').matches;
	const narrow = matchMedia('(max-width: 767px)').matches;
	const cores = navigator.hardwareConcurrency ?? 4;
	const saveData =
		(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
		true;
	return coarse || narrow || cores <= 4 || saveData ? 'low' : 'high';
}
