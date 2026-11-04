import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';

const FONT_FAMILY = '"Inter Variable", "Hiragino Sans", "Noto Sans CJK JP", sans-serif';
/** 文字幅の計測に使う基準解像度（描画解像度とは独立） */
const MEASURE_PX = 256;
/** テクスチャ 1 辺の上限（GPU メモリの暴走を防ぐ） */
const MAX_SIZE = 2048;

let measureCtx: CanvasRenderingContext2D | null = null;

/** ラベル文字列のワールド座標での幅（font-size はワールド単位） */
export function measureLabel(text: string, fontSize: number, weight = 600): number {
	measureCtx ??= document.createElement('canvas').getContext('2d');
	if (!measureCtx) return text.length * fontSize * 0.6;
	measureCtx.font = `${weight} ${fontSize * MEASURE_PX}px ${FONT_FAMILY}`;
	return measureCtx.measureText(text).width / MEASURE_PX;
}

/**
 * 画面上で 1 ワールド単位が何 px で表示されるか（pxPerUnit）に合わせた解像度で描き、
 * 拡大・縮小どちらでもにじまないようにする。
 */
function createCanvas(width: number, height: number, pxPerUnit: number) {
	const scale = Math.min(pxPerUnit, MAX_SIZE / Math.max(width, height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(2, Math.ceil(width * scale));
	canvas.height = Math.max(2, Math.ceil(height * scale));
	return { canvas, ctx: canvas.getContext('2d'), scale };
}

function makeTexture(canvas: HTMLCanvasElement, anisotropy: number): CanvasTexture {
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = anisotropy;
	texture.magFilter = LinearFilter;
	// 縮小表示でも文字がギザつかないようにミップマップを使う
	texture.minFilter = LinearMipmapLinearFilter;
	texture.generateMipmaps = true;
	return texture;
}

export type TextureQuality = { pxPerUnit: number; anisotropy: number };

/** ブロック上面に貼る、透明背景の文字テクスチャ。呼び出し側で dispose すること */
export function createLabelTexture(
	text: string,
	options: { width: number; height: number; fontSize: number; color: string },
	quality: TextureQuality
): CanvasTexture {
	const { canvas, ctx, scale } = createCanvas(options.width, options.height, quality.pxPerUnit);
	if (ctx) {
		ctx.font = `600 ${options.fontSize * scale}px ${FONT_FAMILY}`;
		ctx.fillStyle = options.color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, canvas.width / 2, canvas.height / 2 + canvas.height * 0.03);
	}
	return makeTexture(canvas, quality.anisotropy);
}

/** 整列時に列の頭へ印字する種類名（左揃え）。呼び出し側で dispose すること */
export function createHeaderTexture(
	options: { label: string; width: number; height: number; fontSize: number; color: string },
	quality: TextureQuality
): CanvasTexture {
	const { canvas, ctx, scale } = createCanvas(options.width, options.height, quality.pxPerUnit);
	if (ctx) {
		ctx.font = `700 ${options.fontSize * scale}px ${FONT_FAMILY}`;
		ctx.fillStyle = options.color;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(options.label, 0, canvas.height / 2);
	}
	return makeTexture(canvas, quality.anisotropy);
}

/** 接地影（中心が濃い楕円グラデーション）。全ブロックで1枚を共有する */
export function createShadowTexture(): CanvasTexture {
	const size = 128;
	const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size });
	const ctx = canvas.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
		g.addColorStop(0, 'rgba(0,0,0,0.5)');
		g.addColorStop(0.55, 'rgba(0,0,0,0.22)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, size, size);
	}
	return new CanvasTexture(canvas);
}
