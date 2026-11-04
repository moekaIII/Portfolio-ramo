import type { Picture } from '@sveltejs/enhanced-img';

/** src/lib/assets/works/ の画像を enhanced-img で最適化（AVIF/WebP + srcset）して取得する */
const pictures = import.meta.glob<Picture>('/src/lib/assets/works/*.{jpg,jpeg,png,webp}', {
	eager: true,
	import: 'default',
	query: { enhanced: true, w: '2400;1600;1200;800;480' }
});

export function getThumbnail(filename: string): Picture {
	const picture = pictures[`/src/lib/assets/works/${filename}`];
	if (!picture)
		throw new Error(`[works] thumbnail "${filename}" が src/lib/assets/works/ にありません`);
	return picture;
}
