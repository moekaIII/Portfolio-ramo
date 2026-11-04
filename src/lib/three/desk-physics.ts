/**
 * 「散らかったスキルを整列」の机上物理（three.js 非依存）。
 * - 机の上（XZ 平面）を滑るブロックを、長辺方向に並べた円で近似して衝突を解く
 * - scatter: 摩擦・壁・ブロック同士の衝突のみ
 * - arrange: 左から「フロントエンド / デザイン / その他」の列に、左揃えの縦並びで整列する。
 *   各ブロックは自分の席へばねで吸い寄せられる
 */

export interface Body {
	index: number;
	groupIndex: number;
	w: number;
	d: number;
	x: number;
	z: number;
	a: number;
	vx: number;
	vz: number;
	va: number;
	/** 跳ねの高さ（見た目のみ） */
	y: number;
	vy: number;
	tx: number;
	tz: number;
	/** arrange 時、この時刻（秒）以降に目標へ向かう */
	startAt: number;
	circles: number[];
	radius: number;
}

export type Mode = 'scatter' | 'arrange';

/** ブロックに表示するラベル。accent はアクセント色で塗る（主力スキル） */
export type DeskLabel = { text: string; accent: boolean; groupIndex: number };

/** スキルの種類（整列時の列） */
export type DeskGroup = { label: string };

/** 整列時の列見出しの位置（机のローカル座標。x は列の左端） */
export type ColumnHeader = { groupIndex: number; x: number; z: number };

/** 整列レイアウトの寸法（ワールド単位） */
export const LAYOUT = {
	/** 列同士の間隔 */
	columnGap: 0.5,
	/** 同じ列内のブロック同士の間隔 */
	gapZ: 0.16,
	headerHeight: 0.3,
	/** 列見出しの下端から最初のブロックまで */
	headerGap: 0.18
} as const;

const FRICTION = 3.6;
const ANGULAR_FRICTION = 3.4;
const RESTITUTION = 0.45;
const GRAVITY = 28;
/** ポインタの当たり判定（指先ほどの大きさ。大きいとブロックが大きく動きすぎる） */
const POINTER_RADIUS = 0.22;
/** ポインタの速度のうちブロックへ伝える割合（弾き飛ばさず、そっと押す程度） */
const POINTER_TRANSFER = 0.4;
/** ポインタに押されたときの最大速度 */
const POINTER_MAX_SPEED = 1.8;

