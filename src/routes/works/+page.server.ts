import { getWorks } from '#lib/server/works.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ works: getWorks() });
