<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		AdditiveBlending,
		BufferGeometry,
		CanvasTexture,
		CatmullRomCurve3,
		Euler,
		Color,
		BackSide,
		DoubleSide,
		FrontSide,
		Float32BufferAttribute,
		Group,
		InstancedMesh,
		LatheGeometry,
		LineBasicMaterial,
		LineSegments,
		MathUtils,
		Matrix4,
		Mesh,
		MeshBasicMaterial,
		NormalBlending,
		PerspectiveCamera,
		PlaneGeometry,
		Plane,
		Quaternion,
		Raycaster,
		SphereGeometry,
		Sprite,
		SpriteMaterial,
		SRGBColorSpace,
		TubeGeometry,
		Vector2,
		Vector3,
		WireframeGeometry,
		type Material,
		type Side
	} from 'three';
	import { theme } from '#lib/state/theme.svelte.ts';
	import { cssVarToRgb } from '#lib/three/css-color.ts';
	import { createPetalGeometry } from '#lib/three/petal.ts';
	import { createBackdrop, createSilkPetal, type SilkPalette } from '#lib/three/silk-petal.ts';
	import { mulberry32, type RGB } from '#lib/three/random.ts';
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

	/*
	 * 光が透ける薄い花びらの、一輪の花（ポピーのような）。
	 * - 陰影は使わず（MeshBasicMaterial）、半透明の花びらが重なって色が深まる
	 * - 各花びらに少しずらした淡い残像を重ね、二重露光のような柔らかい輪郭にする
	 * - 背景は継ぎ目のないスタジオ背景（中心は暖かく、外側は淡いラベンダーとミント）
	 */
	const PETALS = 5;
	const PETAL_LENGTH = 3.4;
	const PETAL_WIDTH = 3.5;
	// 花びらは中心から生やす（付け根どうしが離れて見えないように）
	const PETAL_OFFSET = 0.02;
	const FLOWER_RADIUS = PETAL_OFFSET + PETAL_LENGTH;
	const GHOSTS = high ? 2 : 1;

	// ---- camera ----
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 120);
	camera.position.set(0, 0, CAMERA_Z);
	camera.lookAt(0, 0, 0);

	// ---- 境界: 設計図（左）と実物（右）を分ける面 ----
	const solidPlane = new Plane(new Vector3(1, 0, 0), 0);
	const wirePlane = new Plane(new Vector3(-1, 0, 0), 0);
	renderer.localClippingEnabled = true;
	const clip = <M extends Material>(m: M, plane: Plane) => {
		m.clippingPlanes = [plane];
		return m;
	};

	const geometries: BufferGeometry[] = [];
	const track = <G extends BufferGeometry>(g: G) => (geometries.push(g), g);

	// ---- 花びら（くしゃっと波打つ、薄い大きな花びら）----
	const petalOptions = {
		length: PETAL_LENGTH,
		width: PETAL_WIDTH,
		// 負の値で先端がわずかに外へ反り、花が少しだけ開く
		curl: -0.12,
		cup: 0.38,
		tip: 'round' as const,
		ruffle: 0.24
	};
	const petalGeometry = track(
		createPetalGeometry({ ...petalOptions, segmentsX: high ? 36 : 20, segmentsY: high ? 44 : 24 })
	);
	// 手前の花びら用: くぼみと反りを弱め、強く立ち上げても先が折れて尖らない形
	const frontPetalOptions = { ...petalOptions, curl: 0.02, cup: 0.14, ruffle: 0.18 };
	const frontPetalGeometry = track(
		createPetalGeometry({
			...frontPetalOptions,
			segmentsX: high ? 36 : 20,
			segmentsY: high ? 44 : 24
		})
	);
	// DESIGN 側の線は、BUILD 側と同じ形状オプションから作る（形がずれないように）。
	// 分割だけを粗くするので、輪郭と波打ちは一致する
	const wireOf = (options: typeof petalOptions) =>
		track(
			new WireframeGeometry(
				track(createPetalGeometry({ ...options, segmentsX: 10, segmentsY: 16 }))
			)
		);
	const petalWire = wireOf(petalOptions);
	const frontPetalWire = wireOf(frontPetalOptions);
	const lineMuted = clip(new LineBasicMaterial({ transparent: true, opacity: 0.5 }), wirePlane);
	const lineAccent = clip(new LineBasicMaterial({ transparent: true, opacity: 0.8 }), wirePlane);

	const silkMaterial = (opacity: number, side: Side = DoubleSide) =>
		clip(
			new MeshBasicMaterial({
				transparent: true,
				opacity,
				depthWrite: false,
				side,
				fog: false
			}),
			solidPlane
		);

	type Petal = {
		mesh: Mesh;
		ghosts: Mesh[];
		material: MeshBasicMaterial;
		/** 花びらの裏側（手前の花びらで見える面）。表とは別の、白っぽく粉をふいた色調 */
		backMaterial: MeshBasicMaterial;
		ghostMaterial: MeshBasicMaterial;
		pitch: number;
		flip: boolean;
		/** 手前（花の下側）にあるほど 1 に近い */
		lower: number;
		phase: number;
		wave: number;
	};

	const flower = new Group();
	const rand = mulberry32(11);
	const petals: Petal[] = Array.from({ length: PETALS }, (_, i) => {
		// 花びらは均等に並べず、少しずつ大きさと角度を崩す（写真のような自然な開き方）
		const angle = (i / PETALS) * Math.PI * 2 + 0.5 + (rand() - 0.5) * 0.35;
		const holder = new Group();
		holder.rotation.z = angle;
		// 手前（花の下側）の花びらほど大きく立ち上げ、花全体を上へ向けて杯のように開く
		const lower = Math.max(0, -Math.cos(angle));
		const geometry = lower > 0.45 ? frontPetalGeometry : petalGeometry;
		const material = silkMaterial(0.72, FrontSide);
		const backMaterial = silkMaterial(0.8, BackSide);
		const ghostMaterial = silkMaterial(0.16);
		const mesh = new Mesh(geometry, material);
		const back = new Mesh(geometry, backMaterial);
		back.renderOrder = i;
		mesh.add(back);
		mesh.position.y = PETAL_OFFSET;
		const pitch = 0.45 + rand() * 0.25 + lower * 0.85;
		mesh.rotation.x = pitch;
		mesh.rotation.y = (rand() - 0.5) * 0.12;
		mesh.scale.setScalar(0.9 + rand() * 0.2);
		mesh.position.z = i * 0.006;
		mesh.renderOrder = i;
		mesh.add(
			new LineSegments(
				geometry === frontPetalGeometry ? frontPetalWire : petalWire,
				i % 2 ? lineMuted : lineAccent
			)
		);
		holder.add(mesh);
		// 残像: 少し大きく・少し回した淡い複製
		const ghosts: Mesh[] = [];
		for (let k = 0; k < GHOSTS; k++) {
			const ghost = new Mesh(geometry, ghostMaterial);
			ghost.position.copy(mesh.position);
			ghost.rotation.copy(mesh.rotation);
			// 残像は横方向にだけ広げ、先端はずらさない（先がぼけないように）
			ghost.scale.set(mesh.scale.x * (1.05 + k * 0.04), mesh.scale.y, mesh.scale.z);
			ghost.rotation.z = (k % 2 ? -1 : 1) * 0.025;
			ghost.renderOrder = i - 0.5;
			holder.add(ghost);
			ghosts.push(ghost);
		}
		flower.add(holder);
		return {
			mesh,
			ghosts,
			material,
			backMaterial,
			ghostMaterial,
			pitch,
			lower,
			flip: -Math.sin(angle) < 0,
			phase: i * 1.3,
			wave: 0
		};
	});

	/** いちばん手前の花びら（少しだけ不透明にして、手前にあることを伝える） */
	const frontmost = petals.reduce((a, b) => (b.lower > a.lower ? b : a));
	frontmost.material.opacity = 0.84;
	frontmost.backMaterial.opacity = 0.9;

	// ---- 花芯: 放射状に広がる細い雄しべと、先の葯。中心は赤みを帯びて光る ----
	const filamentCount = high ? 220 : 110;
	const filamentPositions: number[] = [];
	const filamentColors: number[] = [];
	const shade: number[] = [];
	const antherMatrix = new Matrix4();
	const antherGeometry = track(new SphereGeometry(0.035, 6, 4));
	const antherMaterial = clip(
		new MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }),
		solidPlane
	);
	const anthers = new InstancedMesh(antherGeometry, antherMaterial, filamentCount);
	for (let i = 0; i < filamentCount; i++) {
		const th = rand() * Math.PI * 2;
		const len = 0.2 + rand() * 0.42;
		const lift = 0.4 + rand() * 0.55;
		const x = Math.cos(th) * len;
		const y = Math.sin(th) * len;
		const z = lift;
		filamentPositions.push(0, 0, 0.15, x, y, z);
		const s = 0.7 + rand() * 0.8;
		antherMatrix.makeScale(s, s * 0.6, s).setPosition(x, y, z);
		anthers.setMatrixAt(i, antherMatrix);
		// 手前（花の下側 = -Y）の雄しべほど、立ち上がった花びらの陰になって暗い
		const lit = MathUtils.smoothstep(y, -0.55, 0.45);
		shade.push(0.32 + 0.68 * lit);
		filamentColors.push(0.5, 0.5, 0.5, ...Array(3).fill(0.3 + 0.7 * lit));
	}
	// 葯の明るさ（陰の濃さ）をインスタンスごとの色で掛ける
	shade.forEach((k, i) => anthers.setColorAt(i, new Color(k, k, k)));
	const filamentGeometry = track(new BufferGeometry());
	filamentGeometry.setAttribute('position', new Float32BufferAttribute(filamentPositions, 3));
	filamentGeometry.setAttribute('color', new Float32BufferAttribute(filamentColors, 3));
	const filamentMaterial = clip(
		new LineBasicMaterial({
			transparent: true,
			opacity: 0.8,
			depthWrite: false,
			vertexColors: true
		}),
		solidPlane
	);
	const filaments = new LineSegments(filamentGeometry, filamentMaterial);
	const filamentWire = new LineSegments(filamentGeometry, lineAccent);
	filaments.renderOrder = 20;
	anthers.renderOrder = 21;
	// 中心の赤い光（にじむような発光）
	const glowTexture = (() => {
		const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
		const ctx = c.getContext('2d')!;
		const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
		g.addColorStop(0, 'rgba(255,255,255,0.9)');
		g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
		g.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 128, 128);
		return new CanvasTexture(c);
	})();
	const glowMaterial = clip(
		new SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false }),
		solidPlane
	);
	const glow = new Sprite(glowMaterial);
	glow.scale.setScalar(3.2);
	// 光は奥側（上）へずらし、手前側は陰に沈める
	glow.position.set(0, 0.35, 0.4);
	// 手前の花びらが落とす影（花芯の手前側に重ねる柔らかい暗がり）
	const shadeTexture = (() => {
		const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
		const ctx = c.getContext('2d')!;
		const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
		g.addColorStop(0, 'rgba(255,255,255,1)');
		g.addColorStop(0.5, 'rgba(255,255,255,0.55)');
		g.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 128, 128);
		return new CanvasTexture(c);
	})();
	const centerShadeMaterial = clip(
		new SpriteMaterial({ map: shadeTexture, transparent: true, depthWrite: false }),
		solidPlane
	);
	const centerShade = new Sprite(centerShadeMaterial);
	centerShade.scale.set(1.9, 1.2, 1);
	centerShade.position.set(0, -0.45, 0.75);
	centerShade.renderOrder = 22;
	glow.renderOrder = 19;
	// 花托: 花びらの付け根を一つにまとめる、小さな杯形の台座
	// 下は茎と同じ太さの首から始まり、ふくらんで花びらの付け根を受け止める
	const STEM_RADIUS = 0.075;
	const NECK_BOTTOM = -0.75;
	const receptacleProfile = [
		new Vector2(STEM_RADIUS, NECK_BOTTOM),
		new Vector2(STEM_RADIUS * 1.05, -0.6),
		new Vector2(STEM_RADIUS * 1.25, -0.45),
		...Array.from({ length: 8 }, (_, i) => {
			const t = (i + 1) / 8;
			return new Vector2(
				STEM_RADIUS * 1.25 + (0.46 - STEM_RADIUS * 1.25) * Math.sin((t * Math.PI) / 2),
				-0.45 + t * 0.6
			);
		})
	];
	const receptacleGeometry = track(new LatheGeometry(receptacleProfile, high ? 24 : 14));
	receptacleGeometry.rotateX(Math.PI / 2);
	const receptacleMaterial = clip(
		new MeshBasicMaterial({ transparent: true, opacity: 0.95, depthWrite: false }),
		solidPlane
	);
	const receptacle = new Mesh(receptacleGeometry, receptacleMaterial);
	receptacle.renderOrder = -2;
	const receptacleWire = new LineSegments(
		track(
			new WireframeGeometry(track(new LatheGeometry(receptacleProfile, 8).rotateX(Math.PI / 2)))
		),
		lineMuted
	);
	flower.add(receptacle, receptacleWire, glow, filaments, filamentWire, anthers, centerShade);

	// ---- 茎: 花托の首から、花の向きに沿って後ろへ伸び、ゆるく波打ちながら下へ ----
	// 茎は花のグループの中に置き、花托と必ずつながるようにする。
	// 形は親（plant）の座標で設計し、花の基本の向きの逆回転で花の座標へ変換する
	const baseQuat = new Quaternion().setFromEuler(new Euler(-0.62, -0.34, 0.18));
	const toFlower = baseQuat.clone().invert();
	const neck = new Vector3(0, 0, NECK_BOTTOM).applyQuaternion(baseQuat);
	const back = new Vector3(0, 0, -1).applyQuaternion(baseQuat);
	const stemCurve = new CatmullRomCurve3(
		[
			neck,
			neck.clone().addScaledVector(back, 0.35),
			neck
				.clone()
				.addScaledVector(back, 0.7)
				.add(new Vector3(0, -0.5, 0)),
			new Vector3(-0.2, -2.6, -0.7),
			new Vector3(-0.55, -4.8, -0.3),
			new Vector3(-0.5, -7.2, 0),
			new Vector3(-0.85, -10, 0.1)
		].map((p) => p.applyQuaternion(toFlower))
	);
	const stemGeometry = track(new TubeGeometry(stemCurve, 96, STEM_RADIUS, high ? 10 : 6, false));
	const stemWire = track(
		new WireframeGeometry(track(new TubeGeometry(stemCurve, 24, STEM_RADIUS, 5, false)))
	);
	const stemMaterial = clip(
		new MeshBasicMaterial({ transparent: true, opacity: 0.92, depthWrite: false }),
		solidPlane
	);
	const stem = new Mesh(stemGeometry, stemMaterial);
	stem.renderOrder = -1;
	const stemLines = new LineSegments(stemWire, lineMuted);

	const plant = new Group();
	flower.add(stem, stemLines);
	plant.add(flower);

	// ---- 境界線とタグ「DESIGN | BUILD」 ----
	const planeGeometry = track(new PlaneGeometry(1, 1));
	const boundaryMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0.55 });
	const boundary = new Mesh(planeGeometry, boundaryMaterial);
	const tagMaterials = [
		new MeshBasicMaterial({ transparent: true }),
		new MeshBasicMaterial({ transparent: true })
	];
	// タグと境界線は深度を書き込まない（透明な板が奥の花びらを隠さないように）
	for (const m of [...tagMaterials, boundaryMaterial]) {
		m.depthWrite = false;
		m.depthTest = false;
	}
	const tags = tagMaterials.map((m) => {
		const mesh = new Mesh(planeGeometry, m);
		mesh.renderOrder = 100;
		return mesh;
	});

	function tagTexture(text: string, color: string, align: 'left' | 'right') {
		const canvas = Object.assign(document.createElement('canvas'), { width: 512, height: 96 });
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.font = '500 44px "Inter Variable", sans-serif';
			ctx.letterSpacing = '10px';
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

	const root = new Group();
	root.add(plant, boundary, ...tags);

	// ---- レイアウト: 花は画面の右寄り・やや上。茎は画面の下へ抜ける ----
	let halfW0 = 6;
	let halfH0 = 4;
	let aspect = 1.6;
	/** 花はこちらへ向きつつ、少し上と左へ傾く */
	const BASE_ROTATION = new Vector3(-0.62, -0.34, 0.18); // baseQuat と同じ値

	function updateLayout(width: number, height: number) {
		aspect = width / Math.max(height, 1);
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		halfH0 = Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
		halfW0 = halfH0 * aspect;
		const portrait = aspect < 1;
		const radius = portrait ? halfW0 * 0.9 : halfH0 * 0.62;
		plant.scale.setScalar(radius / FLOWER_RADIUS);
		if (portrait) plant.position.set(halfW0 * 0.1, halfH0 * 0.2, 0);
		else plant.position.set(halfW0 * 0.3, halfH0 * 0.12, 0);
		boundary.scale.set(0.012, halfH0 * 2.6, 1);
		for (const t of tags) t.scale.set(1.6, 0.3, 1);
		applyBackdrop();
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

	// ---- テーマ: 背景と花の色 ----
	let backdrop: CanvasTexture | null = null;
	function applyBackdrop() {
		const old = backdrop;
		backdrop = createBackdrop({ dark: untrack(() => theme.current) === 'dark', aspect });
		scene.background = backdrop;
		old?.dispose();
	}

	const toColor = (rgb: RGB) => new Color().setRGB(...rgb, SRGBColorSpace);
	const toCss = ([r, g, b]: RGB) =>
		`rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
	const mix = (a: RGB, b: RGB, k: number): RGB => [
		a[0] + (b[0] - a[0]) * k,
		a[1] + (b[1] - a[1]) * k,
		a[2] + (b[2] - a[2]) * k
	];

	$effect(() => {
		const dark = theme.current === 'dark';
		applyBackdrop();
		// 参考の写真の色: 付け根の濃いオレンジ → コーラル → 淡いピンク、縁に深いさび色
		const orange: RGB = [0.96, 0.52, 0.2];
		const coral: RGB = [0.98, 0.62, 0.48];
		const pink: RGB = [0.98, 0.8, 0.8];
		const rust: RGB = [0.62, 0.24, 0.12];
		const gold: RGB = [0.99, 0.74, 0.22];
		const peach: RGB = [1, 0.74, 0.58];
		const rose: RGB = [0.95, 0.55, 0.62];
		const magenta: RGB = [0.86, 0.36, 0.56];
		const lilac: RGB = [0.84, 0.76, 0.92];
		const creamy: RGB = [1, 0.95, 0.86];
		const apricot: RGB = [0.98, 0.6, 0.32];
		const palettes: SilkPalette[] = [0, 1, 2, 3, 4].map((i) => {
			const warmth = [0.0, 0.35, 0.75, 0.55, 0.15][i];
			return {
				heart: mix(gold, orange, warmth * 0.4),
				base: mix(orange, apricot, 0.3 + warmth * 0.3),
				mid: mix(coral, peach, warmth * 0.5),
				blush: mix(rose, coral, warmth * 0.6),
				tip: mix(pink, lilac, 0.2 + (1 - warmth) * 0.25),
				haze: mix(lilac, creamy, warmth * 0.5),
				rim: rust,
				ink: mix(rust, [0.4, 0.15, 0.1], 0.4),
				accents: [gold, peach, rose, magenta, lilac, creamy, apricot]
			};
		});
		const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
		const texSize = high ? 640 : 320;
		petals.forEach((p, i) => {
			const old = p.material.map;
			const map = createSilkPetal({
				width: texSize,
				height: Math.round(texSize * (PETAL_LENGTH / PETAL_WIDTH)),
				seed: 31 + i * 13,
				palette: palettes[i],
				texts: [],
				flipText: p.flip,
				anisotropy
			});
			// 裏側: 同じ筋（同じ seed）で、白っぽく淡いローズとピーチの色調
			const pal = palettes[i];
			const pale = (c: RGB, k: number) => mix(c, creamy, k);
			const oldBack = p.backMaterial.map;
			const backMap = createSilkPetal({
				width: texSize,
				height: Math.round(texSize * (PETAL_LENGTH / PETAL_WIDTH)),
				seed: 31 + i * 13,
				palette: {
					heart: mix(pal.heart, [0.78, 0.82, 0.55], 0.45),
					base: pale(pal.base, 0.45),
					mid: pale(mix(pal.mid, rose, 0.35), 0.5),
					blush: pale(rose, 0.45),
					tip: pale(mix(pal.tip, peach, 0.3), 0.55),
					haze: pale(lilac, 0.5),
					rim: mix(rose, rust, 0.35),
					ink: pal.ink,
					accents: [rose, peach, lilac, creamy, [0.86, 0.9, 0.78]]
				},
				texts: [],
				anisotropy
			});
			p.material.map = map;
			p.backMaterial.map = backMap;
			p.ghostMaterial.map = map;
			// いちばん手前の花びらだけ、少し暗くする（陰になっている感じ）
			const tint = p === frontmost ? (dark ? 0.55 : 0.6) : 1;
			for (const m of [p.material, p.backMaterial, p.ghostMaterial]) {
				// 灰色にくすまないよう、赤みを残して暗くする
				m.color.setRGB(tint * 1.08, tint * 0.9, tint * 0.9);
				m.needsUpdate = true;
			}
			old?.dispose();
			oldBack?.dispose();
		});
		filamentMaterial.color = toColor([0.98, 0.62, 0.18]);
		receptacleMaterial.color = toColor(dark ? [0.62, 0.56, 0.3] : [0.78, 0.72, 0.38]);
		antherMaterial.color = toColor([1, 0.72, 0.22]);
		centerShadeMaterial.color = toColor(dark ? [0.12, 0.06, 0.05] : [0.45, 0.2, 0.12]);
		centerShadeMaterial.opacity = dark ? 0.55 : 0.32;
		glowMaterial.color = toColor([1, 0.35, 0.18]);
		glowMaterial.blending = dark ? AdditiveBlending : NormalBlending;
		glowMaterial.opacity = dark ? 0.55 : 0.7;
		glowMaterial.needsUpdate = true;
		stemMaterial.color = toColor(dark ? [0.42, 0.5, 0.36] : [0.48, 0.56, 0.4]);
		const muted = toColor(cssVarToRgb('--fg-muted'));
		lineMuted.color = muted;
		lineAccent.color = toColor(cssVarToRgb('--accent-text'));
		boundaryMaterial.color = muted;
		const prev = tagMaterials.map((m) => m.map);
		tagMaterials[0].map = tagTexture('DESIGN', toCss(cssVarToRgb('--fg-muted')), 'right');
		tagMaterials[1].map = tagTexture('BUILD', toCss(cssVarToRgb('--fg-muted')), 'left');
		for (const m of tagMaterials) m.needsUpdate = true;
		for (const t of prev) t?.dispose();
		invalidate();
	});

	// ---- ポインタ: 境界がカーソルを追う / クリック・タップで花びらがふわっと揺れる ----
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
		petals.forEach((p, i) => (p.wave = 1 + i * 0.12));
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
	let tiltX = 0;
	let tiltY = 0;
	let frameAcc = 0;
	const tmp = new Vector3();
	const ndc = new Vector2();
	const anchor = new Vector3();
	const dir = new Vector3();
	const up = new Vector3();
	const raycaster = new Raycaster();
	const screenPlane = new Plane(new Vector3(0, 0, 1), 0);

	const { start, stop } = useTask(
		(delta) => {
			const dt = Math.min(delta, 1 / 20);
			elapsed += dt;
			const idle = !hasPointer || elapsed - lastPointerAt > 2.5;

			// カメラはカーソルに合わせてわずかに動く（視差）
			const cx = idle ? Math.sin(elapsed * 0.12) * 0.4 : pointer.x * 0.7;
			const cy = idle ? Math.sin(elapsed * 0.09) * 0.2 : pointer.y * 0.35;
			camera.position.x += (cx - camera.position.x) * Math.min(1, dt * 1.2);
			camera.position.y += (cy - camera.position.y) * Math.min(1, dt * 1.2);
			camera.lookAt(0, 0, 0);
			camera.updateMatrixWorld();

			// 境界のばね追従（操作がない間はゆっくり左右に揺れる）
			const targetNdc = idle
				? Math.sin(elapsed * 0.25) * 0.45
				: MathUtils.clamp(pointer.x, -0.8, 0.8);
			const k = 22;
			boundaryV += (k * (targetNdc - boundaryX) - 2 * Math.sqrt(k) * 0.9 * boundaryV) * dt;
			boundaryX += boundaryV * dt;
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
				tags[0].position.set(anchor.x - 0.95, halfH0 * 0.7, 0);
				tags[1].position.set(anchor.x + 0.95, halfH0 * 0.7, 0);
				for (const t of tags) t.quaternion.copy(camera.quaternion);
			}

			// 花: ゆっくり揺れる
			const tx = idle ? Math.sin(elapsed * 0.2) * 0.04 : pointer.y * 0.06;
			const ty = idle ? Math.sin(elapsed * 0.15) * 0.05 : pointer.x * 0.08;
			tiltX += (tx - tiltX) * Math.min(1, dt * 0.8);
			tiltY += (ty - tiltY) * Math.min(1, dt * 0.8);
			flower.rotation.set(BASE_ROTATION.x - tiltX, BASE_ROTATION.y + tiltY, BASE_ROTATION.z);
			plant.rotation.z = Math.sin(elapsed * 0.3) * 0.012;

			// 花びら: 呼吸するように開閉し、残像は少し遅れてついてくる
			for (const p of petals) {
				const breathe = Math.sin(elapsed * 0.5 + p.phase) * 0.035;
				let wave = 0;
				if (p.wave > 0) {
					p.wave = Math.max(0, p.wave - dt * 0.6);
					const w = Math.min(1, p.wave);
					wave = Math.sin((1 - w) * Math.PI * 2) * w * 0.12;
				}
				const x = p.pitch + breathe + wave;
				p.mesh.rotation.x = x;
				p.ghosts.forEach((g, gi) => {
					const lag = Math.sin(elapsed * 0.5 + p.phase - 0.6 - gi * 0.4) * 0.035;
					g.rotation.x = x + (lag - breathe) * 0.4;
				});
			}

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
		anthers.dispose();
		for (const p of petals) {
			p.material.map?.dispose();
			p.backMaterial.map?.dispose();
		}
		for (const m of tagMaterials) m.map?.dispose();
		const materials: Material[] = [
			...petals.flatMap((p) => [p.material, p.backMaterial, p.ghostMaterial]),
			receptacleMaterial,
			antherMaterial,
			centerShadeMaterial,
			filamentMaterial,
			glowMaterial,
			stemMaterial,
			lineMuted,
			lineAccent,
			boundaryMaterial,
			...tagMaterials
		];
		for (const m of materials) m.dispose();
		glowTexture.dispose();
		shadeTexture.dispose();
		backdrop?.dispose();
		scene.background = null;
	});
</script>

<T is={camera} makeDefault manual />
<T is={root} dispose={false} />
