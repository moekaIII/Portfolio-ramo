import { MathUtils, PlaneGeometry } from 'three';

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
		segmentsX = 8,
		segmentsY = 24
	} = options;
	const g = new PlaneGeometry(width, length, segmentsX, segmentsY);
	g.translate(0, length / 2, 0);
	const pos = g.attributes.position;
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
		const nx = u * (width / 2) * profile;
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
		const z = curl * length * t * t - cup * width * profile * (1 - u * u) * 0.5 + wave;
		pos.setXYZ(i, nx, y, z);
	}
	pos.needsUpdate = true;
	g.computeVertexNormals();
	return g;
}