/** 決定論的な乱数（毎回同じ「散らかり方」で始めるため） */
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export class Desk {
	bodies: Body[];
	mode: Mode = 'scatter';
	time = 0;
	halfW = 3;
	halfD = 2;
	/** 列見出しの不透明度（0..1）。整列時にブロックより先に現れる */
	guide = 0;
	/** 整列時の列見出しの位置 */
	headers: ColumnHeader[] = [];
	/** 列見出しの文字幅（列の幅の計算に使う。setHeaderWidths で設定） */
	private headerWidths: number[] = [];
	/** 整列レイアウトの外寸（カメラの寄りの調整に使う） */
	extent = { width: 0, depth: 0 };

	pointer = { x: 0, z: 0, vx: 0, vz: 0, active: false };

	private random = mulberry32(20251104);

	constructor(sizes: { w: number; d: number; groupIndex: number }[]) {
		this.bodies = sizes.map(({ w, d, groupIndex }, index) => {
			const radius = d / 2;
			const n = Math.max(1, Math.ceil(w / d));
			const span = w / 2 - radius;
			const circles = Array.from({ length: n }, (_, i) =>
				n === 1 ? 0 : -span + (2 * span * i) / (n - 1)
			);
			return {
				index,
				groupIndex,
				w,
				d,
				x: 0,
				z: 0,
				a: 0,
				vx: 0,
				vz: 0,
				va: 0,
				y: 0,
				vy: 0,
				tx: 0,
				tz: 0,
				startAt: 0,
				circles,
				radius
			};
		});
	}

	setHeaderWidths(widths: number[]) {
		this.headerWidths = widths;
		this.layout();
	}

	/** 机の範囲を更新する（整列レイアウトは机の範囲に依存しない。外寸は extent で取得できる） */
	setBounds(halfW: number, halfD: number) {
		this.halfW = halfW;
		this.halfD = halfD;
		this.layout();
	}

	/** 初期配置: 上空から机の上へ落とす */
	drop() {
		const r = this.random;
		for (const b of this.bodies) {
			b.x = (r() * 2 - 1) * this.halfW * 0.7;
			b.z = (r() * 2 - 1) * this.halfD * 0.7;
			b.a = (r() * 2 - 1) * Math.PI * 0.5;
			b.vx = (r() * 2 - 1) * 1.5;
			b.vz = (r() * 2 - 1) * 1.5;
			b.va = (r() * 2 - 1) * 3;
			b.y = 2.5 + r() * 2.5;
			b.vy = 0;
		}
		this.mode = 'scatter';
	}

	scatter() {
		this.mode = 'scatter';
		const r = this.random;
		for (const b of this.bodies) {
			const angle = r() * Math.PI * 2;
			const speed = 3 + r() * 4;
			b.vx += Math.cos(angle) * speed;
			b.vz += Math.sin(angle) * speed;
			b.va += (r() * 2 - 1) * 9;
			b.vy += 3 + r() * 3;
		}
	}

	arrange() {
		this.mode = 'arrange';
		this.layout();
		// 列見出しが浮かび上がってから、ブロックが順に自分の席へ向かう
		this.bodies.forEach((b, i) => {
			b.startAt = this.time + 0.18 + i * 0.035;
		});
	}

	/**
	 * 左から種類順（groupIndex 順）の列に、左揃えの縦並びで並べる（列内は入力の並び順）。
	 * 各列: [見出し] → [ブロック] → [ブロック] …
	 */
	private layout() {
		const { columnGap, gapZ, headerHeight, headerGap } = LAYOUT;
		const d = this.bodies[0]?.d ?? 0.6;

		const columns = new Map<number, Body[]>();
		for (const b of this.bodies) {
			const list = columns.get(b.groupIndex) ?? [];
			list.push(b);
			columns.set(b.groupIndex, list);
		}
		const ordered = [...columns.entries()].sort(([a], [b]) => a - b);

		const colWidths = ordered.map(([gi, list]) =>
			Math.max(this.headerWidths[gi] ?? 0, ...list.map((b) => b.w))
		);
		const width = colWidths.reduce((s, w) => s + w, 0) + columnGap * (ordered.length - 1);
		const tallest = Math.max(...ordered.map(([, list]) => list.length));
		const depth = headerHeight + headerGap + tallest * d + (tallest - 1) * gapZ;

		const x0 = -width / 2;
		const z0 = -depth / 2;
		this.headers = [];
		let x = x0;
		ordered.forEach(([groupIndex, list], ci) => {
			this.headers.push({ groupIndex, x, z: z0 + headerHeight / 2 });
			list.forEach((b, i) => {
				b.tx = x + b.w / 2;
				b.tz = z0 + headerHeight + headerGap + d / 2 + i * (d + gapZ);
			});
			x += colWidths[ci] + columnGap;
		});
		this.extent = { width, depth };
	}

	movePointer(x: number, z: number, dt: number) {
		if (this.pointer.active && dt > 0) {
			// 速度は平滑化（ポインタの微小な揺れでブロックが暴れないように）
			const k = 0.35;
			this.pointer.vx += ((x - this.pointer.x) / dt - this.pointer.vx) * k;
			this.pointer.vz += ((z - this.pointer.z) / dt - this.pointer.vz) * k;
		}
		this.pointer.x = x;
		this.pointer.z = z;
		this.pointer.active = true;
	}

	releasePointer() {
		this.pointer.active = false;
		this.pointer.vx = 0;
		this.pointer.vz = 0;
	}

	/** 運動エネルギーの目安。十分小さければ再描画を止められる */
	get energy() {
		let e = 0;
		for (const b of this.bodies) {
			e += b.vx * b.vx + b.vz * b.vz + b.va * b.va * 0.1 + b.vy * b.vy + b.y;
			if (this.mode === 'arrange') e += Math.abs(b.tx - b.x) + Math.abs(b.tz - b.z) + Math.abs(b.a);
		}
		return e;
	}

	step(rawDt: number) {
		// 大きな dt を分割して安定させる
		const steps = Math.min(4, Math.ceil(rawDt / (1 / 120)));
		const dt = rawDt / steps;
		for (let s = 0; s < steps; s++) this.substep(dt);
	}

	private substep(dt: number) {
		this.time += dt;
		const arranged = this.mode === 'arrange';
		this.guide += ((arranged ? 1 : 0) - this.guide) * Math.min(1, dt * (arranged ? 4 : 6));

		for (const b of this.bodies) {
			// 跳ね（見た目の高さ）
			b.vy -= GRAVITY * dt;
			b.y += b.vy * dt;
			if (b.y < 0) {
				b.y = 0;
				b.vy = Math.abs(b.vy) > 1.5 ? -b.vy * 0.35 : 0;
			}

			if (arranged && this.time >= b.startAt) {
				const k = 70;
				const c = 2 * Math.sqrt(k) * 0.8;
				b.vx += (k * (b.tx - b.x) - c * b.vx) * dt;
				b.vz += (k * (b.tz - b.z) - c * b.vz) * dt;
				// 角度は最短方向で 0 へ
				const da = Math.atan2(Math.sin(-b.a), Math.cos(-b.a));
				b.va += (k * 1.2 * da - c * 1.1 * b.va) * dt;
			} else {
				const f = Math.exp(-FRICTION * dt);
				b.vx *= f;
				b.vz *= f;
				b.va *= Math.exp(-ANGULAR_FRICTION * dt);
			}

			b.x += b.vx * dt;
			b.z += b.vz * dt;
			b.a += b.va * dt;
			// 何周回っても -π..π に正規化（整列時に最短方向で 0 へ戻すため）
			b.a = Math.atan2(Math.sin(b.a), Math.cos(b.a));
		}

		if (!arranged) this.collideBodies();
		this.collidePointer();
		this.collideWalls();
	}

	private worldCircle(b: Body, ox: number): [number, number] {
		return [b.x + ox * Math.cos(b.a), b.z - ox * Math.sin(b.a)];
	}

	private applyImpulse(b: Body, jx: number, jz: number, cx: number, cz: number) {
		b.vx += jx;
		b.vz += jz;
		// トルク（接触点のオフセット × 撃力）。長いブロックほど回りにくい
		const rx = cx - b.x;
		const rz = cz - b.z;
		const inertia = (b.w * b.w + b.d * b.d) / 12;
		b.va -= ((rx * jz - rz * jx) / Math.max(inertia, 0.05)) * 0.5;
	}

	private collideBodies() {
		const n = this.bodies.length;
		for (let i = 0; i < n; i++) {
			const A = this.bodies[i];
			for (let j = i + 1; j < n; j++) {
				const B = this.bodies[j];
				// 粗い判定
				const reach = (A.w + B.w) / 2 + 0.1;
				if (Math.abs(A.x - B.x) > reach || Math.abs(A.z - B.z) > reach) continue;
				for (const oa of A.circles) {
					const [ax, az] = this.worldCircle(A, oa);
					for (const ob of B.circles) {
						const [bx, bz] = this.worldCircle(B, ob);
						const dx = bx - ax;
						const dz = bz - az;
						const min = A.radius + B.radius;
						const dist2 = dx * dx + dz * dz;
						if (dist2 >= min * min || dist2 === 0) continue;
						const dist = Math.sqrt(dist2);
						const nx = dx / dist;
						const nz = dz / dist;
						const pen = (min - dist) / 2;
						A.x -= nx * pen;
						A.z -= nz * pen;
						B.x += nx * pen;
						B.z += nz * pen;
						const rv = (B.vx - A.vx) * nx + (B.vz - A.vz) * nz;
						if (rv < 0) {
							const jn = (-(1 + RESTITUTION) * rv) / 2;
							const cx = (ax + bx) / 2;
							const cz = (az + bz) / 2;
							this.applyImpulse(A, -jn * nx, -jn * nz, cx, cz);
							this.applyImpulse(B, jn * nx, jn * nz, cx, cz);
							if (jn > 1.5) {
								A.vy = Math.max(A.vy, Math.min(jn * 0.4, 3));
								B.vy = Math.max(B.vy, Math.min(jn * 0.4, 3));
							}
						}
					}
				}
			}
		}
	}

	private collidePointer() {
		const p = this.pointer;
		if (!p.active) return;
		for (const b of this.bodies) {
			if (b.y > 0.6) continue; // 跳ねている最中はすり抜ける
			for (const o of b.circles) {
				const [cx, cz] = this.worldCircle(b, o);
				const dx = cx - p.x;
				const dz = cz - p.z;
				const min = b.radius + POINTER_RADIUS;
				const dist2 = dx * dx + dz * dz;
				if (dist2 >= min * min || dist2 === 0) continue;
				const dist = Math.sqrt(dist2);
				const nx = dx / dist;
				const nz = dz / dist;
				// めり込みは押し戻さない（押し戻すとポインタがブロックを運び続けてしまう）。
				// ポインタの速度の一部だけを伝えるので、ポインタは必ずブロックを追い越してすり抜け、
				// 移動はブロックの長さの半分程度に収まる
				const rv = (b.vx - p.vx * POINTER_TRANSFER) * nx + (b.vz - p.vz * POINTER_TRANSFER) * nz;
				if (rv < 0) {
					this.applyImpulse(b, -rv * nx, -rv * nz, cx - nx * b.radius, cz - nz * b.radius);
				}
				const speed = Math.hypot(b.vx, b.vz);
				if (speed > POINTER_MAX_SPEED) {
					b.vx *= POINTER_MAX_SPEED / speed;
					b.vz *= POINTER_MAX_SPEED / speed;
				}
				b.va = Math.max(-3, Math.min(3, b.va));
			}
		}
	}

	private collideWalls() {
		for (const b of this.bodies) {
			for (const o of b.circles) {
				const [cx, cz] = this.worldCircle(b, o);
				const r = b.radius;
				if (cx - r < -this.halfW) {
					b.x += -this.halfW - (cx - r);
					if (b.vx < 0) b.vx = -b.vx * RESTITUTION;
				} else if (cx + r > this.halfW) {
					b.x -= cx + r - this.halfW;
					if (b.vx > 0) b.vx = -b.vx * RESTITUTION;
				}
				if (cz - r < -this.halfD) {
					b.z += -this.halfD - (cz - r);
					if (b.vz < 0) b.vz = -b.vz * RESTITUTION;
				} else if (cz + r > this.halfD) {
					b.z -= cz + r - this.halfD;
					if (b.vz > 0) b.vz = -b.vz * RESTITUTION;
				}
			}
		}
	}
}
