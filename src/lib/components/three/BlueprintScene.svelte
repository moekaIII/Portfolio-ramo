<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		AdditiveBlending,
		CanvasTexture,
		CapsuleGeometry,
		NormalBlending,
		Fog,
		IcosahedronGeometry,
		MeshStandardMaterial,
		PointLight,
		Sprite,
		SpriteMaterial,
		TorusGeometry,
		WireframeGeometry,
		Color,
		DoubleSide,
		EdgesGeometry,
		GridHelper,
		Group,
		LineBasicMaterial,
		LineSegments,
		MathUtils,
		Mesh,
		MeshBasicMaterial,
		MeshPhysicalMaterial,
		OctahedronGeometry,
		PerspectiveCamera,
		PlaneGeometry,
		PMREMGenerator,
		Plane,
		SRGBColorSpace,
		Vector2,
		Vector3,
		type BufferGeometry,
		type Material
	} from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
	import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js';
	import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
	// Inter Bold の欧文サブセット（OFL-1.1。src/lib/assets/fonts/INTER-LICENSE.txt）
	import interBold from '#lib/assets/fonts/inter-bold.typeface.json';
	import { ribbons } from '#lib/content/hero-ribbons.ts';
	import { theme } from '#lib/state/theme.svelte.ts';
	import { cssVarToRgb } from '#lib/three/css-color.ts';
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

	const FOV = 32;
	const CAMERA_Z = 16;

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

	// ---- materials ----
	// BUILD 側の文字はガラス: 奥の発光オブジェクトが屈折して透けて見える。
	// 透過（transmission）は描画が重いので、モバイルでは半透明の簡易版にする
	const glass = settings.quality === 'high';
	type Tone = 'base' | 'accent' | 'label';
	const solid: Record<Tone, MeshPhysicalMaterial> = {
		base: new MeshPhysicalMaterial({
			roughness: 0.08,
			metalness: 0,
			transmission: glass ? 1 : 0,
			thickness: 0.9,
			ior: 1.5,
			transparent: !glass,
			opacity: glass ? 1 : 0.55,
			specularIntensity: 1,
			envMapIntensity: 0.9,
			// うっすら虹色の干渉（ガラスらしい高級感）
			iridescence: glass ? 0.35 : 0,
			iridescenceIOR: 1.3
		}),
		// フロントエンド（主力）の帯: ライム色のガラス
		accent: new MeshPhysicalMaterial({
			roughness: 0.14,
			metalness: 0,
			transmission: glass ? 0.92 : 0,
			thickness: 1.1,
			ior: 1.45,
			attenuationDistance: 0.7,
			transparent: !glass,
			opacity: glass ? 1 : 0.8,
			envMapIntensity: 1,
			emissiveIntensity: 0.08
		}),
		label: new MeshPhysicalMaterial({ roughness: 0.5, metalness: 0 })
	};
	const lines: Record<Tone, LineBasicMaterial> = {
		base: new LineBasicMaterial({ transparent: true, opacity: 0.6 }),
		accent: new LineBasicMaterial({ transparent: true, opacity: 0.95 }),
		label: new LineBasicMaterial({ transparent: true, opacity: 0.5 })
	};
	for (const m of Object.values(solid)) {
		m.clippingPlanes = [solidPlane];
		m.side = DoubleSide;
	}
	for (const m of Object.values(lines)) m.clippingPlanes = [wirePlane];

	// ---- 奥行き: 背景色の霧で、奥のものほど溶ける ----
	const fog = new Fog(0x000000, CAMERA_Z + 2, CAMERA_Z + 16);
	scene.fog = fog;

	// ---- 発光オブジェクト（ガラスの文字越しに透けて屈折する光源）----
	// BUILD 側では発光体、DESIGN 側では設計図の線で描く
	const glowSolid = new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 1.3 });
	glowSolid.clippingPlanes = [solidPlane];
	const glowLine = new LineBasicMaterial({ transparent: true, opacity: 0.9 });
	glowLine.clippingPlanes = [wirePlane];
	const haloTexture = (() => {
		const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
		const ctx = c.getContext('2d');
		if (ctx) {
			const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
			g.addColorStop(0, 'rgba(255,255,255,0.9)');
			g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
			g.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, 128, 128);
		}
		return new CanvasTexture(c);
	})();
	const haloMaterial = new SpriteMaterial({
		map: haloTexture,
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending
	});
	haloMaterial.clippingPlanes = [solidPlane];

	type Glow = { group: Group; light: PointLight; spin: Vector3; base: Vector3; phase: number };
	const glowGeometries: BufferGeometry[] = [
		new TorusGeometry(1.5, 0.045, 12, 96),
		new CapsuleGeometry(0.06, 3.2, 4, 12),
		new TorusGeometry(0.8, 0.035, 10, 64),
		new IcosahedronGeometry(0.42, 0)
	];
	const glowEdges = glowGeometries.map((g, i) =>
		i === 3 ? new EdgesGeometry(g) : new WireframeGeometry(g)
	);
	const glowGroup = new Group();
	/** [形状, 位置（halfW/halfH 比）, 奥行き, 回転速度] */
	const GLOWS: [number, number, number, number, [number, number, number]][] = [
		[0, 0.42, 0.18, -6, [0.12, 0.2, 0.05]],
		[1, -0.3, -0.35, -5, [0.05, 0.0, 0.22]],
		[2, -0.55, 0.45, -8, [0.18, 0.1, 0.0]],
		[3, 0.7, -0.5, -4, [0.3, 0.25, 0.1]],
		[1, 0.15, 0.55, -9, [0.0, 0.1, 0.15]]
	];
	const glows: Glow[] = GLOWS.map(([gi, u, v, z, spin], i) => {
		const group = new Group();
		const mesh = new Mesh(glowGeometries[gi], glowSolid);
		const wire = new LineSegments(glowEdges[gi], glowLine);
		const halo = new Sprite(haloMaterial);
		halo.scale.setScalar(gi === 0 ? 5 : 3.2);
		const light = new PointLight(0xffffff, glass ? 24 : 14, 14, 1.6);
		group.add(mesh, wire, halo, light);
		group.rotation.set(i * 0.7, i * 1.3, i * 0.4);
		glowGroup.add(group);
		return { group, light, spin: new Vector3(...spin), base: new Vector3(u, v, z), phase: i * 2.1 };
	});

	// ---- 文字の形状（単語ごとに 1 回だけ作り、ループ表示のインスタンスで共有） ----
	const font: Font = new FontLoader().parse(
		interBold as unknown as Parameters<FontLoader['parse']>[0]
	);
	/** 帯を組み直すたびに作り直す文字の形状（組み直す前に必ず dispose する） */
	let textGeometries: BufferGeometry[] = [];

	type Glyph = { geometry: BufferGeometry; edges: BufferGeometry; width: number };
	function makeText(text: string, sizeU: number, depth: number): Glyph {
		const geometry = new TextGeometry(text, {
			font,
			size: sizeU,
			depth,
			curveSegments: settings.quality === 'high' ? 6 : 4,
			bevelEnabled: true,
			bevelThickness: depth * 0.12,
			bevelSize: sizeU * 0.012,
			bevelSegments: 2
		});
		geometry.computeBoundingBox();
		const box = geometry.boundingBox!;
		// 左端を原点、縦は中央に揃える
		geometry.translate(-box.min.x, -(box.min.y + box.max.y) / 2, -depth / 2);
		const edges = new EdgesGeometry(geometry, 30);
		textGeometries.push(geometry, edges);
		return { geometry, edges, width: box.max.x - box.min.x };
	}

	/** 単語の区切り（小さな正八面体） */
	const separator = new OctahedronGeometry(1, 0);
	const separatorEdges = new EdgesGeometry(separator);

	// ---- 帯（スキルの種類ごと）----
	type RibbonLayout = {
		y: number;
		z: number;
		angle: number;
		tilt: number;
		size: number;
		speed: number;
	};
	/** 横長: 3 本の帯を角度を変えて交差させる */
	const LANDSCAPE: RibbonLayout[] = [
		{ y: 1.6, z: 0.6, angle: -7, tilt: -0.18, size: 1.25, speed: 0.55 },
		{ y: -0.4, z: -2.4, angle: 5, tilt: 0.22, size: 1.0, speed: -0.42 },
		{ y: -2.6, z: 1.4, angle: -2.5, tilt: -0.1, size: 0.82, speed: 0.48 }
	];
	/** 縦長: 文字を小さくして上寄せ（下部の h1 と重ならないように） */
	const PORTRAIT: RibbonLayout[] = [
		{ y: 2.6, z: 0.6, angle: -9, tilt: -0.18, size: 0.85, speed: 0.5 },
		{ y: 0.5, z: -1.8, angle: 6, tilt: 0.2, size: 0.72, speed: -0.4 },
		{ y: -1.6, z: 1.0, angle: -4, tilt: -0.1, size: 0.62, speed: 0.45 }
	];

	type Item = { group: Group; offset: number };
	type RibbonState = { group: Group; items: Item[]; loop: number; speed: number; shift: number };

	const root = new Group();
	let ribbonStates: RibbonState[] = [];

	function buildRibbons(layouts: RibbonLayout[], coverSpan: number) {
		for (const r of ribbonStates) root.remove(r.group);
		for (const g of textGeometries) g.dispose();
		textGeometries = [];
		ribbonStates = [];

		ribbons.forEach((ribbon, ri) => {
			const layout = layouts[ri];
			if (!layout) return;
			const tone: Tone = ribbon.accent ? 'accent' : 'base';
			const sizeU = layout.size;
			const depth = sizeU * 0.32;
			const gap = sizeU * 1.1;

			// 1 周分の並び: [種類名] ◆ [単語] ◆ [単語] ◆ …
			const sequence: { glyph: Glyph | null; tone: Tone; width: number }[] = [];
			const label = makeText(ribbon.label, sizeU * 0.34, depth * 0.4);
			sequence.push({ glyph: label, tone: 'label', width: label.width });
			for (const word of ribbon.words) {
				sequence.push({ glyph: null, tone, width: 0 });
				const g = makeText(word, sizeU, depth);
				sequence.push({ glyph: g, tone, width: g.width });
			}
			sequence.push({ glyph: null, tone, width: 0 });
			const loop = sequence.reduce((s, it) => s + it.width + gap, 0);

			// 画面幅を覆うだけ繰り返す
			const copies = Math.max(2, Math.ceil(coverSpan / loop) + 1);
			const group = new Group();
			group.position.set(0, layout.y, layout.z);
			group.rotation.set(layout.tilt, 0, MathUtils.degToRad(layout.angle));
			const items: Item[] = [];
			for (let c = 0; c < copies; c++) {
				let x = c * loop;
				for (const it of sequence) {
					const holder = new Group();
					if (it.glyph) {
						holder.add(
							new Mesh(it.glyph.geometry, solid[it.tone]),
							new LineSegments(it.glyph.edges, lines[it.tone])
						);
					} else {
						const dot = new Group();
						dot.scale.setScalar(sizeU * 0.16);
						dot.position.x = -gap / 2;
						dot.add(
							new Mesh(separator, solid.accent),
							new LineSegments(separatorEdges, lines.accent)
						);
						holder.add(dot);
					}
					group.add(holder);
					items.push({ group: holder, offset: x });
					x += it.width + gap;
				}
			}
			root.add(group);
			ribbonStates.push({
				group,
				items,
				loop: loop * copies,
				speed: layout.speed,
				shift: ri * 3.1
			});
		});
	}

	// ---- 境界線とタグ「DESIGN | BUILD」 ----
	const planeGeometry = new PlaneGeometry(1, 1);
	const boundaryMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0.9 });
	const boundary = new Mesh(planeGeometry, boundaryMaterial);
	const tagMaterials = [
		new MeshBasicMaterial({ transparent: true }),
		new MeshBasicMaterial({ transparent: true })
	];
	const tags = tagMaterials.map((m) => new Mesh(planeGeometry, m));
	root.add(boundary, ...tags);

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
	const gridMaterial = grid.material as LineBasicMaterial;
	gridMaterial.vertexColors = false;
	gridMaterial.transparent = true;
	gridMaterial.opacity = 0.22;
	gridMaterial.clippingPlanes = [wirePlane];
	root.add(grid, glowGroup);

	// ---- レイアウト ----
	let halfW0 = 6;
	let halfH0 = 4;
	/** 帯の折り返し位置の幅（組み直したときの値で固定する） */
	let span = 20;
	let builtKey = '';

	function updateLayout(width: number, height: number) {
		const aspect = width / Math.max(height, 1);
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		halfH0 = Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
		halfW0 = halfH0 * aspect;
		// 帯の傾きを考慮して、画面の左右端より広く覆う
		const needed = halfW0 * 2 * 1.5 + 6;
		const key = aspect < 1 ? 'portrait' : 'landscape';
		// リサイズ中に毎回作り直さないよう、縦横の切り替えか、覆う幅が足りなくなったときだけ組み直す
		if (key !== builtKey || needed > span) {
			builtKey = key;
			span = needed * 1.2;
			buildRibbons(key === 'portrait' ? PORTRAIT : LANDSCAPE, span);
		}
		// 縦長の画面では発光体を小さく（文字より主張しないように）
		const glowScale = aspect < 1 ? 0.6 : 1;
		for (const g of glows) {
			g.group.position.set(g.base.x * halfW0, g.base.y * halfH0, g.base.z);
			g.group.scale.setScalar(glowScale);
		}
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
		// ガラス: ダークでは澄んだガラス、ライトでは白い背景に溶けないようスモークガラスにする
		// 透過する光は地の色で乗算されるので、ガラスの地は白に固定する（色づきは attenuation で付ける）
		solid.base.color = new Color(1, 1, 1);
		solid.base.attenuationColor = toColor(cssVarToRgb('--fg-muted'));
		solid.base.attenuationDistance = dark ? 2.4 : 1.8;
		if (!glass) solid.base.color = toColor(cssVarToRgb(dark ? '--fg-muted' : '--line-strong'));
		solid.accent.color = accent;
		solid.accent.attenuationColor = accent.clone().multiplyScalar(0.55);
		solid.accent.emissive = accent;
		solid.label.color = toColor(cssVarToRgb('--fg-muted'));
		// 発光オブジェクトと、その光
		glowSolid.emissive = accent;
		glowLine.color = toColor(cssVarToRgb('--accent-text'));
		haloMaterial.color = accent;
		haloMaterial.blending = dark ? AdditiveBlending : NormalBlending;
		haloMaterial.opacity = dark ? 0.9 : 0.35;
		haloMaterial.needsUpdate = true;
		for (const g of glows) g.light.color = accent;
		// 背景色をシーンにも持たせる（透過のガラスは背景を屈折して映すため。未設定だと黒く濁る）
		const bg = toColor(cssVarToRgb('--bg'));
		fog.color = bg;
		scene.background = bg;
		const muted = toColor(cssVarToRgb('--fg-muted'));
		const accentText = toColor(cssVarToRgb('--accent-text'));
		lines.base.color = muted;
		lines.label.color = muted;
		lines.accent.color = accentText;
		boundaryMaterial.color = accentText;
		gridMaterial.color = toColor(cssVarToRgb('--line-strong'));
		scene.environmentIntensity = dark ? 0.7 : 1;
		const prev = tagMaterials.map((m) => m.map);
		tagMaterials[0].map = tagTexture('DESIGN', toCss(cssVarToRgb('--fg-muted')), 'right');
		tagMaterials[1].map = tagTexture('BUILD', toCss(cssVarToRgb('--accent-text')), 'left');
		for (const m of tagMaterials) m.needsUpdate = true;
		for (const t of prev) t?.dispose();
		invalidate();
	});

	// ---- ポインタ: 境界がカーソルを追う ----
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

	$effect(() => {
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		return () => window.removeEventListener('pointermove', onPointerMove);
	});

	// ---- フレーム更新 ----
	let boundaryX = 0;
	let boundaryV = 0;
	let tiltX = 0;
	let tiltY = 0;
	let frameAcc = 0;
	const tmp = new Vector3();

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

			// 全体はカーソルの方へほんの少しだけ傾く（視差）
			const tx = idle ? 0 : pointer.y * 0.04;
			const ty = idle ? 0 : pointer.x * 0.07;
			tiltX += (tx - tiltX) * Math.min(1, dt * 3);
			tiltY += (ty - tiltY) * Math.min(1, dt * 3);
			root.rotation.set(-tiltX, tiltY, 0);

			// 帯を流す（単語は帯に沿ってループ。帯ごとに速さと向きが違う）
			for (const r of ribbonStates) {
				r.shift += r.speed * dt;
				for (const it of r.items) {
					const x = MathUtils.euclideanModulo(it.offset + r.shift, r.loop) - span / 2;
					it.group.position.x = x;
					// 帯の上をゆるやかに波打つ奥行き
					it.group.position.z = Math.sin(x * 0.18 + r.shift * 0.4) * 0.35;
				}
			}

			// 発光オブジェクトはゆっくり回転しながら漂う
			for (const g of glows) {
				const t = elapsed + g.phase;
				g.group.rotation.x += g.spin.x * dt;
				g.group.rotation.y += g.spin.y * dt;
				g.group.rotation.z += g.spin.z * dt;
				g.group.position.y = g.base.y * halfH0 + Math.sin(t * 0.4) * 0.3;
			}

			// モバイルは 30fps（電池への配慮）
			frameAcc += delta;
			if (settings.quality === 'high' || frameAcc >= 1 / 30) {
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
		for (const g of textGeometries) g.dispose();
		separator.dispose();
		separatorEdges.dispose();
		for (const g of [...glowGeometries, ...glowEdges]) g.dispose();
		for (const g of glows) g.light.dispose();
		glowSolid.dispose();
		glowLine.dispose();
		haloMaterial.dispose();
		haloTexture.dispose();
		scene.fog = null;
		scene.background = null;
		const materials: Material[] = [
			...Object.values(solid),
			...Object.values(lines),
			boundaryMaterial,
			...tagMaterials,
			gridMaterial
		];
		for (const m of tagMaterials) m.map?.dispose();
		for (const m of materials) m.dispose();
		planeGeometry.dispose();
		grid.geometry.dispose();
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
