import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

const FONT_FAMILY = '"Inter Variable", "Hiragino Sans", "Noto Sans CJK JP", sans-serif';
const PX_PER_UNIT = 256;

let measureCtx: CanvasRenderingContext2D | null = null;

/** ラベル文字列のワールド座標での幅（font-size はワールド単位） */
export function measureLabel(text: string, fontSize: number): number {
	measureCtx ??= document.createElement('canvas').getContext('2d');
	if (!measureCtx) return text.length * fontSize * 0.6;
	measureCtx.font = `600 ${fontSize * PX_PER_UNIT}px ${FONT_FAMILY}`;
	return measureCtx.measureText(text).width / PX_PER_UNIT;
}

/** ブロック上面に貼る、透明背景の文字テクスチャ。呼び出し側で dispose すること */
export function createLabelTexture(
	text: string,
	options: { width: number; height: number; fontSize: number; color: string }
): CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = Math.ceil(options.width * PX_PER_UNIT);
	canvas.height = Math.ceil(options.height * PX_PER_UNIT);
	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.font = `600 ${options.fontSize * PX_PER_UNIT}px ${FONT_FAMILY}`;
		ctx.fillStyle = options.color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, canvas.width / 2, canvas.height / 2 + canvas.height * 0.03);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	texture.minFilter = LinearFilter;
	texture.generateMipmaps = false;
	return texture;
}

/** 接地影（中心が濃い楕円グラデーション）。全ブロックで1枚を共有する */
export function createShadowTexture(): CanvasTexture {
	const size = 128;
	const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size });
	const ctx = canvas.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
		g.addColorStop(0, 'rgba(0,0,0,0.55)');
		g.addColorStop(0.55, 'rgba(0,0,0,0.25)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, size, size);
	}
	return new CanvasTexture(canvas);
}
