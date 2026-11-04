/** WebGL2 が使えるかを判定（失敗時は静的フォールバックを表示する） */
export function supportsWebGL(): boolean {
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2');
		const ok = gl !== null;
		gl?.getExtension('WEBGL_lose_context')?.loseContext();
		return ok;
	} catch {
		return false;
	}
}
