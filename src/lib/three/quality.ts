export type Quality = 'high' | 'low';

export interface QualitySettings {
	quality: Quality;
	/** devicePixelRatio の上限 */
	maxDpr: number;
	antialias: boolean;
}

export const QUALITY: Record<Quality, QualitySettings> = {
	high: { quality: 'high', maxDpr: 2, antialias: true },
	// モバイル: クリアコートなし・30fps・DPR 1.5（常に浮遊して描画し続けるため電池に配慮）
	low: { quality: 'low', maxDpr: 1.5, antialias: true }
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
