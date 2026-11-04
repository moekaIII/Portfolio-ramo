/**
 * 精密グリッドの重力場（A案）
 * - 等間隔の点格子を頂点シェーダーで変位させる（CPU 負荷はポインタ追従のばね計算のみ）
 * - ポインタ付近: 点が引き寄せられ、手前へ盛り上がり、アクセント色に染まる
 * - クリック / タップ: 波紋が同心円状に広がる
 */
export const MAX_RIPPLES = 4;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uStrength;
uniform float uRadius;
uniform vec4 uRipples[${MAX_RIPPLES}]; // xy: 中心, z: 開始時刻, w: 振幅
uniform float uSize;
uniform float uPixelRatio;
uniform vec2 uExtent;

varying float vHeat;
varying float vAlpha;

void main() {
	vec3 p = position;

	// 重力レンズ: ポインタからのガウス分布で引き寄せ + 盛り上がり
	vec2 toPointer = p.xy - uPointer;
	float d = length(toPointer);
	float g = exp(-(d * d) / (uRadius * uRadius)) * uStrength;
	p.xy -= toPointer * g * 0.22;
	p.z += g * 1.8;

	// ごく微弱な呼吸（静止画に見えない程度の生命感）
	p.z += 0.05 * sin(position.x * 0.55 + uTime * 0.5) * cos(position.y * 0.6 - uTime * 0.35);

	// 波紋
	float ripple = 0.0;
	for (int i = 0; i < ${MAX_RIPPLES}; i++) {
		vec4 r = uRipples[i];
		float age = uTime - r.z;
		if (r.w <= 0.0 || age < 0.0 || age > 4.0) continue;
		float rd = length(position.xy - r.xy);
		float front = age * 4.5;
		ripple += exp(-pow(rd - front, 2.0) * 2.2) * exp(-age * 1.2) * r.w;
	}
	p.z += ripple * 0.8;

	vHeat = clamp(g * 1.15 + ripple * 0.9, 0.0, 1.0);

	// 外周は自然にフェードアウト
	vec2 e = abs(position.xy) / uExtent;
	float edge = 1.0 - smoothstep(0.7, 1.0, max(e.x, e.y));
	vAlpha = (0.5 + vHeat * 0.5) * edge;

	vec4 mv = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * mv;
	gl_PointSize = uSize * uPixelRatio * (1.0 + vHeat * 1.1) * (14.0 / -mv.z);
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;

varying float vHeat;
varying float vAlpha;

void main() {
	float r = length(gl_PointCoord - 0.5);
	float a = smoothstep(0.5, 0.36, r) * vAlpha * uOpacity;
	if (a < 0.01) discard;
	vec3 color = mix(uColor, uAccent, smoothstep(0.06, 0.65, vHeat));
	gl_FragColor = vec4(color, a);
}
`;
