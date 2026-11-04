<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import {
		BufferGeometry,
		Color,
		Float32BufferAttribute,
		Group,
		LineBasicMaterial,
		LineSegments,
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
	import { Desk, LATE_EXCUSES, type DeskLabel } from '#lib/three/desk-physics.ts';
	import {
		createLabelTexture,
		createShadowTexture,
		measureLabel
	} from '#lib/three/label-texture.ts';

	type Props = {
		labels: DeskLabel[];
		/** 整列状態（ボタンとキャンバスのクリックで切り替える） */
		arranged: boolean;
		/** 画面内かつタブ表示中のときのみ true。false の間は物理も描画も止める */
		active: boolean;
		ontoggle: () => void;
	};

	let { labels, arranged, active, ontoggle }: Props = $props();

	const { size, invalidate: invalidateFrame, renderer } = useThrelte();

	/**
	 * 画面外・タブ非表示の間は再描画を要求しない（画面内に戻った時点でまとめて描画する）。
	 * untrack: 呼び出し元の $effect が active に依存しないようにする（テクスチャの再生成を防ぐ）
	 */
	function invalidate() {
		if (untrack(() => active)) invalidateFrame();
	}

	const DEPTH = 0.62;
	const HEIGHT = 0.3;
	const FONT = 0.24;

	// ---- camera: 机を斜め上から見下ろす ----
	const camera = new PerspectiveCamera(30, 1, 0.1, 100);
	camera.position.set(0, 10.5, 7.2);
	camera.lookAt(0, 0, 0.35);

	// ---- shared resources（onDestroy で dispose） ----
	const root = new Group();
	const shadowTexture = createShadowTexture();
	const shadowGeometry = new PlaneGeometry(1, 1);
	shadowGeometry.rotateX(-Math.PI / 2);
	const labelGeometry = new PlaneGeometry(1, 1);
	labelGeometry.rotateX(-Math.PI / 2);
	const blockMaterial = new MeshStandardMaterial({ roughness: 0.55, metalness: 0 });
	const accentMaterial = new MeshStandardMaterial({ roughness: 0.45, metalness: 0 });
	const guideMaterial = new LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
	const guide = new LineSegments(new BufferGeometry(), guideMaterial);
	root.add(guide);

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
		const w = measureLabel(text, FONT) + 0.5;
		const geometry = new RoundedBoxGeometry(w, HEIGHT, DEPTH, 3, 0.08);
		const body = new Mesh(geometry, accent ? accentMaterial : blockMaterial);
		body.position.y = HEIGHT / 2;
		const label = new Mesh(
			labelGeometry,
			new MeshBasicMaterial({ transparent: true, depthWrite: false })
		);
		label.scale.set(w - 0.1, 1, DEPTH - 0.08);
		label.position.y = HEIGHT + 0.002;
		const shadow = new Mesh(
			shadowGeometry,
			new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
		);
		shadow.scale.set(w + 0.45, 1, DEPTH + 0.45);
		shadow.position.y = 0.001;
		shadow.renderOrder = -1;
		const group = new Group();
		group.add(body, label);
		root.add(shadow, group);
		return { group, geometry, label, shadow, accent, text, w };
	});

	const desk = new Desk(blocks.map((b) => ({ w: b.w, d: DEPTH })));
	desk.drop();

	// ---- 机の範囲: 画面の四隅から y=0 平面へのレイで、見えている台形の内側を求める ----
	const raycaster = new Raycaster();
	const deskPlane = new Plane(new Vector3(0, 1, 0), 0);
	const ndc = new Vector2();
	const hit = new Vector3();

	function projectToDesk(x: number, y: number): Vector3 | null {
		ndc.set(x, y);
		raycaster.setFromCamera(ndc, camera);
		return raycaster.ray.intersectPlane(deskPlane, hit);
	}

	function updateBounds(width: number, height: number) {
		camera.aspect = width / Math.max(height, 1);
		// 縦長の画面では引いて、机全体を収める
		camera.zoom = camera.aspect < 1 ? camera.aspect * 1.05 : 1;
		camera.updateProjectionMatrix();
		const far = projectToDesk(0.92, 0.9)?.clone();
		const near = projectToDesk(0.92, -0.92)?.clone();
		if (!far || !near) return;
		const halfW = Math.min(Math.abs(far.x), Math.abs(near.x));
		const halfD = (near.z - far.z) / 2;
		root.position.z = (near.z + far.z) / 2;
		desk.setBounds(halfW, halfD);
		buildGuide(halfW, halfD);
	}

	/** Figma のレイアウトグリッド風の 12 カラムガイド */
	function buildGuide(halfW: number, halfD: number) {
		const cols = 12;
		const width = halfW * 2 * 0.88;
		const gutter = 0.12;
		const colW = (width - gutter * (cols - 1)) / cols;
		const pts: number[] = [];
		for (let i = 0; i < cols; i++) {
			const x0 = -width / 2 + i * (colW + gutter);
			for (const x of [x0, x0 + colW]) pts.push(x, 0.003, -halfD * 0.8, x, 0.003, halfD * 0.8);
		}
		guide.geometry.dispose();
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(pts, 3));
		guide.geometry = geometry;
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

	// ---- テーマ: CSS トークンから色を取得し、ラベルテクスチャを作り直す ----
	const toColor = (rgb: [number, number, number]) => new Color().setRGB(...rgb, SRGBColorSpace);
	const toCss = ([r, g, b]: [number, number, number]) =>
		`rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

	$effect(() => {
		const dark = theme.current === 'dark';
		blockMaterial.color = toColor(cssVarToRgb(dark ? '--surface-2' : '--surface'));
		accentMaterial.color = toColor(cssVarToRgb('--accent'));
		guideMaterial.color = toColor(cssVarToRgb('--accent-text'));
		const fg = toCss(cssVarToRgb('--fg'));
		const onAccent = toCss(cssVarToRgb('--on-accent'));
		for (const b of blocks) {
			const old = b.label.material.map;
			b.label.material.map = createLabelTexture(b.text, {
				width: b.w - 0.1,
				height: DEPTH - 0.08,
				fontSize: FONT,
				color: b.accent ? onAccent : fg
			});
			b.label.material.needsUpdate = true;
			old?.dispose();
			b.shadow.material.opacity = dark ? 1 : 0.45;
		}
		invalidate();
	});

	// ---- 整列 / 散らかす ----
	let lastArranged = false;
	$effect(() => {
		if (arranged === lastArranged) return;
		lastArranged = arranged;
		if (arranged) desk.arrange();
		else desk.scatter();
		invalidate();
	});

	// ---- ポインタ（押して転がす / クリックで切り替え） ----
	let pointerDown: { x: number; y: number; t: number } | null = null;
	let pendingPointer: { x: number; y: number } | null = null;
	const canvas = renderer.domElement;

	function toDesk(event: PointerEvent): Vector3 | null {
		const rect = canvas.getBoundingClientRect();
		const p = projectToDesk(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		);
		if (!p) return null;
		p.z -= root.position.z;
		return p;
	}

	function onPointerMove(event: PointerEvent) {
		pendingPointer = { x: event.clientX, y: event.clientY };
		const p = toDesk(event);
		if (p) {
			lastPointer = { x: p.x, z: p.z };
			if (!active) return;
			invalidate();
		}
	}
	let lastPointer: { x: number; z: number } | null = null;

	function onPointerLeave() {
		lastPointer = null;
		pendingPointer = null;
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

	// ---- 遅刻ブロックの吹き出し ----
	const bubbleAnchor = new Group();
	root.add(bubbleAnchor);
	let excuse = $state('');
	let bubbleVisible = $state(false);

	// ---- フレーム更新 ----
	const { start, stop } = useTask(
		(delta) => {
			if (lastPointer) desk.movePointer(lastPointer.x, lastPointer.z, delta);
			desk.step(Math.min(delta, 1 / 20));

			for (let i = 0; i < blocks.length; i++) {
				const b = blocks[i];
				const s = desk.bodies[i];
				b.group.position.set(s.x, s.y, s.z);
				b.group.rotation.y = s.a;
				b.shadow.position.x = s.x;
				b.shadow.position.z = s.z;
				b.shadow.rotation.y = s.a;
				const lift = Math.min(s.y / 3, 1);
				b.shadow.scale.set((b.w + 0.45) * (1 + lift * 0.6), 1, (DEPTH + 0.45) * (1 + lift * 0.6));
				b.shadow.material.opacity = (theme.current === 'dark' ? 1 : 0.45) * (1 - lift * 0.7);
			}
			guideMaterial.opacity = desk.guide * 0.35;

			// 吹き出し: 遅刻ブロックが到着してから 2.4 秒
			const late = desk.bodies[desk.lateIndex];
			const showing = arranged && !!late && desk.time - desk.lateArrivedAt < 2.4;
			// 最後尾（最下段）の手前側に出すので、ほかのブロックを隠さない
			if (late) bubbleAnchor.position.set(late.x, 0, late.z + DEPTH / 2 + 0.12);
			if (showing !== bubbleVisible) {
				bubbleVisible = showing;
				excuse = LATE_EXCUSES[(desk.arrangedCount - 1) % LATE_EXCUSES.length];
			}

			// 十分に静止したら再描画を止める（ポインタが動けば再開）
			const guideMoving = Math.abs(desk.guide - (arranged ? 1 : 0)) > 0.002;
			const settling = desk.energy > 0.002 || guideMoving || bubbleVisible;
			if (settling || pendingPointer) invalidate();
			pendingPointer = null;
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
		shadowTexture.dispose();
		shadowGeometry.dispose();
		labelGeometry.dispose();
		blockMaterial.dispose();
		accentMaterial.dispose();
		guide.geometry.dispose();
		guideMaterial.dispose();
	});
</script>

<T is={camera} makeDefault manual />
<T.HemisphereLight args={['#ffffff', '#666666', 1.6]} />
<T.DirectionalLight position={[3, 8, 5]} intensity={1.8} />
<T is={root} dispose={false}>
	<T is={bubbleAnchor} dispose={false}>
		<HTML center pointerEvents="none" zIndexRange={[20, 0]}>
			<p
				class={[
					'pointer-events-none translate-y-1/2 rounded-md bg-fg px-3 py-1.5 text-xs font-medium whitespace-nowrap text-bg shadow-lg transition-[opacity,scale] duration-300',
					bubbleVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
				]}
			>
				{excuse}
			</p>
		</HTML>
	</T>
</T>
