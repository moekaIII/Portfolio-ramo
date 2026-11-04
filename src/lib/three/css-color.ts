let ctx: CanvasRenderingContext2D | null = null;

/**
 * CSS カスタムプロパティ（oklch など任意の CSS 色）を sRGB の [0..1] 配列に変換する。
 * 1px の canvas に塗って読み戻すため、ブラウザが解釈できる色空間ならすべて扱える。
 */
export function cssVarToRgb(
	name: string,
	el: Element = document.documentElement
): [number, number, number] {
	const value = getComputedStyle(el).getPropertyValue(name).trim() || '#888';
	ctx ??= Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext(
		'2d',
		{
			willReadFrequently: true
		}
	);
	if (!ctx) return [0.5, 0.5, 0.5];
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = value;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return [r / 255, g / 255, b / 255];
}
