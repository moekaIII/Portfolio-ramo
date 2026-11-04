import { CanvasTexture, SRGBColorSpace } from 'three';

/**
 * 水彩風の花びらテクスチャを手続き的に描く（外部画像は使わない）。
 * UV: u = 花びらの幅方向（0..1）、v = 付け根(0)→先端(1)。テクスチャの縁が、そのまま花びらの縁になる。
 *
 * 水彩らしさの要素:
 * - にじみ（ぼかした色の塊を重ねる）/ 付け根ほど濃く先端ほど淡いグラデーション
 * - 縁に溜まる顔料（エッジの濃い線）/ ブルーム（水が戻って広がった模様）
 * - 粒状感（顔料の粒）/ 付け根からの淡い筋 / 不規則にぼけた縁（アルファ）
 */

export type RGB = [number, number, number];

export interface WatercolorPalette {
	/** 付け根の濃い色 */
	deep: RGB;
	/** 中ほどの色 */
	mid: RGB;
	/** 先端の淡い色 */
	pale: RGB;
	/** 縁に溜まる顔料の色 */
	edge: RGB;
	/** 文字の色 */
	ink: RGB;
	/** にじみに混ぜる、暖かい差し色 */
	warm: RGB;
}

export function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const css = ([r, g, b]: RGB, a: number) =>
	`rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
const lerp = (a: RGB, b: RGB, t: number): RGB => [
	a[0] + (b[0] - a[0]) * t,
	a[1] + (b[1] - a[1]) * t,
	a[2] + (b[2] - a[2]) * t
];

/** ぼかした丸い色の塊（ctx.filter を使わず、放射グラデーションで柔らかくする） */
function blob(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	r: number,
	color: RGB,
	a: number
) {
	const g = ctx.createRadialGradient(x, y, 0, x, y, r);
	g.addColorStop(0, css(color, a));
	g.addColorStop(0.55, css(color, a * 0.55));
	g.addColorStop(1, css(color, 0));
	ctx.fillStyle = g;
	ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function createWatercolorPetal(options: {
	width: number;
	height: number;
	seed: number;
	palette: WatercolorPalette;
	texts: string[];
	/** 文字の向きを反転する（花びらが画面の左を向くとき、逆さに見えないように） */
	flipText?: boolean;
	anisotropy?: number;
}): CanvasTexture {
	const { width: W, height: H, palette: p, texts } = options;
	const rand = mulberry32(options.seed);
	const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
	const ctx = canvas.getContext('2d')!;
	// キャンバスの y は下向きなので、v（付け根=0）を y = H - v*H に対応させる
	const Y = (v: number) => H - v * H;

	// 1. 下地: 付け根 → 先端のグラデーション
	const base = ctx.createLinearGradient(0, H, 0, 0);
	base.addColorStop(0, css(p.deep, 1));
	base.addColorStop(0.35, css(p.mid, 1));
	base.addColorStop(1, css(p.pale, 1));
	ctx.fillStyle = base;
	ctx.fillRect(0, 0, W, H);

	// 2. にじみ: 色の塊をランダムに重ねる（濃淡のむら）
	for (let i = 0; i < 70; i++) {
		const v = Math.pow(rand(), 0.8);
		const color = lerp(lerp(p.deep, p.mid, Math.min(1, v * 2)), p.pale, Math.max(0, v * 2 - 1));
		const tinted = lerp(color, rand() < 0.5 ? p.deep : p.pale, rand() * 0.5);
		blob(ctx, rand() * W, Y(v), (0.08 + rand() * 0.22) * W, tinted, 0.12 + rand() * 0.2);
	}

	// 3. ウェット・イン・ウェット: 付け根の濃い色が、水を含んだ紙の上で先端へ不規則ににじみ上がる
	for (let k = 0; k < 3; k++) {
		let x = W * (0.3 + rand() * 0.4);
		let v = 0.02;
		while (v < 0.55 + rand() * 0.2) {
			blob(ctx, x, Y(v), W * (0.1 + rand() * 0.12), p.deep, 0.07 + rand() * 0.06);
			x += (rand() - 0.5) * W * 0.12;
			v += 0.04 + rand() * 0.05;
		}
	}
	// 暖かい差し色をところどころに落とす
	for (let i = 0; i < 6; i++) {
		blob(
			ctx,
			rand() * W,
			Y(0.35 + rand() * 0.55),
			W * (0.12 + rand() * 0.16),
			p.warm,
			0.1 + rand() * 0.1
		);
	}
	// ブルーム（水が戻って広がった跡）: 輪郭は線にせず、外周がほんのり濃くなる程度
	for (let i = 0; i < 2; i++) {
		const x = (0.25 + rand() * 0.5) * W;
		const y = Y(0.45 + rand() * 0.4);
		const r = (0.14 + rand() * 0.12) * W;
		const g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, css(p.pale, 0.28));
		g.addColorStop(0.7, css(p.pale, 0.08));
		g.addColorStop(0.9, css(p.edge, 0.07));
		g.addColorStop(1, css(p.edge, 0));
		ctx.fillStyle = g;
		ctx.fillRect(x - r, y - r, r * 2, r * 2);
	}

	// 4. 付け根からの淡い筋
	ctx.lineCap = 'round';
	for (let i = 0; i < 9; i++) {
		const u = 0.15 + (i / 8) * 0.7 + (rand() - 0.5) * 0.04;
		ctx.strokeStyle = css(p.deep, 0.08 + rand() * 0.06);
		ctx.lineWidth = W * (0.004 + rand() * 0.004);
		ctx.beginPath();
		ctx.moveTo(W * 0.5, H);
		ctx.quadraticCurveTo(W * (0.5 + (u - 0.5) * 0.6), Y(0.4), W * u, Y(0.55 + rand() * 0.35));
		ctx.stroke();
	}

	// 5. 縁に溜まる顔料（左右の縁と先端）
	const edgeDots = 220;
	for (let i = 0; i < edgeDots; i++) {
		const t = i / edgeDots;
		const r = W * (0.018 + rand() * 0.03);
		const a = 0.08 + rand() * 0.12;
		const jitter = (rand() - 0.5) * W * 0.015;
		if (t < 0.4) {
			const v = 0.1 + (t / 0.4) * 0.85;
			blob(ctx, W * 0.03 + jitter, Y(v), r, p.edge, a);
		} else if (t < 0.8) {
			const v = 0.1 + ((t - 0.4) / 0.4) * 0.85;
			blob(ctx, W * 0.97 + jitter, Y(v), r, p.edge, a);
		} else {
			const u = 0.08 + ((t - 0.8) / 0.2) * 0.84;
			blob(ctx, W * u, Y(0.975) + jitter, r, p.edge, a);
		}
	}

	// 6. 粒状感（顔料の粒と、紙の白い抜け）
	const grains = Math.round((W * H) / 220);
	for (let i = 0; i < grains; i++) {
		const dark = rand() < 0.6;
		ctx.fillStyle = dark ? css(p.edge, 0.05 + rand() * 0.07) : 'rgba(255,255,255,0.08)';
		const s = 0.8 + rand() * 1.6;
		ctx.fillRect(rand() * W, rand() * H, s, s);
	}

	// 7. スキル名: 顔料の色で小さく、花びらに沿って
	const family = '"Inter Variable", "Hiragino Sans", sans-serif';
	ctx.save();
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = css(p.ink, 0.62);
	texts.forEach((text, i) => {
		const fontSize = W * 0.055;
		ctx.font = `600 ${fontSize}px ${family}`;
		ctx.letterSpacing = `${fontSize * 0.08}px`;
		ctx.save();
		ctx.translate(W * (0.5 + (i - (texts.length - 1) / 2) * 0.16), Y(0.6 - i * 0.04));
		ctx.rotate((options.flipText ? Math.PI / 2 : -Math.PI / 2) + (i - 1) * 0.08);
		ctx.fillText(text, 0, 0);
		ctx.restore();
	});
	ctx.restore();

	// 8. 縁をふわっとぼかす（不規則に削る）
	ctx.globalCompositeOperation = 'destination-out';
	for (let i = 0; i < 260; i++) {
		const t = rand();
		const r = W * (0.02 + rand() * 0.03);
		const side = rand();
		const [x, y] =
			side < 0.4 ? [-r * 0.35, Y(t)] : side < 0.8 ? [W + r * 0.35, Y(t)] : [W * t, -r * 0.35];
		const g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, 'rgba(0,0,0,0.9)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(x - r, y - r, r * 2, r * 2);
	}
	ctx.globalCompositeOperation = 'source-over';

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = options.anisotropy ?? 4;
	return texture;
}
