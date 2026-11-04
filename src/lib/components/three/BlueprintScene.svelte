<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		AdditiveBlending,
		BoxGeometry,
		CanvasTexture,
		CapsuleGeometry,
		Color,
		EdgesGeometry,
		Fog,
		FrontSide,
		GridHelper,
		Group,
		IcosahedronGeometry,
		LineBasicMaterial,
		LineSegments,
		MathUtils,
		Mesh,
		MeshBasicMaterial,
		MeshPhysicalMaterial,
		MeshStandardMaterial,
		NormalBlending,
		OctahedronGeometry,
		PerspectiveCamera,
		PlaneGeometry,
		PMREMGenerator,
		Plane,
		PointLight,
		Quaternion,
		SRGBColorSpace,
		SphereGeometry,
		Sprite,
		SpriteMaterial,
		TorusGeometry,
		Vector2,
		Vector3,
		WireframeGeometry,
		type BufferGeometry,
		type Material
	} from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js';
	import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
	// Inter Bold の欧文サブセット（OFL-1.1。src/lib/assets/fonts/INTER-LICENSE.txt）
	import interBold from '#lib/assets/fonts/inter-bold.typeface.json';
	import { skillChips } from '#lib/content/hero-skills.ts';
	import { theme } from '#lib/state/theme.svelte.ts';
	import { cssVarToRgb } from '#lib/three/css-color.ts';
	import { Jar, mulberry32, type JarBody } from '#lib/three/jar-physics.ts';
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
	/** 器（角丸キューブ）の半辺。中身はこのローカル座標で計算する */
	const JAR_HALF = 2.2;
	const WALL = 0.12;

	// ---- camera ----
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
	camera.position.set(0, 0, CAMERA_Z);
	camera.lookAt(0, 0, 0);

	// ---- 境界: 設計図（左）と実物（右）を分ける面。カメラを通るので、奥行きが違っても画面上で1本の線になる ----
	const solidPlane = new Plane(new Vector3(1, 0, 0), 0);
	const wirePlane = new Plane(new Vector3(-1, 0, 0), 0);
	renderer.localClippingEnabled = true;

	// ---- 環境マップ（艶のある映り込み） ----
	const pmrem = new PMREMGenerator(renderer);
	const room = new RoomEnvironment();
	const envTexture = pmrem.fromScene(room, 0.04).texture;
	room.dispose();
	scene.environment = envTexture;

	// ---- 奥行き: 背景色の霧 ----
	const fog = new Fog(0x000000, CAMERA_Z + 2, CAMERA_Z + 16);
	scene.fog = fog;

	// ---- materials ----
	const clip = <M extends Material>(m: M, plane: Plane) => {
		m.clippingPlanes = [plane];
		return m;
	};
	/** 器: 透過するガラス。中身が屈折して見える（モバイルは半透明の簡易版） */
	const jarGlass = clip(
		new MeshPhysicalMaterial({
			color: 0xffffff,
			roughness: 0.04,
			metalness: 0,
			transmission: high ? 1 : 0,
			// 壁の薄いガラスの器として見せる（厚いと塊になって中身が濁る）
			thickness: 0.08,
			ior: 1.3,
			transparent: !high,
			opacity: high ? 1 : 0.18,
			specularIntensity: 1,
			envMapIntensity: 1,
			iridescence: high ? 0.3 : 0,
			iridescenceIOR: 1.3,
			side: FrontSide
		}),
		solidPlane
	);
	// 中身（不透明。ガラス越しに透けて見えるように）
	type Tone = 'lime' | 'graphite' | 'light' | 'chrome';
	const solids: Record<Tone, MeshPhysicalMaterial> = {
		lime: new MeshPhysicalMaterial({ roughness: 0.35, clearcoat: high ? 0.4 : 0 }),
		graphite: new MeshPhysicalMaterial({ roughness: 0.45, clearcoat: high ? 0.5 : 0 }),
		light: new MeshPhysicalMaterial({ roughness: 0.5, clearcoat: high ? 0.3 : 0 }),
		chrome: new MeshPhysicalMaterial({ roughness: 0.15, metalness: 1 })
	};
	for (const m of Object.values(solids)) clip(m, solidPlane);
	/** タイルの文字（濃い / 明るい） */
	const ink = clip(new MeshStandardMaterial({ roughness: 0.6 }), solidPlane);
	const paper = clip(new MeshStandardMaterial({ roughness: 0.6 }), solidPlane);
	const lineMuted = clip(new LineBasicMaterial({ transparent: true, opacity: 0.55 }), wirePlane);
	const lineAccent = clip(new LineBasicMaterial({ transparent: true, opacity: 0.9 }), wirePlane);
	const lineJar = clip(new LineBasicMaterial({ transparent: true, opacity: 0.8 }), wirePlane);

	/** 器の中の発光体（中身を内側から照らす） */
	const glowMaterial = clip(
		new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 1.6 }),
		solidPlane
	);
	const haloTexture = (() => {
		const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
		const ctx = c.getContext('2d');
		if (ctx) {
			const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
			g.addColorStop(0, 'rgba(255,255,255,0.9)');
			g.addColorStop(0.3, 'rgba(255,255,255,0.3)');
			g.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, 128, 128);
		}
		return new CanvasTexture(c);
	})();
	const haloMaterial = clip(
		new SpriteMaterial({
			map: haloTexture,
			transparent: true,
			depthWrite: false,
			blending: AdditiveBlending
		}),
		solidPlane
	);

	// ---- 器 ----
	const jarGroup = new Group();
	const jarGeometry = new RoundedBoxGeometry(JAR_HALF * 2, JAR_HALF * 2, JAR_HALF * 2, 6, 0.4);
	// 角の丸みは細かい面に分かれているので、輪郭線の検出角度を小さくする
	const jarEdges = new EdgesGeometry(jarGeometry, 8);
	const jarMesh = new Mesh(jarGeometry, jarGlass);
	jarMesh.renderOrder = 2;
	jarGroup.add(jarMesh, new LineSegments(jarEdges, lineJar));

	// ---- 中身: スキル名のタイル + 小さな部品 + 発光体 ----
	const font: Font = new FontLoader().parse(
		interBold as unknown as Parameters<FontLoader['parse']>[0]
	);
	const geometries: BufferGeometry[] = [jarGeometry, jarEdges];
	const jar = new Jar(JAR_HALF - WALL);
	type Item = { body: JarBody; object: Group };
	const items: Item[] = [];

	const TEXT_SIZE = 0.26;
	const TILE_H = 0.62;
	const TILE_D = 0.22;
	const chipTone: Tone[] = ['lime', 'graphite', 'light'];

	function makeText(text: string) {
		const g = new TextGeometry(text, {
			font,
			size: TEXT_SIZE,
			depth: 0.03,
			curveSegments: high ? 5 : 3,
			bevelEnabled: false
		});
		g.computeBoundingBox();
		const b = g.boundingBox!;
		g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, 0);
		geometries.push(g);
		return { geometry: g, width: b.max.x - b.min.x };
	}

	// スキル名のタイル（両面に文字。どちらを向いても読める）
	for (const chip of skillChips) {
		const text = makeText(chip.text);
		const w = text.width + 0.5;
		const tile = new RoundedBoxGeometry(w, TILE_H, TILE_D, 3, 0.1);
		const tileEdges = new EdgesGeometry(tile, 30);
		const textEdges = new EdgesGeometry(text.geometry, 30);
		geometries.push(tile, tileEdges, textEdges);
		const tone = chipTone[chip.group] ?? 'graphite';
		const textMaterial = tone === 'graphite' ? paper : ink;
		const object = new Group();
		const front = new Mesh(text.geometry, textMaterial);
		front.position.z = TILE_D / 2 + 0.002;
		const back = new Mesh(text.geometry, textMaterial);
		back.rotation.y = Math.PI;
		back.position.z = -TILE_D / 2 - 0.002;
		const frontWire = new LineSegments(textEdges, chip.group === 0 ? lineAccent : lineMuted);
		frontWire.position.z = TILE_D / 2;
		object.add(
			new Mesh(tile, solids[tone]),
			new LineSegments(tileEdges, chip.group === 0 ? lineAccent : lineMuted),
			front,
			back,
			frontWire
		);
		jarGroup.add(object);
		items.push({ body: jar.add(w, TILE_H / 2), object });
	}

	// 隙間を埋める小さな部品（器いっぱいに詰まって見えるように）
	const random = mulberry32(7);
	const fillerShapes: {
		geometry: BufferGeometry;
		wire: BufferGeometry;
		length: number;
		radius: number;
	}[] = [];
	const addShape = (
		geometry: BufferGeometry,
		wire: 'edges' | 'mesh',
		length: number,
		radius: number
	) => {
		const w = wire === 'edges' ? new EdgesGeometry(geometry, 25) : new WireframeGeometry(geometry);
		geometries.push(geometry, w);
		fillerShapes.push({ geometry, wire: w, length, radius });
	};
	addShape(new SphereGeometry(0.34, 20, 12), 'mesh', 0.68, 0.34);
	addShape(new BoxGeometry(0.6, 0.6, 0.6), 'edges', 0.6, 0.36);
	addShape(new TorusGeometry(0.32, 0.11, 10, 28), 'mesh', 0.86, 0.43);
	addShape(new OctahedronGeometry(0.42, 0), 'edges', 0.84, 0.42);
	addShape(new CapsuleGeometry(0.16, 0.7, 4, 12).rotateZ(Math.PI / 2), 'mesh', 1.02, 0.18);
	addShape(new IcosahedronGeometry(0.36, 0), 'edges', 0.72, 0.36);
	const fillerTones: Tone[] = ['chrome', 'graphite', 'lime', 'light', 'chrome', 'graphite'];
	// 器の半分以上が埋まる数（「詰まっている」ように見せる）
	const fillerCount = high ? 46 : 18;
	for (let i = 0; i < fillerCount; i++) {
		const shape = fillerShapes[i % fillerShapes.length];
		const tone = fillerTones[Math.floor(random() * fillerTones.length)];
		const object = new Group();
		const s = 0.6 + random() * 0.45;
		object.scale.setScalar(s);
		object.add(
			new Mesh(shape.geometry, solids[tone]),
			new LineSegments(shape.wire, tone === 'lime' ? lineAccent : lineMuted)
		);
		jarGroup.add(object);
		items.push({ body: jar.add(shape.length * s, shape.radius * s), object });
	}

	// 発光体（器の中で転がる光源）
	const glowGeometry = new SphereGeometry(0.22, 16, 10);
	const glowWire = new WireframeGeometry(new SphereGeometry(0.22, 8, 6));
	geometries.push(glowGeometry, glowWire);
	const lights: PointLight[] = [];
	for (let i = 0; i < (high ? 2 : 1); i++) {
		const object = new Group();
		const halo = new Sprite(haloMaterial);
		halo.scale.setScalar(2.4);
		const light = new PointLight(0xffffff, high ? 10 : 6, 7, 1.5);
		lights.push(light);
		object.add(
			new Mesh(glowGeometry, glowMaterial),
			new LineSegments(glowWire, lineAccent),
			halo,
			light
		);
		jarGroup.add(object);
		items.push({ body: jar.add(0.44, 0.22), object });
	}

	// ---- 境界線とタグ「DESIGN | BUILD」 ----
	const planeGeometry = new PlaneGeometry(1, 1);
	geometries.push(planeGeometry);
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

	// ---- 設計図側の方眼（背景） ----
	const grid = new GridHelper(90, 90);
	grid.rotation.x = Math.PI / 2;
	grid.position.z = -7;
	const gridMaterial = clip(grid.material as LineBasicMaterial, wirePlane);
	gridMaterial.vertexColors = false;
	gridMaterial.transparent = true;
	gridMaterial.opacity = 0.22;

	const root = new Group();
	root.add(jarGroup, boundary, ...tags, grid);

	// ---- レイアウト: 器は MV の大半を占める大きさ ----
	let halfW0 = 6;
	let halfH0 = 4;

	function updateLayout(width: number, height: number) {
		const aspect = width / Math.max(height, 1);
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		halfH0 = Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
		halfW0 = halfH0 * aspect;
		// 回転しても画面に収まる大きさ（立方体の対角を考慮）
		const visual = JAR_HALF * 2 * 1.45;
		const scale = Math.min((halfH0 * 2 * 0.82) / visual, (halfW0 * 2 * 0.92) / visual);
		jarGroup.scale.setScalar(scale);
		if (aspect >= 1) jarGroup.position.set(halfW0 * 0.2, 0, 0);
		else jarGroup.position.set(0, halfH0 * 0.12, 0);
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

	// ---- テーマ ----
	const toColor = (rgb: [number, number, number]) => new Color().setRGB(...rgb, SRGBColorSpace);
	const toCss = ([r, g, b]: [number, number, number]) =>
		`rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

	$effect(() => {
		const dark = theme.current === 'dark';
		const accent = toColor(cssVarToRgb('--accent'));
		const muted = toColor(cssVarToRgb('--fg-muted'));
		const accentText = toColor(cssVarToRgb('--accent-text'));
		solids.lime.color = accent;
		solids.graphite.color = toColor(cssVarToRgb(dark ? '--surface-2' : '--line-strong'));
		solids.light.color = toColor(cssVarToRgb(dark ? '--fg-muted' : '--surface'));
		solids.chrome.color = new Color(0xffffff);
		ink.color = toColor(cssVarToRgb('--on-accent'));
		paper.color = toColor(cssVarToRgb('--fg'));
		// ガラスはわずかに色づける（ダーク: 澄んだ灰 / ライト: 淡いスモーク）
		jarGlass.attenuationColor = muted;
		jarGlass.attenuationDistance = dark ? 6 : 4;
		lineMuted.color = muted;
		lineAccent.color = accentText;
		lineJar.color = accentText;
		glowMaterial.emissive = accent;
		haloMaterial.color = accent;
		haloMaterial.blending = dark ? AdditiveBlending : NormalBlending;
		haloMaterial.opacity = dark ? 0.85 : 0.3;
		haloMaterial.needsUpdate = true;
		for (const l of lights) l.color = accent;
		boundaryMaterial.color = accentText;
		gridMaterial.color = toColor(cssVarToRgb('--line-strong'));
		// 背景色をシーンにも持たせる（透過のガラスは背景を屈折して映すため。未設定だと黒く濁る）
		const bg = toColor(cssVarToRgb('--bg'));
		fog.color = bg;
		scene.background = bg;
		scene.environmentIntensity = dark ? 0.8 : 1;
		const prev = tagMaterials.map((m) => m.map);
		tagMaterials[0].map = tagTexture('DESIGN', toCss(cssVarToRgb('--fg-muted')), 'right');
		tagMaterials[1].map = tagTexture('BUILD', toCss(cssVarToRgb('--accent-text')), 'left');
		for (const m of tagMaterials) m.needsUpdate = true;
		for (const t of prev) t?.dispose();
		invalidate();
	});

	// ---- ポインタ: 境界がカーソルを追い、器が少し傾く / クリック・タップで中身をシャッフル ----
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
		jar.shake(high ? 6 : 5);
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
	let spinY = 0.6;
	let tiltX = 0;
	let tiltZ = 0;
	let frameAcc = 0;
	const tmp = new Vector3();
	const gravityWorld = new Vector3(0, -7, 0);
	const gravityLocal = new Vector3();
	const inverse = new Quaternion();

	const { start, stop } = useTask(
		(delta) => {
			const dt = Math.min(delta, 1 / 20);
			elapsed += dt;

			// 境界のばね追従（操作がない間はゆっくり左右に揺れる）
			const idle = !hasPointer || elapsed - lastPointerAt > 2.5;
			const targetNdc = idle
				? Math.sin(elapsed * 0.3) * 0.45
				: MathUtils.clamp(pointer.x, -0.8, 0.8);
			const target = targetNdc * halfW0;
			const k = 26;
			boundaryV += (k * (target - boundaryX) - 2 * Math.sqrt(k) * 0.9 * boundaryV) * dt;
			boundaryX += boundaryV * dt;
			tmp.set(CAMERA_Z, 0, boundaryX).normalize();
			solidPlane.normal.copy(tmp);
			solidPlane.constant = -tmp.x * boundaryX;
			wirePlane.normal.copy(tmp).negate();
			wirePlane.constant = tmp.x * boundaryX;
			boundary.position.set(boundaryX, 0, 0);
			tags[0].position.set(boundaryX - 0.95, halfH0 * 0.82, 0);
			tags[1].position.set(boundaryX + 0.95, halfH0 * 0.82, 0);

			// 器はゆっくり回り、カーソルの方へ傾く（傾くたびに中身が流れる）
			spinY += dt * 0.16;
			const tx = idle ? Math.sin(elapsed * 0.25) * 0.25 : pointer.y * 0.45;
			const tz = idle ? Math.cos(elapsed * 0.2) * 0.15 : -pointer.x * 0.35;
			tiltX += (tx - tiltX) * Math.min(1, dt * 2);
			tiltZ += (tz - tiltZ) * Math.min(1, dt * 2);
			jarGroup.rotation.set(-tiltX + 0.35, spinY, tiltZ);

			// 中身の物理（重力は器のローカル座標へ変換）
			jarGroup.updateMatrixWorld();
			inverse.copy(jarGroup.quaternion).invert();
			gravityLocal.copy(gravityWorld).applyQuaternion(inverse);
			jar.step(dt, gravityLocal);
			for (const it of items) {
				it.object.position.copy(it.body.p);
				it.object.quaternion.copy(it.body.q);
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
		for (const l of lights) l.dispose();
		const materials: Material[] = [
			jarGlass,
			...Object.values(solids),
			ink,
			paper,
			lineMuted,
			lineAccent,
			lineJar,
			glowMaterial,
			haloMaterial,
			boundaryMaterial,
			...tagMaterials,
			gridMaterial
		];
		for (const m of tagMaterials) m.map?.dispose();
		for (const m of materials) m.dispose();
		haloTexture.dispose();
		grid.geometry.dispose();
		scene.fog = null;
		scene.background = null;
		scene.environment = null;
		envTexture.dispose();
		pmrem.dispose();
	});
</script>

<T is={camera} makeDefault manual />
<!-- キーライト（右上手前）と、ガラスの輪郭を際立たせる逆光（左奥） -->
<T.DirectionalLight position={[4, 6, 8]} intensity={1.4} />
<T.DirectionalLight position={[-6, 3, -8]} intensity={2.4} />
<T is={root} dispose={false} />
