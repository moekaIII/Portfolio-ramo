export type Quality = 'high' | 'low';

export interface QualitySettings {
	/** 点の間隔（CSS px）。列数はビューポート幅から算出 */
	spacing: number;
	/** 点全体の不透明度（テキストの可読性を優先して調整） */
	opacity: number;
	/** devicePixelRatio の上限 */
	maxDpr: number;
	pointSize: number;
	antialias: boolean;
}

export const QUALITY: Record<Quality, QualitySettings> = {
	high: { spacing: 10, opacity: 1, maxDpr: 2, pointSize: 2.1, antialias: false },
	low: { spacing: 13, opacity: 0.7, maxDpr: 1.5, pointSize: 2.2, antialias: false }
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
