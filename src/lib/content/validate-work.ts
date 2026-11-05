import {
	WORK_CATEGORIES,
	type WorkCategory,
	type WorkMeta,
	type WorkResult
} from '#lib/types/work.ts';

const PERIOD = /^\d{4}\.\d{2} – (\d{4}\.\d{2}|継続中)$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class WorkSchemaError extends Error {
	constructor(file: string, message: string) {
		super(`[works] ${file}: ${message}`);
	}
}

const isObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * frontmatter を検証して WorkMeta に変換する。不正な場合はビルドを失敗させるため例外を投げる。
 */
export function parseWorkMeta(file: string, raw: unknown): WorkMeta {
	if (!isObject(raw)) throw new WorkSchemaError(file, 'frontmatter がありません');

	const str = (key: string): string => {
		const v = raw[key];
		if (typeof v !== 'string' || v.trim() === '')
			throw new WorkSchemaError(file, `"${key}" は空でない文字列が必要です`);
		return v;
	};
	const strArray = (key: string): string[] => {
		const v = raw[key];
		if (!Array.isArray(v) || v.length === 0 || !v.every((x) => typeof x === 'string'))
			throw new WorkSchemaError(file, `"${key}" は1件以上の文字列配列が必要です`);
		return v;
	};

	const slug = str('slug');
	if (!SLUG.test(slug))
		throw new WorkSchemaError(file, `slug "${slug}" は kebab-case にしてください`);
	const expected = file.split('/').pop()?.replace(/\.md$/, '');
	if (expected !== slug)
		throw new WorkSchemaError(
			file,
			`slug "${slug}" とファイル名 "${expected}" を一致させてください`
		);

	const period = str('period');
	if (!PERIOD.test(period))
		throw new WorkSchemaError(
			file,
			`period は "YYYY.MM – YYYY.MM" 形式にしてください（"${period}"）`
		);

	const category = str('category');
	if (!(category in WORK_CATEGORIES))
		throw new WorkSchemaError(
			file,
			`category "${category}" は ${Object.keys(WORK_CATEGORIES).join(' / ')} のいずれかにしてください`
		);

	const rawResults = raw.results;
	if (!Array.isArray(rawResults) || rawResults.length === 0)
		throw new WorkSchemaError(file, '"results" は1件以上必要です');
	const results: WorkResult[] = rawResults.map((r, i) => {
		if (!isObject(r) || typeof r.label !== 'string' || r.value === undefined)
			throw new WorkSchemaError(file, `results[${i}] には label と value が必要です`);
		return {
			label: r.label,
			value: String(r.value),
			unit: typeof r.unit === 'string' ? r.unit : undefined,
			note: typeof r.note === 'string' ? r.note : undefined
		};
	});

	return {
		title: str('title'),
		slug,
		client: str('client'),
		role: str('role'),
		period,
		tags: strArray('tags'),
		category: category as WorkCategory,
		summary: str('summary'),
		results,
		featured: raw.featured === true
	};
}
