import { getFeaturedWorks } from '#lib/server/works.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ featured: getFeaturedWorks(3) });
