/**
 * 半陰的オイラー法によるばね。zeta < 1 でわずかにオーバーシュートし「遊び心」のある戻りになる。
 */
export class Spring {
	value: number;
	velocity = 0;
	target: number;

	constructor(
		initial: number,
		private stiffness = 90,
		private zeta = 0.7
	) {
		this.value = initial;
		this.target = initial;
	}

	step(dt: number) {
		// 大きな dt（タブ復帰直後など）で発散しないよう分割
		const h = Math.min(dt, 1 / 30);
		const damping = 2 * Math.sqrt(this.stiffness) * this.zeta;
		const accel = this.stiffness * (this.target - this.value) - damping * this.velocity;
		this.velocity += accel * h;
		this.value += this.velocity * h;
		return this.value;
	}

	get settled() {
		return Math.abs(this.target - this.value) < 1e-3 && Math.abs(this.velocity) < 1e-3;
	}
}
