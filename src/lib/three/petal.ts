import { MathUtils, PlaneGeometry } from 'three';
import { mulberry32 } from './random.ts';

/**
 * 花びらの形状。分割した平面を、付け根と先端が細い輪郭に絞り、
 * 長さ方向に反り返らせ、幅方向にくぼませる（UV は保持するので、名前のテクスチャが曲面に沿う）。
 * 付け根が原点、先端が +Y。
 */
export function createPetalGeometry(options: {
	length: number;
	width: number;
	/** 先端の反り返り（+Z 方向へ持ち上がる量。長さに対する比） */
	curl: number;
	/** 幅方向のくぼみ（中央が -Z に沈む量。幅に対する比） */
	cup: number;
	/** 先端の形: pointed=尖る（葉・苞）/ round=丸い倒卵形（フリージアの花びら） */
	tip?: 'pointed' | 'round';
	/** 縁の波打ち（幅に対する比）。ふわっとした花びらに使う */
	ruffle?: number;
	/**
	 * 指定すると、規則的な波ではなく、花びらごとに違う不規則なしわ・左右非対称・
	 * でこぼこした縁にする（自然界の薄い花びら。ポピーのような）
	 */
	seed?: number;
	segmentsX?: number;
	segmentsY?: number;
}) {
	const {
		length,
		width,
		curl,
		cup,
		tip = 'pointed',
		ruffle = 0,
		seed,
		segmentsX = 8,
		segmentsY = 24
	} = options;
	const g = new PlaneGeometry(width, length, segmentsX, segmentsY);
	g.translate(0, length / 2, 0);
	const pos = g.attributes.position;
	// 不規則なしわ: 周波数と位相の違う波を重ねる（花びらごとに seed で変わる）
	const rand = mulberry32(seed ?? 1);
	const terms = Array.from({ length: 6 }, (_, k) => ({
		fu: 0.8 + rand() * 2.8,
		ft: 1.2 + rand() * 4.2,
		ph: rand() * Math.PI * 2,
		a: 1 / (1 + k * 0.6)
	}));
	const ampSum = terms.reduce((s, t) => s + t.a, 0);
	const asym = (rand() - 0.5) * 0.16; // 左右非対称（先がどちらかへ少し流れる）
	const edgePh = rand() * Math.PI * 2;
	const lobePh = rand() * Math.PI * 2;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		// 浮動小数点の誤差で範囲外になると、負の数の非整数乗で NaN になるため丸める
		const t = MathUtils.clamp(y / length, 0, 1); // 0: 付け根 / 1: 先端
		// 輪郭: 付け根は細く、中ほどで最も広く、先端は丸く閉じる
		let profile: number;
		if (tip === 'round') {
			// 倒卵形: 付け根から広がり、先端寄り（7 割の位置）で最も広く、先は丸く閉じる
			const peak = 0.62;
			profile =
				t < peak
					? // 付け根も幅を持たせ、側面が折れて角にならないようにする
						0.42 + 0.58 * Math.sin((Math.PI / 2) * (t / peak))
					: // 超楕円で先をふっくら丸く閉じる（ただの円弧より尖って見えにくい）
						Math.pow(Math.max(0, 1 - Math.pow((t - peak) / (1 - peak), 3.4)), 1 / 3.4);
		} else {
			const s = Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.72)));
			profile = Math.pow(s, 0.85) * 0.92 + 0.08 * (1 - t);
		}
		const u = x / (width / 2); // -1..1
		let ny = y;
		if (seed !== undefined) {
			// 縁のでこぼこ: 幅をゆるく増減させ、先端の縁も一様に丸くせず少し凹凸を付ける
			profile *= 1 + 0.07 * Math.sin(t * Math.PI * 2.6 + lobePh) * t;
			ny = y * (1 - 0.07 * (0.5 + 0.5 * Math.sin(u * Math.PI * 1.9 + edgePh)) * u * u * t);
		}
		const nx = u * (width / 2) * profile + (seed !== undefined ? asym * width * t * t : 0);
		// 縁ほど大きく波打ち、花びらの上の方ほど波が強い（付け根は平ら）。
		// 幅（profile）を掛けるので、細くなる先端でも尖らず丸いまま
		const upper = MathUtils.smoothstep(t, 0.15, 0.7);
		const wave =
			ruffle *
			width *
			Math.sin(t * Math.PI * 4.5 + u * 2) *
			Math.pow(Math.abs(u), 1.6) *
			upper *
			// 先端付近だけ波を弱め、先が尖って見えないようにする
			(1 - 0.75 * MathUtils.smoothstep(t, 0.82, 1)) *
			profile;
		let crinkle = 0;
		if (seed !== undefined) {
			for (const k of terms)
				crinkle += k.a * Math.sin(k.fu * u * Math.PI + k.ft * t * Math.PI + k.ph);
			crinkle /= ampSum;
		}
		const natural =
			seed === undefined
				? 0
				: ruffle *
					width *
					1.6 *
					crinkle *
					(0.3 + 0.7 * Math.pow(Math.abs(u), 1.3)) *
					MathUtils.smoothstep(t, 0.08, 0.55) *
					(1 - 0.4 * MathUtils.smoothstep(t, 0.85, 1)) *
					profile;
		const z =
			curl * length * t * t -
			cup * width * profile * (1 - u * u) * 0.5 +
			(seed === undefined ? wave : natural);
		pos.setXYZ(i, nx, ny, z);
	}
	pos.needsUpdate = true;
	g.computeVertexNormals();
	return g;
}
