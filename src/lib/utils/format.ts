/** 数値表示用: 先頭のハイフンを正式なマイナス記号（U+2212）に置き換える */
export function formatSigned(value: string): string {
	return value.replace(/^-/, '−');
}
