export type Quality = 'high' | 'low';

export interface QualitySettings {
	/** devicePixelRatio の上限 */
	maxDpr: number;
	/** 机に置くブロックの最大数 */
	maxBlocks: number;
	antialias: boolean;
}

export const QUALITY: Record<Quality, QualitySettings> = {
	high: { maxDpr: 2, maxBlocks: 14, antialias: true },
	low: { maxDpr: 1.5, maxBlocks: 9, antialias: false }
};

/** モバイル・低スペック・省データ設定では負荷を下げる */
export function detectQuality(): Quality {
	const coarse = matchMedia('(pointer: coarse)').matches;
	const narrow = matchMedia('(max-width: 767px)').matches;
	const cores = navigator.hardwareConcurrency ?? 4;
	const saveData =
		(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
		true;
	return coarse || narrow || cores <= 4 || saveData ? 'low' : 'high';
}
