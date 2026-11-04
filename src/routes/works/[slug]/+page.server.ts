import { error } from '@sveltejs/kit';
import { getWork, getWorks } from '#lib/server/works.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => getWorks().map(({ slug }) => ({ slug }));

export const load: PageServerLoad = ({ params }) => {
	const found = getWork(params.slug);
	if (!found) error(404, '実績が見つかりませんでした');
	return found;
};
