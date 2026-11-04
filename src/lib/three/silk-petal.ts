import { CanvasTexture, SRGBColorSpace } from 'three';
import { mulberry32, type RGB } from './random.ts';

/**
 * 光が透ける薄い花びら（ポピーのような）のテクスチャ。
 * UV: u = 幅方向（0..1）、v = 付け根(0)→先端(1)。テクスチャの縁がそのまま花びらの縁になる。
 * - 付け根の濃いオレンジから、先端の淡いピンクへ溶けるグラデーション
 * - ゴールド・ピーチ・ローズ・マゼンタ・ライラック・淡いグリーンのにじみを重ねた、複雑な色味
 * - 薄い布のような、付け根から伸びる淡い筋と、縁の一部に溜まる深いさび色
 */
export interface SilkPalette {
	base: RGB;
	mid: RGB;
	tip: RGB;
	rim: RGB;
	ink: RGB;
	/** 付け根の差し色（ゴールドなど） */
	heart: RGB;
	/** 中ほどの差し色（ローズなど） */
	blush: RGB;
	/** 先端寄りの差し色（ライラックなど） */
	haze: RGB;
	/** 花びらの上に薄く重ねる、さまざまな色のにじみ */
	accents: RGB[];
}

const css = ([r, g, b]: RGB, a: number) =>
	`rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;

export function createSilkPetal(options: {
	width: number;
	height: number;
	seed: number;
	palette: SilkPalette;
	texts: string[];
	flipText?: boolean;
	anisotropy?: number;
}): CanvasTexture {
	const { width: W, height: H, palette: p, texts } = options;
	const rand = mulberry32(options.seed);
	const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
	const ctx = canvas.getContext('2d')!;
	const Y = (v: number) => H - v * H;

	// 1. 色: 付け根のゴールド → オレンジ → コーラル → ローズ → 先端の淡いライラックピンク
	const g = ctx.createLinearGradient(0, H, 0, 0);
	g.addColorStop(0, css(p.heart, 1));
	g.addColorStop(0.12 + rand() * 0.05, css(p.base, 1));
	g.addColorStop(0.35 + rand() * 0.08, css(p.mid, 1));
	g.addColorStop(0.62 + rand() * 0.08, css(p.blush, 1));
	g.addColorStop(0.85, css(p.tip, 1));
	g.addColorStop(1, css(p.haze, 1));
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, W, H);

	// 2. 色のゆらぎ（大きくぼかした塊）
	const blob = (x: number, y: number, r: number, c: RGB, a: number) => {
		const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
		rg.addColorStop(0, css(c, a));
		rg.addColorStop(1, css(c, 0));
		ctx.fillStyle = rg;
		ctx.fillRect(x - r, y - r, r * 2, r * 2);
	};
	for (let i = 0; i < 18; i++) {
		const v = rand();
		blob(rand() * W, Y(v), W * (0.2 + rand() * 0.3), v < 0.5 ? p.mid : p.tip, 0.25);
	}
	// 複雑さ: いろいろな色のにじみを、小さいものから大きいものまで薄く重ねる
	for (let i = 0; i < 46; i++) {
		const c = p.accents[Math.floor(rand() * p.accents.length)];
		blob(rand() * W, Y(rand()), W * (0.06 + rand() * 0.28), c, 0.08 + rand() * 0.16);
	}
	// 付け根まわりのゴールドと、淡いグリーンの透け
	for (let i = 0; i < 6; i++) {
		blob(W * (0.3 + rand() * 0.4), Y(rand() * 0.18), W * (0.12 + rand() * 0.15), p.heart, 0.3);
	}
	blob(W * 0.5, Y(0.02), W * 0.22, [0.6, 0.72, 0.45], 0.22);

	// 3. 付け根から放射状に伸びる、薄い布のような筋（ひだ）
	ctx.lineCap = 'round';
	for (let i = 0; i < 26; i++) {
		const u = rand();
		const vein = [p.base, p.rim, p.blush, ...p.accents][
			Math.floor(rand() * (3 + p.accents.length))
		];
		ctx.strokeStyle = css(vein, 0.05 + rand() * 0.09);
		ctx.lineWidth = W * (0.004 + rand() * 0.01);
		ctx.beginPath();
		ctx.moveTo(W * 0.5, H);
		ctx.bezierCurveTo(
			W * (0.5 + (u - 0.5) * 0.3),
			Y(0.3),
			W * (u + (rand() - 0.5) * 0.2),
			Y(0.6),
			W * u,
			Y(0.75 + rand() * 0.25)
		);
		ctx.stroke();
	}

	// 4. 縁の一部に溜まる深いさび色（写真の、折れた花びらの縁の濃い部分）
	for (let k = 0; k < 2; k++) {
		const side = rand() < 0.5 ? 0.04 : 0.96;
		const v0 = 0.3 + rand() * 0.35;
		for (let i = 0; i < 26; i++) {
			blob(
				W * (side + (rand() - 0.5) * 0.05),
				Y(v0 + (i / 26) * 0.18),
				W * (0.03 + rand() * 0.05),
				p.rim,
				0.06 + rand() * 0.08
			);
		}
	}

	// 5. スキル名: 花の濃い色で小さく
	const family = '"Inter Variable", "Hiragino Sans", sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = css(p.ink, 0.5);
	texts.forEach((text, i) => {
		const fontSize = W * 0.045;
		ctx.font = `500 ${fontSize}px ${family}`;
		ctx.letterSpacing = `${fontSize * 0.1}px`;
		ctx.save();
		ctx.translate(W * (0.5 + (i - (texts.length - 1) / 2) * 0.13), Y(0.5 - i * 0.03));
		ctx.rotate((options.flipText ? Math.PI / 2 : -Math.PI / 2) + (i - 1) * 0.07);
		ctx.fillText(text, 0, 0);
		ctx.restore();
	});

	// 6. 透明度: 付け根（芯の近く）ほど透ける。先端はぼかさず、くっきり残す
	ctx.globalCompositeOperation = 'destination-in';
	const mask = ctx.createLinearGradient(0, H, 0, 0);
	// 芯に近い付け根ほど透け、中ほどから先は光を受けて色が乗る
	mask.addColorStop(0, 'rgba(0,0,0,0.38)');
	mask.addColorStop(0.18, 'rgba(0,0,0,0.5)');
	mask.addColorStop(0.45, 'rgba(0,0,0,0.78)');
	mask.addColorStop(1, 'rgba(0,0,0,0.8)');
	ctx.fillStyle = mask;
	ctx.fillRect(0, 0, W, H);
	// 左右の縁だけ、ごくわずかに柔らかくする
	ctx.globalCompositeOperation = 'destination-out';
	for (let i = 0; i < 140; i++) {
		const t = rand() * 0.85;
		const r = W * (0.02 + rand() * 0.03);
		const x = rand() < 0.5 ? -r * 0.4 : W + r * 0.4;
		const rg = ctx.createRadialGradient(x, Y(t), 0, x, Y(t), r);
		rg.addColorStop(0, 'rgba(0,0,0,0.45)');
		rg.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = rg;
		ctx.fillRect(x - r, Y(t) - r, r * 2, r * 2);
	}
	ctx.globalCompositeOperation = 'source-over';

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = options.anisotropy ?? 4;
	return texture;
}

/**
 * スタジオの背景（奥行きのある空間）。画面中央が地平線（カメラの高さ）。
 * - 上（奥の壁）: 淡いラベンダーグレーで、上へ行くほど少し暗い
 * - 花の背後: 暖かい光がにじむ
 * - 下（床）: 手前ほど明るく、地平線（奥）へ向かって暗く沈む。花の足元に光だまり
 * - 四隅: 色味のある陰（ラベンダー・ミント・ローズ）で空間を閉じる
 */
export function createBackdrop(options: { dark: boolean; aspect: number }): CanvasTexture {
	const H = 768;
	const W = Math.max(384, Math.round(H * Math.min(3, Math.max(0.4, options.aspect))));
	const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
	const ctx = canvas.getContext('2d')!;
	const d = options.dark;
	const c = (light: string, dark: string) => (d ? dark : light);

	// 1. 縦のグラデーション: 奥の壁（上）→ 地平線 → 床（下、手前ほど明るい）
	const v = ctx.createLinearGradient(0, 0, 0, H);
	v.addColorStop(0, c('#dcd8e4', '#17151d'));
	v.addColorStop(0.42, c('#ece8ec', '#221d24'));
	v.addColorStop(0.5, c('#e4e0e2', '#1c181d')); // 地平線のすぐ下が最も奥（暗い）
	v.addColorStop(0.75, c('#efebe8', '#241f22'));
	v.addColorStop(1, c('#f7f3ee', '#2c2527'));
	ctx.fillStyle = v;
	ctx.fillRect(0, 0, W, H);

	// 透明側も同じ色にする（「色 → 透明の黒」だと途中が灰色に濁る）
	const glow = (x: number, y: number, rx: number, ry: number, color: string) => {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(1, ry / rx);
		const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
		g.addColorStop(0, color);
		g.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
		ctx.fillStyle = g;
		ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
		ctx.restore();
	};
	// 2. 花の背後に暖かい光
	glow(W * 0.64, H * 0.4, H * 0.75, H * 0.65, c('rgba(255,244,232,0.95)', 'rgba(80,56,52,0.75)'));
	// 3. 床の光だまり（横長の楕円 = 床に落ちた光に見える）
	glow(W * 0.62, H * 0.8, H * 0.95, H * 0.22, c('rgba(255,248,240,0.9)', 'rgba(70,52,50,0.7)'));
	glow(W * 0.62, H * 0.66, H * 0.5, H * 0.07, c('rgba(250,232,222,0.6)', 'rgba(90,60,56,0.45)'));
	// 4. 四隅の色味のある陰
	glow(0, 0, H * 0.9, H * 0.7, c('rgba(206,198,224,0.7)', 'rgba(30,26,46,0.85)'));
	glow(0, H, H * 0.8, H * 0.55, c('rgba(208,224,214,0.7)', 'rgba(22,34,32,0.8)'));
	glow(W, 0, H * 0.7, H * 0.55, c('rgba(226,212,226,0.6)', 'rgba(36,26,40,0.8)'));
	glow(W, H, H * 0.6, H * 0.4, c('rgba(234,220,214,0.6)', 'rgba(34,26,28,0.7)'));

	const t = new CanvasTexture(canvas);
	t.colorSpace = SRGBColorSpace;
	return t;
}
