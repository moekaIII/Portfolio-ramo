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
	segmentsX?: number;
	segmentsY?: number;
}) {
	const { length, width, curl, cup, segmentsX = 8, segmentsY = 24 } = options;
	const g = new PlaneGeometry(width, length, segmentsX, segmentsY);
	g.translate(0, length / 2, 0);
	const pos = g.attributes.position;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		// 浮動小数点の誤差で範囲外になると、負の数の非整数乗で NaN になるため丸める
		const t = MathUtils.clamp(y / length, 0, 1); // 0: 付け根 / 1: 先端
		// 輪郭: 付け根は細く、中ほどで最も広く、先端は丸く閉じる
		const s = Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.72)));
		const profile = Math.pow(s, 0.85) * 0.92 + 0.08 * (1 - t);
		const u = x / (width / 2); // -1..1
		const nx = u * (width / 2) * profile;
		const z = curl * length * t * t - cup * width * profile * (1 - u * u) * 0.5;
		pos.setXYZ(i, nx, y, z);
	}
	pos.needsUpdate = true;
	g.computeVertexNormals();
	return g;
}
