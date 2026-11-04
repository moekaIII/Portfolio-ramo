<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		CanvasTexture,
		CatmullRomCurve3,
		Color,
		DoubleSide,
		Fog,
		GridHelper,
		Group,
		LatheGeometry,
		LineBasicMaterial,
		LineSegments,
		MathUtils,
		Mesh,
		MeshBasicMaterial,
		MeshPhysicalMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		PMREMGenerator,
		Plane,
		PointLight,
		Raycaster,
		SRGBColorSpace,
		TubeGeometry,
		Vector2,
		Vector3,
		WireframeGeometry,
		type BufferGeometry,
		type Material
	} from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
	import { skillChips } from '#lib/content/hero-skills.ts';
	import { theme } from '#lib/state/theme.svelte.ts';
	import { cssVarToRgb } from '#lib/three/css-color.ts';
	import { createPetalGeometry } from '#lib/three/petal.ts';
	import type { QualitySettings } from '#lib/three/quality.ts';

	type Props = {
		settings: QualitySettings;
		/** 画面内かつタブ表示中のときのみ true。false の間は描画を止める */
		active: boolean;
	};

	let { settings, active }: Props = $props();

	const { size, invalidate: invalidateFrame, renderer, scene } = useThrelte();

	function invalidate() {
		if (untrack(() => active)) invalidateFrame();
	}

	// 品質設定はマウント時に一度だけ決まる（途中で変わらない）
	const high = untrack(() => settings.quality === 'high');
	const FOV = 32;
	const CAMERA_Z = 16;

	// ---- camera ----
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 120);
	camera.position.set(0, 0, CAMERA_Z);
	/** カメラの注視点。少し下を見て、床が奥へ続いていくのが見えるようにする */
	const LOOK_AT = new Vector3(0, -0.6, 0);
	camera.lookAt(LOOK_AT);

	// ---- 境界: 設計図（左）と実物（右）を分ける面。カメラを通るので、奥行きが違っても画面上で1本の線になる ----
	const solidPlane = new Plane(new Vector3(1, 0, 0), 0);
	const wirePlane = new Plane(new Vector3(-1, 0, 0), 0);
	renderer.localClippingEnabled = true;
	const clip = <M extends Material>(m: M, plane: Plane) => {
		m.clippingPlanes = [plane];
		return m;
	};

	// ---- 環境マップ（艶のある映り込み） ----
	const pmrem = new PMREMGenerator(renderer);
	const room = new RoomEnvironment();
	const envTexture = pmrem.fromScene(room, 0.04).texture;
	room.dispose();
	scene.environment = envTexture;

	// ---- 奥行き: 遠くの床ほど背景色の霧に溶ける ----
	const fog = new Fog(0x000000, CAMERA_Z - 2, CAMERA_Z + 34);
	scene.fog = fog;

	const geometries: BufferGeometry[] = [];
	const track = <G extends BufferGeometry>(g: G) => (geometries.push(g), g);

	/*
	 * フリージア: 弓なりにしなる茎の片側に、ラッパ形の花が並ぶ。先端に向かって小さく、最後はつぼみになる。
	 * スキル名は花びらに小さく、花の色に近いトーンでさりげなく印字する（1 輪に 2 つまで）。
	 */
	const TEPAL_LENGTH = 1.05;
	const TEPAL_WIDTH = 0.66;
	const TUBE_LENGTH = 0.75;

	const tepalOptions = { length: TEPAL_LENGTH, width: TEPAL_WIDTH, curl: 0.42, cup: 0.34 };
	const tepalGeometry = track(
		createPetalGeometry({
			...tepalOptions,
			segmentsX: high ? 8 : 5,
			segmentsY: high ? 16 : 10
		})
	);
	const tepalWire = track(
		new WireframeGeometry(
			track(createPetalGeometry({ ...tepalOptions, segmentsX: 3, segmentsY: 6 }))
		)
	);
	// 花の筒（ラッパの付け根）: 付け根は細く、口に向かって広がる
	const tubeProfile = Array.from({ length: 10 }, (_, i) => {
		const t = i / 9;
		return new Vector2(0.05 + 0.2 * Math.pow(t, 1.6), t * TUBE_LENGTH);
	});
	const tubeGeometry = track(new LatheGeometry(tubeProfile, high ? 20 : 12));
	const tubeWire = track(new WireframeGeometry(track(new LatheGeometry(tubeProfile, 8))));

	const lineMuted = clip(new LineBasicMaterial({ transparent: true, opacity: 0.5 }), wirePlane);
	const lineAccent = clip(new LineBasicMaterial({ transparent: true, opacity: 0.85 }), wirePlane);

	type Tone = 0 | 1 | 2;
	const petalMaterial = () =>
		clip(
			new MeshPhysicalMaterial({
				roughness: 0.55,
				sheen: 0.9,
				sheenRoughness: 0.5,
				sheenColor: new Color(0xffffff),
				clearcoat: high ? 0.15 : 0,
				side: DoubleSide
			}),
			solidPlane
		);
	/** 文字のない花びら・筒は、色の種類ごとに材質を共有する */
	const plainPetal: Record<Tone, MeshPhysicalMaterial> = {
		0: petalMaterial(),
		1: petalMaterial(),
		2: petalMaterial()
	};

	type Labeled = { material: MeshPhysicalMaterial; text: string; tone: Tone };
	const labeled: Labeled[] = [];

	type Blossom = {
		group: Group;
		tepals: { mesh: Mesh; open: number }[];
		/** 0: 満開 / 1: つぼみ */
		budness: number;
		phase: number;
		nod: number;
	};

	// スキルを 2 つずつ花に割り当てる（種類が混ざらないように）
	const assignments: { texts: string[]; tone: Tone }[] = [];
	for (const g of [0, 1, 2] as Tone[]) {
		const list = skillChips.filter((c) => c.group === g).map((c) => c.text);
		for (let i = 0; i < list.length; i += 2)
			assignments.push({ texts: list.slice(i, i + 2), tone: g });
	}
	// 先端のつぼみ（文字なし）
	const BUDS = 3;

	const plant = new Group();
	const stemCurve = new CatmullRomCurve3([
		new Vector3(-3.4, -3.6, 0.3),
		new Vector3(-2.9, -1.4, 0.2),
		new Vector3(-1.9, 0.6, 0.1),
		new Vector3(-0.4, 1.7, 0),
		new Vector3(1.4, 2.0, -0.1),
		new Vector3(2.9, 1.6, -0.15),
		new Vector3(3.9, 0.8, -0.2)
	]);
	const stemGeometry = track(new TubeGeometry(stemCurve, 96, 0.07, high ? 10 : 6, false));
	const stemWire = track(
		new WireframeGeometry(track(new TubeGeometry(stemCurve, 24, 0.07, 5, false)))
	);
	const stemMaterial = clip(
		new MeshPhysicalMaterial({ roughness: 0.45, clearcoat: high ? 0.4 : 0 }),
		solidPlane
	);
	plant.add(new Mesh(stemGeometry, stemMaterial), new LineSegments(stemWire, lineMuted));

	// 葉: 細長い剣状の葉を根元から 2 枚
	const leafOptions = { length: 4.2, width: 0.34, curl: 0.12, cup: 0.2 };
	const leafGeometry = track(createPetalGeometry({ ...leafOptions, segmentsY: 20 }));
	const leafWire = track(
		new WireframeGeometry(
			track(createPetalGeometry({ ...leafOptions, segmentsX: 2, segmentsY: 8 }))
		)
	);
	for (const [rz, ry] of [
		[0.42, 0.5],
		[-0.18, -0.6]
	]) {
		const leaf = new Mesh(leafGeometry, stemMaterial);
		leaf.position.copy(stemCurve.getPoint(0));
		leaf.rotation.set(-0.1, ry, rz);
		leaf.add(new LineSegments(leafWire, lineMuted));
		plant.add(leaf);
	}

	const blossoms: Blossom[] = [];
	const total = assignments.length + BUDS;
	const Y = new Vector3(0, 1, 0);
	for (let i = 0; i < total; i++) {
		const t = 0.3 + (i / (total - 1)) * 0.68;
		const p = stemCurve.getPoint(t);
		const tangent = stemCurve.getTangent(t);
		const a = assignments[i];
		const budness = a ? 0 : (i - assignments.length + 1) / BUDS;
		const tone: Tone = a ? a.tone : 1;
		const s = MathUtils.lerp(1.08, 0.62, i / (total - 1)) * (1 - budness * 0.35);

		const group = new Group();
		group.position.copy(p);
		// 花は茎の片側（上・手前）を向き、茎の進む方向へ少し傾く
		const dirV = new Vector3(0, 0.75, 0.62).addScaledVector(tangent, 0.35).normalize();
		group.quaternion.setFromUnitVectors(Y, dirV);
		group.rotateY(i * 0.7);
		group.scale.setScalar(s);

		const tube = new Mesh(tubeGeometry, plainPetal[tone]);
		tube.add(new LineSegments(tubeWire, tone === 0 ? lineAccent : lineMuted));
		group.add(tube);

		const tepals: Blossom['tepals'] = [];
		for (let k = 0; k < 6; k++) {
			const holder = new Group();
			holder.position.y = TUBE_LENGTH * 0.92;
			holder.rotation.y = (k / 6) * Math.PI * 2 + (k % 2 ? 0.12 : 0);
			const text = k === 0 ? a?.texts[0] : k === 3 ? a?.texts[1] : undefined;
			let material = plainPetal[tone];
			if (text) {
				material = petalMaterial();
				labeled.push({ material, text, tone });
			}
			const mesh = new Mesh(tepalGeometry, material);
			const inner = k % 2 === 1;
			const open = (inner ? 0.95 : 1.15) * (1 - budness * 0.85);
			mesh.rotation.x = open;
			mesh.scale.setScalar(inner ? 0.9 : 1);
			mesh.add(new LineSegments(tepalWire, tone === 0 ? lineAccent : lineMuted));
			holder.add(mesh);
			group.add(holder);
			tepals.push({ mesh, open });
		}
		plant.add(group);
		blossoms.push({ group, tepals, budness, phase: i * 0.8, nod: 0 });
	}

	// 花の奥のライム色の光（物体は置かず、花びらに色を回り込ませる）
	const accentLight = new PointLight(0xffffff, high ? 12 : 8, 16, 1.2);
	accentLight.position.set(0.5, 1.6, -2.2);
	plant.add(accentLight);

	/** 花びらのテクスチャ（付け根を濃く、先端を明るく。名前は小さく、さりげなく） */
	const TEX_W = high ? 256 : 160;
	const TEX_H = Math.round(TEX_W * (TEPAL_LENGTH / TEPAL_WIDTH));
	function petalTexture(
		base: string,
		tip: string,
		ink: string,
		text: string | null,
		anisotropy: number
	) {
		const canvas = Object.assign(document.createElement('canvas'), {
			width: TEX_W,
			height: TEX_H
		});
		const ctx = canvas.getContext('2d');
		if (ctx) {
			const g = ctx.createLinearGradient(0, TEX_H, 0, 0);
			g.addColorStop(0, base);
			g.addColorStop(0.5, tip);
			g.addColorStop(1, tip);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, TEX_W, TEX_H);
			if (text) {
				const family = '"Inter Variable", "Hiragino Sans", sans-serif';
				ctx.font = `600 100px ${family}`;
				const ratio = ctx.measureText(text).width / 100;
				// 花びらの長さの 4 割ほどに収まる、小さな文字
				const fontSize = Math.min(TEX_W * 0.13, (TEX_H * 0.4) / ratio);
				ctx.font = `600 ${fontSize}px ${family}`;
				ctx.letterSpacing = `${fontSize * 0.04}px`;
				ctx.fillStyle = ink;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.translate(TEX_W / 2, TEX_H * 0.6);
				ctx.rotate(-Math.PI / 2);
				ctx.fillText(text, 0, 0);
			}
		}
		const t = new CanvasTexture(canvas);
		t.colorSpace = SRGBColorSpace;
		t.anisotropy = anisotropy;
		return t;
	}

	// ---- 境界線とタグ「DESIGN | BUILD」 ----
	const planeGeometry = track(new PlaneGeometry(1, 1));
	const boundaryMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0.9 });
	const boundary = new Mesh(planeGeometry, boundaryMaterial);
	const tagMaterials = [
		new MeshBasicMaterial({ transparent: true }),
		new MeshBasicMaterial({ transparent: true })
	];
	const tags = tagMaterials.map((m) => new Mesh(planeGeometry, m));

	function tagTexture(text: string, color: string, align: 'left' | 'right') {
		const canvas = Object.assign(document.createElement('canvas'), { width: 512, height: 96 });
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.font = '600 52px "Inter Variable", sans-serif';
			ctx.letterSpacing = '8px';
			ctx.fillStyle = color;
			ctx.textBaseline = 'middle';
			ctx.textAlign = align;
			ctx.fillText(text, align === 'left' ? 0 : canvas.width, canvas.height / 2);
		}
		const t = new CanvasTexture(canvas);
		t.colorSpace = SRGBColorSpace;
		t.anisotropy = 4;
		return t;
	}

	// ---- 背景の奥行き: 地平線まで続く床の方眼と、接地影 ----
	const grid = new GridHelper(240, 120);
	const gridMaterial = grid.material as LineBasicMaterial;
	gridMaterial.vertexColors = false;
	gridMaterial.transparent = true;
	gridMaterial.opacity = 0.45;
	const shadowTexture = (() => {
		const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
		const ctx = c.getContext('2d');
		if (ctx) {
			const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
			g.addColorStop(0, 'rgba(0,0,0,0.5)');
			g.addColorStop(0.6, 'rgba(0,0,0,0.15)');
			g.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, 128, 128);
		}
		return new CanvasTexture(c);
	})();
	const shadowMaterial = new MeshBasicMaterial({
		map: shadowTexture,
		transparent: true,
		depthWrite: false
	});
	const shadow = new Mesh(planeGeometry, shadowMaterial);
	shadow.rotation.x = -Math.PI / 2;

	const root = new Group();
	root.add(plant, boundary, ...tags, grid, shadow);

	// ---- レイアウト: フリージアが MV を横切る大きさ ----
	let halfW0 = 6;
	let halfH0 = 4;
	const PLANT_W = 8.2;
	const PLANT_H = 6.4;

	function updateLayout(width: number, height: number) {
		const aspect = width / Math.max(height, 1);
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		halfH0 = Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
		halfW0 = halfH0 * aspect;
		const scale = Math.min((halfH0 * 2 * 0.6) / PLANT_H, (halfW0 * 2 * 0.8) / PLANT_W);
		plant.scale.setScalar(scale);
		if (aspect >= 1) plant.position.set(halfW0 * 0.14, -0.9, 0);
		else plant.position.set(0, halfH0 * 0.05, 0);
		// 床は茎の根元。影は根元に落とす
		const base = stemCurve.getPoint(0).multiplyScalar(scale).add(plant.position);
		grid.position.y = base.y;
		shadow.position.set(base.x + 0.6 * scale, base.y + 0.01, base.z);
		shadow.scale.setScalar(3.2 * scale);
		boundary.scale.set(0.016, halfH0 * 2.6, 1);
		for (const t of tags) t.scale.set(1.6, 0.3, 1);
	}

	let lastKey = '';
	$effect(() => {
		const { width, height } = $size;
		const key = `${Math.round(width)}x${Math.round(height)}`;
		if (key === lastKey || width === 0 || height === 0) return;
		lastKey = key;
		updateLayout(width, height);
		invalidate();
	});

	// ---- テーマ: CSS トークンから色を取得し、花びらのテクスチャを作り直す ----
	type RGB = [number, number, number];
	const toColor = (rgb: RGB) => new Color().setRGB(...rgb, SRGBColorSpace);
	const toCss = ([r, g, b]: RGB, a = 1) =>
		`rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${a})`;
	const shade = ([r, g, b]: RGB, k: number): RGB => [r * k, g * k, b * k];

	$effect(() => {
		const dark = theme.current === 'dark';
		const accent = cssVarToRgb('--accent');
		const graphite = cssVarToRgb(dark ? '--fg-muted' : '--line-strong');
		const pearl: RGB = [0.96, 0.95, 0.93];
		// 文字は花びらと同系色で、少しだけ濃く（さりげなく読める程度）
		const palettes: Record<Tone, { tip: RGB; ink: string }> = {
			0: { tip: accent, ink: toCss(shade(accent, 0.42), 0.75) },
			1: { tip: pearl, ink: toCss(shade(pearl, 0.45), 0.7) },
			2: { tip: graphite, ink: toCss(shade(graphite, 0.45), 0.8) }
		};
		const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
		const set = (m: MeshPhysicalMaterial, tone: Tone, text: string | null) => {
			const pal = palettes[tone];
			const old = m.map;
			m.map = petalTexture(toCss(shade(pal.tip, 0.7)), toCss(pal.tip), pal.ink, text, anisotropy);
			m.needsUpdate = true;
			old?.dispose();
		};
		for (const tone of [0, 1, 2] as Tone[]) set(plainPetal[tone], tone, null);
		for (const l of labeled) set(l.material, l.tone, l.text);
		stemMaterial.color = toColor(cssVarToRgb(dark ? '--surface-2' : '--line-strong'));
		const muted = toColor(cssVarToRgb('--fg-muted'));
		const accentText = toColor(cssVarToRgb('--accent-text'));
		lineMuted.color = muted;
		lineAccent.color = accentText;
		accentLight.color = toColor(accent);
		boundaryMaterial.color = accentText;
		gridMaterial.color = toColor(cssVarToRgb(dark ? '--line-strong' : '--line'));
		shadowMaterial.opacity = dark ? 1 : 0.5;
		const bg = toColor(cssVarToRgb('--bg'));
		fog.color = bg;
		scene.background = bg;
		scene.environmentIntensity = dark ? 0.7 : 1;
		const prev = tagMaterials.map((m) => m.map);
		tagMaterials[0].map = tagTexture('DESIGN', toCss(cssVarToRgb('--fg-muted')), 'right');
		tagMaterials[1].map = tagTexture('BUILD', toCss(cssVarToRgb('--accent-text')), 'left');
		for (const m of tagMaterials) m.needsUpdate = true;
		for (const t of prev) t?.dispose();
		invalidate();
	});

	// ---- ポインタ: 境界がカーソルを追う / クリック・タップで花が根元から順にうなずく ----
	const canvas = renderer.domElement;
	const pointer = new Vector2(0, 0);
	let hasPointer = false;
	let lastPointerAt = -Infinity;
	let elapsed = 0;

	function onPointerMove(event: PointerEvent) {
		const rect = canvas.getBoundingClientRect();
		pointer.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		);
		hasPointer = true;
		lastPointerAt = elapsed;
	}

	function onPointerDown() {
		blossoms.forEach((b, i) => (b.nod = 1 + i * 0.08));
		invalidate();
	}

	$effect(() => {
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			canvas.removeEventListener('pointerdown', onPointerDown);
		};
	});

	// ---- フレーム更新 ----
	let boundaryX = 0;
	let boundaryV = 0;
	let sway = 0;
	let frameAcc = 0;
	const tmp = new Vector3();
	const ndc = new Vector2();
	const anchor = new Vector3();
	const dir = new Vector3();
	const up = new Vector3();
	const raycaster = new Raycaster();
	/** 境界の基準にする、画面に平行な面 */
	const screenPlane = new Plane(new Vector3(0, 0, 1), 0);
	const baseRotations = blossoms.map((b) => b.group.rotation.x);

	const { start, stop } = useTask(
		(delta) => {
			const dt = Math.min(delta, 1 / 20);
			elapsed += dt;
			const idle = !hasPointer || elapsed - lastPointerAt > 2.5;

			// カメラはカーソルに合わせてわずかに動く（視差で背景の奥行きが分かる）
			const cx = idle ? Math.sin(elapsed * 0.12) * 0.5 : pointer.x * 0.9;
			const cy = idle ? Math.sin(elapsed * 0.09) * 0.2 : pointer.y * 0.45;
			camera.position.x += (cx - camera.position.x) * Math.min(1, dt * 1.2);
			camera.position.y += (cy - camera.position.y) * Math.min(1, dt * 1.2);
			camera.lookAt(LOOK_AT);
			camera.updateMatrixWorld();

			// 境界のばね追従（操作がない間はゆっくり左右に揺れる）
			const targetNdc = idle
				? Math.sin(elapsed * 0.25) * 0.45
				: MathUtils.clamp(pointer.x, -0.8, 0.8);
			const k = 22;
			boundaryV += (k * (targetNdc - boundaryX) - 2 * Math.sqrt(k) * 0.9 * boundaryV) * dt;
			boundaryX += boundaryV * dt;

			// 境界面: 画面上の x を通る鉛直線と、カメラ位置を含む面
			ndc.set(boundaryX, 0);
			raycaster.setFromCamera(ndc, camera);
			if (raycaster.ray.intersectPlane(screenPlane, anchor)) {
				dir.subVectors(anchor, camera.position);
				up.set(0, 1, 0).applyQuaternion(camera.quaternion);
				tmp.crossVectors(dir, up).normalize();
				solidPlane.setFromNormalAndCoplanarPoint(tmp, anchor);
				wirePlane.setFromNormalAndCoplanarPoint(tmp.negate(), anchor);
				boundary.position.copy(anchor);
				boundary.quaternion.copy(camera.quaternion);
				tags[0].position.set(anchor.x - 0.95, halfH0 * 0.62, 0);
				tags[1].position.set(anchor.x + 0.95, halfH0 * 0.62, 0);
				for (const t of tags) t.quaternion.copy(camera.quaternion);
			}

			// 茎はそよ風のようにゆっくり揺れる
			const target = idle ? Math.sin(elapsed * 0.35) * 0.02 : -pointer.x * 0.03;
			sway += (target - sway) * Math.min(1, dt * 0.8);
			plant.rotation.z = sway;
			plant.rotation.y = Math.sin(elapsed * 0.11) * 0.06;

			// 花: ゆっくり呼吸するように開閉し、クリック後は根元から順にうなずく
			blossoms.forEach((b, i) => {
				let nod = 0;
				if (b.nod > 0) {
					b.nod = Math.max(0, b.nod - dt * 0.8);
					const w = Math.min(1, b.nod);
					nod = Math.sin((1 - w) * Math.PI * 2) * w * 0.14;
				}
				b.group.rotation.x = baseRotations[i] + nod;
				const breathe = Math.sin(elapsed * 0.5 + b.phase) * 0.03;
				for (const tp of b.tepals) tp.mesh.rotation.x = tp.open + breathe * (1 - b.budness);
			});

			// モバイルは 30fps（電池への配慮）
			frameAcc += delta;
			if (high || frameAcc >= 1 / 30) {
				frameAcc = 0;
				invalidate();
			}
		},
		{ autoStart: false, autoInvalidate: false }
	);

	$effect(() => {
		if (active) {
			start();
			invalidateFrame();
		} else stop();
	});

	onDestroy(() => {
		stop();
		for (const g of geometries) g.dispose();
		accentLight.dispose();
		const petalMaterials = [...Object.values(plainPetal), ...labeled.map((l) => l.material)];
		for (const m of petalMaterials) m.map?.dispose();
		for (const m of tagMaterials) m.map?.dispose();
		const materials: Material[] = [
			...petalMaterials,
			stemMaterial,
			lineMuted,
			lineAccent,
			shadowMaterial,
			boundaryMaterial,
			...tagMaterials,
			gridMaterial
		];
		for (const m of materials) m.dispose();
		shadowTexture.dispose();
		grid.geometry.dispose();
		scene.fog = null;
		scene.background = null;
		scene.environment = null;
		envTexture.dispose();
		pmrem.dispose();
	});
</script>

<T is={camera} makeDefault manual />
<!-- キーライト（右上手前）と、花びらの輪郭を際立たせる逆光（左奥） -->
<T.DirectionalLight position={[4, 6, 8]} intensity={1.5} />
<T.DirectionalLight position={[-6, 4, -8]} intensity={2.2} />
<T is={root} dispose={false} />
