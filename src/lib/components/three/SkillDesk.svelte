<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		Color,
		Group,
		MathUtils,
		Mesh,
		MeshBasicMaterial,
		MeshStandardMaterial,
		PerspectiveCamera,
		Plane,
		PlaneGeometry,
		Raycaster,
		SRGBColorSpace,
		Vector2,
		Vector3
	} from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { theme } from '#lib/state/theme.svelte.ts';
	import { cssVarToRgb } from '#lib/three/css-color.ts';
	import { Desk, LAYOUT, type DeskGroup, type DeskLabel } from '#lib/three/desk-physics.ts';
	import {
		createHeaderTexture,
		createLabelTexture,
		createShadowTexture,
		measureLabel,
		type TextureQuality
	} from '#lib/three/label-texture.ts';

	type Props = {
		labels: DeskLabel[];
		/** スキルの種類（整列時の列見出し。左から順に並ぶ） */
		groups: DeskGroup[];
		/** 整列状態（ボタンとキャンバスのクリックで切り替える） */
		arranged: boolean;
		/** 画面内かつタブ表示中のときのみ true。false の間は物理も描画も止める */
		active: boolean;
		ontoggle: () => void;
	};

	let { labels, groups, arranged, active, ontoggle }: Props = $props();

	const { size, invalidate: invalidateFrame, renderer } = useThrelte();

	/**
	 * 画面外・タブ非表示の間は再描画を要求しない（画面内に戻った時点でまとめて描画する）。
	 * untrack: 呼び出し元の $effect が active に依存しないようにする（テクスチャの再生成を防ぐ）
	 */
	function invalidate() {
		if (untrack(() => active)) invalidateFrame();
	}

	const DEPTH = 0.6;
	const HEIGHT = 0.28;
	const FONT = 0.26;
	const HEADER_FONT = 0.24;
	const FOV = 18;

	// ---- camera: 真上から見下ろす平面的な見せ方（狭い画角で歪みを抑え、跳ねたときだけ立体感が出る） ----
	const camera = new PerspectiveCamera(FOV, 1, 1, 200);
	camera.up.set(0, 0, -1);
	camera.position.set(0, 30, 0);
	camera.lookAt(0, 0, 0);

	// ---- shared resources（onDestroy で dispose） ----
	const root = new Group();
	const shadowTexture = createShadowTexture();
	/** 机に平置きする 1x1 の板（ラベル・影・列見出しで共有） */
	const flatGeometry = new PlaneGeometry(1, 1);
	flatGeometry.rotateX(-Math.PI / 2);
	const blockMaterial = new MeshStandardMaterial({ roughness: 0.6, metalness: 0 });
	const accentMaterial = new MeshStandardMaterial({ roughness: 0.5, metalness: 0 });

	type Block = {
		group: Group;
		geometry: RoundedBoxGeometry;
		label: Mesh<PlaneGeometry, MeshBasicMaterial>;
		shadow: Mesh<PlaneGeometry, MeshBasicMaterial>;
		accent: boolean;
		text: string;
		w: number;
	};

	const blocks: Block[] = labels.map(({ text, accent }) => {
		const w = measureLabel(text, FONT) + 0.56;
		const geometry = new RoundedBoxGeometry(w, HEIGHT, DEPTH, 4, 0.07);
		const body = new Mesh(geometry, accent ? accentMaterial : blockMaterial);
		body.position.y = HEIGHT / 2;
		const label = new Mesh(
			flatGeometry,
			new MeshBasicMaterial({ transparent: true, depthWrite: false })
		);
		label.scale.set(w - 0.12, 1, DEPTH - 0.1);
		label.position.y = HEIGHT + 0.002;
		const shadow = new Mesh(
			flatGeometry,
			new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
		);
		shadow.position.y = 0.001;
		shadow.renderOrder = -1;
		const group = new Group();
		group.add(body, label);
		root.add(shadow, group);
		return { group, geometry, label, shadow, accent, text, w };
	});

	/** 列見出し（種類名） */
	const headerWidths = groups.map((g) => measureLabel(g.label, HEADER_FONT, 700) + 0.04);
	const headers = groups.map((_, i) => {
		const mesh = new Mesh(
			flatGeometry,
			new MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 })
		);
		mesh.scale.set(headerWidths[i], 1, LAYOUT.headerHeight);
		mesh.position.y = 0.002;
		mesh.renderOrder = -1;
		root.add(mesh);
		return mesh;
	});

	const desk = new Desk(
		blocks.map((b, i) => ({ w: b.w, d: DEPTH, groupIndex: labels[i].groupIndex }))
	);
	desk.setHeaderWidths(headerWidths);
	desk.drop();

	function placeHeaders() {
		headers.forEach((m) => (m.visible = false));
		for (const h of desk.headers) {
			const mesh = headers[h.groupIndex];
			if (!mesh) continue;
			mesh.visible = true;
			mesh.position.x = h.x + headerWidths[h.groupIndex] / 2;
			mesh.position.z = h.z;
		}
	}

	// ---- 机の範囲とテクスチャ解像度 ----
	const raycaster = new Raycaster();
	const deskPlane = new Plane(new Vector3(0, 1, 0), 0);
	const ndc = new Vector2();
	const hit = new Vector3();

	/**
	 * 画面上で 1 ワールド単位が何 px か（テクスチャの解像度を表示サイズに合わせるため）。
	 * 表示サイズが確定するまでは null（仮の解像度で作って作り直す無駄を避ける）
	 */
	let quality = $state<TextureQuality | null>(null);

	function updateBounds(width: number, height: number) {
		const aspect = width / Math.max(height, 1);
		camera.aspect = aspect;
		// 整列後のレイアウトが余白込みで収まる高さにカメラを置く
		const needD = desk.extent.depth / 0.8;
		const needW = desk.extent.width / 0.88;
		const visH = Math.max(needD, needW / aspect);
		camera.position.y = visH / 2 / Math.tan(MathUtils.degToRad(FOV / 2));
		camera.updateProjectionMatrix();
		desk.setBounds(((visH * aspect) / 2) * 0.95, (visH / 2) * 0.95);
		placeHeaders();

		const ppu = (height * renderer.getPixelRatio()) / visH;
		// 表示サイズが大きく変わったときだけ作り直す（リサイズ中の再生成を抑える）
		if (!quality || Math.abs(ppu - quality.pxPerUnit) / quality.pxPerUnit > 0.15) {
			quality = {
				pxPerUnit: Math.ceil(ppu * 1.25),
				anisotropy: Math.min(8, renderer.capabilities.getMaxAnisotropy())
			};
		}
	}

	let lastKey = '';
	$effect(() => {
		const { width, height } = $size;
		const key = `${Math.round(width)}x${Math.round(height)}`;
		if (key === lastKey || width === 0 || height === 0) return;
		lastKey = key;
		updateBounds(width, height);
		invalidate();
	});

	// ---- テーマ・解像度: CSS トークンから色を取得し、文字テクスチャを作り直す ----
	const toColor = (rgb: [number, number, number]) => new Color().setRGB(...rgb, SRGBColorSpace);
	const toCss = ([r, g, b]: [number, number, number]) =>
		`rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

	function replaceMap(material: MeshBasicMaterial, next: MeshBasicMaterial['map']) {
		const old = material.map;
		material.map = next;
		material.needsUpdate = true;
		old?.dispose();
	}

	$effect(() => {
		const dark = theme.current === 'dark';
		const q = quality;
		if (!q) return;
		blockMaterial.color = toColor(cssVarToRgb(dark ? '--surface-2' : '--surface'));
		accentMaterial.color = toColor(cssVarToRgb('--accent'));
		const fg = toCss(cssVarToRgb('--fg'));
		const muted = toCss(cssVarToRgb('--fg-muted'));
		const onAccent = toCss(cssVarToRgb('--on-accent'));
		for (const b of blocks) {
			replaceMap(
				b.label.material,
				createLabelTexture(
					b.text,
					{
						width: b.w - 0.12,
						height: DEPTH - 0.1,
						fontSize: FONT,
						color: b.accent ? onAccent : fg
					},
					q
				)
			);
		}
		headers.forEach((mesh, i) =>
			replaceMap(
				mesh.material,
				createHeaderTexture(
					{
						label: groups[i].label,
						width: headerWidths[i],
						height: LAYOUT.headerHeight,
						fontSize: HEADER_FONT,
						color: muted
					},
					q
				)
			)
		);
		invalidate();
	});

	// ---- 整列 / 散らかす ----
	let lastArranged = false;
	$effect(() => {
		if (arranged === lastArranged) return;
		lastArranged = arranged;
		if (arranged) {
			desk.arrange();
			placeHeaders();
		} else desk.scatter();
		invalidate();
	});

	// ---- ポインタ（押して転がす / クリックで切り替え） ----
	let pointerDown: { x: number; y: number; t: number } | null = null;
	let pendingPointer = false;
	let lastPointer: { x: number; z: number } | null = null;
	const canvas = renderer.domElement;

	function toDesk(event: PointerEvent): Vector3 | null {
		const rect = canvas.getBoundingClientRect();
		ndc.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		);
		raycaster.setFromCamera(ndc, camera);
		return raycaster.ray.intersectPlane(deskPlane, hit);
	}

	function onPointerMove(event: PointerEvent) {
		const p = toDesk(event);
		if (!p) return;
		pendingPointer = true;
		lastPointer = { x: p.x, z: p.z };
		invalidate();
	}

	function onPointerLeave() {
		lastPointer = null;
		pendingPointer = false;
		desk.releasePointer();
	}

	function onPointerDown(event: PointerEvent) {
		pointerDown = { x: event.clientX, y: event.clientY, t: performance.now() };
		onPointerMove(event);
	}

	function onPointerUp(event: PointerEvent) {
		if (!pointerDown) return;
		const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
		if (moved < 8 && performance.now() - pointerDown.t < 400) ontoggle();
		pointerDown = null;
		if (event.pointerType !== 'mouse') onPointerLeave();
	}

	$effect(() => {
		const opts = { passive: true } as const;
		canvas.addEventListener('pointermove', onPointerMove, opts);
		canvas.addEventListener('pointerdown', onPointerDown, opts);
		canvas.addEventListener('pointerup', onPointerUp, opts);
		canvas.addEventListener('pointerleave', onPointerLeave, opts);
		canvas.addEventListener('pointercancel', onPointerLeave, opts);
		return () => {
			canvas.removeEventListener('pointermove', onPointerMove);
			canvas.removeEventListener('pointerdown', onPointerDown);
			canvas.removeEventListener('pointerup', onPointerUp);
			canvas.removeEventListener('pointerleave', onPointerLeave);
			canvas.removeEventListener('pointercancel', onPointerLeave);
		};
	});

	// ---- フレーム更新 ----
	const { start, stop } = useTask(
		(delta) => {
			if (lastPointer) desk.movePointer(lastPointer.x, lastPointer.z, delta);
			desk.step(Math.min(delta, 1 / 20));

			const shadowBase = theme.current === 'dark' ? 1 : 0.5;
			for (let i = 0; i < blocks.length; i++) {
				const b = blocks[i];
				const s = desk.bodies[i];
				b.group.position.set(s.x, s.y, s.z);
				b.group.rotation.y = s.a;
				// 影は光源（左上）の反対側へずらし、跳ねるほど離れて薄く広がる
				const lift = Math.min(s.y / 3, 1);
				b.shadow.position.x = s.x + 0.06 + s.y * 0.18;
				b.shadow.position.z = s.z + 0.1 + s.y * 0.26;
				b.shadow.rotation.y = s.a;
				b.shadow.scale.set((b.w + 0.4) * (1 + lift * 0.5), 1, (DEPTH + 0.4) * (1 + lift * 0.5));
				b.shadow.material.opacity = shadowBase * (1 - lift * 0.6);
			}
			for (const h of headers) h.material.opacity = desk.guide;

			// 十分に静止したら再描画を止める（ポインタが動けば再開）
			const guideMoving = Math.abs(desk.guide - (arranged ? 1 : 0)) > 0.002;
			if (desk.energy > 0.002 || guideMoving || pendingPointer) invalidate();
			pendingPointer = false;
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
		for (const b of blocks) {
			b.geometry.dispose();
			b.label.material.map?.dispose();
			b.label.material.dispose();
			b.shadow.material.dispose();
		}
		for (const h of headers) {
			h.material.map?.dispose();
			h.material.dispose();
		}
		shadowTexture.dispose();
		flatGeometry.dispose();
		blockMaterial.dispose();
		accentMaterial.dispose();
	});
</script>

<T is={camera} makeDefault manual />
<T.HemisphereLight args={['#ffffff', '#5a5a5a', 1.7]} />
<T.DirectionalLight position={[-3, 10, -4]} intensity={1.6} />
<T is={root} dispose={false} />
