import { Quaternion, Vector3 } from 'three';

/**
 * 大きなガラスの器（角丸キューブ）の中に詰まったスキルの物理。
 * - 各物体は、長辺（ローカル X 軸）方向に並べた球で近似して衝突を解く
 * - 器の中は器のローカル座標で計算する。器が回転すると重力の向きが変わり、中身が流れる
 */

export interface JarBody {
	p: Vector3;
	v: Vector3;
	q: Quaternion;
	/** 角速度（ローカル軸まわり、rad/s） */
	w: Vector3;
	/** 球のローカル X 方向のオフセット */
	offsets: number[];
	r: number;
	/** 計算用: ローカル X 軸のワールド方向（器の座標系） */
	axis: Vector3;
}

const RESTITUTION = 0.35;
const LINEAR_DAMPING = 0.9;
const ANGULAR_DAMPING = 1.4;
const MAX_SPEED = 6;

/** 決定論的な乱数（毎回同じ詰まり方で始める） */
export function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export class Jar {
	bodies: JarBody[] = [];
	/** 器の内側の半径（立方体の半辺） */
	half: number;
	private random = mulberry32(20251105);
	private tmpA = new Vector3();
	private tmpB = new Vector3();
	private tmpN = new Vector3();
	private dq = new Quaternion();

	constructor(half: number) {
		this.half = half;
	}

	/** 物体を追加する。length: 長辺の長さ / radius: 太さの半分 */
	add(length: number, radius: number): JarBody {
		const n = Math.max(1, Math.round(length / (radius * 1.6)));
		const span = Math.max(0, length / 2 - radius);
		const offsets = Array.from({ length: n }, (_, i) =>
			n === 1 ? 0 : -span + (2 * span * i) / (n - 1)
		);
		const r = this.random;
		const h = this.half * 0.8;
		const body: JarBody = {
			p: new Vector3((r() * 2 - 1) * h, (r() * 2 - 1) * h, (r() * 2 - 1) * h),
			v: new Vector3(),
			q: new Quaternion().setFromAxisAngle(
				new Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
				r() * Math.PI * 2
			),
			w: new Vector3((r() - 0.5) * 2, (r() - 0.5) * 2, (r() - 0.5) * 2),
			offsets,
			r: radius,
			axis: new Vector3(1, 0, 0)
		};
		this.bodies.push(body);
		return body;
	}

	/** クリック / タップ: 中身をシャッフルする */
	shake(strength = 5) {
		const r = this.random;
		for (const b of this.bodies) {
			b.v.x += (r() * 2 - 1) * strength;
			b.v.y += (r() * 0.8 + 0.4) * strength;
			b.v.z += (r() * 2 - 1) * strength;
			b.w.set((r() - 0.5) * 8, (r() - 0.5) * 8, (r() - 0.5) * 8);
		}
	}

	/**
	 * @param gravity 器のローカル座標での重力ベクトル
	 */
	step(rawDt: number, gravity: Vector3) {
		const steps = Math.min(3, Math.ceil(rawDt / (1 / 120)));
		const dt = rawDt / steps;
		for (let s = 0; s < steps; s++) this.substep(dt, gravity);
	}

	private substep(dt: number, gravity: Vector3) {
		const lin = Math.exp(-LINEAR_DAMPING * dt);
		const ang = Math.exp(-ANGULAR_DAMPING * dt);
		for (const b of this.bodies) {
			b.v.addScaledVector(gravity, dt);
			b.v.multiplyScalar(lin);
			if (b.v.length() > MAX_SPEED) b.v.setLength(MAX_SPEED);
			b.p.addScaledVector(b.v, dt);
			b.w.multiplyScalar(ang);
			const wl = b.w.length();
			if (wl > 1e-5) {
				this.dq.setFromAxisAngle(this.tmpA.copy(b.w).divideScalar(wl), wl * dt);
				b.q.multiply(this.dq).normalize();
			}
			b.axis.set(1, 0, 0).applyQuaternion(b.q);
		}
		this.collideBodies();
		this.collideWalls();
	}

	private sphere(b: JarBody, o: number, out: Vector3) {
		return out.copy(b.p).addScaledVector(b.axis, o);
	}

	private collideBodies() {
		const list = this.bodies;
		for (let i = 0; i < list.length; i++) {
			const A = list[i];
			const reachA = (A.offsets.at(-1) ?? 0) + A.r;
			for (let j = i + 1; j < list.length; j++) {
				const B = list[j];
				const reach = reachA + (B.offsets.at(-1) ?? 0) + B.r;
				if (A.p.distanceToSquared(B.p) > reach * reach) continue;
				for (const oa of A.offsets) {
					const a = this.sphere(A, oa, this.tmpA);
					for (const ob of B.offsets) {
						const bpos = this.sphere(B, ob, this.tmpB);
						const n = this.tmpN.subVectors(bpos, a);
						const min = A.r + B.r;
						const d2 = n.lengthSq();
						if (d2 >= min * min || d2 < 1e-10) continue;
						const d = Math.sqrt(d2);
						n.divideScalar(d);
						const pen = (min - d) / 2;
						A.p.addScaledVector(n, -pen);
						B.p.addScaledVector(n, pen);
						const rv = (B.v.x - A.v.x) * n.x + (B.v.y - A.v.y) * n.y + (B.v.z - A.v.z) * n.z;
						if (rv < 0) {
							const jn = (-(1 + RESTITUTION) * rv) / 2;
							A.v.addScaledVector(n, -jn);
							B.v.addScaledVector(n, jn);
							// 接触点のずれに応じて少し回る（転がる感じ）
							A.w.addScaledVector(A.axis, oa * jn * 0.6);
							B.w.addScaledVector(B.axis, -ob * jn * 0.6);
						}
					}
				}
			}
		}
	}

	private collideWalls() {
		const h = this.half;
		for (const b of this.bodies) {
			for (const o of b.offsets) {
				const s = this.sphere(b, o, this.tmpA);
				for (const k of ['x', 'y', 'z'] as const) {
					const lo = -h + b.r;
					const hi = h - b.r;
					if (s[k] < lo) {
						b.p[k] += lo - s[k];
						if (b.v[k] < 0) b.v[k] = -b.v[k] * RESTITUTION;
					} else if (s[k] > hi) {
						b.p[k] -= s[k] - hi;
						if (b.v[k] > 0) b.v[k] = -b.v[k] * RESTITUTION;
					}
				}
			}
		}
	}
}
