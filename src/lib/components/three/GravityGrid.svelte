<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		BufferGeometry,
		Float32BufferAttribute,
		MathUtils,
		Plane,
		Points,
		PerspectiveCamera,
		Raycaster,
		ShaderMaterial,
		Vector2,
		Vector3,
		Vector4
	} from 'three';
	import { theme } from '#lib/state/theme.svelte.ts';
	import { cssVarToRgb } from '#lib/three/css-color.ts';
	import { MAX_RIPPLES, fragmentShader, vertexShader } from '#lib/three/shaders.ts';
	import { Spring } from '#lib/three/spring.ts';
	import type { QualitySettings } from '#lib/three/quality.ts';

	type Props = {
		settings: QualitySettings;
		/** 画面内かつタブが表示中のときのみ true。false の間は描画を完全に止める */
		active: boolean;
		/** ポインタ座標の基準となる要素（ヒーローセクション） */
		target: HTMLElement;
	};

	let { settings, active, target }: Props = $props();

	const { size, invalidate, renderer } = useThrelte();

	const FOV = 30;
	const DISTANCE = 14;
	const TILT = -0.42; // 奥へ倒して奥行きを出す（rad）

	// ---- Three.js objects（すべて onDestroy で dispose） ----
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
	camera.position.set(0, 0, DISTANCE);

	const material = new ShaderMaterial({
		vertexShader,
		fragmentShader,
		transparent: true,
		depthWrite: false,
		uniforms: {
			uTime: { value: 0 },
			uPointer: { value: new Vector2(0, 0) },
			uStrength: { value: 0 },
			uRadius: { value: 2.2 },
			uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new Vector4(0, 0, 0, 0)) },
			uSize: { value: 2 },
			uPixelRatio: { value: 1 },
			uExtent: { value: new Vector2(1, 1) },
			uColor: { value: new Vector3(0.6, 0.6, 0.6) },
			uAccent: { value: new Vector3(0.76, 0.97, 0.3) },
			uOpacity: { value: 1 }
		}
	});

	let geometry = new BufferGeometry();
	const points = new Points(geometry, material);
	points.rotation.x = TILT;
	points.frustumCulled = false;

	/** ビューポートを覆う格子を（再）生成する。古いジオメトリは即 dispose */
	function buildGrid(width: number, height: number) {
		const aspect = width / Math.max(height, 1);
		const viewH = 2 * Math.tan(MathUtils.degToRad(FOV / 2)) * DISTANCE;
		const extentX = (viewH * aspect * 1.12) / 2;
		const extentY = (viewH * 1.5) / 2; // 傾けた分だけ縦を広めに
		const cols = Math.max(24, Math.round(width / settings.spacing));
		const step = (extentX * 2) / (cols - 1);
		const rows = Math.ceil((extentY * 2) / step) + 1;

		const positions = new Float32Array(cols * rows * 3);
		let i = 0;
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				positions[i++] = -extentX + x * step;
				positions[i++] = -extentY + y * step;
				positions[i++] = 0;
			}
		}
		const next = new BufferGeometry();
		next.setAttribute('position', new Float32BufferAttribute(positions, 3));
		points.geometry = next;
		geometry.dispose();
		geometry = next;

		material.uniforms.uExtent.value.set(extentX, extentY);
		// 影響半径は短辺に比例（狭い画面で全体が盛り上がらないように）
		material.uniforms.uRadius.value = MathUtils.clamp(Math.min(extentX, extentY) * 0.45, 0.9, 2.2);
		portrait = aspect < 1;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
	}

	let lastKey = '';
	let portrait = false;
	$effect(() => {
		const { width, height } = $size;
		const key = `${Math.round(width)}x${Math.round(height)}`;
		if (key === lastKey || width === 0 || height === 0) return;
		lastKey = key;
		buildGrid(width, height);
		material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
		invalidate();
	});

	$effect(() => {
		material.uniforms.uSize.value = settings.pointSize;
		material.uniforms.uOpacity.value = settings.opacity;
		invalidate();
	});

	// ---- テーマ追従（CSS トークンから色を取得） ----
	$effect(() => {
		void theme.current;
		const color = cssVarToRgb('--fg-muted');
		const accent = cssVarToRgb('--accent-text');
		material.uniforms.uColor.value.set(...color);
		material.uniforms.uAccent.value.set(...accent);
		invalidate();
	});

	// ---- ポインタ（ばねで追従） ----
	const px = new Spring(0, 70, 0.75);
	const py = new Spring(0, 70, 0.75);
	const strength = new Spring(0, 55, 0.45); // 低めの減衰比 → 戻るときに軽く弾む
	const raycaster = new Raycaster();
	const ndc = new Vector2();
	const hit = new Vector3();
	const plane = new Plane();
	let lastPointerAt = -Infinity;
	let elapsed = 0;
	let rippleIndex = 0;

	/** 画面座標 → 格子平面のローカル座標 */
	function toLocal(clientX: number, clientY: number): Vector3 | null {
		const rect = renderer.domElement.getBoundingClientRect();
		ndc.set(
			((clientX - rect.left) / rect.width) * 2 - 1,
			-((clientY - rect.top) / rect.height) * 2 + 1
		);
		raycaster.setFromCamera(ndc, camera);
		points.updateMatrixWorld();
		const normal = new Vector3(0, 0, 1).applyQuaternion(points.quaternion);
		plane.setFromNormalAndCoplanarPoint(normal, points.position);
		if (!raycaster.ray.intersectPlane(plane, hit)) return null;
		return points.worldToLocal(hit);
	}

	function onPointerMove(event: PointerEvent) {
		const local = toLocal(event.clientX, event.clientY);
		if (!local) return;
		px.target = local.x;
		py.target = local.y;
		strength.target = 1;
		lastPointerAt = elapsed;
	}

	function onPointerLeave() {
		strength.target = 0;
	}

	function onPointerDown(event: PointerEvent) {
		const local = toLocal(event.clientX, event.clientY);
		if (!local) return;
		const ripple = material.uniforms.uRipples.value[rippleIndex] as Vector4;
		ripple.set(local.x, local.y, elapsed, 1);
		rippleIndex = (rippleIndex + 1) % MAX_RIPPLES;
		onPointerMove(event);
	}

	$effect(() => {
		const opts = { passive: true } as const;
		target.addEventListener('pointermove', onPointerMove, opts);
		target.addEventListener('pointerdown', onPointerDown, opts);
		target.addEventListener('pointerleave', onPointerLeave, opts);
		return () => {
			target.removeEventListener('pointermove', onPointerMove);
			target.removeEventListener('pointerdown', onPointerDown);
			target.removeEventListener('pointerleave', onPointerLeave);
		};
	});

	// ---- フレーム更新（active の間のみ。停止中は invalidate されず描画も行われない） ----
	const { start, stop } = useTask(
		(delta) => {
			elapsed += delta;
			const u = material.uniforms;
			u.uTime.value = elapsed;

			// 操作がしばらくない時は、焦点がゆっくり漂う（タッチ端末でも動きが伝わるように）
			if (elapsed - lastPointerAt > 3) {
				const ex = u.uExtent.value.x;
				const ey = u.uExtent.value.y;
				if (portrait) {
					// 縦長画面ではテキストより上の領域だけを漂う
					px.target = Math.sin(elapsed * 0.23) * ex * 0.5;
					py.target = ey * 0.4 + Math.sin(elapsed * 0.31 + 1.2) * ey * 0.12;
				} else {
					px.target = Math.sin(elapsed * 0.23) * ex * 0.42 + ex * 0.18;
					py.target = Math.sin(elapsed * 0.31 + 1.2) * ey * 0.22;
				}
				strength.target = 0.6;
			}

			u.uPointer.value.set(px.step(delta), py.step(delta));
			u.uStrength.value = Math.max(0, strength.step(delta));
		},
		{ autoStart: false }
	);

	$effect(() => {
		if (active) start();
		else stop();
	});

	onDestroy(() => {
		stop();
		geometry.dispose();
		material.dispose();
		// テクスチャは使用していない（点の形状はフラグメントシェーダーで描画）
	});
</script>

<T is={camera} makeDefault manual />
<T is={points} dispose={false} />
